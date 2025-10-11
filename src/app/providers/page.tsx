"use client";

import { useEffect, useState } from "react";
import { UsersService } from "@/service/users/users.service";
import { ProductsService } from "@/service/products/product.service";
import type { User } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import { Store, Package, Search, TrendingUp, Mail, Phone } from "lucide-react";

type ProviderWithStats = User & {
  totalProducts: number;
  activeProducts: number;
  totalStock: number;
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderWithStats[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Obtener todos los usuarios que pueden ser proveedores (SELLERS y BUYERS)
        const sellers = await UsersService.byRole("SELLER");
        const buyers = await UsersService.byRole("BUYER");
        const allProviders = [...sellers, ...buyers];

        // Obtener todos los productos para calcular estadísticas
        const allProductsResponse = await ProductsService.list({ limit: 10000, offset: 0 });
        const allProducts = allProductsResponse.products || [];

        // Calcular estadísticas para cada proveedor
        const providersWithStats: ProviderWithStats[] = allProviders.map((provider) => {
          const providerProducts = allProducts.filter(
            (p) => p.container?.user?.id === provider.id
          );
          const activeProducts = providerProducts.filter((p) => p.isActive);
          const totalStock = providerProducts.reduce((acc, p) => acc + p.quantity, 0);

          return {
            ...provider,
            totalProducts: providerProducts.length,
            activeProducts: activeProducts.length,
            totalStock,
          };
        });

        setProviders(providersWithStats);
        setFilteredProviders(providersWithStats);
      } catch (error) {
        toast.error("Error cargando proveedores");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter(
        (p) =>
          p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProviders(filtered);
    }
  }, [searchQuery, providers]);

  if (loading) {
    return (
      <section className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto animate-spin"></div>
          <p className="text-neutral-600 dark:text-neutral-300 font-medium">Cargando proveedores...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Store size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Nuestros Proveedores
            </h1>
            <p className="text-white/90 text-sm md:text-base mt-1">
              Descubre a los vendedores y sus productos
            </p>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Search Bar */}
      <div className="glass rounded-2xl p-6 shadow-lg border-2 border-neutral-200 dark:border-neutral-700 animate-scale-in">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Buscar proveedor por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-center text-neutral-600 dark:text-neutral-400">
              Mostrando {filteredProviders.length} de {providers.length} proveedores
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-in-right">
        <div className="glass rounded-2xl p-6 border-2 border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Store size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Proveedores</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">{providers.length}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border-2 border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Package size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Productos</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {providers.reduce((acc, p) => acc + p.totalProducts, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border-2 border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Stock Total</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {providers.reduce((acc, p) => acc + p.totalStock, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {searchQuery ? "Resultados de búsqueda" : "Todos los Proveedores"}
          </h2>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {filteredProviders.length} {filteredProviders.length === 1 ? "proveedor" : "proveedores"}
          </span>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 animate-scale-in">
            <Store size={48} className="mx-auto mb-4 text-neutral-400" />
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No se encontraron proveedores
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {searchQuery ? "Intenta con otra búsqueda" : "No hay proveedores registrados"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider, idx) => (
              <Link
                key={provider.id}
                href={`/seller/${provider.id}`}
                className="group block animate-slide-in-right"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <article className="h-full rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-400 dark:hover:border-green-500">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
                      <Store size={32} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {provider.username}
                      </h3>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        {provider.role}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    {provider.email && (
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Mail size={14} />
                        <span className="truncate">{provider.email}</span>
                      </div>
                    )}
                    {provider.phones && (
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Phone size={14} />
                        <span>{provider.phones}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {provider.totalProducts}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        Productos
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {provider.activeProducts}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        Activos
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {provider.totalStock}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        Stock
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 text-sm font-bold shadow-md transition-all duration-300 group-hover:from-green-700 group-hover:to-emerald-700 group-hover:shadow-lg group-hover:-translate-y-0.5">
                    <Store size={16} />
                    Ver Productos
                  </button>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
