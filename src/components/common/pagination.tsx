"use client";

export default function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;         // 1-based
  totalPages: number;   // >= 1
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const prev = () => onPage(Math.max(1, page - 1));
  const next = () => onPage(Math.min(totalPages, page + 1));

  // Rango compacto
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 8); // limita a 8 para UI simple

  return (
    <nav className="mt-6 flex items-center justify-center gap-1 text-sm">
      <button className="px-3 py-1 border rounded-md bg-white disabled:opacity-50" onClick={prev} disabled={page === 1}>
        ◀
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`px-3 py-1 border rounded-md ${p === page ? "bg-black text-white" : "bg-white"}`}
        >
          {p}
        </button>
      ))}
      <button
        className="px-3 py-1 border rounded-md bg-white disabled:opacity-50"
        onClick={next}
        disabled={page === totalPages}
      >
        ▶
      </button>
    </nav>
  );
}
