
export const API_BASE = process.env.NEXT_PUBLIC_API_URL_WPBACKEND || "/api";

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get("content-type") ?? "";
  if (res.status === 204 || !ct.includes("application/json")) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export async function getStatus(sessionId: string) {
  return apiFetch<{ sessionId: string; status: string; hasQR: boolean; lastUpdate?: number }>(`/sessions/${encodeURIComponent(sessionId)}/status`);
}

export async function getQR(sessionId: string) {
  return apiFetch<{ sessionId: string; qr: string | null; qrAt: number | null }>(`/sessions/${encodeURIComponent(sessionId)}/qr`);
}

export async function refreshQR(sessionId: string) {
  return apiFetch<{ ok: boolean; sessionId: string; status: string; qr: string | null; qrAt: number | null }>(
    `/sessions/${encodeURIComponent(sessionId)}/qr/refresh`,
    { method: "POST" }
  );
}

export async function startSession(sessionId: string) {
  return apiFetch<{ sessionId: string; status: string; qr: string | null }>(`/sessions/${encodeURIComponent(sessionId)}/start`, {
    method: "POST",
  });
}

export async function listSessions() {
  return apiFetch<Array<{ sessionId: string; status: string; hasQR: boolean }>>(`/sessions`);
}

export async function deleteSession(sessionId: string) {
  return apiFetch(`/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
}

export async function sendMessage({ sessionId, to, text }: { sessionId: string; to: string; text: string; }) {
  return apiFetch(`/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, to, text })
  });
}
