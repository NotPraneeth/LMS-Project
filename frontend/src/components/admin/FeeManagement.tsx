'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Download,
  Receipt,
  CreditCard
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';

interface FeeManagementProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  studentName: string;
  course: string;
  amount: string;
  paidAmount: string;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Pending';
  brand: 'teluguai' | 'genai99';
}

const INITIAL_INVOICES: InvoiceItem[] = [
  // TeluguAI Invoices
  {
    id: 'inv-1',
    invoiceNo: 'INV-TA-2026-081',
    studentName: 'Sai Kiran',
    course: 'FullStack Python AI',
    amount: '₹ 24,999',
    paidAmount: '₹ 24,999',
    dueDate: '28 Sep 2026',
    status: 'Paid',
    brand: 'teluguai',
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-TA-2026-082',
    studentName: 'Bhavani Shankar',
    course: 'Applied Machine Learning',
    amount: '₹ 29,999',
    paidAmount: '₹ 15,000',
    dueDate: '25 Oct 2026',
    status: 'Partial',
    brand: 'teluguai',
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-TA-2026-083',
    studentName: 'Deepika Rani',
    course: 'FullStack Python AI',
    amount: '₹ 24,999',
    paidAmount: '₹ 24,999',
    dueDate: '29 Sep 2026',
    status: 'Paid',
    brand: 'teluguai',
  },
  {
    id: 'inv-4',
    invoiceNo: 'INV-TA-2026-084',
    studentName: 'Venu Madhav',
    course: 'Prompt Engineering Express',
    amount: '₹ 9,999',
    paidAmount: '₹ 0',
    dueDate: '15 Oct 2026',
    status: 'Pending',
    brand: 'teluguai',
  },

  // GenAI99 Invoices
  {
    id: 'inv-5',
    invoiceNo: 'INV-G99-2026-042',
    studentName: 'Alex Morgan',
    course: 'Autonomous AI Agents',
    amount: '$499',
    paidAmount: '$499',
    dueDate: '01 Oct 2026',
    status: 'Paid',
    brand: 'genai99',
  },
  {
    id: 'inv-6',
    invoiceNo: 'INV-G99-2026-043',
    studentName: 'Rahul Sen',
    course: 'Enterprise Production RAG',
    amount: '₹ 32,999',
    paidAmount: '₹ 32,999',
    dueDate: '08 Oct 2026',
    status: 'Paid',
    brand: 'genai99',
  },
  {
    id: 'inv-7',
    invoiceNo: 'INV-G99-2026-044',
    studentName: 'Sarah Chen',
    course: 'Autonomous AI Agents',
    amount: '$499',
    paidAmount: '$250',
    dueDate: '20 Oct 2026',
    status: 'Partial',
    brand: 'genai99',
  },
];

export const FeeManagement: React.FC<FeeManagementProps> = ({ activeBrand }) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [refNumber, setRefNumber] = useState('');

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !amount) return;

    const newInv: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNo: `INV-${Date.now().toString().slice(-4)}`,
      studentName,
      course: 'Direct Admission',
      amount: `₹ ${amount}`,
      paidAmount: `₹ ${amount}`,
      dueDate: 'Today',
      status: 'Paid',
      brand: activeBrand,
    };

    setInvoices([newInv, ...invoices]);
    setIsModalOpen(false);
    setToastMessage(`Payment of ₹${amount} recorded for ${studentName}`);
    setTimeout(() => setToastMessage(null), 3000);

    setStudentName('');
    setAmount('');
    setRefNumber('');
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (inv.brand !== activeBrand) return false;
    const matchesSearch =
      inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Fee & Invoicing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track student tuition invoices, record manual payments, and reconcile branch revenue.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Record Offline Payment
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Fees Invoiced</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {activeBrand === 'teluguai' ? '₹ 89,996' : '$1,397 / ₹ 32,999'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across enrolled batches</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Fees Collected</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {activeBrand === 'teluguai' ? '₹ 64,998' : '$749 / ₹ 32,999'}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Reconciled via gateway & manual</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Outstanding Balances</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {activeBrand === 'teluguai' ? '₹ 24,998' : '$249'}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Pending student installments</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-indigo-600 w-full sm:w-auto"
          >
            <option value="all">All Invoices</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partial">Partial Dues</option>
            <option value="Pending">Pending Payment</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student & Course</th>
                <th className="py-3 px-4">Billed Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{inv.invoiceNo}</td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{inv.studentName}</div>
                    <div className="text-slate-500 text-[11px]">{inv.course}</div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900">{inv.amount}</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">{inv.paidAmount}</td>
                  <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.status === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setToastMessage(`Downloading Receipt ${inv.invoiceNo}...`);
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px]">PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Manual / Offline Fee Payment"
        subtitle="Log tuition received via UPI, Cash, or Direct Bank Transfer"
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Student Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Payment Amount</label>
              <input
                type="number"
                required
                placeholder="24999"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-600"
              >
                <option value="UPI">UPI (Google Pay / PhonePe)</option>
                <option value="Bank Transfer">Direct Bank Transfer / NEFT</option>
                <option value="Cash">Cash at Branch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Transaction Ref / UTR Number</label>
            <input
              type="text"
              placeholder="e.g. UPI-9988220011"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
            >
              Save & Generate Receipt
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
