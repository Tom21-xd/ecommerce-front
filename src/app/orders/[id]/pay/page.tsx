'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { http } from '@/lib/http';
import EpaycoButton from '@/components/payment/EpaycoButton';
import { ArrowLeft, Package, AlertCircle } from 'lucide-react';
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
    producto: {
      id: number;
      containerId: number;
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
  payment?: Array<{
    containerId: number | null;
  }>;
}

interface EpaycoButtonData {
  publicKey: string;
  amount: number;
  tax?: number;
  taxIco?: number;
  taxBase?: number;
  name: string;
  description: string;
  currency: string;
  country: string;
  test: boolean;
  responseUrl?: string;
  confirmationUrl?: string;
  externalRef?: string;
}

type EpaycoCheckoutResponse = {
  x_cod_response?: string;
  [key: string]: unknown;
};

function resolveSellerId(orderData: Order): number | null {
  // Verificar si hay múltiples vendedores
  const sellerIds = new Set<number>();

  for (const item of orderData.pedido_producto) {
    const sellerId =
      item?.producto?.container?.user?.id ||
      item?.producto?.container?.userId ||
      item?.producto?.containerId;

    if (sellerId) {
      sellerIds.add(sellerId);
    }
  }

  // Si hay múltiples vendedores, devolver null (pago multi-vendedor)
  if (sellerIds.size > 1) {
    return null;
  }

  // Si hay un solo vendedor, devolverlo
  if (sellerIds.size === 1) {
    return Array.from(sellerIds)[0];
  }

  // Fallback: intentar obtener del pago
  return orderData.payment?.[0]?.containerId || null;
}

export default function PayOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);

  const [order, setOrder] = useState<Order | null>(null);
  const [buttonData, setButtonData] = useState<EpaycoButtonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingButton, setGeneratingButton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState<string>('');

  const generatePaymentButton = useCallback(async (orderData: Order) => {
    setGeneratingButton(true);
    try {
      const sellerId = resolveSellerId(orderData);

      const subtotal = orderData.precio_total / 1.19;
      const iva = orderData.precio_total - subtotal;

      const payload: {
        pedidoId: number;
        sellerId?: number;
        amount: number;
        tax: number;
        taxBase: number;
        description: string;
      } = {
        pedidoId: orderData.id,
        amount: orderData.precio_total,
        tax: iva,
        taxBase: subtotal,
        description: `Pago del pedido #${orderData.id}`,
      };

      // Solo incluir sellerId si existe (pago de un solo vendedor)
      if (sellerId) {
        payload.sellerId = sellerId;
      }

      const response = await http.post('/payments/epayco/generate-button', payload);

      setButtonData(response.data.result);
    } catch (err: unknown) {
      console.error('Error al generar botón de pago:', err);
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      const fallbackMessage =
        err instanceof Error ? err.message : 'Error al generar el botón de pago';
      const message = apiMessage || fallbackMessage;

      if (message.includes('no tiene configurada') || message.includes('desactivada') || message.includes('no hay configuracion')) {
        setError(
          'El sistema de pagos no está configurado correctamente. Por favor, contacta con soporte.',
        );
        toast.error('Error en la configuración de pagos');
      } else {
        setError(message);
        toast.error(message);
      }
    } finally {
      setGeneratingButton(false);
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await http.get(`/orders/${orderId}`);
        const orderData: Order = response.data.result;
        setOrder(orderData);

        const sellerId = resolveSellerId(orderData);
        const vendor = orderData.pedido_producto[0]?.producto?.container?.user;
        if (vendor || sellerId) {
          setSellerName(
            vendor?.username || vendor?.email || (sellerId ? `Vendedor #${sellerId}` : ''),
          );
        }

        if (orderData.status !== 'PENDING') {
          setError('Este pedido ya no está pendiente de pago');
          return;
        }

        await generatePaymentButton(orderData);
      } catch (err: unknown) {
        console.error('Error al cargar pedido:', err);
        setError('No se pudo cargar el pedido');
        toast.error('Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, generatePaymentButton]);

  const handlePaymentResponse = (response: EpaycoCheckoutResponse) => {
    console.log('Respuesta de ePayco:', response);

    if (response.x_cod_response === '1') {
      toast.success('Pago procesado exitosamente');
      router.push('/orders');
    } else if (response.x_cod_response === '3') {
      toast.info('Pago pendiente de confirmación');
      router.push('/orders');
    } else {
      toast.error('El pago no pudo ser procesado');
    }
  };

  const handlePaymentError = (err: unknown) => {
    console.error('Error en el pago:', err);
    toast.error('Error al procesar el pago');
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

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold text-red-700 dark:text-red-200 mb-2">{error}</p>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            Si crees que es un error, intenta nuevamente o contacta con soporte.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <ArrowLeft size={16} />
            Volver a mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[80vh] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a mis pedidos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Pagar pedido #{order.id}
          </h1>
          {sellerName && (
            <p className="text-sm text-neutral-500">Compra a {sellerName} - Pago seguro vía ePayco</p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Resumen del pedido
              </h2>

              <div className="space-y-3">
                {order.pedido_producto.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {item.nameAtPurchase}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.cantidad} · ${item.priceUnit.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      ${item.subtotal.toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900 dark:text-gray-100">Total:</span>
                  <span className="text-green-600 dark:text-green-400">
                    ${order.precio_total.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Package size={20} />
                Información del pago
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Serás redirigido a la pasarela de pago de ePayco</li>
                <li>El pago se procesa de forma segura a través del marketplace</li>
                <li>{sellerName || 'El vendedor'} recibirá su pago en los próximos días</li>
                <li>Recibirás una confirmación cuando el pago se apruebe</li>
                <li>El pedido se actualiza automáticamente al confirmar el pago</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Realizar pago
              </h2>

              {generatingButton ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generando botón de pago...
                  </p>
                </div>
              ) : buttonData ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monto a pagar:</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${buttonData.amount.toLocaleString('es-CO')}
                    </p>
                  </div>

                  <EpaycoButton
                    buttonData={buttonData}
                    onResponse={handlePaymentResponse}
                    onError={handlePaymentError}
                  />

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {buttonData.test ? 'Modo de prueba activo' : 'Pago seguro'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle size={40} className="mx-auto mb-3 text-yellow-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No se pudo generar el botón de pago
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
