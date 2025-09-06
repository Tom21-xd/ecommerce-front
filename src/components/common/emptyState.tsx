export default function EmptyState({ text = "No hay productos para mostrar." }) {
  return (
    <div className="rounded-xl border bg-white p-8 text-center text-neutral-500">
      {text}
    </div>
  );
}
