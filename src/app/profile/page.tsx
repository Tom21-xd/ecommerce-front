"use client";

import { useEffect, useState } from "react";
import { UsersService } from "@/service/users/users.service";
import { AddressesService } from "@/service/addresses/addresses.service";
import { toast } from "sonner";
import { User2, Mail, Shield, KeyRound, LogOut, Edit2, Phone, MapPin, Trash2, Plus, Save, X } from "lucide-react";
import type { UpdateProfileDto, User, Address } from "@/lib/types";
import type { UpsertAddressDto } from "@/service/addresses/dto";


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [form, setForm] = useState<UpdateProfileDto>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [addressEditId, setAddressEditId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState<UpsertAddressDto & { country?: string }>({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', isDefault: false, country: ''
  });
  const [addressError, setAddressError] = useState<Record<string, string>>({});
  const [addressSaving, setAddressSaving] = useState<boolean>(false);

  useEffect(() => {
    UsersService.profile()
      .then((u) => {
        setUser(u);
        setForm({ email: u.email, username: u.username, phones: u.phones });
      })
      .catch(() => toast.error("No se pudo cargar el perfil"));
    fetchAddresses();
    
  }, []);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.email?.trim()) errs.email = "El email es obligatorio";
    if (!form.username?.trim()) errs.username = "El usuario es obligatorio";
    if (form.password && form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (form.phones && !/^\d{7,15}$/.test(form.phones)) errs.phones = "Celular inválido";
    return errs;
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const updated = await UsersService.updateProfile(form);
      setUser(updated);
      setEditing(false);
      setForm({ ...form, password: undefined });
      toast.success("Perfil actualizado");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  }

  async function fetchAddresses() {
    setAddressLoading(true);
    try {
      const data = await AddressesService.list();
      setAddresses(data);
    } finally {
      setAddressLoading(false);
    }
  }

  function handleAddressInput(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target;
    const { name, value, type } = target;
    if (type === 'checkbox' && target instanceof HTMLInputElement) {
      setAddressForm(f => ({ ...f, [name]: target.checked }));
    } else {
      setAddressForm(f => ({ ...f, [name]: value }));
    }
  }

  function startAddAddress() {
    setAddressEditId(null);
    setAddressForm({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', isDefault: false, country: '' });
    setAddressError({});
  }

  function startEditAddress(addr: Address) {
    setAddressEditId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state || '',
      zip: addr.zip || '',
      isDefault: addr.isDefault,
      country: addr.country || ''
    });
    setAddressError({});
  }

  async function handleAddressSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddressSaving(true);
    setAddressError({});
    try {
      if (!addressForm.fullName || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.country) {
        setAddressError({ general: 'Por favor completa los campos obligatorios.' });
        setAddressSaving(false);
        return;
      }
      if (addressEditId) {
        await AddressesService.update(addressEditId, addressForm);
      } else {
        await AddressesService.create(addressForm);
      }
      setAddressEditId(null);
      setAddressForm({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', isDefault: false, country: '' });
      fetchAddresses();
    } catch (err) {
      setAddressError({ general: err instanceof Error ? err.message : 'Error al guardar dirección' });
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleAddressDelete(id: number) {
    if (!window.confirm('¿Eliminar esta dirección?')) return;
    setAddressSaving(true);
    try {
      await AddressesService.remove(id);
      fetchAddresses();
    } finally {
      setAddressSaving(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto mt-12 px-2 sm:px-6">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden animate-fade-in p-0">
        {/* Avatar y nombre arriba */}
        <div className="flex flex-col items-center gap-4 pt-12 pb-6 px-4 sm:px-8">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-700 dark:to-primary-900 flex items-center justify-center shadow-2xl border-4 border-white dark:border-neutral-900">
            <User2 className="w-20 h-20 sm:w-24 sm:h-24 text-white/90" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white truncate max-w-[220px]">{user?.username}</span>
          <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">ID: <span className="font-mono">{user?.id}</span></span>
        </div>
        {/* Direcciones */}
        <div className="w-full max-w-3xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2"><MapPin className="w-6 h-6" /> Direcciones</h2>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white font-semibold shadow text-sm"
              onClick={startAddAddress}
              type="button"
              disabled={addressSaving || addressEditId === null && Object.values(addressForm).some(v => v)}
            >
              <Plus className="w-4 h-4" /> Nueva dirección
            </button>
          </div>
          {/* Formulario de dirección */}
          {(addressEditId !== null || (addressEditId === null && addressForm.fullName)) && (
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl p-6 mb-6 shadow animate-fade-in" onSubmit={handleAddressSave} autoComplete="off">
              <input name="fullName" value={addressForm.fullName} onChange={handleAddressInput} placeholder="Nombre completo" className="rounded-md border px-3 py-2 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700" required />
              <input name="phone" value={addressForm.phone} onChange={handleAddressInput} placeholder="Celular" className="rounded-md border px-3 py-2 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700" required />
              <input name="line1" value={addressForm.line1} onChange={handleAddressInput} placeholder="Dirección" className="rounded-md border px-3 py-2 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700" required />
              <input name="line2" value={addressForm.line2} onChange={handleAddressInput} placeholder="Apto, piso, etc. (opcional)" className="rounded-md border px-3 py-2 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700" />
              <input name="city" value={addressForm.city} onChange={handleAddressInput} placeholder="Ciudad" className="rounded-md border px-3 py-2 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700" required />
              <input name="state" value={addressForm.state} onChange={handleAddressInput} placeholder="Departamento/Estado (opcional)" className="rounded-md border px-3 py-2 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700" />
              <input name="country" value={addressForm.country || ''} onChange={handleAddressInput} placeholder="País" className="rounded-md border px-3 py-2 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700" required />
              <input name="zip" value={addressForm.zip} onChange={handleAddressInput} placeholder="Código postal (opcional)" className="rounded-md border px-3 py-2 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700" />
              <label className="flex items-center gap-2 col-span-2 mt-2">
                <input type="checkbox" name="isDefault" checked={!!addressForm.isDefault} onChange={handleAddressInput} className="accent-primary-600" />
                <span className="text-sm text-neutral-700 dark:text-neutral-200">Usar como dirección principal</span>
              </label>
              {addressError.general && <div className="col-span-2 text-red-500 text-sm">{addressError.general}</div>}
              <div className="flex gap-2 col-span-2 justify-end mt-2">
                <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white font-bold shadow text-sm disabled:opacity-60" disabled={addressSaving}>
                  {addressSaving ? <span className="inline-block animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4" /> : <Save className="w-4 h-4" />} Guardar
                </button>
                <button type="button" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-bold shadow text-sm" onClick={() => { setAddressEditId(null); setAddressForm({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', isDefault: false, country: '' }); setAddressError({}); }} disabled={addressSaving}>
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </form>
          )}
          {/* Listado de direcciones */}
          <div className="space-y-4">
            {addressLoading ? (
              <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">Cargando direcciones...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">No tienes direcciones registradas.</div>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-xl shadow bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 ${addr.isDefault ? 'ring-2 ring-primary-500' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">{addr.fullName} {addr.isDefault && <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded ml-2">Principal</span>}</div>
                    <div className="text-sm text-neutral-700 dark:text-neutral-200 truncate">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}{addr.state ? `, ${addr.state}` : ''}, {addr.country}{addr.zip ? `, CP ${addr.zip}` : ''}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Cel: {addr.phone}</div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold" onClick={() => startEditAddress(addr)} disabled={addressSaving}><Edit2 className="w-4 h-4" /> Editar</button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 text-xs font-semibold" onClick={() => handleAddressDelete(addr.id)} disabled={addressSaving}><Trash2 className="w-4 h-4" /> Eliminar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Datos y acciones en grilla */}
        <div className="w-full flex flex-col items-center pb-12 px-4 sm:px-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-neutral-900 dark:text-neutral-100 tracking-tight text-center">Mi perfil</h1>
          {!editing ? (
            <div className="w-full max-w-3xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 shadow-sm min-h-[70px]">
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 dark:text-primary-400 shrink-0" />
                  <div className="flex flex-col w-full">
                    <span className="block text-xs sm:text-sm text-neutral-500">Email</span>
                    <span className="block text-sm sm:text-base font-semibold truncate w-full" title={user?.email}>{user?.email}</span>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 shadow-sm min-h-[70px]">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 dark:text-primary-400 shrink-0" />
                  <div>
                    <span className="block text-xs sm:text-sm text-neutral-500">Rol</span>
                    <span className="block text-sm sm:text-base font-semibold uppercase">{user?.role}</span>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 shadow-sm min-h-[70px]">
                  <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 dark:text-primary-400 shrink-0" />
                  <div>
                    <span className="block text-xs sm:text-sm text-neutral-500">Celular</span>
                    <span className="block text-sm sm:text-base font-semibold">{user?.phones || <span className="text-neutral-400">No registrado</span>}</span>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 shadow-sm min-h-[70px]">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 dark:text-primary-400 font-mono shrink-0">#</span>
                  <div>
                    <span className="block text-xs sm:text-sm text-neutral-500">Creado</span>
                    <span className="block text-sm sm:text-base font-mono">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white font-bold shadow transition text-base w-full" onClick={() => setEditing(true)}>
                  <Edit2 className="w-5 h-5" /> Editar perfil
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-bold shadow transition text-base w-full" disabled>
                  <KeyRound className="w-5 h-5" /> Cambiar contraseña
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold shadow transition text-base w-full col-span-1 sm:col-span-2" disabled>
                  <LogOut className="w-5 h-5" /> Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-10 animate-fade-in" onSubmit={handleSave} autoComplete="off">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={`w-full rounded-md border px-3 py-2 dark:bg-neutral-950 ${errors.email ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
                    value={form.email || ''}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                  {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1" htmlFor="username">Usuario</label>
                  <input
                    id="username"
                    className={`w-full rounded-md border px-3 py-2 dark:bg-neutral-950 ${errors.username ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
                    value={form.username || ''}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    required
                  />
                  {errors.username && <div className="text-xs text-red-500 mt-1">{errors.username}</div>}
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1" htmlFor="phones">Celular</label>
                  <input
                    id="phones"
                    className={`w-full rounded-md border px-3 py-2 dark:bg-neutral-950 ${errors.phones ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
                    value={form.phones || ''}
                    onChange={e => setForm(f => ({ ...f, phones: e.target.value }))}
                    placeholder="Ej: 3001234567"
                  />
                  {errors.phones && <div className="text-xs text-red-500 mt-1">{errors.phones}</div>}
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1" htmlFor="password">Nueva contraseña</label>
                  <input
                    id="password"
                    type="password"
                    className={`w-full rounded-md border px-3 py-2 dark:bg-neutral-950 ${errors.password ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}`}
                    value={form.password || ''}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Dejar vacío para no cambiar"
                  />
                  {errors.password && <div className="text-xs text-red-500 mt-1">{errors.password}</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white font-bold shadow transition text-base disabled:opacity-60" disabled={saving}>
                  {saving && <span className="inline-block animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4" />}
                  Guardar cambios
                </button>
                <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-bold shadow transition text-base" onClick={() => { setEditing(false); setForm({ email: user?.email || '', username: user?.username || '', phones: user?.phones }); setErrors({}); }} disabled={saving}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

