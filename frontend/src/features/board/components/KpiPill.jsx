export default function KpiPill({ icon, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 shadow-sm">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
