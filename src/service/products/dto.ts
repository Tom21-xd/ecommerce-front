
export type CreateProductDto = {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  containerId?: number | null;
  unidadId?: number | null;
  marcaId?: number | null;
  categoryIds?: number[];
  images?: { base64: string; alt?: string; position?: number }[];
  minStock?: number;
  isActive?: boolean;
};

export type ListQuery = { limit?: number; offset?: number };
export type MatchQuery = { name: string };
