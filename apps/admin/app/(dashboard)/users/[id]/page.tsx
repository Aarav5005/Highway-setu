'use client';
import { useQuery } from '@tanstack/react-query';
import { getUserDetail, verifyUser, rejectUser, suspendUser } from '@/lib/api';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
  const { id } = useParams();
  const { data: user, isLoading, refetch } = useQuery({ queryKey: ['user', id], queryFn: () => getUserDetail(id as string) });

  if (isLoading) return <div className="p-6">Loading user details...</div>;
  if (!user) return <div className="p-6">User not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">User Profile</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {user.verificationStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
          <h3 className="text-lg font-medium text-slate-900 border-b pb-4 mb-4">Basic Info</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-slate-500">Phone Number</dt>
              <dd className="text-sm font-medium text-slate-900">{user.phoneE164}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Role</dt>
              <dd className="text-sm font-medium text-slate-900 capitalize">{user.role}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Join Date</dt>
              <dd className="text-sm font-medium text-slate-900">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
          <h3 className="text-lg font-medium text-slate-900 border-b pb-4 mb-4">Verification & Documents</h3>
          
          <div className="w-full h-48 bg-slate-100 rounded mb-6 flex items-center justify-center border border-slate-200">
            <span className="text-slate-400">Document Image Preview</span>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => { verifyUser(id as string); toast.success('Verified'); refetch(); }} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-medium">
              Verify & Approve
            </button>
            <button onClick={() => { rejectUser(id as string, 'Invalid document'); toast.success('Rejected'); refetch(); }} className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded text-sm font-medium">
              Reject Document
            </button>
            <button onClick={() => { suspendUser(id as string); toast.success('Suspended'); refetch(); }} className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 rounded text-sm font-medium mt-4">
              Suspend User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
