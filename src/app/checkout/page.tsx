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
    }catch(e:any){ toast.error(e.message); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  async function pay() {
    if(!selected){ toast.error("Selecciona una dirección"); return; }
    try{
      await CartService.checkout({ addressId: selected });
      toast.success("Pedido creado");
      router.push("/");
    }catch(e:any){ toast.error(e.message || "Error en checkout"); }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Checkout</h1>
      {loading && <p>Cargando…</p>}
      {!loading && (
        <>
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-2 font-semibold">Direcciones</h2>
            {addresses.length === 0 && <p className="text-sm text-neutral-600">No tienes direcciones. Crea una en <b>/addresses</b>.</p>}
            <ul className="space-y-2">
              {addresses.map(a=>(
                <li key={a.id} className="flex items-center gap-2">
                  <input type="radio" name="addr" checked={selected===a.id} onChange={()=>setSelected(a.id)} />
                  <span className="text-sm">{a.fullName} — {a.line1}, {a.city}</span>
                  {a.isDefault && <span className="ml-2 rounded bg-neutral-200 px-2 py-0.5 text-xs">Default</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button onClick={pay} className="rounded-md bg-black text-white px-4 py-2">Pagar</button>
          </div>
        </>
      )}
    </section>
  );
}
