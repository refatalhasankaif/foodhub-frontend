export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-50">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-400 border-t-transparent"></div>
        <span className="text-orange-400 font-bold text-2xl tracking-wide">Loading...</span>
      </div>
    </div>
  )
}