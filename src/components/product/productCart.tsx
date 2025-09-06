"use client";
import type { Product } from "@/lib/types";

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" });

export default function ProductCard({ product }: { product: Product }) {
  const img = "/placeholder.svg"; 
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;

  return (
    <article className="group rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-100">
        <img src={img} alt={product.name} className="h-full w-full object-cover" />
      </div>

      <header className="mt-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
        <p className="mt-1 text-xs text-neutral-500">SKU: {product.sku}</p>
      </header>

      <footer className="mt-2 flex items-center justify-between">
        <span className="text-base font-semibold">{money.format(price ?? 0)}</span>
        <span className="text-xs text-neutral-500">Stock: {product.quantity}</span>
      </footer>
    </article>
  );
}
