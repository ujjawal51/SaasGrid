'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../_components/AdminNav';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/audit-logs?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.ok) setLogs(data.logs);
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200">
      <AdminNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              🛡️ Security Audit Logs & Action Tracker
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Immutable security event logs tracking all administrative changes, deletions, and settings updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search action, admin email, target…"
              className="w-full sm:w-72 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
            <button
              onClick={fetchLogs}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading security logs from MongoDB…</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#0d1c2e] p-8 space-y-2">
            <p className="text-sm font-bold text-white">No security audit logs recorded yet.</p>
            <p className="text-xs text-slate-500">Administrative updates & actions will be logged here automatically.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Timestamp</th>
                    <th className="pb-3">Action Type</th>
                    <th className="pb-3">Admin Email</th>
                    <th className="pb-3">Target / Item</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3 text-right pr-2">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pl-2 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span className="rounded bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 font-extrabold text-sky-400 text-[10px] uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-slate-200 font-sans font-bold">{log.adminEmail}</td>
                      <td className="py-3 text-amber-300">{log.target || '—'}</td>
                      <td className="py-3 text-slate-300 font-sans max-w-xs truncate">{log.details || '—'}</td>
                      <td className="py-3 text-right pr-2 text-slate-500">{log.ip || '127.0.0.1'}</td>
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
