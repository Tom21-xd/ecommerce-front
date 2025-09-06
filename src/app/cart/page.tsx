"use client";

import { useEffect, useState } from "react";
import { CartService } from "@/service/cart/cart.service";
import type { Cart, CartItem } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";

export default function CartPage() {
  const [cart,setCart]=useState<Cart|null>(null);
  const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    try{
      const c = await CartService.get();
      setCart(c);
    }catch(e:any){
      toast.error(e.message || "No se pudo cargar el carrito");
    }finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  async function changeQty(it: CartItem, qty: number){
    try{
      await CartService.updateItem(it.productId, { qty });
      await load();
    }catch(e:any){ toast.error(e.message); }
  }
  async function remove(it: CartItem){
    try{
      await CartService.removeItem(it.productId);
      await load();
    }catch(e:any){ toast.error(e.message); }
  }

  const items = cart?.items ?? [];
  const total = items.reduce((acc,it)=>acc + Number(it.priceAtAdd)*it.qty, 0);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Carrito</h1>
      {loading && <p>Cargando…</p>}
      {!loading && items.length === 0 && (
        <div className="rounded-xl border bg-white p-6 text-neutral-600">Tu carrito está vacío.</div>
      )}
      {!loading && items.length > 0 && (
        <>
          <table className="w-full text-sm border bg-white">
            <thead className="bg-neutral-100">
              <tr>
                <th className="p-2 border text-left">Producto</th>
                <th className="p-2 border">Precio</th>
                <th className="p-2 border">Cantidad</th>
                <th className="p-2 border">Subtotal</th>
                <th className="p-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(it=>(
                <tr key={it.id}>
                  <td className="p-2 border">{it.product?.name ?? it.productId}</td>
                  <td className="p-2 border text-right">${Number(it.priceAtAdd).toLocaleString()}</td>
                  <td className="p-2 border text-center">
                    <div className="inline-flex items-center gap-2">
                      <button className="px-2 border rounded" onClick={()=>changeQty(it, Math.max(0,it.qty-1))}>-</button>
                      <span>{it.qty}</span>
                      <button className="px-2 border rounded" onClick={()=>changeQty(it, it.qty+1)}>+</button>
                    </div>
                  </td>
                  <td className="p-2 border text-right">
                    ${(Number(it.priceAtAdd)*it.qty).toLocaleString()}
                  </td>
                  <td className="p-2 border text-center">
                    <button className="px-2 py-1 border rounded" onClick={()=>remove(it)}>Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-end gap-4">
            <div className="text-right">
              <div className="text-sm text-neutral-500">Total</div>
              <div className="text-xl font-semibold">${total.toLocaleString()}</div>
            </div>
            <Link href="/checkout" className="rounded-md bg-black text-white px-4 py-2">Ir a pagar</Link>
          </div>
        </>
      )}
    </section>
  );
}
