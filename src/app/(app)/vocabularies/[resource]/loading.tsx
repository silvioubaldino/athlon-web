export default function VocabularyLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-gray-200 rounded-input" />
      </div>
      <div className="bg-white rounded-card border border-gray-200 overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-200" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
