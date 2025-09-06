export const AUTH_EVENT = "auth:changed";

export type AuthChange =
  | { type: "login"; token: string }
  | { type: "logout" };

export function notifyAuthChange(detail: AuthChange) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail }));
}

export function onAuthChange(
  handler: (e: CustomEvent<AuthChange>) => void
) {
  const wrapped = (ev: Event) => handler(ev as CustomEvent<AuthChange>);
  window.addEventListener(AUTH_EVENT, wrapped as EventListener);
  return () => window.removeEventListener(AUTH_EVENT, wrapped as EventListener);
}
