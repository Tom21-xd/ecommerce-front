export default function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-xl border bg-white p-4 animate-pulse">
          <div className="aspect-[4/3] w-full rounded-lg bg-neutral-200" />
          <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-neutral-100" />
          <div className="mt-2 h-4 w-1/3 rounded bg-neutral-200" />
        </li>
      ))}
    </ul>
  );
}
