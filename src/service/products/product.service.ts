import { http } from "@/lib/http";
import type { ApiOk, Paginated, Product } from "@/lib/types";
import { CreateProductDto, ListQuery } from "./dto";

export const ProductsService = {
  async list(params: ListQuery = { limit: 12, offset: 0 }) {
    const { data } = await http.get<ApiOk<Paginated<Product>>>("/products", { params });
    return data.result;
  },
  async search(name: string) {
    const { data } = await http.get<ApiOk<Paginated<Product>>>("/products/match", { params: { name } });
    return data.result;
  },
  async listMine(params: ListQuery = { limit: 20, offset: 0 }) {
    const { data } = await http.get<ApiOk<Paginated<Product>>>("/products/user", { params });
    return data.result;
  },
  async listAdmin(params: ListQuery = { limit: 20, offset: 0 }) {
    const { data } = await http.get<ApiOk<Paginated<Product>>>("/products/admin", { params });
    return data.result;
  },
  async create(body: CreateProductDto) {
    const { data } = await http.post<ApiOk<Product>>("/products", body);
    return data.result;
  },
};
