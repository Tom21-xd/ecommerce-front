"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/service/auth/auth.service";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email,setEmail]=useState(""); 
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try{
      await AuthService.login({ email, password });
      toast.success("Sesión iniciada");
      router.push("/dashboard");
    }catch(e:any){
      toast.error(e.message || "Error al iniciar sesión");
    }finally{ setLoading(false); }
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded-md px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-md px-3 py-2" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-md bg-black text-white py-2">{loading? "Entrando..." : "Entrar"}</button>
      </form>
      <p className="mt-3 text-sm text-neutral-600">¿No tienes cuenta? <Link className="underline" href="/register">Registrarse</Link></p>
    </section>
  );
}
