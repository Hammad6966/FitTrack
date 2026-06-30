export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-gray-800/50 border border-gray-700/40 rounded-2xl overflow-hidden animate-pulse ${className}`}>
      <div className="h-44 bg-gray-700/50" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-gray-700/60 rounded-full" />
          <div className="h-5 w-16 bg-gray-700/60 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-gray-700/50 rounded-lg" />
        <div className="h-4 w-full bg-gray-700/40 rounded-lg" />
        <div className="h-4 w-2/3 bg-gray-700/40 rounded-lg" />
        <div className="h-10 w-full bg-gray-700/40 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse border-b border-gray-700/20 last:border-0">
      <div className="w-9 h-9 rounded-full bg-gray-700/60 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-32 bg-gray-700/60 rounded-md" />
        <div className="h-3 w-48 bg-gray-700/40 rounded-md" />
      </div>
      <div className="h-5 w-16 bg-gray-700/50 rounded-full" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-700/60" />
        <div className="h-4 w-12 bg-gray-700/50 rounded-full" />
      </div>
      <div className="h-7 w-24 bg-gray-700/60 rounded-lg mb-1" />
      <div className="h-3.5 w-28 bg-gray-700/40 rounded-md" />
    </div>
  );
}

export default SkeletonCard;
