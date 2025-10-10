"use client";

import { useEffect, useState } from "react";
import { AddressesService } from "@/service/addresses/addresses.service";
import { CartService } from "@/service/cart/cart.service";
import type { Address } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Check, Plus } from "lucide-react";
import Link from "next/link";

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
    <section className="min-h-[80vh] px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600 p-8 shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <CreditCard size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                Finalizar Compra
              </h1>
              <p className="text-white/90 text-sm md:text-base mt-1">
                Revisa tu pedido y confirma la entrega
              </p>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {loading && (
          <div className="text-center py-16 animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto animate-spin mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-300 font-medium">Cargando información...</p>
          </div>
        )}

        {!loading && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Direcciones */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-6 shadow-lg animate-slide-in-right">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <MapPin size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Dirección de entrega</h2>
                  </div>
                  <Link href="/addresses" className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium">
                    <Plus size={16} className="inline mr-1" />
                    Agregar nueva
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                    <MapPin size={40} className="mx-auto mb-3 text-neutral-400" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">No tienes direcciones guardadas</p>
                    <Link href="/addresses" className="btn-primary inline-block text-sm">
                      Crear dirección
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {addresses.map(a => (
                      <li key={a.id}>
                        <label
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selected === a.id
                              ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20 shadow-md'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="addr"
                            checked={selected === a.id}
                            onChange={() => setSelected(a.id)}
                            className="mt-1 w-5 h-5 accent-green-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-neutral-900 dark:text-neutral-100">{a.fullName}</span>
                              {a.isDefault && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-300">
                                  <Check size={12} />
                                  Por defecto
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{a.line1}</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{a.city}, {a.state} {a.zip}</p>
                            {a.phone && <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">📞 {a.phone}</p>}
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-6 shadow-lg sticky top-8 animate-scale-in">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">Resumen del pedido</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total a pagar</p>
                    <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">$0</p>
                  </div>
                  <button
                    onClick={pay}
                    disabled={!selected}
                    className={`
                      w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-white shadow-lg transition-all duration-300
                      ${selected
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95'
                        : 'bg-neutral-400 dark:bg-neutral-700 cursor-not-allowed'
                      }
                    `}
                  >
                    <CreditCard size={20} />
                    Confirmar pedido
                  </button>
                  {!selected && addresses.length > 0 && (
                    <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                      Selecciona una dirección para continuar
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
