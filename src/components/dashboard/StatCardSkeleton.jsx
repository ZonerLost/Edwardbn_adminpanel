export default function StatCardSkeleton() {
  return (
    <div className="rounded-sm bg-white py-6 px-7 shadow-lg">
      <div className="h-11 w-11 rounded-full bg-gray-200 animate-pulse" />
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
