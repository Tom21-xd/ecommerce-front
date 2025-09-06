import { http } from "@/lib/http";
import type { ApiOk, User } from "@/lib/types";
import { notifyAuthChange } from "@/lib/auth-bus";

export type AuthResult = { token: string; user: User };

export const AuthService = {
  async login(body: { email: string; password: string }) {
    const { data } = await http.post<ApiOk<AuthResult>>("/auth/login", body);
    localStorage.setItem("jwt_token", data.result.token);
    notifyAuthChange({ type: "login", token: data.result.token }); // 👈
    return data.result;
  },

  async register(body: { username: string; email: string; password: string }) {
    const { data } = await http.post<ApiOk<AuthResult>>("/auth/register", body);
    localStorage.setItem("jwt_token", data.result.token);
    notifyAuthChange({ type: "login", token: data.result.token }); // 👈
    return data.result;
  },

  async validate() {
    const { data } = await http.get<{ status: string; message: string; user: User }>("/auth/validate");
    return data.user;
  },

  logout() {
    localStorage.removeItem("jwt_token");
    notifyAuthChange({ type: "logout" }); // 👈
  },
};
