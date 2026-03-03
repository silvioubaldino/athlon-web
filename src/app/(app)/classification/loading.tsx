export default function ClassificationLoading() {
  return (
    <div className="animate-pulse space-y-6 pb-32">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="w-full aspect-video bg-gray-200 rounded-card" />
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-200" />
    </div>
  )
}
