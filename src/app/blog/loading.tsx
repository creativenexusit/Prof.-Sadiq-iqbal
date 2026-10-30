export default function BlogLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse max-w-6xl mx-auto py-8">
      <div className="space-y-3 text-center flex flex-col items-center">
        <div className="h-10 w-48 bg-white/10 rounded-2xl" />
        <div className="h-4 w-80 bg-white/5 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="h-5 w-24 bg-white/10 rounded-full" />
              <div className="h-5 w-full bg-white/10 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
            <div className="h-6 w-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

