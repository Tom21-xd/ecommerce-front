"use client";

import { ReactNode } from "react";

export default function KpiCard({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string | number;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white dark:bg-neutral-900 p-4 shadow-sm flex items-center gap-4">
      {children && <div className="flex-shrink-0">{children}</div>}
      <div>
        <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{value}</div>
        {hint && <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</div>}
      </div>
    </div>
  );
}
