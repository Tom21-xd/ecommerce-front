export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-500">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© {year} XD Marketplace. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a className="hover:text-neutral-700" href="#">Términos</a>
            <a className="hover:text-neutral-700" href="#">Privacidad</a>
            <a className="hover:text-neutral-700" href="#">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
