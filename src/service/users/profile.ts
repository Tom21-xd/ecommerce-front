import { http } from "@/lib/http";
import type { ApiOk, User } from "@/lib/types";

export const UsersService = {
  // ...otros métodos...
  async profile() {
    const { data } = await http.get<ApiOk<User>>("/users/profile");
    return data.result;
  },
};
