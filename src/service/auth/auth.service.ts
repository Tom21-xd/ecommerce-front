import { http } from "@/lib/http";
import type { ApiOk, User } from "@/lib/types";

export type AuthResult = { token: string; user: User };

export const AuthService = {
  async login(body: import("./dto").LoginDto) {
    const { data } = await http.post<ApiOk<AuthResult>>("/auth/login", body);
    localStorage.setItem("jwt_token", data.result.token);
    return data.result;
  },
  async register(body: import("./dto").RegisterDto) {
    const { data } = await http.post<ApiOk<AuthResult>>("/auth/register", body);
    localStorage.setItem("jwt_token", data.result.token);
    return data.result;
  },
  async validate() {
    const { data } = await http.get<{ status: string; message: string; user: User }>("/auth/validate");
    return data.user;
  },
  logout() {
    localStorage.removeItem("jwt_token");
  },
};
