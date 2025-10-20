import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 로그인/회원가입 경로에서는 헤더 숨김
  const HIDE_ON = ["/login", "/register"];
  if (HIDE_ON.includes(location.pathname)) return null;

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          {/* 왼쪽: 타이틀(클릭 시 드로어 오픈) */}
          <button
            className="text-lg font-semibold hover:opacity-80 transition"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="left-drawer"
          >
            Today’s Board
          </button>

          {/* 오른쪽: 액션 버튼 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-3 py-1.5 font-medium transition hover:border-gray-400 hover:bg-gray-100"
            >
              Search
            </button>
            <Link
              to="/login"
              className="rounded-md bg-gray-900 px-3 py-1.5 font-medium text-white transition hover:bg-gray-800"
            >
              로그인 / 회원가입
            </Link>
          </div>
        </div>
      </header>

      {/* 오버레이 */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30"
          aria-label="Close menu overlay"
        />
      )}

      {/* 왼쪽 드로어 */}
      <aside
        id="left-drawer"
        role="dialog"
        aria-modal="true"
        className={`fixed left-0 top-0 z-50 h-full w-[300px] bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 드로어 헤더 */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="text-base font-semibold">게시판 이동</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>

        {/* 드로어 내용 */}
        <nav className="flex flex-col gap-1 p-4">
          {/* 상단 탭 영역 */}
          <div className="mb-3 space-y-1">
            <Link
              to="/"
              className="block rounded px-3 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              메인 바로가기
            </Link>
            <Link
              to="/posts?tab=all"
              className="block rounded px-3 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              전체 게시글 보기
            </Link>
          </div>

          <hr className="my-2" />

          {/* 하단: 내가 쓴 글 보기 */}
          <button
            className="mt-1 rounded-md bg-gray-900 px-3 py-2 text-left text-sm font-medium text-white hover:opacity-90"
            onClick={() => {
              setOpen(false);
              navigate("/myposts");
            }}
          >
            내가 쓴 글 보기
          </button>
        </nav>
      </aside>

      {/* 헤더 높이만큼 본문 패딩 */}
      <div className="h-14" />
    </>
  );
}
