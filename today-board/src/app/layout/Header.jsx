import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="flex h-20 items-center justify-between border-b border-stone-200 px-4">
      <section>
        <button className="inline-flex items-center px-2 py-2 rounded-lg font-semibold text-2xl">
          Today's Board
        </button>
      </section>
      <div className="flex gap-5">
        <section>
          <button className="inline-flex items-center rounded-sm bg-orange-300 px-4 py-2 text-xl hover:bg-orange-400">
            Search
          </button>
        </section>
        <section>
          <Link
            to="/login"
            className="inline-flex items-center rounded-sm bg-orange-300 px-4 py-2 text-xl font-semibold hover:bg-orange-400"
          >
            로그인/회원가입
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Header;
