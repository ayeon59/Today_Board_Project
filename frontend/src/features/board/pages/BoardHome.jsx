import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/state/AuthContext.jsx";
import { getHomeSummary } from "../api/posts.api";
import StatCard from "../components/StatCard";
import KpiPill from "../components/KpiPill";

export default function BoardHome() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totals, setTotals] = useState({ posts: 0, likes: 0, comments: 0 });
  const [hotPost, setHotPost] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getHomeSummary(accessToken)
      .then((res) => {
        if (cancelled) return;
        setTotals(res?.totals ?? { posts: 0, likes: 0, comments: 0 });
        setHotPost(res?.hotPost ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "통계 정보를 불러오지 못했습니다.");
        setTotals({ posts: 0, likes: 0, comments: 0 });
        setHotPost(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const stats = useMemo(
    () => [
      {
        key: "posts",
        label: "Total Posts",
        value: loading ? "..." : totals.posts,
        iconClass: "fa-solid fa-file-lines",
      },
      {
        key: "likes",
        label: "Total Likes",
        value: loading ? "..." : totals.likes,
        iconClass: "fa-solid fa-heart",
      },
      {
        key: "comments",
        label: "Total Comments",
        value: loading ? "..." : totals.comments,
        iconClass: "fa-solid fa-comment-dots",
      },
    ],
    [loading, totals],
  );

  const fallbackImage = "/images/post-default.jpg";
  const hotPostImage = hotPost?.image?.trim().length ? hotPost.image : fallbackImage;
  const hotPostSummary =
    hotPost?.preview || hotPost?.content || "아직 소개할 게시글이 없어요.";
  const handleImageError = (event) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied) return;
    target.dataset.fallbackApplied = "true";
    target.src = "/images/placeholder-16x9.svg";
  };

  return (
    <div className="space-y-8">
      {/* 1) 대표 배너 */}
      <section className="rounded-2xl border bg-gradient-to-r from-gray-50 to-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome to the Today Community Board
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          자유롭게 글을 올리고, 질문하고, 서로의 생각을 나눠보세요.
        </p>
        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}
      </section>

      {/* 2) 통계 카드 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={s.value}
            icon={<i className={s.iconClass} aria-hidden="true" />}
          />
        ))}
      </section>

      {/* 3) 오늘의 핫 게시글 섹션 */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* 왼쪽: 대표 이미지 */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <img
            src={hotPostImage}
            alt="Hot post preview"
            onError={handleImageError}
            className="h-64 w-full object-cover"
          />
        </div>

        {/* 오른쪽: 제목 / 요약 / 좋아요·댓글 */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {hotPost
                ? hotPost.title
                : loading
                  ? "오늘의 게시글을 불러오는 중..."
                  : "오늘의 인기글을 찾지 못했어요"}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-700">
              {hotPost ? hotPostSummary : "새로운 글을 작성해보세요!"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <KpiPill
              icon={<i className="fa-solid fa-heart" aria-hidden="true" />}
              label="Likes"
              value={hotPost?.likes ?? 0}
            />
            <KpiPill
              icon={
                <i className="fa-solid fa-comment-dots" aria-hidden="true" />
              }
              label="Comments"
              value={hotPost?.comments ?? 0}
            />
            {hotPost && (
              <button
                type="button"
                onClick={() => navigate(`/posts/${hotPost.id}`)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                상세 보기
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
