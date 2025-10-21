// src/features/board/components/PostList.jsx
import PostItemRow from "./PostItemRow";

export default function PostList({
  items,
  emptyMessage = "게시글이 없습니다.",
  renderActions,
}) {
  if (!items?.length)
    return (
      <div className="rounded border bg-white p-6 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  return (
    <ul className="space-y-6">
      {items.map((p) => (
        <li key={p.id}>
          <PostItemRow post={p} renderActions={renderActions} />
        </li>
      ))}
    </ul>
  );
}
