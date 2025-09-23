export default function RangeTabs({ value, onChange }) {
  const items = [
    { k: "day", label: "Day" },
    { k: "week", label: "Week" },
    { k: "month", label: "Month" },
    { k: "year", label: "Year" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = value === it.k;
        return (
          <button
            key={it.k}
            type="button"
            onClick={() => onChange?.(it.k)}
            className={`px-4 py-2 rounded-md text-sm border ${
              active ? "bg-black text-white border-black" : "bg-white text-gray-800 border-black"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
