"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CatalogService } from "@/service/catalog/catalog.service";
import { ProductContainerService } from "@/service/product-container/product-container.service";
import type { Category, Marca, ProductContainer, Unidad } from "@/lib/types";
import type { CreateProductDto } from "@/service/products/dto";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { ProductsService } from "@/service/products/product.service";

type ImgItem = { base64: string; alt?: string; position?: number };

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return `data:${file.type};base64,${btoa(binary)}`;
}

export default function NewProductPage() {
  const router = useRouter();

  // opciones
  const [units, setUnits] = useState<Unidad[]>([]);
  const [brands, setBrands] = useState<Marca[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  // ...existing code...
  const [loadingOpt, setLoadingOpt] = useState(true);

  // form
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [unidadId, setUnidadId] = useState<number | null>(null);
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [containerId, setContainerId] = useState<number | null>(null); // null => auto-crear
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [images, setImages] = useState<ImgItem[]>([]);
  const [minStock, setMinStock] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    (async () => {
      setLoadingOpt(true);
      try {
        const [u, m, c, pc] = await Promise.all([
          CatalogService.listUnidad(),
          CatalogService.listMarca(),
          CatalogService.listCategories(),
          ProductContainerService.mine(),
        ]);
        setUnits(u ?? []);
        setBrands(m ?? []);
        setCats(c ?? []);
  // setContainers(pc ?? []); // eliminado: containers no se usa
        // Seleccionar automáticamente el primer contenedor si existe
        if ((pc ?? []).length > 0) setContainerId(pc[0].id);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "No se pudieron cargar opciones";
        toast.error(msg);
      } finally {
        setLoadingOpt(false);
      }
    })();
  }, []);

  const topCats = useMemo(() => cats.filter((c) => !c.parentId), [cats]);

  function toggleCategory(id: number) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setTouched((t) => ({ ...t, categoryIds: true }));
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget; // guarda la ref sincrónicamente
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    try {
      const list = await Promise.all(
        files.map(async (f) => ({
          base64: await fileToBase64(f),
          alt: f.name,
        }))
      );
      setImages((prev) => [...prev, ...list]);
    } catch {
      toast.error("No se pudieron cargar algunas imágenes");
    } finally {
      if (input) input.value = "";
    }
  }

  function moveImage(index: number, dir: "up" | "down") {
    setImages((prev) => {
      const next = [...prev];
      const to = dir === "up" ? index - 1 : index + 1;
      if (to < 0 || to >= next.length) return prev;
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const errs: { [k: string]: string } = {};
    if (!name.trim()) errs.name = "El nombre es obligatorio";
    if (!sku.trim()) errs.sku = "El SKU es obligatorio";
    if (price <= 0) errs.price = "El precio debe ser mayor a 0";
    if (quantity < 0) errs.quantity = "Cantidad inválida";
    if (categoryIds.length === 0) errs.categoryIds = "Selecciona al menos una categoría";
    return errs;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, sku: true, price: true, quantity: true, categoryIds: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrige los errores antes de guardar");
      return;
    }
    setSaving(true);
    try {
      const payload: CreateProductDto = {
        name: name.trim(),
        sku: sku.trim(),
        quantity: Number(quantity),
        price: Number(price),
        containerId: containerId || undefined,
        unidadId: unidadId || undefined,
        marcaId: marcaId || undefined,
        categoryIds,
        images: images.map((img, i) => ({
          base64: img.base64,
          alt: img.alt,
          position: i,
        })),
        minStock: typeof minStock === "number" ? Number(minStock) : undefined,
        isActive,
      };
      await ProductsService.create(payload);
      toast.success("Producto creado");
      router.push("/dashboard");
    } catch (err: unknown) {
      let msg = "Error al crear el producto";
      if (err instanceof Error) {
        msg = err.message.includes("SKU")
          ? "Ya existe un producto con ese SKU en el contenedor seleccionado."
          : err.message;
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Nuevo producto</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Completa la información. Si no seleccionas contenedor, se creará automáticamente.
          </p>
        </div>
        {/* Resumen visual */}
        <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 shadow-inner min-w-[220px]">
          <div className="w-16 h-16 rounded-lg overflow-hidden border bg-white dark:bg-neutral-900 flex items-center justify-center">
            {images[0] ? (
              <img src={images[0].base64} alt={images[0].alt || name || 'preview'} className="object-cover w-full h-full" />
            ) : (
              <span className="text-xs text-neutral-400">Sin imagen</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-neutral-800 dark:text-white truncate max-w-[120px]">{name || 'Nombre'}</span>
            <span className="text-xs text-neutral-500">{sku || 'SKU'}</span>
            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{money.format(price || 0)}</span>
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={submit} className="space-y-8 animate-fade-in">
        {/* Básicos */}
  <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white dark:bg-neutral-900 p-4 sm:grid-cols-2 shadow-sm">
          <div>
            <label className="block text-xs text-neutral-500 mb-1" htmlFor="name">Nombre *</label>
            <input
              id="name"
              className={`w-full rounded-md border px-3 py-2 transition focus:ring-2 focus:ring-primary-400 dark:bg-neutral-950 ${touched.name && errors.name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
              value={name}
              onChange={e => { setName(e.target.value); setTouched(t => ({ ...t, name: true })); }}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              placeholder="Nombre del producto"
              required
              aria-invalid={!!(touched.name && errors.name)}
              aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
            />
            {touched.name && errors.name && <div id="name-error" className="text-xs text-red-500 mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1" htmlFor="sku">SKU *</label>
            <input
              id="sku"
              className={`w-full rounded-md border px-3 py-2 transition focus:ring-2 focus:ring-primary-400 dark:bg-neutral-950 ${touched.sku && errors.sku ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
              value={sku}
              onChange={e => { setSku(e.target.value); setTouched(t => ({ ...t, sku: true })); }}
              onBlur={() => setTouched(t => ({ ...t, sku: true }))}
              placeholder="SKU"
              required
              aria-invalid={!!(touched.sku && errors.sku)}
              aria-describedby={touched.sku && errors.sku ? 'sku-error' : undefined}
            />
            {touched.sku && errors.sku && <div id="sku-error" className="text-xs text-red-500 mt-1">{errors.sku}</div>}
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1" htmlFor="quantity">Cantidad *</label>
            <input
              id="quantity"
              type="number"
              min={0}
              className={`w-full rounded-md border px-3 py-2 transition focus:ring-2 focus:ring-primary-400 dark:bg-neutral-950 ${touched.quantity && errors.quantity ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
              value={quantity}
              onChange={e => { setQuantity(Number(e.target.value || 0)); setTouched(t => ({ ...t, quantity: true })); }}
              onBlur={() => setTouched(t => ({ ...t, quantity: true }))}
              placeholder="Cantidad en stock"
              required
              aria-invalid={!!(touched.quantity && errors.quantity)}
              aria-describedby={touched.quantity && errors.quantity ? 'quantity-error' : undefined}
            />
            {touched.quantity && errors.quantity && <div id="quantity-error" className="text-xs text-red-500 mt-1">{errors.quantity}</div>}
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1" htmlFor="price">Precio *</label>
            <input
              id="price"
              type="number"
              min={0}
              step="0.01"
              className={`w-full rounded-md border px-3 py-2 transition focus:ring-2 focus:ring-primary-400 dark:bg-neutral-950 ${touched.price && errors.price ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
              value={price}
              onChange={e => { setPrice(Number(e.target.value || 0)); setTouched(t => ({ ...t, price: true })); }}
              onBlur={() => setTouched(t => ({ ...t, price: true }))}
              placeholder="Precio"
              required
              aria-invalid={!!(touched.price && errors.price)}
              aria-describedby={touched.price && errors.price ? 'price-error' : undefined}
            />
            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {money.format(price || 0)}
            </div>
            {touched.price && errors.price && <div id="price-error" className="text-xs text-red-500 mt-1">{errors.price}</div>}
          </div>
        </div>

        {/* Catálogo y contenedor */}
  <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white dark:bg-neutral-900 p-4 sm:grid-cols-2 shadow-sm">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">
              Unidad
            </label>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={unidadId ?? ""}
              onChange={(e) =>
                setUnidadId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={loadingOpt}
            >
              <option value="">— Selecciona —</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Marca</label>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={marcaId ?? ""}
              onChange={(e) =>
                setMarcaId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={loadingOpt}
            >
              <option value="">— Selecciona —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-neutral-500 mb-2">Categorías *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {topCats.map((parent) => {
                const selected = categoryIds.includes(parent.id) || cats.some(c => c.parentId === parent.id && categoryIds.includes(c.id));
                return (
                  <button
                    key={parent.id}
                    type="button"
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${selected ? 'bg-primary-600 text-white border-primary-600 shadow' : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-primary-900/30'}`}
                    onClick={() => {
                      const hasChildren = cats.some(c => c.parentId === parent.id);
                      if (!hasChildren) toggleCategory(parent.id);
                    }}
                    tabIndex={0}
                    aria-pressed={selected}
                  >
                    {parent.name}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {topCats.map((parent) => {
                const children = cats.filter((c) => c.parentId === parent.id);
                if (!children.length) return null;
                return (
                  <div key={parent.id} className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="text-xs text-neutral-500 mr-2">{parent.name}:</span>
                    {children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${categoryIds.includes(child.id) ? 'bg-primary-500 text-white border-primary-500 shadow' : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-primary-900/30'}`}
                        onClick={() => toggleCategory(child.id)}
                        tabIndex={0}
                        aria-pressed={categoryIds.includes(child.id)}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                );
              })}
              {topCats.length === 0 && (
                <div className="text-sm text-neutral-500">No hay categorías.</div>
              )}
            </div>
            {touched.categoryIds && errors.categoryIds && <div className="text-xs text-red-500 mt-1">{errors.categoryIds}</div>}
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">
              Stock mínimo (alerta)
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border px-3 py-2"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value || 0))}
              placeholder="0"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Producto activo (visible en el catálogo)
          </label>
        </div>

        {/* Imágenes */}
  <div className="rounded-xl border bg-white dark:bg-neutral-900 p-4 shadow-sm">
          <div className="mb-2 text-sm font-medium">Imágenes</div>
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm hover:bg-neutral-100">
              <ImagePlus className="h-4 w-4" />
              <span>Agregar imágenes</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onFiles}
                className="hidden"
              />
            </label>
            <span className="text-xs text-neutral-500">
              Se envían como base64; podrás reordenarlas.
            </span>
          </div>

          {images.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((img, i) => (
                <li key={i} className="rounded-lg border dark:border-neutral-700 p-2 bg-neutral-50 dark:bg-neutral-950 transition-all animate-fade-in">
                  <div className="aspect-square w-full overflow-hidden rounded shadow-sm">
                    <img
                      src={img.base64}
                      alt={img.alt || `img-${i}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <input
                    className="mt-2 w-full rounded-md border px-2 py-1 text-xs dark:bg-neutral-900 dark:border-neutral-700"
                    placeholder="Alt/Descripción"
                    value={img.alt ?? ""}
                    onChange={(e) =>
                      setImages((prev) => {
                        const next = [...prev];
                        next[i] = { ...next[i], alt: e.target.value };
                        return next;
                      })
                    }
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(i, "up")}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
                        disabled={i === 0}
                        title="Subir"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(i, "down")}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
                        disabled={i === images.length - 1}
                        title="Bajar"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {images.length === 0 && (
            <div className="mt-3 rounded-lg border border-dashed p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950">
              Aún no has agregado imágenes.
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            disabled={saving}
            className="rounded-md bg-primary-600 dark:bg-primary-500 px-6 py-2 text-white font-semibold shadow hover:bg-primary-700 dark:hover:bg-primary-400 transition flex items-center gap-2 disabled:opacity-60"
            type="submit"
            aria-busy={saving}
          >
            {saving && <span className="inline-block animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4" />}
            {saving ? "Guardando…" : "Guardar producto"}
          </button>
        </div>
      </form>
    </section>
  );
}
