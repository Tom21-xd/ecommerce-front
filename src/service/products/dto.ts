export type ListQuery = { limit?: number; offset?: number };
export type MatchQuery = { name: string };
export type CreateProductDto = { name: string; sku: string; quantity: number; price: number; containerId?: number };
