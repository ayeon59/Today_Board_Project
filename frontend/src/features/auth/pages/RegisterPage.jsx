import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from ?? "/";

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await register({
        nickname: form.nickname,
        email: form.email,
        password: form.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message ?? "회원가입에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4 py-12 sm:px-6">
      <section className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-8 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-300 transition hover:text-white"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            로그인으로
          </Link>
          <span className="tracking-[0.2em] uppercase">Sign up</span>
        </div>

        <header className="mt-8 space-y-2">
          <h1 className="text-2xl font-semibold text-white">회원가입</h1>
          <p className="text-xs text-neutral-400">
            닉네임, 이메일, 비밀번호를 입력하고 커뮤니티에 참여하세요.
          </p>
        </header>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-[6px]">
            <label className="block text-xs font-medium text-neutral-400">
              닉네임
            </label>
            <input
              type="text"
              placeholder="닉네임 입력"
              value={form.nickname}
              onChange={handleChange("nickname")}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/60"
              minLength={2}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-400">
              이메일
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/60"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-400">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={form.password}
              onChange={handleChange("password")}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/60"
              minLength={4}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-400">
              비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="비밀번호 다시 입력"
              value={form.passwordConfirm}
              onChange={handleChange("passwordConfirm")}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/60"
              minLength={4}
              required
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-white py-2 mt-10 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={busy}
          >
            {busy ? "처리 중..." : "회원가입"}
          </button>
        </form>

        <footer className="mt-6 flex items-center justify-between text-xs text-neutral-500">
          <span>이미 계정이 있나요?</span>
          <Link
            to="/login"
            className="font-semibold text-white transition hover:text-neutral-300"
          >
            로그인 하러가기
          </Link>
        </footer>
      </section>
    </main>
  );
}
