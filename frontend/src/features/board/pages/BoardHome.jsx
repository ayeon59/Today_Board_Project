import StatCard from "../components/StatCard";
import KpiPill from "../components/KpiPill";

export default function BoardHome() {
  const stats = [
    {
      key: "posts",
      label: "Total Posts",
      value: 128,
      iconClass: "fa-solid fa-file-lines",
    },
    {
      key: "likes",
      label: "Total Likes",
      value: 743,
      iconClass: "fa-solid fa-heart",
    },
    {
      key: "comments",
      label: "Total Comments",
      value: 312,
      iconClass: "fa-solid fa-comment-dots",
    },
  ];

  const hotPost = {
    id: "abc123",
    title: "🔥 오늘의 핫한 질문: React 상태관리, 가장 쉬운 접근은?",
    summary:
      "전역 상태를 최소화하고 각 컴포넌트의 책임을 분리하는 방향으로 접근하는 게 좋습니다.",
    imageUrl: "",
    likes: 37,
    comments: 14,
  };

  const fallbackImage = "/images/placeholder-16x9.png";

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
            src={hotPost.imageUrl || fallbackImage}
            alt="Hot post preview"
            className="h-64 w-full object-cover"
          />
        </div>

        {/* 오른쪽: 제목 / 요약 / 좋아요·댓글 */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {hotPost.title}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-700">
              {hotPost.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <KpiPill
              icon={<i className="fa-solid fa-heart" aria-hidden="true" />}
              label="Likes"
              value={hotPost.likes}
            />
            <KpiPill
              icon={
                <i className="fa-solid fa-comment-dots" aria-hidden="true" />
              }
              label="Comments"
              value={hotPost.comments}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
