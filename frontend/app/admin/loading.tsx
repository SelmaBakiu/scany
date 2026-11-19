/**
 * Shown the instant a sidebar link is clicked, while the next admin page loads
 * on the server. The header and the sidebar stay put (they live in the layout);
 * only the content area swaps to this placeholder.
 *
 * Without this file Next.js waits for the whole server response before it
 * changes anything on screen, so a click looked like it did nothing.
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" className="flex animate-pulse flex-col gap-4">
      <div className="h-8 w-48 rounded-lg bg-chip" />
      <div className="h-4 w-72 max-w-full rounded bg-chip" />
      <div className="mt-2 flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 rounded-2xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}
