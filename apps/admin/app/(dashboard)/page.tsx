'use client';
import { useQuery } from '@tanstack/react-query';
import { getStats } from '@/lib/api';
import { Users, Store, Wrench, CheckSquare, Package, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30000,
  });

  const stats = [
    { name: 'Total Drivers', value: data?.totalDrivers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Dhabas', value: data?.totalDhabas || 0, icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Total Mechanics', value: data?.totalMechanics || 0, icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Pending Verifications', value: data?.pendingVerifications || 0, icon: CheckSquare, color: data?.pendingVerifications > 0 ? 'text-orange-600' : 'text-slate-600', bg: data?.pendingVerifications > 0 ? 'bg-orange-100' : 'bg-slate-100' },
    { name: 'Orders Today', value: data?.ordersToday || 0, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Active SOS Alerts', value: data?.activeSos || 0, icon: AlertTriangle, color: data?.activeSos > 0 ? 'text-red-600' : 'text-slate-600', bg: data?.activeSos > 0 ? 'bg-red-100' : 'bg-slate-100' },
  ];

  const registrationData = data?.registrationsData || [];
  const orderData = data?.ordersData || [];

  if (isLoading) return <div className="p-4">Loading stats...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg border border-slate-100 p-5 flex items-center">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">{stat.name}</dt>
                <dd>
                  <div className="text-2xl font-semibold text-slate-900">{stat.value}</div>
                </dd>
              </dl>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow rounded-lg border border-slate-100">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Registrations (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="drivers" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="dhabas" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mechanics" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-lg border border-slate-100">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Orders per Day (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <RechartsTooltip />
                <Bar dataKey="orders" fill="#E8611A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
