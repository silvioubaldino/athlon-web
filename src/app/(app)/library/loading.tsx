import { MediaCardSkeleton } from '@/components/media/MediaCardSkeleton'

export default function LibraryLoading() {
  return (
    <div>
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <MediaCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
