import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto">
      {/* Sección principal del footer */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

            {/* Izquierda: Logo + Info */}
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Image
                src="/tienda_verde.png"
                alt="Tienda Verde"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h3 className="font-bold text-green-700 dark:text-green-400">Tienda Verde</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Marketplace ecológico comunitario
                </p>
              </div>
            </div>

            {/* Centro: Banner Red Comunitaria */}
            <div className="flex items-center justify-center">
              <Image
                src="/banner.png"
                alt="Red Comunitaria Uniamazonia"
                width={300}
                height={40}
                className="object-contain max-h-10 opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Derecha: Copyright */}
            <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center md:text-right">
              © {year} Tienda Verde
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
