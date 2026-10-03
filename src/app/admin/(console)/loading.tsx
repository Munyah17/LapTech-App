// Admin console loading skeleton — shows instantly on navigation.
export default function AdminLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-muted" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-muted" />
    </div>
  );
}
