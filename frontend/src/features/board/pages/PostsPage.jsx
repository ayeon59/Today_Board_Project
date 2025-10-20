// src/features/board/pages/PostsPage.jsx
import { useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import PostList from "../components/PostList";
import SortFilter from "../components/SortFilter";

const TABS = [
  { key: "all", label: "전체" },
  { key: "free", label: "자유" },
  { key: "question", label: "질문" },
];

// 더미 데이터
const DUMMY = [
  {
    id: "p1",
    boardType: "free",
    title: "오늘 크래프톤 정글 꿀팁 공유합니다",
    preview: "스터디 템플릿이랑 일정 관리 세팅...",
    image: "/images/sample1.png",
    likes: 12,
    comments: 5,
    author: "neo",
    createdAt: "2025-10-20T10:00:00Z",
  },
  {
    id: "p2",
    boardType: "question",
    title: "React 상태관리 가장 쉬운 방법 뭐죠?",
    preview: "Redux vs Context vs Zustand 고민...",
    image: "/images/sample2.png",
    likes: 21,
    comments: 14,
    author: "trinity",
    createdAt: "2025-10-20T09:00:00Z",
  },
];

export default function PostsPage() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const tab = sp.get("tab") || "all"; // all|free|question
  const sort = sp.get("sort") || "latest"; // latest|popular
  const q = sp.get("q") || "";

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (v === null || v === undefined || v === "") next.delete(k);
    else next.set(k, v);
    setSp(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let arr = [...DUMMY];
    if (tab !== "all") arr = arr.filter((p) => p.boardType === tab);
    if (q)
      arr = arr.filter((p) =>
        (p.title + p.preview).toLowerCase().includes(q.toLowerCase())
      );
    if (sort === "popular")
      arr.sort((a, b) => b.likes + b.comments - (a.likes + a.comments));
    else arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return arr;
  }, [tab, sort, q]);

  return (
    <div className="space-y-6">
      {/* 타이틀 + 새 글 작성 + 정렬 */}
      <div>
        <h1 className="text-2xl font-bold">전체 게시판</h1>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => navigate("/editor")}
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
      <PostList items={filtered} />
    </div>
  );
}
