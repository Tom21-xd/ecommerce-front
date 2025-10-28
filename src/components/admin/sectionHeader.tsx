"use client";

export default function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
