// Instant skeleton while a page streams in — keeps navigations feeling fast.
export default function StoreLoading() {
  return (
    <div className="max-w-content mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-48 sm:h-72 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/3] rounded-xl bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
