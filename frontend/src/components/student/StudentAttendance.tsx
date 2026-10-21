'use client';

import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { studentApi, type AttendanceSummary, type BrandId } from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentAttendanceProps {
  activeBrand: BrandId;
  studentEmail: string;
}

export const StudentAttendance: React.FC<StudentAttendanceProps> = ({
  activeBrand,
  studentEmail,
}) => {
  const { data, loading, error, reload } = useStudentResource<AttendanceSummary>(
    `${studentEmail}:${activeBrand}`,
    () => studentApi.getAttendance(activeBrand),
  );

  if (loading) return <LoadingPanel label="Loading attendance records…" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;
  if (!data) return null;

  const { sessions, attendanceRate, presentCount, lateCount, absentCount } = data;
  const certificationSatisfied = attendanceRate >= 80;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance & Class Presence</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your lecture presence. An attendance rate of 80% or above is mandatory for certification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              certificationSatisfied
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${certificationSatisfied ? 'text-emerald-600' : 'text-amber-600'}`}
            />
            {certificationSatisfied ? 'Certification Requirement Satisfied' : 'Below Certification Threshold'} (
            {attendanceRate}%)
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Attendance Rate</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{attendanceRate}%</div>
          <span className="text-[11px] text-emerald-600 font-medium">&gt; 80% required</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-700 font-medium">Attended On Time</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{presentCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Present from start</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-xs text-amber-700 font-medium">Late Joined</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{lateCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Credited as partial</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-xs text-rose-700 font-medium">Missed Sessions</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{absentCount}</div>
          <span className="text-[11px] text-slate-500">Watch class replay</span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Session-by-Session Attendance Log</h3>
          <span className="text-xs text-slate-500">Total Recorded: {sessions.length} sessions</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Lecture Topic</th>
              <th className="py-3 px-4">Presence Status</th>
              <th className="py-3 px-4 text-right">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">{s.date}</div>
                  <div className="text-[11px] text-slate-400">{s.timeSlot}</div>
                </td>

                <td className="py-3.5 px-4 text-slate-800 font-medium">{s.topic}</td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      s.status === 'present'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : s.status === 'late'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {s.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                    {s.status === 'late' && <Clock className="w-3 h-3" />}
                    {s.status === 'absent' && <XCircle className="w-3 h-3" />}
                    <span className="capitalize">{s.status}</span>
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">{s.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
