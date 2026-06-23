'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [fee, setFee] = useState(10);
  const [pointsMeal, setPointsMeal] = useState(10);
  const [pointsTrip, setPointsTrip] = useState(5);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Platform Settings</h2>
        
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700">Mechanic Platform Fee (%)</label>
            <input type="number" value={fee} onChange={e => setFee(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary" />
            <p className="mt-1 text-xs text-slate-500">Percentage taken from mechanic jobs.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Loyalty Points per Meal</label>
            <input type="number" value={pointsMeal} onChange={e => setPointsMeal(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Loyalty Points per Trip</label>
            <input type="number" value={pointsTrip} onChange={e => setPointsTrip(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary" />
          </div>

          <button onClick={handleSave} className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
