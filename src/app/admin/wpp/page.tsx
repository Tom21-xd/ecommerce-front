"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getStatus, getQR, refreshQR } from "@/service/wpp/wpp.service";
import {
  CheckCircleIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function AdminWppPage() {
  const [status, setStatus] = useState<string>("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState<boolean>(false);

  const SESSION_ID = "admin";
  const firstLoad = useRef(true);

  async function fetchStatusAndQr() {
    if (!firstLoad.current) setStatus("loading");
    setError(null);
    try {
      const data = await getStatus(SESSION_ID);
      setStatus(data.status);
      setLastUpdate(data.lastUpdate || null);

      if (data.status !== "active") {
        try {
          const qrData = await getQR(SESSION_ID);
          const code = qrData.qr || null;
          setQr(code);
          setQrOpen(Boolean(code)); // abre modal si hay QR
        } catch (qrErr: unknown) {
          setQr(null);
          setQrOpen(false);
          setError((qrErr as Error)?.message || "No se pudo obtener el QR.");
        }
      } else {
        setQr(null);
        setQrOpen(false);
      }
    } catch (e: unknown) {
      setStatus("error");
      setQr(null);
      setQrOpen(false);
      setError((e as Error)?.message || "Error obteniendo el estado.");
    }
    firstLoad.current = false;
  }

  useEffect(() => {
    fetchStatusAndQr();
  }, []);

  // repoll suave cuando no está activo
  useEffect(() => {
    if (status !== "active") {
      const t = setInterval(fetchStatusAndQr, 20000);
      return () => clearInterval(t);
    }
  }, [status]);

  async function handleRefreshQR() {
    try {
      await refreshQR(SESSION_ID);
      await fetchStatusAndQr();
      setQrOpen(true);
    } catch (e: unknown) {
      setError((e as Error)?.message || "No se pudo refrescar el QR.");
    }
  }

  const lastUpdateText = lastUpdate ? new Date(lastUpdate).toLocaleString() : "-";

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold tracking-tight mb-8">
        Panel de WhatsApp
      </h1>

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 font-semibold text-white shadow hover:bg-primary-700 transition active:scale-[.99] disabled:opacity-60"
          onClick={fetchStatusAndQr}
          disabled={status === "loading"}
        >
          <ArrowPathIcon className="h-5 w-5" />
          {status === "loading" ? "Actualizando..." : "Actualizar estado"}
        </button>

        {status !== "active" && (
          <>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-200 px-4 py-2 font-semibold text-neutral-900 shadow hover:bg-neutral-300 transition active:scale-[.99] disabled:opacity-60 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
              onClick={() => setQrOpen(true)}
              disabled={!qr || status === "loading"}
            >
              <QrCodeIcon className="h-5 w-5" />
              Ver QR
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 font-semibold text-neutral-800 shadow-sm hover:bg-neutral-100 transition active:scale-[.99] disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800/60"
              onClick={handleRefreshQR}
              disabled={status === "loading"}
            >
              <ArrowPathIcon className="h-5 w-5" />
              Refrescar QR
            </button>
          </>
        )}
      </div>

      {/* Estado */}
      {status === "loading" && !firstLoad.current && (
        <Card className="items-center text-neutral-500">
          <ArrowPathIcon className="h-8 w-8 animate-spin" />
          <p className="mt-2">Cargando estado...</p>
        </Card>
      )}

      {status === "active" && (
        <Card className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/30 text-center">
          <CheckCircleIcon className="mx-auto mb-2 h-12 w-12 text-emerald-500 dark:text-emerald-300" />
          <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-200">
            Sesión activa
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Última actualización: {lastUpdateText}
          </p>
          <p className="mt-2 text-neutral-700 dark:text-neutral-200">
            Ya puedes enviar y recibir mensajes desde la API.
          </p>
        </Card>
      )}

      {status !== "active" && status !== "loading" && (
        <Card className="text-center">
          <ExclamationTriangleIcon className="mx-auto mb-2 h-10 w-10 text-neutral-400 dark:text-neutral-500" />
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Sesión inactiva
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {qr
              ? "Escanea el QR para iniciar sesión (abre el modal)."
              : "No se pudo obtener el QR. Intenta actualizar o revisa el backend."}
          </p>
        </Card>
      )}

      {error && (
        <div className="mt-6 flex flex-col items-center">
          <ExclamationTriangleIcon className="mb-1 h-7 w-7 text-red-400" />
          <span className="text-center text-red-500">{error}</span>
        </div>
      )}

      {/* Modal QR centrado, glassmorphism */}
      <QRModal open={qrOpen && Boolean(qr) && status !== "active"} onClose={() => setQrOpen(false)} qr={qr} onRefresh={handleRefreshQR} />
    </section>
  );
}

/* ---------- UI ---------- */

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-lg ring-1 ring-black/5 dark:ring-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

function QRModal({
  open,
  onClose,
  qr,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  qr: string | null;
  onRefresh: () => void;
}) {
  // Bloquea scroll y cierra con ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm rounded-2xl bg-white/90 p-5 shadow-2xl ring-1 ring-black/10 backdrop-blur-md dark:bg-neutral-900/85 dark:ring-white/10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCodeIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
              <h3 id="qr-title" className="text-lg font-semibold text-neutral-900 dark:text-white">
                Escanea el QR
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800 transition dark:hover:bg-neutral-700/60"
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* QR */}
          <div className="mt-4 flex flex-col items-center">
            <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-950">
              {qr ? (
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=264x264&data=${encodeURIComponent(qr)}`}
                  alt="Código QR de WhatsApp"
                  width={264}
                  height={264}
                  className="rounded-md"
                  priority
                />
              ) : (
                <div className="h-[264px] w-[264px] rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              )}
            </div>

            <p className="mt-4 text-center text-xs text-neutral-600 dark:text-neutral-400">
              WhatsApp → Dispositivos vinculados → Vincular dispositivo.
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-neutral-100 transition dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800/60"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refrescar QR
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(qr || "")}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-neutral-100 transition dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800/60"
              >
                Copiar cadena
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
