export type CreateUnidadDto = { nombre: string };
export type CreateMarcaDto  = { nombre: string };
export type CreateCategoryDto = { name: string; slug: string; parentId?: number };
export type AddImageDto = { productId: number; base64: string; alt?: string; position?: number };
export type AddReviewDto = { productId: number; rating: number; comment?: string };
