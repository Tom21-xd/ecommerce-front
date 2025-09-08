import { useEffect, useState } from "react";
import { AuthService } from "@/service/auth/auth.service";
import type { User } from "@/lib/types";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    AuthService.validate().then(setUser).catch(() => setUser(null));
    // Suscribirse a cambios de auth
    const handler = async () => {
      try {
        setUser(await AuthService.validate());
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("auth:changed", handler);
    return () => {
      window.removeEventListener("auth:changed", handler);
    };
  }, []);

  return user;
}
