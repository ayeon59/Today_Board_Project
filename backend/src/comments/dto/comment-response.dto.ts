import { Expose, Type } from 'class-transformer';

class CommentAuthorDto {
  @Expose()
  id!: string;

  @Expose()
  nickname!: string;
}

export class CommentResponseDto {
  @Expose()
  id!: string;

  @Expose()
  postId!: string;

  @Expose()
  content!: string;

  @Expose()
  @Type(() => CommentAuthorDto)
  author!: CommentAuthorDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  isMine!: boolean;
}
