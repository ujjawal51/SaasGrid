'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

export default function AdminUsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.ok) setUsers(data.users);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleChange = async (id, role) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, role }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchUsers();
      } else {
        alert(data.error || 'Role update failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200">
      <AdminNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              👥 Registered Users & Role Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Search registered users, assign roles (User, Vendor, Admin), and view review/claim activity.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search name or email…"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading registered users from MongoDB…</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#0d1c2e] p-8 space-y-2">
            <p className="text-sm font-bold text-white">No registered users found.</p>
            <p className="text-xs text-slate-500">Users who register via email or Google login will be listed here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">User Details</th>
                    <th className="pb-3 text-center">Reviews Posted</th>
                    <th className="pb-3 text-center">Cashback Claims</th>
                    <th className="pb-3 text-center">Joined Date</th>
                    <th className="pb-3 text-right pr-2">Role Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold">
                            {u.name?.[0] || 'U'}
                          </span>
                          <div>
                            <p className="font-bold text-white">{u.name || 'User'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="rounded-md bg-slate-800 border border-slate-700 px-2.5 py-1 text-slate-300 font-bold">
                          💬 {u.reviewCount}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-amber-400 font-bold">
                          💰 {u.claimCount}
                        </span>
                      </td>
                      <td className="py-3.5 text-center text-slate-400 font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <select
                          disabled={updatingId === u._id}
                          value={u.role || 'user'}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className={`rounded-xl border px-3 py-1.5 font-bold uppercase text-[10px] cursor-pointer focus:outline-none ${
                            u.role === 'admin'
                              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                              : u.role === 'vendor'
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          <option value="user" className="bg-slate-900 text-slate-200">USER</option>
                          <option value="vendor" className="bg-slate-900 text-amber-400">VENDOR</option>
                          <option value="admin" className="bg-slate-900 text-rose-400">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
