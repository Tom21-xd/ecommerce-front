import { http } from "@/lib/http";
import type { ApiOk, Paginated, Product } from "@/lib/types";
import type { CreateProductDto, ListQuery } from "./dto";

const PRODUCTS = "/products";
const PRODUCTS_MATCH = "/products/match";
const PRODUCTS_MINE = "/products/user";
const PRODUCTS_ADMIN = "/products/admin";

export const ProductsService = {
  async list(params: ListQuery = { limit: 10, offset: 0 }) {
    const { data } = await http.get<ApiOk<Paginated<Product>>>(PRODUCTS, { params });
    console.log(data);
    return data.result;
  },

  async search(name: string) {
    const { data } = await http.get<ApiOk<Paginated<Product>>>(PRODUCTS_MATCH, { params: { name } });
    return data.result;
  },

  async listMine(params: ListQuery = { limit: 20, offset: 0 }) {
    const { data } = await http.get<ApiOk<Paginated<Product>>>(PRODUCTS_MINE, { params });
    return data.result;
  },

  async listAdmin(params: ListQuery = { limit: 20, offset: 0 }) {
    const { data } = await http.get<ApiOk<Paginated<Product>>>(PRODUCTS_ADMIN, { params });
    return data.result;
  },

  async getById(id: string | number) {
    const { data } = await http.get<ApiOk<Product>>(`${PRODUCTS}/${id}`);
    return data.result;
  },

  async create(body: CreateProductDto) {
    const { data } = await http.post<ApiOk<Product>>(PRODUCTS, body);
    return data.result;
  },

  async update(id: string | number, body: Partial<CreateProductDto>) {
    const { data } = await http.put<ApiOk<Product>>(`${PRODUCTS}/${id}`, body);
    return data.result;
  },

  async remove(id: string | number) {
    const { data } = await http.delete<ApiOk<{ deleted: boolean }>>(`${PRODUCTS}/${id}`);
    return data.result;
  },

  
};
