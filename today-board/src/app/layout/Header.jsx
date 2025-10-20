const Header = () => {
  return (
    <div className="flex justify-between items-center px-4 py-4 border-b-2 border-stone-200">
      <section>
        <button className="inline-flex items-center px-2 py-2 rounded-lg font-semibold text-2xl">
          Today's Board
        </button>
      </section>
      <div className="flex gap-5">
        <section>
          <button className="inline-flex items-center rounded-sm bg-orange-300 px-4 py-2  text-xl hover:bg-orange-400">
            Search
          </button>
        </section>
        <section>
          <button className="inline-flex items-center rounded-sm bg-orange-300 px-4 py-2  text-xl hover:bg-orange-400">
            로그인/회원가입
          </button>
        </section>
      </div>
    </div>
  );
};

export default Header;
