'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Eye,
  Activity,
  Server,
  Database,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';
import { AuditLogEntry } from '../shared/types';

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '14 Oct 2026, 10:18:24',
    actor: 'Suresh Varma',
    role: 'super_admin',
    brand: 'TeluguAI',
    action: 'CREATE_ADMIN',
    entity: 'users:kavitha',
    ipAddress: '106.51.72.19',
    status: 'SUCCESS',
    details: '{"event": "admin_created", "email": "kavitha@teluguai.com", "branch": "Hyderabad"}',
  },
  {
    id: 'log-2',
    timestamp: '14 Oct 2026, 09:44:11',
    actor: 'Suresh Varma',
    role: 'super_admin',
    brand: 'Platform',
    action: 'UPDATE_WHATSAPP_CONFIG',
    entity: 'settings:meta_api',
    ipAddress: '106.51.72.19',
    status: 'SUCCESS',
    details: '{"gateway": "meta_cloud", "waba_id": "394857102938475", "verified": true}',
  },
  {
    id: 'log-3',
    timestamp: '14 Oct 2026, 08:30:00',
    actor: 'Rohan Sharma',
    role: 'super_admin',
    brand: 'GenAI99',
    action: 'CREATE_BATCH',
    entity: 'batches:cohort_4',
    ipAddress: '49.207.214.88',
    status: 'SUCCESS',
    details: '{"batch": "Enterprise AI Agents - Cohort 4", "trainer": "Dr. Arjun K", "capacity": 60}',
  },
  {
    id: 'log-4',
    timestamp: '13 Oct 2026, 22:15:39',
    actor: 'System Webhook',
    role: 'super_admin',
    brand: 'GenAI99',
    action: 'PAYMENT_RECEIVED',
    entity: 'payments:pay_stripe_88192',
    ipAddress: '54.187.205.12',
    status: 'SUCCESS',
    details: '{"amount": 199.00, "currency": "USD", "student": "alex.m@gmail.com"}',
  },
  {
    id: 'log-5',
    timestamp: '13 Oct 2026, 18:02:14',
    actor: 'Madhavi Latha',
    role: 'admin',
    brand: 'TeluguAI',
    action: 'UPDATE_FEE_PLAN',
    entity: 'fee_plans:fullstack_ai',
    ipAddress: '157.48.12.90',
    status: 'WARNING',
    details: '{"warning": "discount_override", "discount": "20%"}',
  },
];

export const AuditLogsHealth: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = logs.filter((log) => {
    return (
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit trail of administrative events, privilege changes, and gateway triggers.
          </p>
        </div>

        <button
          onClick={() => {}}
          className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Refresh
        </button>
      </div>

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Database Pool</div>
            <div className="text-sm font-bold text-slate-900">42 / 100 Active</div>
            <div className="text-[11px] text-emerald-600 font-medium">56 Tables Synced</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Security Gateways</div>
            <div className="text-sm font-bold text-slate-900">0 Flags</div>
            <div className="text-[11px] text-slate-500">WAF Active</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Avg API Latency</div>
            <div className="text-sm font-bold text-slate-900">28ms</div>
            <div className="text-[11px] text-emerald-600 font-medium">Optimal</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by actor, action name, or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{log.actor}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-800">{log.action}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.entity}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{log.ipAddress}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                      title="Inspect Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for inspection */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Log Details • ${selectedLog.action}`}
          subtitle={`Triggered by ${selectedLog.actor} on ${selectedLog.timestamp}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800 overflow-x-auto text-xs leading-relaxed">
              <pre>{JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2)}</pre>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
