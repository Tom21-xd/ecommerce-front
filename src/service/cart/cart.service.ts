import { http } from "@/lib/http";
import type { ApiOk, Cart } from "@/lib/types";

export const CartService = {
  async get() {
    const { data } = await http.get<ApiOk<Cart>>("/cart");
    return data.result;
  },
  async addItem(body: import("./dto").AddItemDto) {
    const { data } = await http.post<ApiOk<any>>("/cart/items", body);
    return data.result;
  },
  async updateItem(productId: number, body: import("./dto").UpdateItemDto) {
    const { data } = await http.patch<ApiOk<any>>(`/cart/items/${productId}`, body);
    return data.result;
  },
  async removeItem(productId: number) {
    const { data } = await http.delete<ApiOk<any>>(`/cart/items/${productId}`);
    return data.result;
  },
  async checkout(body: import("./dto").CheckoutDto) {
    const { data } = await http.post<ApiOk<any>>("/cart/checkout", body);
    return data.result;
  },
};
