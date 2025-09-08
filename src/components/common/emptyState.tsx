export default function EmptyState({ text = "No hay productos para mostrar." }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-neutral-900 dark:border-neutral-800 p-8 text-center text-neutral-500 dark:text-neutral-400 shadow">
      {text}
    </div>
  );
}
