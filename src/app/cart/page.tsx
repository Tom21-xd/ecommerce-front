"use client";



import { useEffect, useState } from "react";
import { CartService } from "@/service/cart/cart.service";
import type { Cart, CartItem } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";

export default function CartPage() {
  const [cart,setCart]=useState<Cart|null>(null);
  const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    try{
      const c = await CartService.get();
      setCart(c);
    }catch(e: unknown){
      const msg = e instanceof Error ? e.message : "No se pudo cargar el carrito";
      toast.error(msg);
    }finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  // Optimistic UI para cantidad
  async function changeQty(it: CartItem, qty: number) {
    if (qty < 1) return;
    // Actualiza localmente primero
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === it.id ? { ...item, qty } : item
        ),
      };
    });
    try {
      await CartService.updateItem(it.productId, { qty });
      // Opcional: recargar para sincronizar si quieres máxima precisión
      // await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error actualizando cantidad";
      toast.error(msg);
      // Si falla, recarga el carrito real
      await load();
    }
  }
  async function remove(it: CartItem) {
    // Optimista: elimina localmente primero
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

  const items = cart?.items ?? [];
  const total = items.reduce((acc,it)=>acc + Number(it.priceAtAdd)*it.qty, 0);

  return (
  <section className="max-w-5xl mx-auto space-y-8 py-8 px-4 animate-fade-in">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <ShoppingCart size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Mi Carrito
            </h1>
            <p className="text-white/90 text-sm md:text-base mt-1">
              {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {loading && (
        <div className="text-center py-16 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto animate-spin mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-300 font-medium">Cargando carrito...</p>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-16 text-center shadow-lg animate-scale-in">
          <div className="inline-flex p-6 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
            <ShoppingCart size={48} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Tu carrito está vacío</div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">¡Agrega productos increíbles y aparecerán aquí!</p>
          <Link href="/" className="btn-primary inline-block">
            Explorar productos
          </Link>
        </div>
      )}
      {!loading && items.length > 0 && (
        <div className="space-y-6 animate-slide-in-right">
          <div className="rounded-3xl bg-white dark:bg-neutral-900 shadow-xl border-2 border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
            {items.map((it, idx) => {
              const deleted = !it.product;
              return (
                <div
                  key={it.id}
                  className={`flex flex-col sm:flex-row items-center gap-4 p-5 sm:p-6 group hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all duration-300 ${deleted ? "opacity-60" : ""}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-24 h-24 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 overflow-hidden flex items-center justify-center border-2 border-neutral-200 dark:border-neutral-700 shadow-md group-hover:shadow-lg transition-all mb-3 sm:mb-0">
                    {deleted ? (
                      <div className="text-neutral-400"><Trash2 size={32} /></div>
                    ) : (it.product && it.product.ProductImage?.[0]?.base64) ? (
                      <Image
                        src={
                          it.product.ProductImage[0].base64.startsWith("data:")
                            ? it.product.ProductImage[0].base64
                            : `data:image/jpeg;base64,${it.product.ProductImage[0].base64}`
                        }
                        alt={it.product.ProductImage[0].alt || it.product.name}
                        className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-300"
                        width={100}
                        height={100}
                        unoptimized
                      />
                    ) : (
                      <div className="text-neutral-400"><ShoppingCart size={32} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className={`font-bold line-clamp-2 text-base sm:text-lg ${deleted ? "text-red-500" : "text-neutral-900 dark:text-neutral-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"}`}>
                      {deleted ? "Producto eliminado" : it.product?.name}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {deleted ? null : <>SKU: {it.product?.sku ?? "-"}</>}
                    </div>
                    <div className={`text-sm font-bold mt-2 ${deleted ? "text-neutral-400" : "text-green-600 dark:text-green-400"}`}>
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
                    <span className={`w-10 text-center font-bold text-lg select-none ${deleted ? "text-neutral-400" : "text-green-700 dark:text-green-400"}`}>{it.qty}</span>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 active:scale-90 transition-all shadow-sm hover:shadow-md"
                      onClick={() => !deleted && changeQty(it, it.qty + 1)}
                      aria-label="Aumentar cantidad"
                      disabled={deleted}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className={`w-full sm:w-32 text-center sm:text-right font-extrabold text-lg ${deleted ? "text-neutral-400" : "text-neutral-900 dark:text-neutral-100"} mt-3 sm:mt-0`}>
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

          {/* Total y botón de pagar */}
          <div className="glass rounded-3xl p-6 sm:p-8 border-2 border-neutral-200 dark:border-neutral-700 shadow-xl animate-scale-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/20 rounded-2xl p-6 sm:p-8 flex-1 w-full border-2 border-green-200 dark:border-green-700">
                <div className="relative z-10">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">Total a pagar</div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-green-600 dark:text-green-400 tracking-tight">${total.toLocaleString()}</div>
                  <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">{items.length} {items.length === 1 ? 'producto' : 'productos'}</div>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-green-300/20 dark:bg-green-600/10 rounded-full blur-3xl"></div>
              </div>
              <Link
                href="/checkout"
                className="group w-full sm:w-auto rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-4 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Proceder al pago
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
