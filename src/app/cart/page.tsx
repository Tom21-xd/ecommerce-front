"use client";

import { useEffect, useMemo, useState } from "react";
import { CartService } from "@/service/cart/cart.service";
import type { Cart, CartItem } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const c = await CartService.get();
      setCart(c);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudo cargar el carrito";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeQty(it: CartItem, qty: number) {
    if (qty < 1) return;
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => (item.id === it.id ? { ...item, qty } : item)),
      };
    });
    try {
      await CartService.updateItem(it.productId, { qty });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error actualizando cantidad";
      toast.error(msg);
      await load();
    }
  }

  async function remove(it: CartItem) {
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== it.id),
      };
    });
    try {
      await CartService.removeItem(it.productId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error eliminando";
      toast.error(msg);
      await load();
    }
  }

  const items = useMemo(() => cart?.items ?? [], [cart]);

  const sellerGroups = useMemo(() => {
    const groups = new Map<
      number,
      { sellerId: number; sellerName: string; sellerEmail?: string; items: CartItem[] }
    >();
    for (const it of items) {
      const seller = it.product?.container?.user;
      const sellerId =
        seller?.id ?? it.product?.container?.userId ?? it.product?.containerId;
      if (!sellerId) continue;
      if (!groups.has(sellerId)) {
        groups.set(sellerId, {
          sellerId,
          sellerName: seller?.username || seller?.email || `Vendedor #${sellerId}`,
          sellerEmail: seller?.email,
          items: [],
        });
      }
      groups.get(sellerId)!.items.push(it);
    }
    return Array.from(groups.values());
  }, [items]);

  const total = items.reduce(
    (acc, it) => acc + Number(it.priceAtAdd) * it.qty,
    0,
  );

  return (
    <section className="max-w-5xl mx-auto space-y-8 py-8 px-4 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <ShoppingCart size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Mi Carrito
            </h1>
            <p className="text-white/90 text-sm md:text-base mt-1">
              {items.length} {items.length === 1 ? "producto" : "productos"} en tu carrito
            </p>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {loading && (
        <div className="text-center py-16 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto animate-spin mb-4" />
          <p className="text-neutral-600 dark:text-neutral-300 font-medium">Cargando carrito...</p>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-16 text-center shadow-lg animate-scale-in">
          <div className="inline-flex p-6 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
            <ShoppingCart size={48} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Tu carrito está vacío
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Agrega productos increíbles y aparecerán aquí
          </p>
          <Link href="/" className="btn-primary inline-block">
            Explorar productos
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-8 animate-slide-in-right">
          {sellerGroups.map((group, groupIdx) => {
            const groupTotal = group.items.reduce(
              (sum, it) => sum + Number(it.priceAtAdd) * it.qty,
              0,
            );
            return (
              <div
                key={group.sellerId}
                className="rounded-3xl bg-white dark:bg-neutral-900 shadow-xl border-2 border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                <div className="flex flex-col gap-1 px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    Carrito #{groupIdx + 1}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {group.sellerName}
                    </h2>
                    {group.sellerEmail && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {group.sellerEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {group.items.map((it) => {
                    const deleted = !it.product;
                    return (
                      <div
                        key={it.id}
                        className={`flex flex-col sm:flex-row items-center gap-4 p-5 sm:p-6 group hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all duration-300 ${deleted ? "opacity-60" : ""}`}
                      >
                        <div className="w-full sm:w-24 h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shadow-inner">
                          {deleted ? (
                            <div className="text-xs text-neutral-400 text-center px-2">
                              Producto no disponible
                            </div>
                          ) : it.product?.ProductImage && it.product.ProductImage[0] ? (
                            <Image
                              src={it.product.ProductImage[0].base64}
                              alt={it.product.ProductImage[0].alt || it.product.name}
                              width={96}
                              height={96}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="text-neutral-400 text-sm">Sin imagen</div>
                          )}
                        </div>

                        <div className="flex-1 w-full">
                          <div
                            className={`text-lg font-semibold ${
                              deleted
                                ? "text-neutral-400"
                                : "text-neutral-900 dark:text-neutral-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
                            }`}
                          >
                            {deleted ? "Producto eliminado" : it.product?.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {deleted ? null : <>SKU: {it.product?.sku ?? "-"}</>}
                          </div>
                          <div
                            className={`text-sm font-bold mt-2 ${
                              deleted ? "text-neutral-400" : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {deleted ? null : <>${Number(it.priceAtAdd).toLocaleString()} c/u</>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3 sm:mt-0 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-2">
                          <button
                            className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 active:scale-90 transition-all shadow-sm hover:shadow-md"
                            onClick={() => !deleted && changeQty(it, Math.max(1, it.qty - 1))}
                            aria-label="Disminuir cantidad"
                            disabled={deleted}
                          >
                            <Minus size={18} />
                          </button>
                          <span
                            className={`w-10 text-center font-bold text-lg select-none ${
                              deleted ? "text-neutral-400" : "text-green-700 dark:text-green-400"
                            }`}
                          >
                            {it.qty}
                          </span>
                          <button
                            className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 active:scale-90 transition-all shadow-sm hover:shadow-md"
                            onClick={() => !deleted && changeQty(it, it.qty + 1)}
                            aria-label="Aumentar cantidad"
                            disabled={deleted}
                          >
                            <Plus size={18} />
                          </button>
                        </div>

                        <div
                          className={`w-full sm:w-32 text-center sm:text-right font-extrabold text-lg ${
                            deleted ? "text-neutral-400" : "text-neutral-900 dark:text-neutral-100"
                          } mt-3 sm:mt-0`}
                        >
                          ${(Number(it.priceAtAdd) * it.qty).toLocaleString()}
                        </div>

                        <button
                          className="ml-0 sm:ml-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-90 transition-all shadow-sm hover:shadow-md"
                          onClick={() => remove(it)}
                          aria-label="Quitar producto"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-neutral-50 dark:bg-neutral-900/60 px-6 py-5 border-t border-neutral-200 dark:border-neutral-800">
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Total para este vendedor
                    </p>
                    <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                      ${groupTotal.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/checkout?sellerId=${group.sellerId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-95"
                  >
                    Continuar con {group.sellerName}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}

          <div className="glass rounded-3xl p-6 sm:p-8 border-2 border-neutral-200 dark:border-neutral-700 shadow-xl animate-scale-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/20 rounded-2xl p-6 sm:p-8 flex-1 w-full border-2 border-green-200 dark:border-green-700">
                <div className="relative z-10">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">
                    Total en el carrito
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-green-600 dark:text-green-400 tracking-tight">
                    ${total.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                    {items.length} {items.length === 1 ? "producto" : "productos"}
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-green-300/20 dark:bg-green-600/10 rounded-full blur-3xl" />
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                Cada vendedor procesa su propio pago con ePayco. Selecciona el botón de su carrito
                para confirmar la dirección y completar el pago de manera independiente.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
