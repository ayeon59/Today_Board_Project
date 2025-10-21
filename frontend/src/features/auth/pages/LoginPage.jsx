import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from ?? "/";

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message ?? "로그인에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4 py-12 sm:px-6">
      <section className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-8 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-300 transition hover:text-white"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            메인으로
          </Link>
          <span className="tracking-[0.2em] uppercase">Today</span>
        </div>

        <div className="mt-8 space-y-2">
          <h1 className="text-2xl font-semibold text-white">로그인</h1>
          <p className="text-xs text-neutral-400">
            가입한 이메일과 비밀번호를 입력해주세요.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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

          {error && (
            <p className="text-xs font-medium text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-white py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={busy}
          >
            {busy ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-xs text-neutral-500">
          <span>계정이 없나요?</span>
          <Link
            to="/register"
            className="font-semibold text-white transition hover:text-neutral-300"
          >
            회원가입
          </Link>
        </div>
      </section>
    </main>
  );
}
