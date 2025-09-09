"use client";
import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/lib/types";
import { ProductsService } from "@/service/products/product.service";
import SearchBar from "@/components/common/searchBar";
import LoadingGrid from "@/components/common/loadingGrid";
import EmptyState from "@/components/common/emptyState";
import ProductGrid from "@/components/product/productGrid";
import Pagination from "@/components/common/pagination";

const PAGE_SIZE = 12;

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // estado UI
  const [page, setPage] = useState(1);          // 1-based
  const [query, setQuery] = useState("");       // búsqueda por nombre

  const showPagination = useMemo(() => query.length === 0, [query]);

  async function loadList(p = 1) {
    setLoading(true);
    setError(null);
    try {
      const res = await ProductsService.list({
        limit: PAGE_SIZE,
        offset: (p - 1) * PAGE_SIZE,
      });
      setItems(res.products ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error cargando productos";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSearch(q: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await ProductsService.search(q);
      setItems(res.products ?? []);
      setTotalPages(1); // sin paginación en match
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error buscando productos";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadList(1); }, []);

  function onSearch(q: string) {
    setQuery(q);
    setPage(1);
    if (q) loadSearch(q);
    else loadList(1);
  }

  function onPage(p: number) {
    setPage(p);
    loadList(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Productos</h1>
          <p className="text-sm text-neutral-500">Explora el catálogo disponible</p>
        </div>
        <div className="w-full max-w-md">
          <SearchBar onSearch={onSearch} />
        </div>
      </header>

      {loading && <LoadingGrid count={PAGE_SIZE} />}

      {!loading && error && (
        <div className="rounded-xl border bg-white p-4 text-red-600">{error}</div>
      )}

      {!loading && !error && items.length === 0 && <EmptyState />}

      {!loading && !error && items.length > 0 && <ProductGrid items={items} />}

      {!loading && !error && showPagination && (
        <Pagination page={page} totalPages={totalPages} onPage={onPage} />
      )}
    </section>
  );
}
