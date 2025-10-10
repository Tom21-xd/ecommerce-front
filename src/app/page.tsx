"use client";
import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/lib/types";
import { ProductsService } from "@/service/products/product.service";
import SearchBar from "@/components/common/searchBar";
import LoadingGrid from "@/components/common/loadingGrid";
import EmptyState from "@/components/common/emptyState";
import ProductGrid from "@/components/product/productGrid";
import Pagination from "@/components/common/pagination";
import { Sparkles, TrendingUp, Package } from "lucide-react";

const PAGE_SIZE = 12;

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
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
      setTotalProducts(res.totalProducts ?? 0);
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
      setTotalProducts(res.products?.length ?? 0);
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
    <section className="space-y-8 animate-fade-in">
      {/* Hero Section con Gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                Catálogo de Productos
              </h1>
              <p className="text-white/90 text-sm md:text-base mt-1">
                Descubre productos increíbles a los mejores precios
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-white" />
                <div>
                  <p className="text-white/70 text-xs">Productos</p>
                  <p className="text-white text-xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-white" />
                <div>
                  <p className="text-white/70 text-xs">Página</p>
                  <p className="text-white text-xl font-bold">{page} / {totalPages}</p>
                </div>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-white" />
                <div>
                  <p className="text-white/70 text-xs">En catálogo</p>
                  <p className="text-white text-xl font-bold">{items.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Search Bar */}
      <div className="glass rounded-2xl p-6 shadow-lg animate-slide-in-right">
        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={onSearch} />
          {query && (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 text-center">
              Buscando: <span className="font-semibold text-green-600 dark:text-green-400">{query}</span>
            </p>
          )}
        </div>
      </div>

      {/* Loading State con Shimmer */}
      {loading && (
        <div className="animate-scale-in">
          <LoadingGrid count={PAGE_SIZE} />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="animate-scale-in">
          <EmptyState />
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && items.length > 0 && (
        <div className="animate-fade-in">
          <ProductGrid items={items} />
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && showPagination && totalPages > 1 && (
        <div className="animate-slide-in-right">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </section>
  );
}
