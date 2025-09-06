"use client";
import { useState } from "react";

export default function SearchBar({
  onSearch,
  initial = "",
  placeholder = "Buscar por nombre o SKU…",
}: {
  onSearch: (q: string) => void;
  initial?: string;
  placeholder?: string;
}) {
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(q.trim());
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="border rounded-md px-3 py-2 w-full"
      />
      <button type="submit" className="px-3 py-2 rounded-md border bg-white">
        Buscar
      </button>
    </form>
  );
}
