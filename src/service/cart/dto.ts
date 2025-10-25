export type AddItemDto = { productId: number; qty: number };
export type UpdateItemDto = { qty: number };
export type CheckoutDto = { addressId?: number; sellerId?: number };
