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
  <section className="max-w-3xl mx-auto space-y-6 py-4 font-sans">
      <h1 className="text-2xl font-extrabold flex items-center gap-2 text-emerald-700 tracking-tight drop-shadow-sm">
        <ShoppingCart size={24} className="text-emerald-600" /> Carrito de compras
      </h1>
      {loading && <p className="text-center text-neutral-500">Cargando…</p>}
      {!loading && items.length === 0 && (
        <div className="rounded-3xl border bg-white p-10 text-neutral-600 text-center shadow-lg">
          <ShoppingCart size={40} className="mx-auto mb-2 text-neutral-300" />
          <div className="text-lg font-semibold tracking-tight">Tu carrito está vacío.</div>
          <div className="text-sm mt-2 text-neutral-400">¡Agrega productos y aparecerán aquí!</div>
        </div>
      )}
      {!loading && items.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white shadow-lg divide-y">
            {items.map((it) => {
              const deleted = !it.product;
              return (
                <div key={it.id} className={`flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 group hover:bg-emerald-50/40 transition rounded-2xl ${deleted ? "opacity-60" : ""}`}>
                  <div className="w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl bg-neutral-100 overflow-hidden flex items-center justify-center border border-neutral-200 shadow-sm mb-3 sm:mb-0">
                    {deleted ? (
                      <div className="text-neutral-300"><Trash2 size={32} /></div>
                    ) : (it.product && it.product.ProductImage?.[0]?.base64) ? (
                      <Image
                        src={
                          it.product.ProductImage[0].base64.startsWith("data:")
                            ? it.product.ProductImage[0].base64
                            : `data:image/jpeg;base64,${it.product.ProductImage[0].base64}`
                        }
                        alt={it.product.ProductImage[0].alt || it.product.name}
                        className="object-cover w-full h-full transition group-hover:scale-105"
                        width={100}
                        height={100}
                        unoptimized
                      />
                    ) : (
                      <div className="text-neutral-300"><ShoppingCart size={32} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className={`font-semibold line-clamp-1 text-base ${deleted ? "text-red-500" : "text-gray-800 group-hover:text-emerald-700 transition"}`}>
                      {deleted ? "Producto eliminado" : it.product?.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {deleted ? null : <>SKU: {it.product?.sku ?? "-"}</>}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${deleted ? "text-gray-400" : "text-emerald-600"}`}>
                      {deleted ? null : <>${Number(it.priceAtAdd).toLocaleString()} c/u</>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition"
                      onClick={() => !deleted && changeQty(it, Math.max(1, it.qty - 1))}
                      aria-label="Disminuir cantidad"
                      disabled={deleted}
                    >
                      <Minus size={16} />
                    </button>
                    <span className={`w-8 text-center font-semibold text-base select-none ${deleted ? "text-gray-400" : "text-emerald-700"}`}>{it.qty}</span>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition"
                      onClick={() => !deleted && changeQty(it, it.qty + 1)}
                      aria-label="Aumentar cantidad"
                      disabled={deleted}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className={`w-full sm:w-24 text-right font-bold text-base ${deleted ? "text-gray-400" : "text-gray-700"} mt-2 sm:mt-0`}>
                    ${(Number(it.priceAtAdd) * it.qty).toLocaleString()}
                  </div>
                  <button
                    className="ml-2 p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 active:scale-90 transition"
                    onClick={() => remove(it)}
                    aria-label="Quitar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 mt-6">
            <div className="bg-emerald-50 rounded-2xl p-6 flex flex-col items-start shadow-inner border border-emerald-100">
              <div className="text-sm text-neutral-500">Total a pagar</div>
              <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">${total.toLocaleString()}</div>
            </div>
            <Link
              href="/checkout"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 font-bold text-lg shadow-lg transition active:scale-95"
            >
              Ir a pagar
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
