'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { http } from '@/lib/http';
import {
  Package,
  ArrowLeft,
  CreditCard,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: number;
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'SHIPPED' | 'DELIVERED' | 'REFUNDED';
  precio_total: number;
  createdAt: string;
  updatedAt: string;
  pedido_producto: Array<{
    id: number;
    nameAtPurchase: string;
    cantidad: number;
    priceUnit: number;
    subtotal: number;
    producto: {
      id: number;
      name: string;
      container: {
        userId: number;
        user?: {
          id: number;
          username?: string;
          email?: string;
        };
      };
    };
  }>;
  pedido_address: Array<{
    id: number;
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    country: string;
    zip?: string;
    type: 'SHIPPING' | 'BILLING';
  }>;
  payment: Array<{
    id: number;
    method: string;
    status: string;
    amount: number;
    createdAt: string;
  }>;
  shipment: Array<{
    id: number;
    status: string;
    carrier?: string;
    trackingCode?: string;
    estimatedDate?: string;
    deliveredAt?: string;
  }>;
}

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Clock,
  },
  PAID: {
    label: 'Pagado',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle,
  },
  CANCELED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
  },
  SHIPPED: {
    label: 'Enviado',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: Package,
  },
  REFUNDED: {
    label: 'Reembolsado',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: AlertCircle,
  },
};

const paymentStatusConfig = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-600' },
  CONFIRMED: { label: 'Confirmado', color: 'text-green-600' },
  FAILED: { label: 'Fallido', color: 'text-red-600' },
  REFUNDED: { label: 'Reembolsado', color: 'text-gray-600' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await http.get(`/orders/${orderId}`);
      setOrder(response.data.result);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error al cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold text-red-700 dark:text-red-200 mb-2">
            Pedido no encontrado
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mt-4"
          >
            <ArrowLeft size={16} />
            Volver a mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const shippingAddress = order.pedido_address.find((a) => a.type === 'SHIPPING');
  const vendorName =
    order.pedido_producto[0]?.producto?.container?.user?.username ||
    order.pedido_producto[0]?.producto?.container?.user?.email ||
    'Vendedor';

  return (
    <section className="min-h-[80vh] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a mis pedidos
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Pedido #{order.id}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Realizado el {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${config.color}`}
              >
                <StatusIcon size={20} />
                {config.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Package size={24} />
                Productos
              </h2>
              <div className="space-y-3">
                {order.pedido_producto.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {item.nameAtPurchase}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cantidad: {item.cantidad} × {formatCurrency(item.priceUnit)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900 dark:text-gray-100">Total:</span>
                  <span className="text-green-600 dark:text-green-400">
                    {formatCurrency(order.precio_total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {shippingAddress && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <MapPin size={24} />
                  Dirección de Envío
                </h2>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p className="text-sm">{shippingAddress.phone}</p>
                  <p className="text-sm mt-2">{shippingAddress.line1}</p>
                  {shippingAddress.line2 && <p className="text-sm">{shippingAddress.line2}</p>}
                  <p className="text-sm">
                    {shippingAddress.city}
                    {shippingAddress.state && `, ${shippingAddress.state}`}
                  </p>
                  <p className="text-sm">
                    {shippingAddress.country}
                    {shippingAddress.zip && ` - ${shippingAddress.zip}`}
                  </p>
                </div>
              </div>
            )}

            {/* Shipment Info */}
            {order.shipment && order.shipment.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Truck size={24} />
                  Información de Envío
                </h2>
                {order.shipment.map((shipment) => (
                  <div key={shipment.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className="font-medium">{shipment.status}</span>
                    </div>
                    {shipment.carrier && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Transportadora:</span>
                        <span className="font-medium">{shipment.carrier}</span>
                      </div>
                    )}
                    {shipment.trackingCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Código de seguimiento:
                        </span>
                        <span className="font-medium font-mono">{shipment.trackingCode}</span>
                      </div>
                    )}
                    {shipment.estimatedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fecha estimada:</span>
                        <span className="font-medium">{formatDate(shipment.estimatedDate)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Información de Pago
              </h2>

              {order.payment && order.payment.length > 0 ? (
                <div className="space-y-3">
                  {order.payment.map((payment) => (
                    <div key={payment.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.method}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            paymentStatusConfig[payment.status as keyof typeof paymentStatusConfig]
                              ?.color || 'text-gray-600'
                          }`}
                        >
                          {paymentStatusConfig[payment.status as keyof typeof paymentStatusConfig]
                            ?.label || payment.status}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Este pedido aún no ha sido pagado
                  </p>
                  {order.status === 'PENDING' && (
                    <Link
                      href={`/orders/${order.id}/pay`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <CreditCard size={16} />
                      Realizar pago
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Vendor Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Vendedor</h3>
              <p className="text-blue-800 dark:text-blue-200">{vendorName}</p>
            </div>

            {/* Actions */}
            {order.status === 'PENDING' && order.payment.length === 0 && (
              <Link
                href={`/orders/${order.id}/pay`}
                className="block w-full text-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Pagar Ahora
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
