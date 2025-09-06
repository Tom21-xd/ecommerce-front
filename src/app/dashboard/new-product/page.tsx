"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductsService } from "@/service/products/product.service";

export default function NewProductPage() {
  const router = useRouter();
  const [name,setName]=useState("");
  const [sku,setSku]=useState("");
  const [quantity,setQuantity]=useState<number>(1);
  const [price,setPrice]=useState<number>(0);
  const [loading,setLoading]=useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try{
      await ProductsService.create({ name, sku, quantity, price });
      toast.success("Producto creado");
      router.push("/dashboard");
    }catch(e:any){
      toast.error(e.message || "Error al crear");
    }finally{ setLoading(false); }
  }

  return (
    <section className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Nuevo producto</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded-md px-3 py-2" placeholder="Nombre" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="w-full border rounded-md px-3 py-2" placeholder="SKU" value={sku} onChange={(e)=>setSku(e.target.value)} />
        <input className="w-full border rounded-md px-3 py-2" type="number" placeholder="Cantidad" value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} />
        <input className="w-full border rounded-md px-3 py-2" type="number" step="0.01" placeholder="Precio" value={price} onChange={(e)=>setPrice(Number(e.target.value))} />
        <button disabled={loading} className="w-full rounded-md bg-black text-white py-2">{loading ? "Guardando..." : "Guardar"}</button>
      </form>
    </section>
  );
}
