import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center ">
      <section className="w-full">
        <div className="relative flex h-20 items-center justify-center border-b border-stone-200 px-4">
          <Link to="/" className="absolute left-10 text-xl">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <h2 className="text-lg font-semibold">로그인</h2>
        </div>
      </section>
      <section className="bg-orange-300 mt-10 flex w-full max-w-md flex-col items-center px-4">
        <h2 className="text-3xl font-semibold text-stone-800 my-10">
          Today's Board
        </h2>
        <div className="mt-6 flex w-full flex-col gap-4">
          <input
            className="rounded border-b border-stone-300 px-4 py-3 my-2"
            placeholder="아이디 입력"
          />
          <input
            className="rounded border-b border-stone-300 px-4 py-3"
            placeholder="비밀번호 입력"
          />
        </div>
        <div className="mt-10 flex w-full flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-orange-300 px-4 py-3 text-xl hover:bg-orange-400"
          >
            로그인
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center border-brounded-sm px-4 py-3 text-xl hover:font-semibold"
          >
            회원가입
          </Link>
        </div>
      </section>
    </div>
  );
}
