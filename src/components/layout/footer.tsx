export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© {year} Tienda Verde. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a className="hover:text-neutral-700 dark:hover:text-neutral-300" href="#">Términos</a>
            <a className="hover:text-neutral-700 dark:hover:text-neutral-300" href="#">Privacidad</a>
            <a className="hover:text-neutral-700 dark:hover:text-neutral-300" href="#">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
