'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { http } from '@/lib/http';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: number;
  status: string;
  precio_total: number;
  createdAt: string;
  pedido_producto: Array<{
    nameAtPurchase: string;
    cantidad: number;
    priceUnit: number;
    subtotal: number;
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await http.get('/orders');
      setOrders(response.data.result || []);
    } catch (error: any) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      PAID: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Pagado' },
      CANCELED: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelado' },
      SHIPPED: { icon: Package, color: 'bg-blue-100 text-blue-800', label: 'Enviado' },
      DELIVERED: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800', label: 'Entregado' },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[80vh] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Mis Pedidos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Revisa el estado de tus pedidos y realiza los pagos pendientes
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
            <Package size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No tienes pedidos aún
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Comienza a comprar para ver tus pedidos aquí
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Package size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Pedido #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      ${order.precio_total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Productos */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Productos ({order.pedido_producto.length})
                  </h4>
                  <div className="space-y-2">
                    {order.pedido_producto.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.nameAtPurchase} x{item.cantidad}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${item.subtotal.toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                    {order.pedido_producto.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{order.pedido_producto.length - 3} productos más
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <Eye size={16} />
                    Ver detalles
                  </Link>
                  {order.status === 'PENDING' && (
                    <Link
                      href={`/orders/${order.id}/pay`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      Pagar ahora
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
