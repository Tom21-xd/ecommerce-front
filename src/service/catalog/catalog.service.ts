import { http } from "@/lib/http";
import type { Unidad, Marca, Category, ProductImage, Review } from "@/lib/types";
import { AddImageDto, AddReviewDto, CreateCategoryDto, CreateMarcaDto, CreateUnidadDto } from "./dto";

export const CatalogService = {
  async createUnidad(body: CreateUnidadDto) {
    const { data } = await http.post<{ status: number; message: string; result: Unidad }>("/catalog/unidad", body);
    return data.result;
  },
  async listUnidad() {
    const { data } = await http.get<{ status: number; message: string; result: Unidad[] }>("/catalog/unidad");
    return data.result;
  },

  async createMarca(body: CreateMarcaDto) {
    const { data } = await http.post<{ status: number; message: string; result: Marca }>("/catalog/marca", body);
    return data.result;
  },
  async listMarca() {
    const { data } = await http.get<{ status: number; message: string; result: Marca[] }>("/catalog/marca");
    return data.result;
  },

  async createCategory(body: CreateCategoryDto) {
    const { data } = await http.post<{ status: number; message: string; result: Category }>("/catalog/category", body);
    return data.result;
  },
  async listCategories() {
    const { data } = await http.get<{ status: number; message: string; result: Category[] }>("/catalog/category");
    return data.result;
  },

  async addImage(body: AddImageDto) {
    const { data } = await http.post<{ status: number; message: string; result: ProductImage }>("/catalog/product-images", body);
    return data.result;
  },
  async listImages(productId: number) {
    const { data } = await http.get<{ status: number; message: string; result: ProductImage[] }>("/catalog/product-images", { params: { productId } });
    return data.result;
  },

  async addReview(body: AddReviewDto) {
    const { data } = await http.post<{ status: number; message: string; result: Review }>("/catalog/reviews", body);
    return data.result;
  },
  async listReviews(productId: number) {
    const { data } = await http.get<{ status: number; message: string; result: Review[] }>("/catalog/reviews", { params: { productId } });
    return data.result;
  },
};
