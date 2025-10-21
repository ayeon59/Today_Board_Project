// src/features/board/components/SortFilter.jsx
export default function SortFilter({ value, onChange, options }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded border px-3 py-1 text-sm ${
              active ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
