export type Role = "ADMIN" | "SELLER" | "BUYER";

export type User = {
  id: number;
  email: string;
  username: string;
  role: Role;
  createdAt?: string;
  phones?: string;
};

export type UpdateProfileDto = {
  email?: string;
  username?: string;
  password?: string;
  phones?: string;
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number | string;
  description?: string;
  isActive?: boolean;
  containerId?: number;
  container?: { id: number; user?: Pick<User, "id" | "email" | "username" | "role"> };
  unidadId?: number;
  marcaId?: number;
  unidad?: Unidad;
  marca?: Marca;
  categoryIds?: number[];
  ProductCategory?: { category: Category }[];
  ProductImage?: { base64: string; alt?: string; position?: number }[];
  review?: Review[];
  minStock?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductContainer = {
  id: number;
  name?: string | null;
  userId: number;
};

export type Address = {
  id: number;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  country: string;
  zip?: string | null;
  isDefault: boolean;
};

export type CartItem = {
  id: number;
  cartId: number;
  productId: number;
  qty: number;
  priceAtAdd: number | string;
  product?: Product;
};

export type Cart = {
  id: number;
  userId?: number | null;
  items: CartItem[];
};

export type Unidad = { id: number; nombre: string };
export type Marca  = { id: number; nombre: string };
export type Category = { id: number; name: string; slug: string; parentId?: number | null; children?: Category[] };
export type ProductImage = { id: number; productId: number; base64: string; alt?: string | null; position: number };
export type Review = { id: number; productId: number; userId: number; rating: number; comment?: string | null };

export type ApiOk<T> = { status?: number | string; message: string; result: T };
export type Paginated<T> = { products?: T[]; totalPages: number; totalProducts: number };
