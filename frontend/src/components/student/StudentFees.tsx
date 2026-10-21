'use client';

import React, { useState } from 'react';
import { Download, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';

import { studentApi, type BrandId, type FeeAccount } from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentFeesProps {
  activeBrand: BrandId;
  studentEmail: string;
}

const currencySymbol = (currency: 'INR' | 'USD') => (currency === 'USD' ? '$' : '₹');

export const StudentFees: React.FC<StudentFeesProps> = ({ activeBrand, studentEmail }) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const { data: account, loading, error, reload } = useStudentResource<FeeAccount>(
    `${studentEmail}:${activeBrand}`,
    () => studentApi.getFees(activeBrand),
  );

  if (loading) return <LoadingPanel label="Loading tuition & receipts…" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;
  if (!account) return null;

  const { summary, receipts } = account;
  const symbol = currencySymbol(summary.currency);
  const noDues = summary.balanceRemaining <= 0;

  const handleDownloadReceipt = (receiptNo: string) => {
    setDownloadNotice(`Generating official PDF receipt for ${receiptNo}...`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tuition & Fee Receipts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your tuition breakdown, download tax-compliant receipts, and view payment history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              noDues
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${noDues ? 'text-emerald-600' : 'text-amber-600'}`} />
            {noDues ? 'No Dues Pending' : 'Balance Outstanding'}
          </span>
        </div>
      </div>

      {downloadNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {downloadNotice}
        </div>
      )}

      {/* Tuition Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Program Plan</span>
          <div className="text-base font-bold text-slate-900 mt-1">{summary.plan}</div>
          <span className="text-xs text-slate-500">
            Gross: {symbol}
            {summary.totalCourseFee.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-700 font-medium">Total Paid</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {symbol}
            {summary.amountPaid.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 font-medium">
            {summary.status === 'PAID_IN_FULL' ? '100% Cleared' : 'Partially paid'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Remaining Due</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {symbol}
            {summary.balanceRemaining.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">
            {noDues ? 'All installments settled' : 'Payment pending'}
          </span>
        </div>
      </div>

      {/* Payment Receipts History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Official Invoices & Payment Records</h3>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            GST Compliant Tax Receipts
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Receipt Number</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Payment Mode</th>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Amount Paid</th>
              <th className="py-3 px-4 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receipts.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {r.receiptNumber}
                  <div className="text-[11px] text-slate-400 font-normal">{r.date}</div>
                </td>

                <td className="py-3.5 px-4 text-slate-700 font-medium">{r.description}</td>

                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                    <CreditCard className="w-3 h-3" />
                    {r.mode}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{r.transactionId}</td>

                <td className="py-3.5 px-4 font-bold text-emerald-700">
                  {symbol}
                  {r.amount.toLocaleString()}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleDownloadReceipt(r.receiptNumber)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Receipt</span>
                  </button>
                </td>
              </tr>
            ))}

            {receipts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                  No payment receipts available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
