'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Order } from '@/types';
import { monthKey } from '@/lib/utils';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend
} from 'recharts';

const PALETTE = ['#8B5CF6','#6366F1','#3B82F6','#22D3EE','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6','#84CC16','#F43F5E','#06B6D4'];

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
    const map: Record<string, { month: string, revenue: number, orders: number, unpaid: number }> = {};
    for (const o of items) {
      const key = monthKey(o.created_at);
      if (!map[key]) map[key] = { month: key, revenue: 0, orders: 0, unpaid: 0 };
      const sale = Number(o.amount_sale || 0);
      const deposit = Number(o.amount_deposit || 0);
      map[key].revenue += sale;
      map[key].orders += 1;
      map[key].unpaid += Math.max(sale - deposit, 0);
    }
    return Object.values(map);
  }, [items]);

  const donutData = useMemo(() => {
    const total = monthly.reduce((a, b) => a + b.revenue, 0);
    return monthly.map((m) => ({
      name: m.month,
      value: Number(m.revenue.toFixed(2)),
      percent: total ? (m.revenue / total) * 100 : 0
    }));
  }, [monthly]);

  const kpis = useMemo(() => {
    const totalRevenue = monthly.reduce((a, b) => a + b.revenue, 0);
    const totalOrders = monthly.reduce((a, b) => a + b.orders, 0);
    const totalUnpaid = monthly.reduce((a, b) => a + b.unpaid, 0);
    return { totalRevenue, totalOrders, totalUnpaid };
  }, [monthly]);

  return (
    <div className="grid gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPI title="CA total" value={kpis.totalRevenue} />
        <KPI title="Commandes" value={kpis.totalOrders} format="int" />
        <KPI title="Impayés (reste)" value={kpis.totalUnpaid} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gradient Area: Revenue per month */}
        <div className="card overflow-hidden">
          <h3 className="mb-2 text-lg font-semibold">Chiffre d'affaires par mois</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="4 4" />
                <Tooltip formatter={(v: number) => v.toLocaleString(undefined, { style: 'currency', currency: 'MAD' })} />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut: revenue share */}
        <div className="card overflow-hidden">
          <h3 className="mb-2 text-lg font-semibold">Répartition du CA (donut)</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString(undefined, { style: 'currency', currency: 'MAD' })} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bars: Orders per month with color ramp */}
        <div className="card overflow-hidden">
          <h3 className="mb-2 text-lg font-semibold">Nombre de commandes par mois</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders">
                  {monthly.map((_, idx) => (
                    <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bars: Unpaid per month */}
        <div className="card overflow-hidden">
          <h3 className="mb-2 text-lg font-semibold">Impayés (reste) par mois</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => v.toLocaleString(undefined, { style: 'currency', currency: 'MAD' })} />
                <Bar dataKey="unpaid">
                  {monthly.map((_, idx) => (
                    <Cell key={idx} fill="#EF4444" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, format='money' } : { title: string, value: number, format?: 'money'|'int' }) {
  const text = format === 'money'
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'MAD' }).format(value || 0)
    : new Intl.NumberFormat().format(value || 0);
  return (
    <div className="card">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{text}</div>
    </div>
  );
}
