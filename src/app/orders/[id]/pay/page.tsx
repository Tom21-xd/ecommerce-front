'use client';

import { useState, useEffect } from 'react';
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
      };
    };
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

export default function PayOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);

  const [order, setOrder] = useState<Order | null>(null);
  const [buttonData, setButtonData] = useState<EpaycoButtonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingButton, setGeneratingButton] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await http.get(`/orders/${orderId}`);
      const orderData = response.data.result;
      setOrder(orderData);

      // Verificar si el pedido ya está pagado
      if (orderData.status !== 'PENDING') {
        setError('Este pedido ya no está pendiente de pago');
        return;
      }

      // Generar botón de pago automáticamente
      await generatePaymentButton(orderData);
    } catch (error: any) {
      console.error('Error al cargar pedido:', error);
      setError('No se pudo cargar el pedido');
      toast.error('Error al cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentButton = async (orderData: Order) => {
    setGeneratingButton(true);
    try {
      // Obtener el ID del vendedor del primer producto
      // En un escenario real, podrías tener múltiples vendedores por pedido
      const firstProduct = orderData.pedido_producto[0];
      const sellerId = firstProduct?.producto?.container?.userId;

      if (!sellerId) {
        throw new Error('No se pudo obtener información del vendedor');
      }

      // Calcular impuestos (ejemplo: 19% IVA)
      const subtotal = orderData.precio_total / 1.19;
      const iva = orderData.precio_total - subtotal;

      const response = await http.post('/payments/epayco/generate-button', {
        pedidoId: orderData.id,
        sellerId: sellerId,
        amount: orderData.precio_total,
        tax: iva,
        taxBase: subtotal,
        description: `Pago del pedido #${orderData.id}`,
      });

      setButtonData(response.data.result);
    } catch (error: any) {
      console.error('Error al generar botón de pago:', error);
      const message =
        error.response?.data?.message || error.message || 'Error al generar el botón de pago';

      // Mensajes específicos según el error
      if (message.includes('no tiene configurada') || message.includes('desactivada')) {
        setError(
          'El vendedor aún no ha configurado su cuenta de ePayco. Por favor, contacta al vendedor o intenta con otro método de pago.'
        );
        toast.error('El vendedor no tiene ePayco configurado');
      } else {
        setError(message);
        toast.error(message);
      }
    } finally {
      setGeneratingButton(false);
    }
  };

  const handlePaymentResponse = (response: any) => {
    console.log('Respuesta de ePayco:', response);

    if (response.x_cod_response === '1' || response.x_cod_response === '3') {
      toast.success('Pago procesado exitosamente');
      router.push('/orders');
    } else {
      toast.error('El pago no pudo ser procesado');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Error en el pago:', error);
    toast.error('Error al procesar el pago');
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

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
            Error
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a mis pedidos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Pagar Pedido #{order.id}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Resumen del pedido */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Resumen del Pedido
              </h2>

              <div className="space-y-3">
                {order.pedido_producto.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {item.nameAtPurchase}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.cantidad} × ${item.priceUnit.toLocaleString('es-CO')}
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

            {/* Información importante */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Package size={20} />
                Información del pago
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Serás redirigido a la pasarela de pago de ePayco</li>
                <li>El pago se procesará de forma segura</li>
                <li>Recibirás una confirmación por correo electrónico</li>
                <li>El vendedor será notificado automáticamente</li>
              </ul>
            </div>
          </div>

          {/* Botón de pago */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Realizar Pago
              </h2>

              {generatingButton ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generando botón de pago...
                  </p>
                </div>
              ) : buttonData ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Monto a pagar:
                    </p>
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
                    {buttonData.test
                      ? '🧪 Modo de prueba activo'
                      : '🔒 Pago seguro'}
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
