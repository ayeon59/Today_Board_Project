import { Link, useSearchParams } from "react-router-dom";

const TABS = [
  { key: "all", label: "전체" },
  { key: "free", label: "자유" },
  { key: "question", label: "질문" },
];

export default function NavTabs() {
  const [sp] = useSearchParams();
  const active = sp.get("tab") || "all";

  return (
    <div className="flex gap-2 border-b bg-white">
      {TABS.map((t) => {
        const isActive = active === t.key;
        return (
          <Link
            key={t.key}
            to={`/posts?tab=${t.key}`}
            className={`px-3 py-2 text-sm ${
              isActive
                ? "border-b-2 border-gray-900 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
