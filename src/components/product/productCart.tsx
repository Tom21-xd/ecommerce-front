"use client";

import type { Product } from "@/lib/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShoppingCart, Eye, TrendingUp, Store, Power, PowerOff, Edit } from "lucide-react";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { useState } from "react";
import { CartService } from "@/service/cart/cart.service";
import { ProductsService } from "@/service/products/product.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function ProductCard({ product, hideAddToCart, onStatusChange }: { product: Product; hideAddToCart?: boolean; onStatusChange?: (updatedProduct: Product) => void }) {
  const router = useRouter();
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const lowStock = product.quantity <= 5;
  const outOfStock = product.quantity === 0;
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const user = useCurrentUser();
  const isOwner = user && product.container?.user?.id === user.id;
  const isActive = product.isActive !== false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || outOfStock) return;
    setLoading(true);
    try {
      await CartService.addItem({ productId: product.id, qty: 1 });
      setAdded(true);
      toast.success("✨ Producto agregado al carrito");
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error("Error al agregar al carrito");
    } finally {
      setLoading(false);
    }
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.container?.user?.id) {
      router.push(`/seller/${product.container.user.id}`);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      const updatedProduct = await ProductsService.toggleStatus(product.id);
      toast.success(updatedProduct.isActive ? "✅ Producto activado" : "⏸️ Producto desactivado");
      if (onStatusChange) {
        onStatusChange(updatedProduct);
      }
    } catch {
      toast.error("Error al cambiar el estado del producto");
    } finally {
      setToggling(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/dashboard/edit-product/${product.id}`);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <article className={`relative flex flex-col h-full rounded-2xl border-2 bg-white dark:bg-neutral-900 p-4 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${
        !isActive
          ? 'border-red-300 dark:border-red-800 opacity-60 hover:border-red-400 dark:hover:border-red-700'
          : 'border-neutral-200 dark:border-neutral-800 hover:border-green-400 dark:hover:border-green-500'
      }`}>

        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
          <ProductImageCarousel images={product.ProductImage} alt={product.name} />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {!isActive && (
              <span className="animate-pulse rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                Inactivo
              </span>
            )}
            {outOfStock && (
              <span className="animate-pulse rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                Agotado
              </span>
            )}
            {lowStock && !outOfStock && isActive && (
              <span className="animate-pulse rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                ¡Últimas!
              </span>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/90 dark:bg-neutral-900/90 px-3 py-2 text-xs font-semibold text-neutral-900 dark:text-white backdrop-blur-sm transition hover:bg-white dark:hover:bg-neutral-800"
            >
              <Eye size={14} />
              Ver detalles
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-1 flex-col">
          {/* Title & Brand */}
          <div className="flex-1">
            <h3 className="line-clamp-2 text-base font-bold text-neutral-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {product.marca && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {product.marca.nombre}
                </span>
              )}
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                SKU: {product.sku}
              </span>
            </div>

            {/* Seller Info */}
            {product.container?.user && (
              <button
                onClick={handleSellerClick}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors group/seller"
              >
                <Store size={14} className="group-hover/seller:scale-110 transition-transform" />
                <span className="group-hover/seller:underline">
                  {product.container.user.username || "Ver tienda"}
                </span>
              </button>
            )}
          </div>

          {/* Price & Stock Section */}
          <div className="mt-4 space-y-3">
            {/* Price */}
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {money.format(price ?? 0)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Stock: <span className="font-semibold">{product.quantity}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!(hideAddToCart || isOwner) && (
              <button
                onClick={handleAddToCart}
                disabled={loading || added || outOfStock}
                className={`
                  w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-md transition-all duration-300
                  ${added
                    ? 'bg-emerald-500 text-white'
                    : outOfStock
                    ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                `}
              >
                <ShoppingCart size={16} className={added ? "animate-bounce" : ""} />
                {added ? "¡Agregado!" : loading ? "Agregando..." : outOfStock ? "Sin stock" : "Agregar"}
              </button>
            )}

            {/* Owner Actions - Edit and Toggle Status */}
            {hideAddToCart && (
              <div className="grid grid-cols-2 gap-2">
                {/* Botón Editar */}
                <button
                  onClick={handleEdit}
                  className="group/edit relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95"
                  title="Editar producto"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/edit:opacity-100 transition-opacity duration-300"></div>
                  <Edit size={14} className="relative z-10 group-hover/edit:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Editar</span>
                </button>

                {/* Botón Toggle Status */}
                <button
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className={`
                    group/toggle relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold overflow-hidden text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95
                    ${isActive
                      ? 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600 shadow-red-500/30 hover:shadow-red-500/40'
                      : 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 shadow-green-500/30 hover:shadow-green-500/40'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                  `}
                  title={isActive ? "Desactivar producto" : "Activar producto"}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-300"></div>
                  {toggling ? (
                    <div className="relative z-10 w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isActive ? (
                        <PowerOff size={14} className="relative z-10 group-hover/toggle:scale-110 transition-transform duration-300" />
                      ) : (
                        <Power size={14} className="relative z-10 group-hover/toggle:scale-110 transition-transform duration-300" />
                      )}
                      <span className="relative z-10">{isActive ? "Ocultar" : "Mostrar"}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
      </article>
    </Link>
  );
}
