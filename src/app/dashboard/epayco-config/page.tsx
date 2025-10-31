'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { http } from '@/lib/http';

interface EpaycoConfig {
  id: number;
  userId: number;
  publicKey: string;
  isTestMode: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EpaycoConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<EpaycoConfig | null>(null);
  const [formData, setFormData] = useState({
    publicKey: '',
    privateKey: '',
    isTestMode: true,
    isActive: false,
  });

  const loadConfig = useCallback(async () => {
    try {
      const response = await http.get('/epayco-config');
      if (response.data.result) {
        setConfig(response.data.result);
        setFormData({
          publicKey: response.data.result.publicKey,
          privateKey: '',
          isTestMode: response.data.result.isTestMode,
          isActive: response.data.result.isActive,
        });
      }
    } catch (error) {
      let status: number | undefined;
      let message: string;
      
      if (error instanceof Error) {
        message = error.message;
        if ('response' in error) {
          const axiosError = error as { response?: { status?: number } };
          status = axiosError.response?.status;
        }
      } else {
        message = 'Error desconocido';
      }

      // Si no existe configuración (404), no mostrar error
      if (status === 404) {
        console.log('No hay configuración de ePayco aún');
      }
      // Si no tiene permisos (401, 403), redirigir al login o mostrar mensaje
      else if (status === 401 || status === 403) {
        console.error('Error de autenticación:', message);
        toast.error('No tienes permisos para acceder. Debes ser un vendedor.');
        // Opcional: redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
      // Otros errores
      else {
        console.error('Error al cargar configuración:', error);
        toast.error('Error al cargar la configuración');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (config) {
        // Actualizar configuración existente
        await http.patch('/epayco-config', formData);
        toast.success('Configuración actualizada correctamente');
      } else {
        // Crear nueva configuración
        await http.post('/epayco-config', formData);
        toast.success('Configuración creada correctamente');
      }
      await loadConfig();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la configuración de ePayco';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const endpoint = config?.isActive
        ? '/epayco-config/deactivate'
        : '/epayco-config/activate';
      await http.patch(endpoint);
      toast.success(
        config?.isActive
          ? 'Configuración desactivada'
          : 'Configuración activada'
      );
      await loadConfig();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado de la configuración');
    }
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-green-600 hover:text-green-700 flex items-center gap-2"
        >
          ← Volver
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Configuración de ePayco
          </h1>
          {config && (
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  config.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {config.isActive ? 'Activo' : 'Inactivo'}
              </span>
              <button
                onClick={handleToggleActive}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {config.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">
            ¿Cómo obtener tus credenciales de ePayco?
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>
              Ingresa a tu cuenta de{' '}
              <a
                href="https://dashboard.epayco.co"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                ePayco Dashboard
              </a>
            </li>
            <li>Ve a la sección &quot;Integración&quot;</li>
            <li>Copia tu &quot;Public Key&quot; (llave pública)</li>
            <li>
              Opcionalmente, copia tu &quot;Private Key&quot; (llave privada)
            </li>
            <li>Pega las llaves en el formulario a continuación</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public Key (Llave Pública) *
            </label>
            <input
              type="text"
              required
              value={formData.publicKey}
              onChange={(e) =>
                setFormData({ ...formData, publicKey: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="ej: 0ac5d9ead0e4740419a0a53731ab4e49"
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta clave se usará para procesar los pagos en tu tienda
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Private Key (Llave Privada)
            </label>
            <input
              type="password"
              value={formData.privateKey}
              onChange={(e) =>
                setFormData({ ...formData, privateKey: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Opcional"
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta clave es opcional y se almacenará de forma segura
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isTestMode"
              checked={formData.isTestMode}
              onChange={(e) =>
                setFormData({ ...formData, isTestMode: e.target.checked })
              }
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label
              htmlFor="isTestMode"
              className="text-sm font-medium text-gray-700"
            >
              Modo de prueba
            </label>
          </div>
          <p className="text-xs text-gray-500 ml-6 -mt-2">
            Activa esta opción para realizar transacciones de prueba. Desactívala
            cuando estés listo para recibir pagos reales.
          </p>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Guardando...'
                : config
                ? 'Actualizar Configuración'
                : 'Guardar Configuración'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>

        {config && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">
              Estado de la configuración
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Creada:</span>{' '}
                {new Date(config.createdAt).toLocaleDateString('es-CO')}
              </p>
              <p>
                <span className="font-medium">Última actualización:</span>{' '}
                {new Date(config.updatedAt).toLocaleDateString('es-CO')}
              </p>
              <p>
                <span className="font-medium">Modo:</span>{' '}
                {config.isTestMode ? 'Prueba' : 'Producción'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
