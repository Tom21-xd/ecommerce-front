import { ProductImage } from "./types";

export const currency = (value: number, locale = "es-CO", currency = "COP") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const cls = (...xs: (string | false | undefined | null)[]) =>
  xs.filter(Boolean).join(" ");

export function base64ToDataUrl(img?: ProductImage) {
  if (!img) return "";
  const mime = img.alt ?? "image/jpeg";
  const raw = img.base64?.startsWith("data:")
    ? img.base64.split(",")[1]
    : img.base64;
  return `data:${mime};base64,${raw}`;
}
