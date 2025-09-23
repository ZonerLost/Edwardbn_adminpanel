export default function ChartSkeleton() {
  return (
    <div className="col-span-12 xl:col-span-8 rounded-sm border border-gray-400/20 bg-white px-5 pt-7 pb-5 shadow-xl sm:px-7 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
          <div>
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="mt-2 h-3 w-60 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Chart body */}
      <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse" />
    </div>
  );
}
