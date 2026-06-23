'use client';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/lib/api';
import Link from 'next/link';

export default function UsersPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['users'], queryFn: () => getUsers() });

  if (isLoading) return <div className="p-6">Loading users...</div>;

  const users = data?.data || [];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Users Management</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Search by phone..." className="border rounded-md px-3 py-1.5 text-sm" />
          <select className="border rounded-md px-3 py-1.5 text-sm">
            <option>All Roles</option>
            <option>Driver</option>
            <option>Dhaba Owner</option>
            <option>Mechanic</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No users found (or backend API not fully implemented).</td></tr>
            )}
            {users.map((user: any) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.phoneE164}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user.verificationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/dashboard/users/${user.id}`} className="text-primary hover:text-orange-900">View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
