'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { OrdersService, type Order } from '@/service/orders/orders.service';
import { Package, Clock, CheckCircle, MapPin, User, Phone, Mail, DollarSign, Truck } from 'lucide-react';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const result = await OrdersService.getSellerPendingOrders();
      setOrders(result || []);
    } catch (error: unknown) {
      console.error('Error al cargar pedidos:', error);
      const msg = error instanceof Error ? error.message : 'Error al cargar pedidos pendientes';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendiente' },
      PAID: { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Pagado' },
      SHIPPED: { icon: Truck, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Enviado' },
      DELIVERED: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Entregado' },
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

  const getShipmentStatusBadge = (status: string) => {
    const badges = {
      PENDING: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Pendiente de envío' },
      IN_TRANSIT: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'En tránsito' },
      DELIVERED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Entregado' },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Pedidos Pendientes de Entrega
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Pedidos pagados que debes preparar y enviar a tus clientes
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
            <Package size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No tienes pedidos pendientes
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Cuando recibas pedidos pagados aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition p-6"
              >
                {/* Header del pedido */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Package size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Pedido #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${order.precio_total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Información del cliente */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <User size={18} className="text-green-600" />
                      Información del Cliente
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Nombre</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {order.user?.username || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Email</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {order.user?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {order.user?.phones && (
                        <div className="flex items-start gap-2">
                          <Phone size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Teléfono</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {order.user.phones}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dirección de entrega */}
                    {order.pedido_address && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                          <MapPin size={18} className="text-green-600" />
                          Dirección de Entrega
                        </h5>
                        <div className="text-sm space-y-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {order.pedido_address.street}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {order.pedido_address.city}, {order.pedido_address.state}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {order.pedido_address.country} - {order.pedido_address.postalCode}
                          </p>
                          {order.pedido_address.additionalInfo && (
                            <p className="text-gray-500 dark:text-gray-500 italic text-xs mt-2">
                              {order.pedido_address.additionalInfo}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Productos y estado de envío */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Package size={18} className="text-green-600" />
                      Productos a Entregar ({order.pedido_producto.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {order.pedido_producto.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {item.nameAtPurchase}
                            </p>
                            {item.skuAtPurchase && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                SKU: {item.skuAtPurchase}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Cantidad: <span className="font-semibold">{item.cantidad}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ${item.precio_unitario.toLocaleString('es-CO')} c/u
                            </p>
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              ${item.subtotal.toLocaleString('es-CO')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Estado de envío */}
                    {order.shipment && order.shipment.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                          <Truck size={18} className="text-blue-600" />
                          Estado de Envío
                        </h5>
                        <div className="space-y-2">
                          {order.shipment.map((shipment, idx) => (
                            <div key={idx} className="text-sm">
                              {getShipmentStatusBadge(shipment.status)}
                              {shipment.carrier && (
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  Transportadora: {shipment.carrier}
                                </p>
                              )}
                              {shipment.trackingCode && (
                                <p className="text-gray-600 dark:text-gray-400">
                                  Tracking: <span className="font-mono">{shipment.trackingCode}</span>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estado de pago */}
                    {order.payment && order.payment.length > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2 text-sm">
                          <DollarSign size={16} className="text-green-600" />
                          Información de Pago
                        </h5>
                        {order.payment.map((payment, idx) => (
                          <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <p>Método: <span className="font-medium">{payment.method}</span></p>
                            <p>Estado: <span className="font-medium text-green-600">{payment.status}</span></p>
                            {payment.provider && <p>Proveedor: {payment.provider}</p>}
                            {payment.providerRef && (
                              <p className="font-mono">Ref: {payment.providerRef}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
