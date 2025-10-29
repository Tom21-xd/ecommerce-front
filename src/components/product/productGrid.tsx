"use client";
import type { Product } from "@/lib/types";
import ProductCard from "./productCart";

export default function ProductGrid({ items, hideAddToCart, onStatusChange }: { items: Product[]; hideAddToCart?: boolean; onStatusChange?: (updatedProduct: Product) => void }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} hideAddToCart={hideAddToCart} onStatusChange={onStatusChange} />
        </li>
      ))}
    </ul>
  );
}
