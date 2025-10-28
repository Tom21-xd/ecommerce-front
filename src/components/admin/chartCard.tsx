"use client";

export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}
