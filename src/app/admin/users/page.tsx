"use client";

import { useState } from "react";
import { UsersService } from "@/service/users/users.service";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const [role,setRole]=useState<"ADMIN"|"SELLER"|"BUYER">("SELLER");
  const [rows,setRows]=useState<User[]>([]);
  const [loading,setLoading]=useState(false);

  async function load(){
    setLoading(true);
    try{
      const res = await UsersService.byRole(role);
      setRows(res);
    } finally { setLoading(false); }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Usuarios por rol</h1>
      <div className="flex items-center gap-2">
        <select className="border rounded-md px-3 py-2" value={role} onChange={e=>setRole(e.target.value as any)}>
          <option>ADMIN</option>
          <option>SELLER</option>
          <option>BUYER</option>
        </select>
        <button onClick={load} className="rounded-md border bg-white px-3 py-2 text-sm">Cargar</button>
      </div>

      {loading && <p>Cargando…</p>}

      {!loading && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map(u=>(
            <li key={u.id} className="rounded-md border bg-white p-3">
              <b>{u.username}</b> — {u.email} — {u.role}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
