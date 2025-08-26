'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Order } from '@/types';
import { monthKey } from '@/lib/utils';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function DashboardPage() {
  const [items, setItems] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) { window.location.href = '/login'; return; }
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: true });
      setItems((data as Order[]) || []);
    })();
  }, []);

  const monthly = useMemo(() => {
    const map: Record<string, { month: string, revenue: number, orders: number }> = {};
    for (const o of items) {
      const key = monthKey(o.created_at);
      if (!map[key]) map[key] = { month: key, revenue: 0, orders: 0 };
      map[key].revenue += Number(o.amount_sale || 0);
      map[key].orders += 1;
    }
    return Object.values(map);
  }, [items]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card">
        <h3 className="mb-2 text-lg font-semibold">Chiffre d'affaires par mois</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#111827" fillOpacity={1} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-2 text-lg font-semibold">Nombre de commandes par mois</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Bar dataKey="orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
