'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { http } from '@/lib/http';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface VendorBalance {
  vendorId: number;
  vendorName: string;
  vendorEmail: string;
  totalSales: number;
  adminCommission: number;
  availableBalance: number;
  totalDispersed: number;
  activeBankAccount: {
    id: number;
    bankName: string;
    accountType: string;
    accountNumber: string;
    holderName: string;
  } | null;
  hasBankAccountVerified: boolean;
}

interface Payout {
  id: number;
  vendorId: number;
  amount: number;
  adminCommission: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  processedAt: string | null;
}

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'yellow', icon: Clock },
  PROCESSING: { label: 'Procesando', color: 'blue', icon: TrendingUp },
  COMPLETED: { label: 'Completado', color: 'green', icon: CheckCircle },
  FAILED: { label: 'Fallido', color: 'red', icon: XCircle },
  CANCELLED: { label: 'Cancelado', color: 'gray', icon: XCircle },
};

export default function PayoutsPage() {
  const [balance, setBalance] = useState<VendorBalance | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, payoutsRes] = await Promise.all([
        http.get('/vendor-payouts/my-balance'),
        http.get('/vendor-payouts/my-payouts'),
      ]);
      setBalance(balanceRes.data.result);
      setPayouts(payoutsRes.data.result || []);
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast.error('Error al cargar información de pagos');
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">Error al cargar información</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Mis Pagos y Dispersiones
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Consulta tu balance disponible y el historial de dispersiones
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Ventas Totales</span>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balance.totalSales)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Balance Disponible</span>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balance.availableBalance)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">Total Dispersado</span>
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balance.totalDispersed)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">Comisión Admin</span>
            <AlertCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balance.adminCommission)}</p>
        </div>
      </div>

      {/* Bank Account Status */}
      {balance.activeBankAccount ? (
        <div
          className={`rounded-xl shadow p-6 mb-8 ${
            balance.hasBankAccountVerified
              ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500'
          }`}
        >
          <div className="flex items-start gap-4">
            {balance.hasBankAccountVerified ? (
              <CheckCircle size={24} className="text-green-600 mt-1" />
            ) : (
              <Clock size={24} className="text-yellow-600 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                {balance.hasBankAccountVerified
                  ? 'Cuenta bancaria verificada'
                  : 'Cuenta bancaria pendiente de verificación'}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {balance.hasBankAccountVerified
                  ? 'Recibirás tus dispersiones automáticamente en:'
                  : 'El administrador debe verificar tu cuenta antes de poder recibir dispersiones:'}
              </p>
              <div className="mt-2 text-sm">
                <p>
                  <strong>Banco:</strong> {balance.activeBankAccount.bankName}
                </p>
                <p>
                  <strong>Cuenta:</strong> {balance.activeBankAccount.accountType} -{' '}
                  {balance.activeBankAccount.accountNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl shadow p-6 mb-8">
          <div className="flex items-start gap-4">
            <XCircle size={24} className="text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">No tienes cuenta bancaria registrada</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Debes registrar una cuenta bancaria para poder recibir tus dispersiones
              </p>
              <a
                href="/dashboard/bank-accounts"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Registrar cuenta bancaria
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Payouts History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Historial de Dispersiones</h2>

        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Aún no tienes dispersiones registradas
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Monto Bruto</th>
                  <th className="text-left py-3 px-4">Comisión</th>
                  <th className="text-left py-3 px-4">Monto Neto</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Procesado</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => {
                  const config = statusConfig[payout.status];
                  const StatusIcon = config.icon;

                  return (
                    <tr key={payout.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">{formatDate(payout.createdAt)}</td>
                      <td className="py-3 px-4">{formatCurrency(payout.amount)}</td>
                      <td className="py-3 px-4 text-red-600">
                        -{formatCurrency(payout.adminCommission)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        {formatCurrency(payout.netAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-${config.color}-100 text-${config.color}-800`}
                        >
                          <StatusIcon size={14} />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
