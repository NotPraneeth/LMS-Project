'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  DollarSign,
  Calendar,
  Send,
  FileText
} from 'lucide-react';

interface StudentEnrolmentProps {
  activeBrand: 'teluguai' | 'genai99';
}

export const StudentEnrolment: React.FC<StudentEnrolmentProps> = ({ activeBrand }) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(
    isTeluguAI ? 'FullStack Python & Vernacular AI Engineering' : 'Autonomous AI Agents & Multi-Modal LLMs'
  );
  const [batch, setBatch] = useState(
    isTeluguAI ? 'Python AI Evening Cohort #12' : 'Autonomous AI Agents - Global Cohort 4'
  );
  const [feePlan, setFeePlan] = useState<'full' | 'installment'>('full');
  const [initialPayment, setInitialPayment] = useState(isTeluguAI ? '24999' : '499');
  const [paymentMode, setPaymentMode] = useState('UPI / Card');

  const [recentEnrolments, setRecentEnrolments] = useState([
    {
      id: 'enr-1',
      name: 'Sai Kiran',
      phone: '+91 98480 44556',
      course: 'FullStack Python AI',
      batch: 'Cohort #12',
      amount: '₹ 24,999',
      date: 'Today 09:30 AM',
      brand: 'teluguai',
    },
    {
      id: 'enr-2',
      name: 'Deepika Rani',
      phone: '+91 94402 88990',
      course: 'FullStack Python AI',
      batch: 'Cohort #12',
      amount: '₹ 24,999',
      date: 'Yesterday',
      brand: 'teluguai',
    },
    {
      id: 'enr-3',
      name: 'Alex Morgan',
      phone: '+1 415 555 0192',
      course: 'Autonomous AI Agents',
      batch: 'Global Cohort 4',
      amount: '$499',
      date: 'Yesterday',
      brand: 'genai99',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !phone) return;

    const newEnr = {
      id: `enr-${Date.now()}`,
      name: studentName,
      phone,
      course,
      batch,
      amount: isTeluguAI ? `₹ ${initialPayment}` : `$${initialPayment}`,
      date: 'Just now',
      brand: activeBrand,
    };

    setRecentEnrolments([newEnr, ...recentEnrolments]);
    setToastMessage(`Successfully enrolled ${studentName}! Welcome WhatsApp packet dispatched.`);
    setTimeout(() => setToastMessage(null), 3500);

    setStudentName('');
    setEmail('');
    setPhone('');
  };

  const filteredEnrolments = recentEnrolments.filter((e) => e.brand === activeBrand);

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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Student Enrolment Desk</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Convert candidates into enrolled learners, assign academic batches, and generate invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Enrolment Application</h2>
          <p className="text-xs text-slate-500 mb-4">Complete candidate details to provision student account</p>

          <form onSubmit={handleEnroll} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Student Full Name *</label>
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
                <label className="block text-slate-700 font-medium mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98480 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="ramesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Program</label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {isTeluguAI ? (
                    <>
                      <option value="FullStack Python & Vernacular AI Engineering">FullStack Python & Vernacular AI</option>
                      <option value="Applied Machine Learning in Telugu">Applied Machine Learning in Telugu</option>
                      <option value="Prompt Engineering Express">Prompt Engineering Express</option>
                    </>
                  ) : (
                    <>
                      <option value="Autonomous AI Agents & Multi-Modal LLMs">Autonomous AI Agents & LLMs</option>
                      <option value="Enterprise Production RAG & LLMOps">Enterprise Production RAG</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Batch / Cohort</label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {isTeluguAI ? (
                    <>
                      <option value="Python AI Evening Cohort #12">Evening Cohort #12 (Starts 01 Nov)</option>
                      <option value="Machine Learning Weekend Batch #5">Weekend Batch #5 (Starts 25 Oct)</option>
                    </>
                  ) : (
                    <>
                      <option value="Autonomous AI Agents - Global Cohort 4">Global Cohort 4 (Starts 05 Nov)</option>
                      <option value="Enterprise Production RAG - Cohort 2">RAG Cohort 2 (Starts 10 Nov)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Fee Payment Plan</label>
                <select
                  value={feePlan}
                  onChange={(e) => setFeePlan(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                >
                  <option value="full">Full Upfront (Discounted)</option>
                  <option value="installment">2 Installments</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Initial Deposit Amount</label>
                <input
                  type="number"
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                >
                  <option value="UPI / Card">Razorpay UPI / Card</option>
                  <option value="Stripe">Stripe (USD)</option>
                  <option value="Bank NEFT">Direct Bank Transfer</option>
                  <option value="Cash">Cash at Branch</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              Complete Enrolment & Send Credentials
            </button>
          </form>
        </div>

        {/* Recent Admissions Closed */}
        <div className="space-y-3">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Recent Enrollments Closed</h2>
            <p className="text-xs text-slate-500">Admissions processed by your desk</p>
          </div>

          {filteredEnrolments.map((enr) => (
            <div key={enr.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900">{enr.name}</span>
                <span className="font-bold text-emerald-700">{enr.amount}</span>
              </div>
              <div className="text-slate-500 text-[11px] font-mono">{enr.phone}</div>
              <div className="text-slate-700 mt-1">{enr.course} • {enr.batch}</div>
              <div className="text-slate-400 text-[10px] mt-1 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span>{enr.date}</span>
                <span className="text-emerald-700 font-medium">Access Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
