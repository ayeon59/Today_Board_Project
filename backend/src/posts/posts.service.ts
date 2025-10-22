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

  /* async : 비동기 함수 키워드로 await를 쓸 수 있고 항상 Promise를 반환
   * 즉, 문자열로 된 userID를 받아서 PostResponseDto 객체들의 배열을 Promise하겠다.
   */

  async findMine(userId: string): Promise<PostResponseDto[]> {
    const posts = await this.prisma.post.findMany({
      // 여러 글 중 해당 사용자가 작성한 글만
      where: { authorId: userId },
      // 'desc' 내림차순으로 최신 글이 배열 앞쪽에 오도록
      orderBy: [{ createdAt: 'desc' }],
      // 관련된 추가 필드를 가져와라 -> 작성자 정보, 집계 데이터
      include: this.postInclude,
    });

    // API는 다른 엔드포인트에 기대지 않고 자기 호출만으로도 완성된 데이터를 내려야 함
    // 즉 내가 쓴 글 보드에서도 상세 페이지를 볼 수 있고 그럼 내가 좋아요 누른지는 확인되어야 함
    // 그래서 여기서도 myLike를 확인하는 것
    const likedIds =
      // 즉, 내가 쓴 글이 없다면 해당 보드에서 상세페이지를 읽을 필요가 없으니까
      // likes 테이블에서 조건에 맞는 레코드들을 비동기 조회
      posts.length > 0
        ? new Set(
            (
              await this.prisma.like.findMany({
                // like 안에는 현재 사용자가 좋아요를 누른 모든 정보가 담김
                // 이중에서 사용자가 작성한 글 중 사용자가 좋아요를 누른 정보만 찾아야 함
                // posts 배열을 돌면서 각 요소 post 중 id만 뽑아내서 postId 로 사용
                // where : findMan가 어떤 레코드를 고를지 결정하는 필터 조건
                where: { userId, postId: { in: posts.map((post) => post.id) } },
                // select : 고른 레코드에서 어떤 필드를 가져올 지
                select: { postId: true },
              })
            ).map((like) => like.postId),
          ) //like 객체에서 postId "값"만 꺼내서 새로운 배열에 넣어라
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
