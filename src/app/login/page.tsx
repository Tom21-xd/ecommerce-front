"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/service/auth/auth.service";
import { toast } from "sonner";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.login({ email, password });
      toast.success("Sesión iniciada");
      router.push("/dashboard");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al iniciar sesión";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header con gradiente */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600 p-8 text-center shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <LogIn size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              Bienvenido de nuevo
            </h1>
            <p className="text-white/90 text-sm mt-2">
              Inicia sesión para continuar
            </p>
          </div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Formulario */}
        <div className="rounded-b-3xl bg-white dark:bg-neutral-900 shadow-xl border-2 border-t-0 border-neutral-200 dark:border-neutral-800 p-8 animate-slide-in-right">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block" htmlFor="email">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2 mb-2">
                  <Mail size={16} className="text-green-600 dark:text-green-400" />
                  Correo electrónico
                </span>
                <input
                  id="email"
                  className="w-full rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="tu@email.com"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="block" htmlFor="password">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-green-600 dark:text-green-400" />
                  Contraseña
                </span>
                <input
                  id="password"
                  className="w-full rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>

            <button
              disabled={loading}
              className={`
                w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 mt-6
                ${loading
                  ? 'bg-neutral-400 dark:bg-neutral-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95'
                }
              `}
              type="submit"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              ¿No tienes cuenta?{" "}
              <Link
                className="font-semibold text-green-600 dark:text-green-400 hover:underline transition"
                href="/register"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
