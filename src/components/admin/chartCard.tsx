"use client";

export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium text-neutral-700">{title}</div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}
