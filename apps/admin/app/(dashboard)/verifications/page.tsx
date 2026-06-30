'use client';
import { useQuery } from '@tanstack/react-query';
import { getUsers, verifyUser, rejectUser } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerificationsPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['verifications'], queryFn: () => getUsers({ status: 'pending' }) });

  if (isLoading) return <div className="p-6">Loading queue...</div>;

  const users = data?.data || [];

  const handleApprove = async (id: string) => {
    try {
      await verifyUser(id);
      toast.success('User approved!');
      refetch();
    } catch (err) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectUser(id, 'Verification failed');
      toast.success('User rejected!');
      refetch();
    } catch (err) {
      toast.error('Failed to reject user');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Verification Queue</h2>
        <span className="bg-orange-100 text-primary py-1 px-3 rounded-full text-sm font-medium">{users.length} pending</span>
      </div>

      {users.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center border border-slate-100">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-slate-900">All verifications are up to date!</h3>
          <p className="text-slate-500 mt-2">No users currently waiting for document review.</p>
        </div>
      ) : (
        users.map((user: any) => (
          <div key={user.id} className="bg-white shadow rounded-lg p-6 border border-slate-100 flex gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-900">{user.phoneE164}</h3>
              <p className="text-sm text-slate-500 capitalize">{user.role} • Registered recently</p>
              
              <div className="mt-4 flex gap-3">
                <button onClick={() => handleApprove(user.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Approve
                </button>
                <button onClick={() => handleReject(user.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-red-200">
                  Reject
                </button>
              </div>
            </div>
            <div className="w-48 h-32 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-sm border border-slate-200">
              [Document Preview]
            </div>
          </div>
        ))
      )}
    </div>
  );
}
