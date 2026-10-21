'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Link2,
  Copy
} from 'lucide-react';

interface PaymentStatusProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface PaymentRecord {
  id: string;
  studentName: string;
  phone: string;
  course: string;
  totalFee: string;
  paidFee: string;
  balanceDue: string;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Overdue';
  brand: 'teluguai' | 'genai99';
}

const INITIAL_PAYMENTS: PaymentRecord[] = [
  // TeluguAI
  { id: 'pay-1', studentName: 'Sai Kiran', phone: '+91 98480 44556', course: 'FullStack Python AI', totalFee: '₹ 24,999', paidFee: '₹ 24,999', balanceDue: '₹ 0', dueDate: 'Paid', status: 'Paid', brand: 'teluguai' },
  { id: 'pay-2', studentName: 'Bhavani Shankar', phone: '+91 99881 22334', course: 'Machine Learning (Telugu)', totalFee: '₹ 29,999', paidFee: '₹ 15,000', balanceDue: '₹ 14,999', dueDate: '25 Oct 2026', status: 'Partial', brand: 'teluguai' },
  { id: 'pay-3', studentName: 'K. Sravani', phone: '+91 91234 55667', course: 'FullStack Python AI', totalFee: '₹ 24,999', paidFee: '₹ 12,000', balanceDue: '₹ 12,999', dueDate: '20 Oct 2026', status: 'Partial', brand: 'teluguai' },

  // GenAI99
  { id: 'pay-4', studentName: 'Alex Morgan', phone: '+1 415 555 0192', course: 'Autonomous AI Agents', totalFee: '$499', paidFee: '$499', balanceDue: '$0', dueDate: 'Paid', status: 'Paid', brand: 'genai99' },
  { id: 'pay-5', studentName: 'Sarah Chen', phone: '+1 206 555 8821', course: 'Autonomous AI Agents', totalFee: '$499', paidFee: '$250', balanceDue: '$249', dueDate: '20 Oct 2026', status: 'Partial', brand: 'genai99' },
];

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ activeBrand }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = payments.filter((p) => {
    if (p.brand !== activeBrand) return false;
    return (
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
    );
  });

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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Student Fee Tracking</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitor tuition payments and installment dues for candidates you counseled.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student fee status by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student & Contact</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Total Tuition</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Reminder Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.studentName}</div>
                    <div className="text-slate-500 text-[11px] font-mono">{item.phone}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-800">{item.course}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.totalFee}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">{item.paidFee}</td>

                  <td className="py-3 px-4">
                    <span className={item.balanceDue !== '₹ 0' && item.balanceDue !== '$0' ? 'font-semibold text-amber-700' : 'text-slate-400'}>
                      {item.balanceDue}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500">{item.dueDate}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {item.status !== 'Paid' ? (
                      <button
                        onClick={() => {
                          setToastMessage(`Dispatched payment link to ${item.phone} via WhatsApp`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-[11px] border border-indigo-200 inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Send Link
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Settled</span>
                    )}
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
