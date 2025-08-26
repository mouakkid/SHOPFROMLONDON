'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Order } from '@/types';
import OrderForm from '@/components/OrderForm';
import OrdersTable from '@/components/OrdersTable';

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        window.location.href = '/login';
        return;
      }
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setItems((data as Order[]) || []);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <div className="grid gap-6">
      <OrderForm onCreated={o => setItems([o, ...items])} />
      <OrdersTable items={items} onChanged={setItems} />
    </div>
  );
}
