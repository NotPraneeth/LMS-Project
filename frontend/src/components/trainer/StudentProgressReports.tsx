'use client';

import React, { useState } from 'react';
import {
  Award,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface StudentProgressReportsProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface StudentPerformanceRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  batchName: string;
  attendanceRate: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  quizAverage: number;
  certificateStatus: 'eligible' | 'issued' | 'in_progress' | 'at_risk';
  certificateId?: string;
  brand: 'teluguai' | 'genai99';
}

const INITIAL_RECORDS: StudentPerformanceRecord[] = [
  // TeluguAI
  {
    id: 'sp-1',
    name: 'Sai Kiran',
    email: 'saikiran.dev@gmail.com',
    phone: '+91 98480 11223',
    batchName: 'Python AI Evening Cohort #12',
    attendanceRate: 96,
    assignmentsCompleted: 4,
    totalAssignments: 4,
    quizAverage: 92,
    certificateStatus: 'eligible',
    brand: 'teluguai',
  },
  {
    id: 'sp-2',
    name: 'Deepika Rani',
    email: 'deepika.rani@yahoo.com',
    phone: '+91 94401 22334',
    batchName: 'Python AI Evening Cohort #12',
    attendanceRate: 92,
    assignmentsCompleted: 4,
    totalAssignments: 4,
    quizAverage: 88,
    certificateStatus: 'issued',
    certificateId: 'CERT-TAI-8921',
    brand: 'teluguai',
  },
  {
    id: 'sp-3',
    name: 'Bhavani Shankar',
    email: 'bhavani.shankar@gmail.com',
    phone: '+91 99890 33445',
    batchName: 'Python AI Evening Cohort #12',
    attendanceRate: 74,
    assignmentsCompleted: 2,
    totalAssignments: 4,
    quizAverage: 65,
    certificateStatus: 'at_risk',
    brand: 'teluguai',
  },
  {
    id: 'sp-4',
    name: 'K. Sravani',
    email: 'sravani.k@gmail.com',
    phone: '+91 91212 44556',
    batchName: 'Machine Learning Weekend Batch #5',
    attendanceRate: 100,
    assignmentsCompleted: 3,
    totalAssignments: 3,
    quizAverage: 95,
    certificateStatus: 'eligible',
    brand: 'teluguai',
  },
  // GenAI99
  {
    id: 'sp-5',
    name: 'Dr. Arjun Mehta',
    email: 'arjun.mehta@healthtech.ai',
    phone: '+91 98111 22334',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    attendanceRate: 98,
    assignmentsCompleted: 4,
    totalAssignments: 4,
    quizAverage: 96,
    certificateStatus: 'eligible',
    brand: 'genai99',
  },
  {
    id: 'sp-6',
    name: 'Priyanka Sharma',
    email: 'priyanka.s@fintechcorp.io',
    phone: '+91 98222 33445',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    attendanceRate: 94,
    assignmentsCompleted: 4,
    totalAssignments: 4,
    quizAverage: 92,
    certificateStatus: 'issued',
    certificateId: 'CERT-G99-4412',
    brand: 'genai99',
  },
  {
    id: 'sp-7',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@datasystems.com',
    phone: '+91 98444 55667',
    batchName: 'Enterprise Production RAG - Cohort 2',
    attendanceRate: 70,
    assignmentsCompleted: 1,
    totalAssignments: 3,
    quizAverage: 58,
    certificateStatus: 'at_risk',
    brand: 'genai99',
  },
];

export const StudentProgressReports: React.FC<StudentProgressReportsProps> = ({ activeBrand }) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [records, setRecords] = useState<StudentPerformanceRecord[]>(INITIAL_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const filtered = records.filter((r) => {
    if (r.brand !== activeBrand) return false;
    if (statusFilter !== 'all' && r.certificateStatus !== statusFilter) return false;
    if (
      searchTerm &&
      !r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleIssueCertificate = (id: string, name: string) => {
    const certNum = isTeluguAI
      ? `CERT-TAI-${Math.floor(1000 + Math.random() * 9000)}`
      : `CERT-G99-${Math.floor(1000 + Math.random() * 9000)}`;

    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, certificateStatus: 'issued', certificateId: certNum } : r
      )
    );

    setNotification(`Certificate ${certNum} approved and issued to ${name}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendProgressMessage = (name: string, phone: string) => {
    setNotification(`Sent WhatsApp academic progress summary to ${name} (${phone}).`);
    setTimeout(() => setNotification(null), 4000);
  };

  const totalEligible = records.filter(
    (r) => r.brand === activeBrand && (r.certificateStatus === 'eligible' || r.certificateStatus === 'issued')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Progress & Certifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track student milestones, verify graduation requirements, and sign off on completion certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700">
            Graduation Ready: <strong className="text-emerald-700">{totalEligible} Learners</strong>
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'eligible', 'issued', 'at_risk'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all'
                ? 'All Learners'
                : status === 'eligible'
                ? 'Eligible for Certificate'
                : status === 'issued'
                ? 'Certificate Issued'
                : 'At Academic Risk'}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Cohort</th>
              <th className="py-3 px-4">Attendance Rate</th>
              <th className="py-3 px-4">Projects Done</th>
              <th className="py-3 px-4">Quiz Avg</th>
              <th className="py-3 px-4">Certification Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{item.email}</p>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {item.batchName}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        item.attendanceRate >= 80 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {item.attendanceRate}%
                    </span>
                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          item.attendanceRate >= 80 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.attendanceRate}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="font-semibold text-slate-800">
                    {item.assignmentsCompleted} / {item.totalAssignments}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`font-semibold ${
                      item.quizAverage >= 75 ? 'text-slate-800' : 'text-amber-700'
                    }`}
                  >
                    {item.quizAverage}%
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  {item.certificateStatus === 'issued' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Issued ({item.certificateId})
                    </span>
                  ) : item.certificateStatus === 'eligible' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Award className="w-3 h-3" />
                      Eligible (Ready to Issue)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3 h-3" />
                      At Risk (&lt;80% attendance)
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.certificateStatus === 'eligible' && (
                      <button
                        onClick={() => handleIssueCertificate(item.id, item.name)}
                        className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs transition-colors ${
                          isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                        }`}
                      >
                        Issue Certificate
                      </button>
                    )}

                    <button
                      onClick={() => handleSendProgressMessage(item.name, item.phone)}
                      className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                      title="Send WhatsApp Progress Card"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
