"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UsersService } from "@/service/users/users.service";
import { ProductsService } from "@/service/products/product.service";
import type { User, Product } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import { Store, Package, TrendingUp, Mail, Phone, ArrowLeft, Search } from "lucide-react";
import ProductGrid from "@/components/product/productGrid";

export default function SellerProfilePage() {
  const params = useParams();
  const [seller, setSeller] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        // Obtener información del vendedor
        const sellerData = await UsersService.getById(Number(id));
        setSeller(sellerData);

        // Obtener productos del vendedor
        const allProducts = await ProductsService.list({ limit: 1000, offset: 0 });
        const sellerProducts = allProducts.products.filter(
          (p) => p.container?.user?.id === Number(id)
        );
        setProducts(sellerProducts);
        setFilteredProducts(sellerProducts);
      } catch (error) {
        toast.error("Error cargando perfil del vendedor");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  if (loading) {
    return (
      <section className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto animate-spin"></div>
          <p className="text-neutral-600 dark:text-neutral-300 font-medium">Cargando perfil...</p>
        </div>
      </section>
    );
  }

  if (!seller) {
    return (
      <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-full">
          <Store size={48} className="text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Vendedor no encontrado</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">El vendedor que buscas no existe</p>
        </div>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const activeProducts = filteredProducts.filter((p) => p.isActive);
  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const avgPrice = products.length > 0
    ? products.reduce((acc, p) => acc + (typeof p.price === "string" ? parseFloat(p.price) : p.price), 0) / products.length
    : 0;

  return (
    <section className="space-y-8 animate-fade-in py-4 px-4 max-w-7xl mx-auto">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-green-600 dark:text-neutral-400 dark:hover:text-green-400 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver al catálogo
      </Link>

      {/* Seller Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-6 bg-white/20 backdrop-blur-sm rounded-3xl">
            <Store size={64} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
              <span className="text-white text-xs font-bold uppercase">{seller.role}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              {seller.username}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
              {seller.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{seller.email}</span>
                </div>
              )}
              {seller.phones && (
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>{seller.phones}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-right">
        <div className="glass rounded-2xl p-6 border-2 border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Package size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Productos</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border-2 border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Productos Activos</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">{activeProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border-2 border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Package size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Stock Total</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">{totalStock}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border-2 border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Precio Promedio</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">${avgPrice.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass rounded-2xl p-6 shadow-lg border-2 border-neutral-200 dark:border-neutral-700 animate-scale-in">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos de este vendedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-center text-neutral-600 dark:text-neutral-400">
              Mostrando {filteredProducts.length} de {products.length} productos
            </p>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Productos de {seller.username}
          </h2>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
            <Package size={48} className="mx-auto mb-4 text-neutral-400" />
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {searchQuery ? "No se encontraron productos" : "Este vendedor no tiene productos"}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {searchQuery ? "Intenta con otra búsqueda" : "Vuelve más tarde para ver nuevos productos"}
            </p>
          </div>
        ) : (
          <ProductGrid items={filteredProducts} />
        )}
      </div>
    </section>
  );
}
