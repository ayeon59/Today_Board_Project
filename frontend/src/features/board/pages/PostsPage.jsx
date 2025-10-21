// src/features/board/pages/PostsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/state/AuthContext.jsx";
import PostList from "../components/PostList";
import SortFilter from "../components/SortFilter";
import { listPosts } from "../api/posts.api";

const TABS = [
  { key: "all", label: "전체" },
  { key: "free", label: "자유" },
  { key: "question", label: "질문" },
];

const DEFAULT_TAB = "all";
const DEFAULT_SORT = "latest";

export default function PostsPage() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const tab = sp.get("tab") || DEFAULT_TAB;
  const sort = sp.get("sort") || DEFAULT_SORT;
  const q = sp.get("q") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    listPosts({ tab, sort, q }, accessToken)
      .then((res) => {
        if (cancelled) return;
        setItems(res ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "게시글을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, sort, q, accessToken]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (v === null || v === undefined || v === "") next.delete(k);
    else next.set(k, v);
    setSp(next, { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam("q", searchInput.trim());
  };

  const emptyMessage = useMemo(() => {
    if (loading) return "게시글을 불러오는 중입니다...";
    if (error) return error;
    return "게시글이 없습니다.";
  }, [loading, error]);

  return (
    <div className="space-y-6">
      {/* 타이틀 + 새 글 작성 + 정렬 */}
      <div>
        <h1 className="text-2xl font-bold">전체 게시판</h1>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() =>
                user
                  ? navigate("/editor")
                  : navigate("/login", { state: { from: "/editor" } })
              }
            >
              새 글 작성하기
            </button>
          </div>
          <div className="flex items-center gap-2">
            <SortFilter
              value={sort}
              onChange={(v) => setParam("sort", v)}
              options={[
                { value: "popular", label: "인기순" },
                { value: "latest", label: "최신순" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 검색 */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 rounded border bg-white px-3 py-2"
      >
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="flex-1 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          검색
        </button>
        {q && (
          <button
            type="button"
            onClick={() => setParam("q", "")}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            초기화
          </button>
        )}
      </form>

      {/* 탭 */}
      <div className="flex gap-2 border-b pb-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setParam("tab", t.key)}
              className={`px-3 py-1 text-sm ${
                active
                  ? "border-b-2 border-gray-900 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 리스트 */}
      {loading ? (
        <div className="rounded border bg-white p-6 text-center text-sm text-gray-500">
          불러오는 중...
        </div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      ) : (
        <PostList items={items} emptyMessage={emptyMessage} />
      )}
    </div>
  );
}
