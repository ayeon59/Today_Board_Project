import { Expose, Transform, Type } from 'class-transformer';
import { BoardType } from '@prisma/client';

class PostAuthorDto {
  @Expose()
  id!: string;

  @Expose()
  nickname!: string;
}

/* 게시글을 API로 응답할 때 어떤 필드들을 포함해 보낼지 묶어둔 DTO
 * 서버가 Prisma에서 가져온 게시글 데이터를 그대로 노출하는 것이 아니고 필요한 정보만 추림
 */
export class PostResponseDto {
  @Expose()
  // 게시글 id
  id!: string;

  @Expose()
  // 게시글 type 자유 / 질문
  boardType!: BoardType;

  @Expose()
  // 게시글 title
  title!: string;

  @Expose()
  // 게시글 content
  content!: string;

  @Expose()
  // 게시글 요약 preview
  preview!: string;

  @Expose()
  // 게시글 대표 이미지 URL
  image?: string | null;

  @Expose()
  // 게시글 좋아요 수
  likes!: number;

  @Expose()
  // 게시글 댓글 수
  comments!: number;

  @Expose()
  @Type(() => PostAuthorDto)
  // PostAuthorDto 타입화 시킨 작성자 정보
  author!: PostAuthorDto;

  // 작성 시각
  @Expose()
  createdAt!: Date;

  // 수정 시각
  @Expose()
  updatedAt!: Date;

  // 현재 사용자의 해당 글에 좋아요 클릭 여부
  @Expose()
  @Transform(({ value }) => value ?? null)
  myLike?: boolean | null;
}
