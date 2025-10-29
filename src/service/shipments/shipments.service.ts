import { http } from "@/lib/http";
import type { ApiOk } from "@/lib/types";

export interface Shipment {
  id: number;
  status: string;
  carrier?: string;
  trackingCode?: string;
  estimatedDate?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const ShipmentsService = {
  async updateStatus(shipmentId: number, status: string) {
    const { data } = await http.patch<ApiOk<Shipment>>(`/shipments/${shipmentId}`, { status });
    return data.result;
  },
};
