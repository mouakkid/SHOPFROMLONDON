'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Order } from '@/types';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';

type Props = {
  onCreated?: (o: Order) => void;
};

export default function OrderForm({ onCreated }: Props) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', address: '', phone: '', instagram_url: '',
    product_name: '', comment: '',
    amount_purchase: '', amount_sale: '', amount_deposit: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      instagram_url: form.instagram_url.trim() || null,
      product_name: form.product_name.trim() || null,
      comment: form.comment.trim() || null,
      amount_purchase: form.amount_purchase ? Number(form.amount_purchase) : null,
      amount_sale: form.amount_sale ? Number(form.amount_sale) : null,
      amount_deposit: form.amount_deposit ? Number(form.amount_deposit) : null,
    };
    const { data, error } = await supabase.from('orders').insert(payload).select().single();
    setLoading(false);
    if (error) setError(error.message);
    else {
      onCreated?.(data as Order);
      setForm({
        first_name: '', last_name: '', address: '', phone: '', instagram_url: '',
        product_name: '', comment: '',
        amount_purchase: '', amount_sale: '', amount_deposit: '',
      });
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={submit}
      className="card grid gap-3"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Prénom" value={form.first_name} onChange={set('first_name')} />
        <Field label="Nom" value={form.last_name} onChange={set('last_name')} />
        <Field label="Adresse" value={form.address} onChange={set('address')} />
        <Field label="Téléphone" value={form.phone} onChange={set('phone')} />
        <Field label="Lien Instagram" value={form.instagram_url} onChange={set('instagram_url')} placeholder="https://instagram.com/..." />
        <Field label="Nom du produit" value={form.product_name} onChange={set('product_name')} />
        <Textarea label="Commentaire" value={form.comment} onChange={set('comment')} />
        <Field label="Montant Achat (MAD)" value={form.amount_purchase} onChange={set('amount_purchase')} type="number" />
        <Field label="Montant Vente (MAD)" value={form.amount_sale} onChange={set('amount_sale')} type="number" />
        <Field label="Montant Avance (MAD)" value={form.amount_deposit} onChange={set('amount_deposit')} type="number" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={loading} className="btn btn-primary disabled:opacity-50 animate-pulse-soft">
        <Save size={16}/> {loading ? 'Enregistrement...' : 'Ajouter la commande'}
      </button>
    </motion.form>
  );
}

function Field({ label, value, onChange, type='text', placeholder='' } : { label: string, value: any, onChange: any, type?: string, placeholder?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
        type={type} value={value} onChange={onChange} placeholder={placeholder}
      />
    </label>
  );
}

function Textarea({ label, value, onChange } : { label: string, value: any, onChange: any }) {
  return (
    <label className="md:col-span-2 grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200 min-h-[80px]"
        value={value} onChange={onChange}
      />
    </label>
  );
}
