'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Search,
  Filter
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface AttendanceManagementProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  email: string;
  status: 'present' | 'absent' | 'late';
  joinedAt?: string;
}

const INITIAL_ROSTER: AttendanceRecord[] = [
  { id: 'att-1', studentName: 'Sai Kiran', email: 'saikiran.dev@gmail.com', status: 'present', joinedAt: '07:01 PM' },
  { id: 'att-2', studentName: 'Deepika Rani', email: 'deepika.rani@yahoo.com', status: 'present', joinedAt: '06:58 PM' },
  { id: 'att-3', studentName: 'Bhavani Shankar', email: 'bhavani.shankar@gmail.com', status: 'late', joinedAt: '07:18 PM' },
  { id: 'att-4', studentName: 'Venu Madhav', email: 'venu.madhav@gmail.com', status: 'absent' },
  { id: 'att-5', studentName: 'K. Sravani', email: 'sravani.k@gmail.com', status: 'present', joinedAt: '07:00 PM' },
  { id: 'att-6', studentName: 'Ravi Teja', email: 'raviteja.b@gmail.com', status: 'absent' },
];

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ activeBrand }) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const [selectedBatch, setSelectedBatch] = useState(
    isTeluguAI ? 'Python AI Evening Cohort #12' : 'Autonomous AI Agents - Global Cohort 4'
  );
  const [selectedDate, setSelectedDate] = useState('2026-10-14');
  const [roster, setRoster] = useState<AttendanceRecord[]>(INITIAL_ROSTER);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const presentCount = roster.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absentCount = roster.filter((r) => r.status === 'absent').length;
  const attendanceRate = Math.round((presentCount / roster.length) * 100);

  const toggleStatus = (id: string, newStatus: 'present' | 'absent' | 'late') => {
    setRoster(roster.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const sendAbsenteeAlerts = () => {
    setToastMessage(`Sent automated WhatsApp alerts to ${absentCount} absent learners.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Screen Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Attendance Tracker</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor daily session rosters, track presence, and trigger attendance notifications.
          </p>
        </div>

        <button
          onClick={sendAbsenteeAlerts}
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          Notify Absentees via WhatsApp
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-600 text-xs font-medium mb-1">Select Cohort</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
          >
            {isTeluguAI ? (
              <>
                <option value="Python AI Evening Cohort #12">Python AI Evening Cohort #12</option>
                <option value="Machine Learning Weekend Batch #5">Machine Learning Weekend Batch #5</option>
                <option value="Prompt Engineering Express Batch #8">Prompt Engineering Express Batch #8</option>
              </>
            ) : (
              <>
                <option value="Autonomous AI Agents - Global Cohort 4">Autonomous AI Agents - Global Cohort 4</option>
                <option value="Enterprise Production RAG - Cohort 2">Enterprise Production RAG - Cohort 2</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-slate-600 text-xs font-medium mb-1">Class Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-slate-600 text-xs font-medium mb-1">Attendance Ratio</label>
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <span className="font-semibold text-slate-900">{attendanceRate}% Present</span>
            <span className="text-slate-500">
              {presentCount} Present • {absentCount} Absent
            </span>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Session Attendance Roster</h2>
          <span className="text-xs text-slate-500">Session time: 07:00 PM - 08:30 PM</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Join Timestamp</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Mark Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {roster.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{record.studentName}</div>
                    <div className="text-slate-500 text-[11px]">{record.email}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {record.joinedAt ? (
                      <span className="font-mono text-emerald-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.joinedAt}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        record.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : record.status === 'late'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {record.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(record.id, 'present')}
                        className={`px-2 py-1 rounded text-[11px] font-medium border ${
                          record.status === 'present'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => toggleStatus(record.id, 'late')}
                        className={`px-2 py-1 rounded text-[11px] font-medium border ${
                          record.status === 'late'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => toggleStatus(record.id, 'absent')}
                        className={`px-2 py-1 rounded text-[11px] font-medium border ${
                          record.status === 'absent'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
