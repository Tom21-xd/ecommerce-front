'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { http } from '@/lib/http';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Building2, CheckCircle, X, Shield } from 'lucide-react';

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
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export default function AdminBankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

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

  const fetchAccounts = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filter === 'verified') params.isVerified = 'true';
      if (filter === 'pending') params.isVerified = 'false';

      const queryString = new URLSearchParams(params).toString();
      const response = await http.get(`/bank-accounts/all?${queryString}`);
      setAccounts(response.data.result || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('Error al cargar las cuentas bancarias');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleVerify = (id: number, accountInfo: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Verificar Cuenta Bancaria',
      message: `¿Verificar la cuenta bancaria de ${accountInfo}? Una vez verificada, el vendedor podrá recibir dispersiones.`,
      type: 'success',
      onConfirm: async () => {
        try {
          await http.patch(`/bank-accounts/${id}/verify`);
          toast.success('Cuenta verificada exitosamente');
          fetchAccounts();
        } catch (error) {
          console.error('Error verifying account:', error);
          toast.error('Error al verificar la cuenta');
        }
      },
    });
  };

  const handleUnverify = (id: number, accountInfo: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Desverificar Cuenta Bancaria',
      message: `¿Desverificar la cuenta bancaria de ${accountInfo}? El vendedor no podrá recibir dispersiones hasta que sea verificada nuevamente.`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await http.patch(`/bank-accounts/${id}/unverify`);
          toast.success('Cuenta desverificada');
          fetchAccounts();
        } catch (error) {
          console.error('Error unverifying account:', error);
          toast.error('Error al desverificar la cuenta');
        }
      },
    });
  };

  const filteredAccounts = accounts;
  const verifiedCount = accounts.filter((a) => a.isVerified).length;
  const pendingCount = accounts.filter((a) => !a.isVerified).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Cuentas Bancarias de Vendedores
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Verifica las cuentas bancarias de los vendedores para habilitar dispersiones
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cuentas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {accounts.length}
              </p>
            </div>
            <Building2 size={40} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verificadas</p>
              <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
            </div>
            <CheckCircle size={40} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Shield size={40} className="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Todas ({accounts.length})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'verified'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Verificadas ({verifiedCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Pendientes ({pendingCount})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No hay cuentas bancarias</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Vendedor</th>
                  <th className="text-left py-4 px-6 font-semibold">Banco</th>
                  <th className="text-left py-4 px-6 font-semibold">Tipo</th>
                  <th className="text-left py-4 px-6 font-semibold">Número de Cuenta</th>
                  <th className="text-left py-4 px-6 font-semibold">Titular</th>
                  <th className="text-left py-4 px-6 font-semibold">Documento</th>
                  <th className="text-left py-4 px-6 font-semibold">Estado</th>
                  <th className="text-left py-4 px-6 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {account.user.username}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {account.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">{account.bankName}</td>
                    <td className="py-4 px-6">{account.accountType}</td>
                    <td className="py-4 px-6">
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {account.accountNumber}
                      </code>
                    </td>
                    <td className="py-4 px-6">{account.holderName}</td>
                    <td className="py-4 px-6">
                      <span className="text-sm">
                        {account.documentType} {account.holderDocument}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {account.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <CheckCircle size={16} />
                            Verificada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-600 text-sm font-semibold">
                            <Shield size={16} />
                            Pendiente
                          </span>
                        )}
                        {account.isActive && (
                          <span className="text-xs text-blue-600">Activa</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {account.isVerified ? (
                          <button
                            onClick={() =>
                              handleUnverify(account.id, account.user.username)
                            }
                            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition"
                            title="Desverificar"
                          >
                            <X size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleVerify(account.id, account.user.username)
                            }
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition"
                            title="Verificar"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
