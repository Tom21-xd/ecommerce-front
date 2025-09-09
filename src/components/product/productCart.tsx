"use client";

import type { Product } from "@/lib/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShoppingCart } from "lucide-react";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { useState } from "react";
import { CartService } from "@/service/cart/cart.service";

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

export default function ProductCard({ product, hideAddToCart }: { product: Product; hideAddToCart?: boolean }) {
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const lowStock = product.quantity <= 5;
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const user = useCurrentUser();
  const isOwner = user && product.container?.user?.id === user.id;

  const handleAddToCart = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await CartService.addItem({ productId: product.id, qty: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch {
      // Podrías mostrar un toast aquí
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="group flex flex-col rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100">
        <ProductImageCarousel images={product.ProductImage} alt={product.name} />
        {lowStock && (
          <span className="absolute top-2 left-2 rounded-md bg-red-500 px-2 py-1 text-[10px] font-semibold text-white shadow">
            Stock bajo
          </span>
        )}
      </div>

      {/* Info */}
      <header className="mt-3 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-800">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">SKU: {product.sku}</p>
      </header>

      {/* Precio + Stock + Botón */}
      <footer className="mt-3 flex items-center justify-between">
        <div>
          <span className="block text-base font-bold text-emerald-600">
            {money.format(price ?? 0)}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {product.quantity}
          </span>
        </div>
        {!(hideAddToCart || isOwner) && (
          <button
            className={`ml-2 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow transition ${added ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"}`}
            onClick={handleAddToCart}
            disabled={loading || added}
          >
            <ShoppingCart size={14} />
            {added ? "Agregado" : loading ? "Agregando..." : "Agregar"}
          </button>
        )}
      </footer>
    </article>
  );
}
