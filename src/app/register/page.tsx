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
    }catch(e: unknown){
      const msg = e instanceof Error ? e.message : "Error al registrar";
      toast.error(msg);
    }finally{ setLoading(false); }
  }

  return (
    <section className="mx-auto max-w-sm">
      <div className="w-full max-w-sm rounded-lg bg-white/80 dark:bg-neutral-900/80 shadow-md p-5 backdrop-blur-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-neutral-900 dark:text-neutral-100">Crear cuenta</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block" htmlFor="username">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Usuario</span>
            <input
              id="username"
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              placeholder="Usuario"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="block" htmlFor="email">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Correo electrónico</span>
            <input
              id="email"
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              placeholder="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block" htmlFor="password">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Contraseña</span>
            <input
              id="password"
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              placeholder="Contraseña"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-md bg-primary-600 dark:bg-primary-500 text-white font-semibold py-2 mt-2 transition hover:bg-primary-700 dark:hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            aria-busy={loading}
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-700 dark:text-neutral-300">
          ¿Ya tienes cuenta?{' '}
          <Link className="underline hover:text-primary-600 dark:hover:text-primary-400 transition" href="/login">Entrar</Link>
        </p>
      </div>
    </section>
  );
}
