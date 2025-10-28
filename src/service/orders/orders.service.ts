import { http } from "@/lib/http";
import type { ApiOk } from "@/lib/types";
import type { ListQuery } from "./dto";

const ORDERS = "/orders";
const ORDERS_SELLER_PENDING = "/orders/seller/pending";

export interface OrderAddress {
  id: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

export interface OrderUser {
  id: number;
  email: string;
  username: string;
  phones?: string;
}

export interface OrderProduct {
  id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nameAtPurchase: string;
  skuAtPurchase?: string;
  producto?: {
    id: number;
    nombre: string;
    sku: string;
    container?: {
      id: number;
      userId: number;
    };
  };
}

export interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  provider?: string;
  providerRef?: string;
  createdAt: string;
}

export interface Shipment {
  id: number;
  status: string;
  carrier?: string;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  status: string;
  precio_total: number;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser;
  pedido_address?: OrderAddress;
  pedido_producto: OrderProduct[];
  payment?: Payment[];
  shipment?: Shipment[];
}

export const OrdersService = {
  async getSellerPendingOrders(params?: ListQuery) {
    const { data } = await http.get<ApiOk<Order[]>>(ORDERS_SELLER_PENDING, { params });
    return data.result;
  },

  async getMyOrders(params?: ListQuery) {
    const { data } = await http.get<ApiOk<Order[]>>(`${ORDERS}/me`, { params });
    return data.result;
  },

  async getById(id: string | number) {
    const { data } = await http.get<ApiOk<Order>>(`${ORDERS}/${id}`);
    return data.result;
  },
};
