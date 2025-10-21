import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentsService {
  private readonly commentInclude = {
    author: { select: { id: true, nickname: true } },
  } satisfies Prisma.CommentInclude;

  constructor(private readonly prisma: PrismaService) {}

  async list(
    postId: string,
    userId?: string | null,
  ): Promise<CommentResponseDto[]> {
    await this.ensurePostExists(postId);
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: [{ createdAt: 'asc' }],
      include: this.commentInclude,
    });
    return comments.map((comment) =>
      this.toCommentDto(comment, comment.authorId === userId),
    );
  }

  async create(
    postId: string,
    authorId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.ensurePostExists(postId);
    const content = dto.content.trim();
    if (!content.length) {
      throw new BadRequestException('댓글 내용을 입력해주세요.');
    }
    const comment = await this.prisma.comment.create({
      data: { postId, authorId, content },
      include: this.commentInclude,
    });
    return this.toCommentDto(comment, true);
  }

  async remove(id: string, userId: string, postId?: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }
    if (postId && comment.postId !== postId) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException('댓글 권한이 없습니다.');
    }
    await this.prisma.comment.delete({ where: { id } });
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

  private toCommentDto(
    comment: Prisma.CommentGetPayload<{
      include: {
        author: { select: { id: true; nickname: true } };
      };
    }>,
    isMine: boolean,
  ): CommentResponseDto {
    return plainToInstance(
      CommentResponseDto,
      {
        id: comment.id,
        postId: comment.postId,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        isMine,
      },
      { excludeExtraneousValues: true },
    );
  }
}
