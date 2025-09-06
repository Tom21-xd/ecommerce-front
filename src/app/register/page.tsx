"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/service/auth/auth.service";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username,setUsername]=useState(""); 
  const [email,setEmail]=useState(""); 
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try{
      await AuthService.register({ username, email, password });
      toast.success("Cuenta creada");
      router.push("/dashboard");
    }catch(e:any){
      toast.error(e.message || "Error al registrar");
    }finally{ setLoading(false); }
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Registro</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded-md px-3 py-2" placeholder="Usuario" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full border rounded-md px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-md px-3 py-2" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-md bg-black text-white py-2">{loading? "Creando..." : "Crear cuenta"}</button>
      </form>
      <p className="mt-3 text-sm text-neutral-600">¿Ya tienes cuenta? <Link className="underline" href="/login">Entrar</Link></p>
    </section>
  );
}
