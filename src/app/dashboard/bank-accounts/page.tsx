'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { http } from '@/lib/http';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Building2, Plus, Trash2, Check, X, Store, ArrowRight } from 'lucide-react';

interface BankAccount {
  id: number;
  bankName: string;
  accountType: 'AHORROS' | 'CORRIENTE';
  accountNumber: string;
  holderName: string;
  holderDocument: string;
  documentType: 'CC' | 'CE' | 'NIT' | 'PP';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function BankAccountsPage() {
  const user = useCurrentUser();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [upgradingToSeller, setUpgradingToSeller] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: 'AHORROS' as 'AHORROS' | 'CORRIENTE',
    accountNumber: '',
    holderName: '',
    holderDocument: '',
    documentType: 'CC' as 'CC' | 'CE' | 'NIT' | 'PP',
    isActive: true,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await http.get('/bank-accounts/my-accounts');
      setAccounts(response.data.result || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('Error al cargar las cuentas bancarias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post('/bank-accounts', formData);
      toast.success('Cuenta bancaria registrada exitosamente');
      setShowForm(false);
      setFormData({
        bankName: '',
        accountType: 'AHORROS',
        accountNumber: '',
        holderName: '',
        holderDocument: '',
        documentType: 'CC',
        isActive: true,
      });
      fetchAccounts();
    } catch (error: any) {
      console.error('Error creating bank account:', error);
      toast.error(error.response?.data?.message || 'Error al registrar la cuenta');
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Cuenta Bancaria',
      message: '¿Estás seguro de eliminar esta cuenta bancaria? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await http.delete(`/bank-accounts/${id}`);
          toast.success('Cuenta eliminada exitosamente');
          fetchAccounts();
        } catch (error) {
          console.error('Error deleting bank account:', error);
          toast.error('Error al eliminar la cuenta');
        }
      },
    });
  };

  const handleSetActive = async (id: number) => {
    try {
      await http.patch(`/bank-accounts/${id}`, { isActive: true });
      toast.success('Cuenta activa actualizada');
      fetchAccounts();
    } catch (error) {
      console.error('Error updating bank account:', error);
      toast.error('Error al actualizar la cuenta');
    }
  };

  const handleUpgradeToSeller = async () => {
    setUpgradingToSeller(true);
    try {
      await http.patch('/users/upgrade-to-seller');
      toast.success('¡Felicidades! Ahora eres vendedor. Recarga la página para ver los cambios.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error upgrading to seller:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar tu rol');
    } finally {
      setUpgradingToSeller(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Cuentas Bancarias
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Registra tus cuentas bancarias para recibir los pagos de tus ventas
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Importante:</strong> El administrador debe verificar tu cuenta bancaria antes
          de que puedas recibir dispersiones. Solo puedes tener una cuenta activa a la vez.
        </p>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        <Plus size={20} />
        Agregar cuenta bancaria
      </button>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Nueva Cuenta Bancaria</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Banco</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Ej: Bancolombia"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Cuenta</label>
                <select
                  value={formData.accountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accountType: e.target.value as 'AHORROS' | 'CORRIENTE',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="AHORROS">Ahorros</option>
                  <option value="CORRIENTE">Corriente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Número de Cuenta</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Titular</label>
                <input
                  type="text"
                  value={formData.holderName}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                  placeholder="Juan Pérez"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Documento</label>
                <select
                  value={formData.documentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      documentType: e.target.value as 'CC' | 'CE' | 'NIT' | 'PP',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="NIT">NIT</option>
                  <option value="PP">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Número de Documento</label>
                <input
                  type="text"
                  value={formData.holderDocument}
                  onChange={(e) => setFormData({ ...formData, holderDocument: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Registrar Cuenta
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No tienes cuentas bancarias registradas
            </p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-2 ${
                account.isActive
                  ? 'border-green-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 size={24} className="text-gray-600 dark:text-gray-400" />
                    <h3 className="text-xl font-semibold">{account.bankName}</h3>
                    {account.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        ACTIVA
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de Cuenta</p>
                      <p className="font-medium">{account.accountType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Número de Cuenta</p>
                      <p className="font-medium">{account.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Titular</p>
                      <p className="font-medium">{account.holderName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Documento</p>
                      <p className="font-medium">
                        {account.documentType} {account.holderDocument}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {account.isVerified ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <Check size={16} />
                        Verificada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <X size={16} />
                        Pendiente de verificación
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!account.isActive && (
                    <button
                      onClick={() => handleSetActive(account.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Activar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
