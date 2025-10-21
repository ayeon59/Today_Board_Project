import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardType, Prisma } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PostsService {
  private readonly postInclude = {
    author: { select: { id: true, nickname: true } },
    _count: { select: { likes: true, comments: true } },
  } satisfies Prisma.PostInclude;

  constructor(private prisma: PrismaService) {}

  // 목록
  async findAll(
    params?: {
      tab?: 'all' | 'free' | 'question';
      q?: string;
      sort?: 'latest' | 'popular';
    },
    userId?: string | null,
  ): Promise<PostResponseDto[]> {
    const tab = params?.tab ?? 'all';
    const q = params?.q;
    const sort = params?.sort ?? 'latest';

    const posts = await this.prisma.post.findMany({
      where: {
        boardType: tab === 'all' ? undefined : (tab as BoardType),
        OR: q
          ? [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy:
        sort === 'popular'
          ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }],
      include: this.postInclude,
    });

    const likedIds =
      userId && posts.length
        ? new Set(
            (
              await this.prisma.like.findMany({
                where: {
                  userId,
                  postId: { in: posts.map((post) => post.id) },
                },
                select: { postId: true },
              })
            ).map((like) => like.postId),
          )
        : new Set<string>();

    return posts.map((post) => this.toPostDto(post, likedIds.has(post.id)));
  }

  // 단건
  async findOne(id: string, userId?: string | null): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: this.postInclude,
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    let liked = false;
    if (userId) {
      liked = Boolean(
        await this.prisma.like.findUnique({
          where: { userId_postId: { userId, postId: id } },
        }),
      );
    }
    return this.toPostDto(post, liked);
  }

  async findMine(userId: string): Promise<PostResponseDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      orderBy: [{ createdAt: 'desc' }],
      include: this.postInclude,
    });
    const likedIds =
      posts.length > 0
        ? new Set(
            (
              await this.prisma.like.findMany({
                where: { userId, postId: { in: posts.map((post) => post.id) } },
                select: { postId: true },
              })
            ).map((like) => like.postId),
          )
        : new Set<string>();
    return posts.map((post) => this.toPostDto(post, likedIds.has(post.id)));
  }

  async create(
    authorId: string,
    data: CreatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.prisma.post.create({
      data: {
        boardType: data.boardType,
        title: data.title.trim(),
        content: data.content.trim(),
        image: this.normalizeImage(data.image),
        author: {
          connect: { id: authorId },
        },
      },
      include: this.postInclude,
    });
    return this.toPostDto(post, false);
  }

  async update(
    id: string,
    patch: UpdatePostDto,
    userId: string,
  ): Promise<PostResponseDto> {
    await this.ensureOwnership(id, userId);
    const data = this.prepareUpdateData(patch);
    const post = await this.prisma.post.update({
      where: { id },
      data,
      include: this.postInclude,
    });
    const liked = Boolean(
      await this.prisma.like.findUnique({
        where: { userId_postId: { userId, postId: id } },
      }),
    );
    return this.toPostDto(post, liked);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.ensureOwnership(id, userId);
    await this.prisma.comment.deleteMany({ where: { postId: id } });
    await this.prisma.like.deleteMany({ where: { postId: id } }); // FK 안전
    await this.prisma.post.delete({ where: { id } });
  }

  async toggleLike(postId: string, userId: string) {
    await this.ensurePostExists(postId);
    const composite = { userId_postId: { userId, postId } };
    const existing = await this.prisma.like.findUnique({ where: composite });
    let liked: boolean;
    if (existing) {
      await this.prisma.like.delete({ where: composite });
      liked = false;
    } else {
      await this.prisma.like.create({ data: { postId, userId } });
      liked = true;
    }
    const likes = await this.prisma.like.count({ where: { postId } });
    return { postId, liked, likes };
  }

  async getHomeSummary(userId?: string | null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalPosts, totalLikes, totalComments, likeGroups, commentGroups] =
      await Promise.all([
        this.prisma.post.count(),
        this.prisma.like.count(),
        this.prisma.comment.count(),
        this.prisma.like.groupBy({
          by: ['postId'],
          where: { createdAt: { gte: today } },
          _count: { _all: true },
        }),
        this.prisma.comment.groupBy({
          by: ['postId'],
          where: { createdAt: { gte: today } },
          _count: { _all: true },
        }),
      ]);

    const interactionScore = new Map<
      string,
      { likes: number; comments: number; score: number }
    >();

    for (const item of likeGroups) {
      const record = interactionScore.get(item.postId) ?? {
        likes: 0,
        comments: 0,
        score: 0,
      };
      record.likes += item._count._all ?? 0;
      record.score = record.likes + record.comments;
      interactionScore.set(item.postId, record);
    }

    for (const item of commentGroups) {
      const record = interactionScore.get(item.postId) ?? {
        likes: 0,
        comments: 0,
        score: 0,
      };
      record.comments += item._count._all ?? 0;
      record.score = record.likes + record.comments;
      interactionScore.set(item.postId, record);
    }

    let hotPost: PostResponseDto | null = null;

    if (interactionScore.size > 0) {
      let topPostId: string | null = null;
      let topScore = -1;
      let topLikes = 0;
      let topComments = 0;
      for (const [postId, info] of interactionScore.entries()) {
        if (
          info.score > topScore ||
          (info.score === topScore &&
            (info.comments > topComments ||
              (info.comments === topComments && info.likes > topLikes)))
        ) {
          topPostId = postId;
          topScore = info.score;
          topLikes = info.likes;
          topComments = info.comments;
        }
      }

      if (topPostId) {
        try {
          hotPost = await this.findOne(topPostId, userId);
        } catch (e) {
          hotPost = null;
        }
      }
    }

    if (!hotPost) {
      const fallback = await this.prisma.post.findFirst({
        orderBy: [{ createdAt: 'desc' }],
        include: this.postInclude,
      });
      if (!fallback) {
        return {
          totals: {
            posts: totalPosts,
            likes: totalLikes,
            comments: totalComments,
          },
          hotPost: null,
        };
      }
      const liked =
        userId &&
        (await this.prisma.like.findUnique({
          where: { userId_postId: { userId, postId: fallback.id } },
        }))
          ? true
          : false;
      hotPost = this.toPostDto(fallback, liked);
    }

    return {
      totals: {
        posts: totalPosts,
        likes: totalLikes,
        comments: totalComments,
      },
      hotPost,
    };
  }

  private async ensureOwnership(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException('게시글 권한이 없습니다.');
    }
  }

  private async ensurePostExists(postId: string) {
    const exists = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
  }

  private prepareUpdateData(patch: UpdatePostDto) {
    const data: Prisma.PostUpdateInput = {};
    if (patch.boardType) data.boardType = patch.boardType;
    if (typeof patch.title === 'string') data.title = patch.title.trim();
    if (typeof patch.content === 'string') data.content = patch.content.trim();
    if (typeof patch.image === 'string') {
      data.image = this.normalizeImage(patch.image);
    }
    return data;
  }

  private toPostDto(
    post: Prisma.PostGetPayload<{
      include: {
        author: { select: { id: true; nickname: true } };
        _count: { select: { likes: true; comments: true } };
      };
    }>,
    liked = false,
  ): PostResponseDto {
    const preview = this.buildPreview(post.content);
    const image =
      typeof post.image === 'string' && post.image.length ? post.image : null;

    return plainToInstance(
      PostResponseDto,
      {
        id: post.id,
        boardType: post.boardType,
        title: post.title,
        content: post.content,
        preview,
        image,
        likes: post._count.likes ?? 0,
        comments: post._count.comments ?? 0,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        myLike: liked,
      },
      { excludeExtraneousValues: true },
    );
  }

  private buildPreview(content: string): string {
    const condensed = content?.replace(/\s+/g, ' ').trim() ?? '';
    if (!condensed.length) return '내용 미리보기';
    const limit = condensed.length > 100 ? 30 : 120;
    return condensed.slice(0, limit);
  }

  private normalizeImage(value?: string | null) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
}
