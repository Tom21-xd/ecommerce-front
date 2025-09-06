import { http } from "@/lib/http";
import type { ApiOk, Address } from "@/lib/types";
import { UpsertAddressDto } from "./dto";

export const AddressesService = {
  async list() {
    const { data } = await http.get<ApiOk<Address[]>>("/addresses");
    return data.result;
  },
  async create(body: UpsertAddressDto) {
    const { data } = await http.post<ApiOk<Address>>("/addresses", body);
    return data.result;
  },
  async update(id: number, body: UpsertAddressDto) {
    const { data } = await http.patch<ApiOk<Address>>(`/addresses/${id}`, body);
    return data.result;
  },
  async remove(id: number) {
    const { data } = await http.delete<ApiOk<{ id: number }>>(`/addresses/${id}`);
    return data.result;
  },
};
