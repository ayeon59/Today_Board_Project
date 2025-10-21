import { Expose, Transform, Type } from 'class-transformer';
import { BoardType } from '@prisma/client';

class PostAuthorDto {
  @Expose()
  id!: string;

  @Expose()
  nickname!: string;
}

export class PostResponseDto {
  @Expose()
  id!: string;

  @Expose()
  boardType!: BoardType;

  @Expose()
  title!: string;

  @Expose()
  content!: string;

  @Expose()
  preview!: string;

  @Expose()
  image?: string | null;

  @Expose()
  likes!: number;

  @Expose()
  comments!: number;

  @Expose()
  @Type(() => PostAuthorDto)
  author!: PostAuthorDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  @Transform(({ value }) => value ?? null)
  myLike?: boolean | null;
}
