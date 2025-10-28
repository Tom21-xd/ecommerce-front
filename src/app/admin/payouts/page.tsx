'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { http } from '@/lib/http';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  DollarSign,
  Users,
  TrendingUp,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Eye,
} from 'lucide-react';

interface VendorBalance {
  vendorId: number;
  vendorName: string;
  vendorEmail: string;
  totalSales: number;
  adminCommission: number;
  availableBalance: number;
  totalDispersed: number;
  activeBankAccount: any | null;
  hasBankAccountVerified: boolean;
}

interface DispersionConfig {
  id: number;
  dispersalFrequency: number;
  adminCommission: number;
  minimumPayout: number;
  isAutoDispersalOn: boolean;
  lastDispersalDate: string | null;
  nextDispersalDate: string | null;
}

interface Payout {
  id: number;
  vendorId: number;
  vendor: {
    id: number;
    username: string;
    email: string;
  };
  amount: number;
  adminCommission: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  processedAt: string | null;
}

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FAILED: { label: 'Fallido', color: 'bg-red-100 text-red-800', icon: XCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export default function AdminPayoutsPage() {
  const [balances, setBalances] = useState<VendorBalance[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [config, setConfig] = useState<DispersionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'balances' | 'payouts'>('balances');

  // Estado para el diálogo de confirmación
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balancesRes, payoutsRes, configRes] = await Promise.all([
        http.get('/vendor-payouts/balances'),
        http.get('/vendor-payouts/all'),
        http.get('/vendor-payouts/config'),
      ]);
      setBalances(balancesRes.data.result || []);
      setPayouts(payoutsRes.data.result || []);
      setConfig(configRes.data.result);
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast.error('Error al cargar información de dispersiones');
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
    });
  };

  const handleCreatePayout = (vendorId: number, vendorName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Crear Dispersión',
      message: `¿Crear dispersión para ${vendorName}? Se calculará automáticamente el monto disponible menos la comisión.`,
      type: 'info',
      onConfirm: async () => {
        try {
          await http.post('/vendor-payouts/create', { vendorId });
          toast.success('Dispersión creada exitosamente');
          fetchData();
        } catch (error: any) {
          console.error('Error creating payout:', error);
          toast.error(error.response?.data?.message || 'Error al crear dispersión');
        }
      },
    });
  };

  const handleCreateMultiplePayouts = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Dispersar a Todos',
      message: '¿Crear dispersiones para todos los vendedores elegibles? Solo se procesarán vendedores con cuenta verificada y balance suficiente.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const response = await http.post('/vendor-payouts/create-multiple', {});
          const result = response.data.result;
          toast.success(`Dispersiones creadas: ${result.successful} exitosas, ${result.failed} fallidas`);
          fetchData();
        } catch (error: any) {
          console.error('Error creating payouts:', error);
          toast.error(error.response?.data?.message || 'Error al crear dispersiones');
        }
      },
    });
  };

  const handleExecutePayout = (payoutId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Ejecutar Dispersión',
      message: '¿Ejecutar esta dispersión? Se procesará la transferencia a la cuenta bancaria del vendedor.',
      type: 'success',
      onConfirm: async () => {
        try {
          await http.post(`/vendor-payouts/execute/${payoutId}`);
          toast.success('Dispersión ejecutada exitosamente');
          fetchData();
        } catch (error: any) {
          console.error('Error executing payout:', error);
          toast.error(error.response?.data?.message || 'Error al ejecutar dispersión');
        }
      },
    });
  };

  const handleCancelPayout = (payoutId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancelar Dispersión',
      message: '¿Estás seguro de cancelar esta dispersión? Esta acción no se puede deshacer.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await http.delete(`/vendor-payouts/${payoutId}`);
          toast.success('Dispersión cancelada');
          fetchData();
        } catch (error: any) {
          console.error('Error cancelling payout:', error);
          toast.error(error.response?.data?.message || 'Error al cancelar dispersión');
        }
      },
    });
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      await http.patch('/vendor-payouts/config', {
        dispersalFrequency: config.dispersalFrequency,
        adminCommission: config.adminCommission,
        minimumPayout: config.minimumPayout,
        isAutoDispersalOn: config.isAutoDispersalOn,
      });
      toast.success('Configuración actualizada');
      setShowConfig(false);
      fetchData();
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Error al actualizar configuración');
    }
  };

  // Calcular totales generales
  const totalSales = balances.reduce((sum, b) => sum + b.totalSales, 0);
  const totalCommissions = balances.reduce((sum, b) => sum + b.adminCommission, 0);
  const totalAvailable = balances.reduce((sum, b) => sum + b.availableBalance, 0);
  const totalDispersed = balances.reduce((sum, b) => sum + b.totalDispersed, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Gestión de Dispersiones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los pagos a proveedores y configuración del sistema
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          <Settings size={20} />
          Configuración
        </button>
      </div>

      {/* Configuration Modal */}
      {showConfig && config && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Configuración de Dispersión</h2>
            <form onSubmit={handleUpdateConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frecuencia (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={config.dispersalFrequency}
                    onChange={(e) =>
                      setConfig({ ...config, dispersalFrequency: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Comisión Admin (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={config.adminCommission}
                    onChange={(e) =>
                      setConfig({ ...config, adminCommission: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mínimo para Dispersar (COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={config.minimumPayout}
                    onChange={(e) =>
                      setConfig({ ...config, minimumPayout: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.isAutoDispersalOn}
                    onChange={(e) =>
                      setConfig({ ...config, isAutoDispersalOn: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">
                    Dispersión Automática
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Total Recaudado</span>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
          <p className="text-sm text-green-100 mt-1">{balances.length} vendedores</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Por Dispersar</span>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalAvailable)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">Comisiones</span>
            <Users size={24} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalCommissions)}</p>
          <p className="text-sm text-purple-100 mt-1">
            {config?.adminCommission}% por venta
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">Total Dispersado</span>
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalDispersed)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'balances'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Balances de Vendedores
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'payouts'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Historial de Dispersiones
        </button>
      </div>

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Balances de Vendedores</h2>
            <button
              onClick={handleCreateMultiplePayouts}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Send size={20} />
              Dispersar a Todos los Elegibles
            </button>
          </div>

          {balances.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No hay vendedores con ventas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-4 px-4">Vendedor</th>
                    <th className="text-left py-4 px-4">Total Ventas</th>
                    <th className="text-left py-4 px-4">Comisión</th>
                    <th className="text-left py-4 px-4">Disponible</th>
                    <th className="text-left py-4 px-4">Dispersado</th>
                    <th className="text-left py-4 px-4">Cuenta</th>
                    <th className="text-left py-4 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((balance) => (
                    <tr
                      key={balance.vendorId}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold">{balance.vendorName}</p>
                          <p className="text-sm text-gray-600">{balance.vendorEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {formatCurrency(balance.totalSales)}
                      </td>
                      <td className="py-4 px-4 text-red-600">
                        -{formatCurrency(balance.adminCommission)}
                      </td>
                      <td className="py-4 px-4 font-bold text-green-600">
                        {formatCurrency(balance.availableBalance)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatCurrency(balance.totalDispersed)}
                      </td>
                      <td className="py-4 px-4">
                        {balance.hasBankAccountVerified ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle size={16} />
                            Verificada
                          </span>
                        ) : balance.activeBankAccount ? (
                          <span className="flex items-center gap-1 text-yellow-600 text-sm">
                            <Clock size={16} />
                            Pendiente
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <XCircle size={16} />
                            Sin cuenta
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleCreatePayout(balance.vendorId, balance.vendorName)}
                          disabled={
                            balance.availableBalance < (config?.minimumPayout || 0) ||
                            !balance.hasBankAccountVerified
                          }
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                        >
                          <Send size={14} />
                          Dispersar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Historial de Dispersiones</h2>

          {payouts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay dispersiones registradas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Vendedor</th>
                    <th className="text-left py-3 px-4">Monto Bruto</th>
                    <th className="text-left py-3 px-4">Comisión</th>
                    <th className="text-left py-3 px-4">Monto Neto</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => {
                    const config = statusConfig[payout.status];
                    const StatusIcon = config.icon;

                    return (
                      <tr
                        key={payout.id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-3 px-4">#{payout.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{payout.vendor.username}</p>
                            <p className="text-xs text-gray-600">{payout.vendor.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatCurrency(payout.amount)}</td>
                        <td className="py-3 px-4 text-red-600">
                          -{formatCurrency(payout.adminCommission)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          {formatCurrency(payout.netAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${config.color}`}
                          >
                            <StatusIcon size={14} />
                            {config.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{formatDate(payout.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {payout.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleExecutePayout(payout.id)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Ejecutar"
                                >
                                  <Send size={16} />
                                </button>
                                <button
                                  onClick={() => handleCancelPayout(payout.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Cancelar"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
}
