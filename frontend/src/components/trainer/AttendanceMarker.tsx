'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Save,
  Search,
  Filter,
  Calendar
} from 'lucide-react';

interface AttendanceMarkerProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface StudentAttendanceRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'present' | 'late' | 'absent';
  streak: number;
}

const TELUGU_STUDENTS: StudentAttendanceRecord[] = [
  { id: 'ts-1', name: 'Sai Kiran', email: 'saikiran.dev@gmail.com', phone: '+91 98480 11223', status: 'present', streak: 12 },
  { id: 'ts-2', name: 'Deepika Rani', email: 'deepika.rani@yahoo.com', phone: '+91 94401 22334', status: 'present', streak: 10 },
  { id: 'ts-3', name: 'Bhavani Shankar', email: 'bhavani.shankar@gmail.com', phone: '+91 99890 33445', status: 'absent', streak: 0 },
  { id: 'ts-4', name: 'K. Sravani', email: 'sravani.k@gmail.com', phone: '+91 91212 44556', status: 'present', streak: 15 },
  { id: 'ts-5', name: 'Venkat Rao', email: 'venkat.rao@outlook.com', phone: '+91 98660 55667', status: 'late', streak: 4 },
  { id: 'ts-6', name: 'Anusha Reddy', email: 'anusha.reddy@gmail.com', phone: '+91 97000 66778', status: 'present', streak: 8 },
  { id: 'ts-7', name: 'Ramesh Naidu', email: 'ramesh.naidu@gmail.com', phone: '+91 93910 77889', status: 'absent', streak: 0 },
  { id: 'ts-8', name: 'Pooja Varma', email: 'pooja.varma@gmail.com', phone: '+91 94900 88990', status: 'present', streak: 6 },
];

const GENAI_STUDENTS: StudentAttendanceRecord[] = [
  { id: 'gs-1', name: 'Dr. Arjun Mehta', email: 'arjun.mehta@healthtech.ai', phone: '+91 98111 22334', status: 'present', streak: 14 },
  { id: 'gs-2', name: 'Priyanka Sharma', email: 'priyanka.s@fintechcorp.io', phone: '+91 98222 33445', status: 'present', streak: 9 },
  { id: 'gs-3', name: 'Rohan Nambiar', email: 'rohan.n@cloudscale.net', phone: '+91 98333 44556', status: 'late', streak: 5 },
  { id: 'gs-4', name: 'Sneha Kulkarni', email: 'sneha.k@datasystems.com', phone: '+91 98444 55667', status: 'absent', streak: 0 },
  { id: 'gs-5', name: 'Vikramaditya Iyer', email: 'vikram.iyer@enterprisegpt.ai', phone: '+91 98555 66778', status: 'present', streak: 11 },
  { id: 'gs-6', name: 'Tara Deshmukh', email: 'tara.d@automations.io', phone: '+91 98666 77889', status: 'present', streak: 7 },
];

export const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({ activeBrand }) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [students, setStudents] = useState<StudentAttendanceRecord[]>(
    isTeluguAI ? TELUGU_STUDENTS : GENAI_STUDENTS
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [whatsappNotice, setWhatsappNotice] = useState<string | null>(null);

  const selectedBatchName = isTeluguAI
    ? 'Python AI Evening Cohort #12'
    : 'Autonomous AI Agents - Global Cohort 4';

  const sessionTopic = isTeluguAI
    ? 'Session 24: Building FastAPIs & Pydantic Data Models'
    : 'Session 16: Multi-Agent Collaboration with LangGraph & CrewAI';

  const setStudentStatus = (id: string, status: 'present' | 'late' | 'absent') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
  };

  const handleSaveAttendance = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleSendWhatsAppAlerts = () => {
    const absentees = students.filter((s) => s.status === 'absent');
    if (absentees.length === 0) {
      setWhatsappNotice('No absentees to notify. Everyone is present or late!');
    } else {
      setWhatsappNotice(
        `WhatsApp absentee alert sent to ${absentees.length} learners (${absentees.map((s) => s.name).join(', ')}).`
      );
    }
    setTimeout(() => setWhatsappNotice(null), 4000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = students.filter((s) => s.status === 'present').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const attendanceRate = Math.round(((presentCount + lateCount) / students.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
              {selectedBatchName}
            </span>
            <span className="text-xs text-slate-400">• Today's Session</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{sessionTopic}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Mark live presence for students. Changes will update their attendance records and completion certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSaveAttendance}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
              isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            Save Attendance
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Attendance marked successfully! Records synced to student profiles.
        </div>
      )}

      {whatsappNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-600" />
          {whatsappNotice}
        </div>
      )}

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{students.length}</div>
          <span className="text-[11px] text-slate-500">Learners registered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-medium">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{presentCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">{Math.round((presentCount / students.length) * 100)}% on time</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-medium">Late Joined</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{lateCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Joined after 15m</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-medium">Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{absentCount}</div>
          <button
            onClick={handleSendWhatsAppAlerts}
            className="text-[11px] text-rose-700 hover:underline font-semibold flex items-center gap-1 mt-0.5"
          >
            Notify via WhatsApp
          </button>
        </div>
      </div>

      {/* Roster Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search learner by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Live Attendance Rate:</span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
              {attendanceRate}%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Consecutive Attendance</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Quick Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-slate-900">{student.name}</p>
                      <p className="text-slate-500 text-[11px]">{student.email}</p>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">{student.phone}</td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      🔥 {student.streak} sessions
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        student.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : student.status === 'late'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {student.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                      {student.status === 'late' && <Clock className="w-3 h-3" />}
                      {student.status === 'absent' && <XCircle className="w-3 h-3" />}
                      <span className="capitalize">{student.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                      <button
                        onClick={() => setStudentStatus(student.id, 'present')}
                        className={`px-3 py-1 font-medium text-xs transition-colors ${
                          student.status === 'present'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setStudentStatus(student.id, 'late')}
                        className={`px-3 py-1 font-medium text-xs border-x border-slate-200 transition-colors ${
                          student.status === 'late'
                            ? 'bg-amber-500 text-white font-bold'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setStudentStatus(student.id, 'absent')}
                        className={`px-3 py-1 font-medium text-xs transition-colors ${
                          student.status === 'absent'
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
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
