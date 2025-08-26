'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Order } from '@/types';
import { currency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Download, Edit, Search, Trash2, FileSpreadsheet } from 'lucide-react';
import ExcelJS from 'exceljs';

type Props = {
  items: Order[];
  onChanged?: (items: Order[]) => void;
};

export default function OrdersTable({ items, onChanged }: Props) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Order | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(o =>
      (o.order_no ?? '').toLowerCase().includes(q) ||
      (o.first_name ?? '').toLowerCase().includes(q) ||
      (o.last_name ?? '').toLowerCase().includes(q) ||
      (o.phone ?? '').toLowerCase().includes(q) ||
      (o.address ?? '').toLowerCase().includes(q) ||
      (o.instagram_url ?? '').toLowerCase().includes(q) ||
      (o.product_name ?? '').toLowerCase().includes(q) ||
      (o.comment ?? '').toLowerCase().includes(q)
    );
  }, [items, query]);

  const onDelete = async (id: string) => {
    if (!confirm('Supprimer cette commande ?')) return;
    setBusyId(id);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    setBusyId(null);
    if (!error && onChanged) onChanged(items.filter(i => i.id !== id));
  };

  const onSave = async () => {
    if (!editing) return;
    setBusyId(editing.id);
    const { id, created_at, user_id, ...payload } = editing as any;
    const { data, error } = await supabase.from('orders').update(payload).eq('id', editing.id).select().single();
    setBusyId(null);
    if (!error && data && onChanged) {
      const updated = items.map(i => i.id === editing.id ? data as Order : i);
      onChanged(updated);
      setEditing(null);
    }
  };

  const exportCSV = () => {
    const headers = ['order_no','first_name','last_name','address','phone','instagram_url','product_name','comment','amount_purchase','amount_sale','amount_deposit','created_at'];
    const rows = filtered.map(o => [o.order_no,o.first_name,o.last_name,o.address,o.phone,o.instagram_url,o.product_name,o.comment,o.amount_purchase,o.amount_sale,o.amount_deposit,o.created_at]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => (v ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Orders');
    ws.addRow(['Order #','First name','Last name','Address','Phone','Instagram','Product','Comment','Amount purchase','Amount sale','Amount deposit','Created at']);
    filtered.forEach(o => {
      ws.addRow([o.order_no,o.first_name,o.last_name,o.address,o.phone,o.instagram_url,o.product_name,o.comment,o.amount_purchase,o.amount_sale,o.amount_deposit,o.created_at]);
    });
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders.xlsx'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-xl border px-3">
          <Search size={16} className="text-gray-500" />
          <input className="bg-transparent py-2 outline-none" placeholder="Rechercher..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn btn-outline" title="Exporter CSV"><Download size={16}/> CSV</button>
          <button onClick={exportXLSX} className="btn btn-outline" title="Exporter Excel"><FileSpreadsheet size={16}/> XLSX</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-2">#</th>
              <th className="p-2">Produit</th>
              <th className="p-2">Client</th>
              <th className="p-2">Téléphone</th>
              <th className="p-2">Montant Vente</th>
              <th className="p-2">Avance</th>
              <th className="p-2">Reste</th>
              <th className="p-2">Créé</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, idx) => {
              const unpaid = Math.max(Number(o.amount_sale || 0) - Number(o.amount_deposit || 0), 0);
              return (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="border-t"
                >
                  <td className="p-2 font-mono">{o.order_no}</td>
                  <td className="p-2">
                    <div className="font-medium">{o.product_name ?? '-'}</div>
                    {o.comment ? <div className="text-xs text-gray-500 line-clamp-1">{o.comment}</div> : null}
                  </td>
                  <td className="p-2">
                    <div className="font-medium">{o.first_name} {o.last_name}</div>
                    <div className="text-xs text-gray-500">{o.address}</div>
                  </td>
                  <td className="p-2">{o.phone}</td>
                  <td className="p-2">{currency(o.amount_sale ?? 0)}</td>
                  <td className="p-2">{currency(o.amount_deposit ?? 0)}</td>
                  <td className="p-2">{currency(unpaid)}</td>
                  <td className="p-2">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-outline" onClick={() => setEditing(o)}><Edit size={16}/> Edit</button>
                      <button className="btn btn-outline" onClick={() => onDelete(o.id)} disabled={busyId===o.id}>
                        <Trash2 size={16}/> {busyId===o.id ? '...' : 'Supprimer'}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="card w-full max-w-xl">
            <h3 className="mb-3 text-lg font-semibold">Modifier commande {editing.order_no}</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Nom du produit" value={editing.product_name ?? ''} onChange={v => setEditing({ ...editing!, product_name: v })} />
              <Field label="Prénom" value={editing.first_name} onChange={v => setEditing({ ...editing!, first_name: v })} />
              <Field label="Nom" value={editing.last_name} onChange={v => setEditing({ ...editing!, last_name: v })} />
              <Field label="Adresse" value={editing.address} onChange={v => setEditing({ ...editing!, address: v })} />
              <Field label="Téléphone" value={editing.phone} onChange={v => setEditing({ ...editing!, phone: v })} />
              <Field label="Instagram" value={editing.instagram_url ?? ''} onChange={v => setEditing({ ...editing!, instagram_url: v })} />
              <Field label="Montant Achat" value={String(editing.amount_purchase ?? '')} onChange={v => setEditing({ ...editing!, amount_purchase: v ? Number(v) : null })} type="number" />
              <Field label="Montant Vente" value={String(editing.amount_sale ?? '')} onChange={v => setEditing({ ...editing!, amount_sale: v ? Number(v) : null })} type="number" />
              <Field label="Montant Avance" value={String(editing.amount_deposit ?? '')} onChange={v => setEditing({ ...editing!, amount_deposit: v ? Number(v) : null })} type="number" />
              <Textarea label="Commentaire" value={editing.comment ?? ''} onChange={v => setEditing({ ...editing!, comment: v })} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={onSave} disabled={busyId===editing.id}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type='text' } : { label: string, value: any, onChange: (v: string)=>void, type?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
             type={type}
             value={value}
             onChange={e => onChange((e.target as HTMLInputElement).value)} />
    </label>
  );
}

function Textarea({ label, value, onChange } : { label: string, value: any, onChange: (v: string)=>void }) {
  return (
    <label className="md:col-span-2 grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200 min-h-[80px]"
                value={value}
                onChange={e => onChange((e.target as HTMLTextAreaElement).value)} />
    </label>
  );
}
