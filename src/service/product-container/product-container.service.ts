import { http } from "@/lib/http";
import type { ProductContainer } from "@/lib/types";
import { CreateProductContainerDto } from "./dto";

export const ProductContainerService = {
  async create(body: CreateProductContainerDto) {
    const { data } = await http.post<ProductContainer>("/product-container", body);
    return data;
  },
  async mine() {
    const { data } = await http.get<ProductContainer[]>("/product-container");
    return data;
  },
};
