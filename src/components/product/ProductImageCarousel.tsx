"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";

interface ProductImage {
  base64: string;
  alt?: string | null;
  position?: number;
}

interface ProductImageCarouselProps {
  images?: ProductImage[];
  alt?: string;
}

const placeholder = "/placeholder.svg";

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images = [], alt }) => {
  const validImages = images.filter(img => !!img.base64);
  function getImageSrc(base64: string) {
    return `${base64}`;
  }
  const [current, setCurrent] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (validImages.length === 0) {
    return (
      <Image
        src={placeholder}
        alt={alt || "Producto"}
        className="h-full w-full object-cover"
        width={400}
        height={300}
        priority
      />
    );
  }


  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setShowControls(false);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev - 1 + validImages.length) % validImages.length);
  const next = () => setCurrent((prev) => (prev + 1) % validImages.length);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) next();
        else prev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative h-full w-full select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-roledescription="Carrusel de imágenes"
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl">
        {validImages.map((img, idx) => (
          <Image
            key={idx}
            src={getImageSrc(img.base64)}
            alt={img.alt || alt || `Producto ${idx + 1}`}
            className={`absolute top-0 left-0 h-full w-full object-cover transition-all duration-500 ease-in-out ${idx === current ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-95"}`}
            draggable={false}
            style={{ pointerEvents: idx === current ? "auto" : "none" }}
            width={400}
            height={300}
            priority={idx === 0}
          />
        ))}
      </div>
      {validImages.length > 1 && (
        <>
          {showControls && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 z-20 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                tabIndex={0}
                aria-label="Anterior"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 16L8 10L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 z-20 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                tabIndex={0}
                aria-label="Siguiente"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4L12 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-200 ${idx === current ? "bg-emerald-400 scale-110 shadow" : "bg-white/40"}`}
                tabIndex={0}
                aria-label={`Imagen ${idx + 1}`}
              />
            ))}
          </div>
          <span className="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white z-20">
            {current + 1}/{validImages.length}
          </span>
        </>
      )}
    </div>
  );
};
