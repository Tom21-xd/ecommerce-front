"use client";

import { useEffect, useState } from "react";
import { AddressesService } from "@/service/addresses/addresses.service";
import { CartService } from "@/service/cart/cart.service";
import type { Address } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses,setAddresses]=useState<Address[]>([]);
  const [selected,setSelected]=useState<number|undefined>(undefined);
  const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    try{
      const res = await AddressesService.list();
      setAddresses(res);
      const def = res.find(a=>a.isDefault);
      setSelected(def?.id ?? res[0]?.id);
    }catch(e: unknown){
      const msg = e instanceof Error ? e.message : "Error cargando direcciones";
      toast.error(msg);
    }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  async function pay() {
    if(!selected){ toast.error("Selecciona una dirección"); return; }
    try{
      await CartService.checkout({ addressId: selected });
      toast.success("Pedido creado");
      router.push("/");
    }catch(e: unknown){
      const msg = e instanceof Error ? e.message : "Error en checkout";
      toast.error(msg);
    }
  }

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-center text-neutral-900 dark:text-neutral-100">Checkout</h1>
        {loading && <p className="text-center text-neutral-600 dark:text-neutral-300">Cargando…</p>}
        {!loading && (
          <>
            <div className="rounded-xl border bg-white/80 dark:bg-neutral-900/80 p-6 shadow">
              <h2 className="mb-3 font-semibold text-neutral-800 dark:text-neutral-200">Direcciones</h2>
              {addresses.length === 0 && <p className="text-sm text-neutral-600 dark:text-neutral-400">No tienes direcciones. Crea una en <b>/addresses</b>.</p>}
              <ul className="space-y-3">
                {addresses.map(a=>(
                  <li key={a.id} className="flex items-center gap-2">
                    <input type="radio" name="addr" checked={selected===a.id} onChange={()=>setSelected(a.id)} className="accent-primary-600 dark:accent-primary-400" />
                    <span className="text-sm text-neutral-800 dark:text-neutral-100">{a.fullName} — {a.line1}, {a.city}</span>
                    {a.isDefault && <span className="ml-2 rounded bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 text-xs text-neutral-700 dark:text-neutral-200">Default</span>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={pay}
                className="rounded-md bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 font-semibold transition hover:bg-primary-700 dark:hover:bg-primary-400"
              >
                Pagar
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
