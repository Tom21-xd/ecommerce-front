"use client";

import { useEffect, useState } from "react";
import { AuthService } from "@/service/auth/auth.service";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/adminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [, setMe] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await AuthService.validate();
        if (u.role !== "ADMIN") {
          router.replace("/");
          return;
        }
        setMe(u);
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

  if (checking) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-neutral-600 dark:text-neutral-400">
        Verificando permisos…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
      <AdminSidebar />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
