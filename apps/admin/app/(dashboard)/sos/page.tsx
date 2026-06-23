'use client';
import { useQuery } from '@tanstack/react-query';
import { getSOSAlerts } from '@/lib/api';
import { useState } from 'react';
import { Map, List } from 'lucide-react';

export default function SOSPage() {
  const [view, setView] = useState<'table' | 'map'>('table');
  const { data, isLoading } = useQuery({ queryKey: ['sos'], queryFn: () => getSOSAlerts() });

  if (isLoading) return <div className="p-6">Loading SOS Alerts...</div>;

  const alerts = data?.data || [];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">SOS Alerts</h2>
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button onClick={() => setView('table')} className={`px-3 py-1.5 text-sm flex items-center gap-2 rounded ${view === 'table' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>
            <List className="w-4 h-4" /> Table
          </button>
          <button onClick={() => setView('map')} className={`px-3 py-1.5 text-sm flex items-center gap-2 rounded ${view === 'map' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>
            <Map className="w-4 h-4" /> Map
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {alerts.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No recent SOS alerts.</td></tr>
              ) : alerts.map((alert: any) => (
                <tr key={alert.id} className={alert.status === 'active' ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{alert.driver_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">{alert.emergency_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${alert.status === 'active' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[500px] bg-slate-100 rounded flex items-center justify-center border border-slate-200">
          <p className="text-slate-500 flex items-center gap-2"><Map className="w-5 h-5" /> Map View Integration Pending</p>
        </div>
      )}
    </div>
  );
}
