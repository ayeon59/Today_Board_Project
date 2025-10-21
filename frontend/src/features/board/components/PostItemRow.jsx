// src/features/board/components/PostItemRow.jsx
import { Link } from "react-router-dom";

const BOARD_LABEL = { free: "자유게시판", question: "질문게시판" };
const DEFAULT_POST_IMAGE = "/images/placeholder-16x9.jpg";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export default function PostItemRow({ post, renderActions }) {
  const authorName =
    typeof post.author === "string"
      ? post.author
      : post.author?.nickname || "익명";
  const createdAt = formatDate(post.createdAt);
  const actions = renderActions?.(post);

  const thumbnail = post.image?.trim().length ? post.image : DEFAULT_POST_IMAGE;

  const handleImageError = (event) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied) return;
    target.dataset.fallbackApplied = "true";
    target.src = "/images/placeholder-16x9.svg";
  };

  return (
    <div className="flex items-stretch gap-4 rounded border bg-gray-100 p-4">
      {/* 썸네일 */}
      <div className="relative w-40 flex-shrink-0">
        <div className="relative overflow-hidden rounded border bg-white pb-[56.25%]">
          <img
            src={thumbnail}
            alt=""
            onError={handleImageError}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      {/* 본문 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{BOARD_LABEL[post.boardType] || "게시판"}</span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-pink-600">
              <i className="fa-solid fa-heart" aria-hidden="true" />
              {post.likes ?? 0}
            </span>
            <span className="inline-flex items-center gap-1 text-cyan-600">
              <i className="fa-solid fa-comment-dots" aria-hidden="true" />
              {post.comments ?? 0}
            </span>
          </span>
        </div>
        <div className="truncate text-lg font-semibold">{post.title}</div>
        <div className="truncate text-sm text-gray-600">{post.preview}</div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>작성자: {authorName}</span>
          {createdAt && (
            <>
              <span aria-hidden="true">•</span>
              <span>{createdAt}</span>
            </>
          )}
        </div>
      </div>

      {/* 우측 액션 */}
      <div className="flex w-32 flex-col items-end justify-between gap-2 text-sm">
        {actions && <div className="flex gap-2">{actions}</div>}
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
