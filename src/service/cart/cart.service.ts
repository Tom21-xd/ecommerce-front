import { http } from "@/lib/http";
import type { ApiOk, Cart } from "@/lib/types";
import { AddItemDto, CheckoutDto, UpdateItemDto } from "./dto";

export const CartService = {
  async get() {
    const { data } = await http.get<ApiOk<Cart>>("/cart");
    console.log(data);
    return data.result;
  },
  async addItem(body: AddItemDto) {
    const { data } = await http.post<ApiOk<unknown>>("/cart/items", body);
    return data.result;
  },
  async updateItem(productId: number, body: UpdateItemDto) {
    const { data } = await http.patch<ApiOk<unknown>>(`/cart/items/${productId}`, body);
    return data.result;
  },
  async removeItem(productId: number) {
    const { data } = await http.delete<ApiOk<unknown>>(`/cart/items/${productId}`);
    return data.result;
  },
  async checkout(body: CheckoutDto) {
    const { data } = await http.post<ApiOk<unknown>>("/cart/checkout", body);
    return data.result;
  },
};
