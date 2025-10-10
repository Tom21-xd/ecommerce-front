import { http } from "@/lib/http";
import type { ApiOk, User } from "@/lib/types";
import { UsersByRoleDto } from "./dto";

export const UsersService = {
  async all() {
    const { data } = await http.get<ApiOk<User[]>>("/users/all");
    return data.result;
  },
  async byRole(role: UsersByRoleDto["role"]) {
    const { data } = await http.get<ApiOk<User[]>>("/users/by-role", { params: { role } });
    return data.result;
  },
  async remove(id: number) {
    const { data } = await http.delete<ApiOk<User>>(`/users/${id}`);
    return data.result;
  },
  async profile() {
    const { data } = await http.get<ApiOk<User>>("/users/profile");
    return data.result;
  },
  async updateProfile(payload: { email?: string; username?: string; password?: string; phones?: string }) {
    const { data } = await http.patch<ApiOk<User>>("/users/profile", payload);
    return data.result;
  },
  async getById(id: number) {
    const { data } = await http.get<ApiOk<User>>(`/users/${id}`);
    return data.result;
  },
};
