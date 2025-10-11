"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductsService } from "@/service/products/product.service";
import { CartService } from "@/service/cart/cart.service";
import { CatalogService } from "@/service/catalog/catalog.service";
import type { Product, Review } from "@/lib/types";
import { ProductImageCarousel } from "@/components/product/ProductImageCarousel";
import { ShoppingCart, ArrowLeft, Star, Package, Tag, Store } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    (async () => {
      try {
        const [productData, reviewsData] = await Promise.all([
          ProductsService.getById(id),
          CatalogService.listReviews(Number(id)).catch(() => []),
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch {
        toast.error("Error cargando el producto");
        router.push("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router]);

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    try {
      await CartService.addItem({ productId: product.id, qty: 1 });
      toast.success("Producto agregado al carrito");
    } catch {
      toast.error("Error al agregar al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full mx-auto animate-spin"></div>
          <p className="text-neutral-600 dark:text-neutral-300 font-medium">Cargando producto...</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-full">
          <Package size={48} className="text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Producto no encontrado</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">El producto que buscas no existe o fue eliminado</p>
        </div>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const lowStock = product.quantity <= 5;
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      {/* Back button */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 animate-slide-in-right">
        {/* Images */}
        <div className="group rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 dark:bg-neutral-900 hover:-translate-y-1">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
            <ProductImageCarousel images={product.ProductImage} alt={product.name} />
            {lowStock && (
              <span className="absolute left-4 top-4 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-pulse backdrop-blur-sm">
                ⚠️ Stock bajo
              </span>
            )}
            {product.quantity === 0 && (
              <span className="absolute left-4 top-4 rounded-lg bg-neutral-900/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="animate-slide-in-left">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 font-medium">SKU: {product.sku}</p>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= avgRating ? "fill-yellow-400 text-yellow-400" : "text-neutral-300 dark:text-neutral-600"}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                  {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="relative rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 p-6 border-2 border-emerald-200 dark:border-emerald-700 shadow-lg animate-scale-in overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Precio</p>
              <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {money.format(price ?? 0)}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-200/30 dark:bg-emerald-700/20 rounded-full blur-2xl"></div>
          </div>

          {/* Stock & Info */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <Package size={20} className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Stock: <strong className="text-green-600 dark:text-green-400">{product.quantity}</strong> {product.quantity === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>
            {product.marca && (
              <div className="flex items-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                <Tag size={20} className="text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{product.marca.nombre}</span>
              </div>
            )}
          </div>

          {/* Seller Info */}
          {product.container?.user && (
            <Link
              href={`/seller/${product.container.user.id}`}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-4 py-3 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 group"
            >
              <Store size={20} className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <span className="text-xs text-green-700 dark:text-green-300 font-medium">Vendedor</span>
                <p className="text-sm font-bold text-green-800 dark:text-green-200 group-hover:underline">
                  {product.container.user.username}
                </p>
              </div>
            </Link>
          )}

          {/* Description */}
          {product.description && (
            <div className="glass rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                📋 Descripción
              </h2>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {product.description}
              </p>
            </div>
          )}

          {/* Categories */}
          {product.ProductCategory && product.ProductCategory.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                🏷️ Categorías
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.ProductCategory.map((pc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 px-4 py-2 text-xs font-semibold text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    {pc.category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.quantity === 0}
            className={`
              group flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-bold text-white shadow-lg transition-all duration-300
              ${product.quantity === 0
                ? 'bg-neutral-400 dark:bg-neutral-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95'
              }
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            `}
          >
            <ShoppingCart size={20} className={addingToCart ? "animate-bounce" : "group-hover:scale-110 transition-transform"} />
            {addingToCart ? "Agregando..." : product.quantity === 0 ? "Sin stock" : "Agregar al carrito"}
          </button>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-16 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg">
              <Star size={24} className="text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Reseñas de clientes
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'} de nuestros compradores
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review, idx) => (
              <div
                key={review.id}
                className="group rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slide-in-right"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-300 dark:text-neutral-600"}
                    />
                  ))}
                  <span className="ml-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {review.rating}/5
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 italic">
                    &quot;{review.comment}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
