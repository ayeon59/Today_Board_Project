export default function StatCard({ label, value, icon, iconClassName = "" }) {
  return (
    <div className="relative rounded-xl border bg-white px-4 pb-5 pt-8 text-center shadow-sm transition hover:shadow-md">
      <div className="absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900 text-lg text-white shadow-lg ring-4 ring-white">
        <span className={iconClassName}>{icon}</span>
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  );
}
