// src/features/board/pages/MyPostsPage.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyPosts, removePost } from "../api/posts.api";
import { useAuth } from "../../auth/state/AuthContext.jsx";
import PostList from "../components/PostList";

export default function MyPostsPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPosts = useCallback(() => {
    if (!accessToken) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    listMyPosts(accessToken)
      .then((res) => {
        if (cancelled) return;
        setItems(res ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "내 게시글을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    const cleanup = loadPosts();
    return cleanup;
  }, [loadPosts]);

  const handleEdit = (postId) => {
    navigate(`/editor/${postId}`);
  };

  const handleDelete = async (postId) => {
    if (!accessToken) return;
    const ok = window.confirm("정말로 이 게시글을 삭제할까요?");
    if (!ok) return;
    setError("");
    try {
      await removePost(postId, accessToken);
      setItems((prev) => prev.filter((item) => item.id !== postId));
    } catch (err) {
      setError(err.message ?? "게시글 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내가 쓴 글</h1>
          <p className="mt-1 text-sm text-gray-600">
            {user?.nickname ?? "사용자"}님이 작성한 게시글을 확인하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/editor")}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          새 글 작성
        </button>
      </div>

      {loading ? (
        <div className="rounded border bg-white p-6 text-center text-sm text-gray-500">
          불러오는 중...
        </div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      ) : (
        <PostList
          items={items}
          emptyMessage="아직 작성한 게시글이 없습니다. 첫 글을 작성해보세요!"
          renderActions={(post) => (
            <>
              <button
                type="button"
                onClick={() => handleEdit(post.id)}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </>
          )}
        />
      )}
    </div>
  );
}
