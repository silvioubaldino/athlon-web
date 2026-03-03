export function MediaCardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden animate-pulse">
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-gray-200" />
      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex gap-1">
          <div className="w-7 h-7 rounded bg-gray-200" />
          <div className="w-7 h-7 rounded bg-gray-200" />
          <div className="w-7 h-7 rounded bg-gray-200" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="flex gap-1">
          <div className="h-5 w-16 bg-gray-100 rounded-md" />
          <div className="h-5 w-12 bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>
  )
}
