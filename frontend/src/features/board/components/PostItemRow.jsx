// src/features/board/components/PostItemRow.jsx
import { Link } from "react-router-dom";

const BOARD_LABEL = { free: "자유게시판", question: "질문게시판" };

export default function PostItemRow({ post }) {
  return (
    <div className="flex items-stretch gap-4 rounded border bg-gray-100 p-4">
      {/* 썸네일 */}
      <div className="w-40 flex-shrink-0 overflow-hidden rounded border bg-white">
        <img
          src={post.image || "/images/placeholder-16x9.png"}
          alt=""
          className="h-24 w-full object-cover"
        />
      </div>

      {/* 본문 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-1 text-xs text-gray-500">
          {BOARD_LABEL[post.boardType] || "게시판"}
        </div>
        <div className="truncate text-lg font-semibold">{post.title}</div>
        <div className="truncate text-sm text-gray-600">{post.preview}</div>
      </div>

      {/* 우측 액션 */}
      <div className="flex w-14 flex-col items-end justify-between text-sm">
        {/* (옵션) 수정/삭제 버튼은 작성자 본인일 때만 */}
        {/* <div className="flex gap-2 text-gray-500">
          <button className="hover:underline">수정</button>
          <button className="hover:underline">삭제</button>
        </div> */}
        <Link
          to={`/posts/${post.id}`}
          className="grid h-10 w-10 place-items-center rounded-full border bg-white hover:bg-gray-50"
          title="상세 보기"
        >
          →
        </Link>
      </div>
    </div>
  );
}
