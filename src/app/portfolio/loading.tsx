export default function PortfolioLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse max-w-6xl mx-auto py-8">
      {/* Title skeleton */}
      <div className="space-y-3 text-center flex flex-col items-center">
        <div className="h-10 w-64 bg-white/10 rounded-2xl" />
        <div className="h-4 w-96 bg-white/5 rounded-full" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex justify-center gap-3 py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 bg-white/10 rounded-full" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between p-4 space-y-4">
            <div className="h-44 rounded-xl bg-white/10 w-full" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </div>
            <div className="h-8 w-full bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

