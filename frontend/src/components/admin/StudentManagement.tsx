'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  CheckCircle2,
  Eye,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';

interface StudentManagementProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface StudentItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  feeStatus: 'Paid' | 'Partial' | 'Pending';
  feePaid: string;
  totalFee: string;
  attendancePct: number;
  enrolledDate: string;
  brand: 'teluguai' | 'genai99';
}

const INITIAL_STUDENTS: StudentItem[] = [
  // TeluguAI Students
  {
    id: 'std-1',
    name: 'Sai Kiran',
    email: 'saikiran.dev@gmail.com',
    phone: '+91 98480 44556',
    course: 'FullStack Python & Vernacular AI',
    batch: 'Python AI Evening Cohort #12',
    feeStatus: 'Paid',
    feePaid: '₹ 24,999',
    totalFee: '₹ 24,999',
    attendancePct: 96,
    enrolledDate: '28 Sep 2026',
    brand: 'teluguai',
  },
  {
    id: 'std-2',
    name: 'Bhavani Shankar',
    email: 'bhavani.shankar@gmail.com',
    phone: '+91 99881 22334',
    course: 'Applied Machine Learning (Telugu)',
    batch: 'Machine Learning Weekend Batch #5',
    feeStatus: 'Partial',
    feePaid: '₹ 15,000',
    totalFee: '₹ 29,999',
    attendancePct: 88,
    enrolledDate: '12 Sep 2026',
    brand: 'teluguai',
  },
  {
    id: 'std-3',
    name: 'Deepika Rani',
    email: 'deepika.rani@yahoo.com',
    phone: '+91 94402 88990',
    course: 'FullStack Python & Vernacular AI',
    batch: 'Python AI Evening Cohort #12',
    feeStatus: 'Paid',
    feePaid: '₹ 24,999',
    totalFee: '₹ 24,999',
    attendancePct: 92,
    enrolledDate: '29 Sep 2026',
    brand: 'teluguai',
  },
  {
    id: 'std-4',
    name: 'Venu Madhav',
    email: 'venu.madhav@gmail.com',
    phone: '+91 91234 33445',
    course: 'Prompt Engineering & Tools',
    batch: 'Prompt Engineering Express Batch #8',
    feeStatus: 'Pending',
    feePaid: '₹ 0',
    totalFee: '₹ 9,999',
    attendancePct: 0,
    enrolledDate: '10 Oct 2026',
    brand: 'teluguai',
  },

  // GenAI99 Students
  {
    id: 'std-5',
    name: 'Alex Morgan',
    email: 'alex.morgan@techcorp.io',
    phone: '+1 415 555 0192',
    course: 'Autonomous AI Agents & Multi-Modal LLMs',
    batch: 'Autonomous AI Agents - Global Cohort 4',
    feeStatus: 'Paid',
    feePaid: '$499',
    totalFee: '$499',
    attendancePct: 94,
    enrolledDate: '01 Oct 2026',
    brand: 'genai99',
  },
  {
    id: 'std-6',
    name: 'Rahul Sen',
    email: 'rahul.sen@fintech.co',
    phone: '+91 98200 44321',
    course: 'Enterprise Production RAG & LLMOps',
    batch: 'Enterprise Production RAG - Cohort 2',
    feeStatus: 'Paid',
    feePaid: '₹ 32,999',
    totalFee: '₹ 32,999',
    attendancePct: 100,
    enrolledDate: '08 Oct 2026',
    brand: 'genai99',
  },
  {
    id: 'std-7',
    name: 'Sarah Chen',
    email: 'sarah.chen@cloudscale.com',
    phone: '+1 206 555 8821',
    course: 'Autonomous AI Agents & Multi-Modal LLMs',
    batch: 'Autonomous AI Agents - Global Cohort 4',
    feeStatus: 'Partial',
    feePaid: '$250',
    totalFee: '$499',
    attendancePct: 82,
    enrolledDate: '04 Oct 2026',
    brand: 'genai99',
  },
];

export const StudentManagement: React.FC<StudentManagementProps> = ({ activeBrand }) => {
  const [students, setStudents] = useState<StudentItem[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [feeFilter, setFeeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newBatch, setNewBatch] = useState('');
  const [newFeeStatus, setNewFeeStatus] = useState<'Paid' | 'Partial' | 'Pending'>('Paid');

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newStd: StudentItem = {
      id: `std-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+91 98000 00000',
      course: newCourse || 'FullStack AI Bootcamp',
      batch: newBatch || 'Active Cohort',
      feeStatus: newFeeStatus,
      feePaid: newFeeStatus === 'Paid' ? '₹ 24,999' : newFeeStatus === 'Partial' ? '₹ 10,000' : '₹ 0',
      totalFee: '₹ 24,999',
      attendancePct: 100,
      enrolledDate: 'Today',
      brand: activeBrand,
    };

    setStudents([newStd, ...students]);
    setIsModalOpen(false);
    setToastMessage(`Enrolled student: ${newName}`);
    setTimeout(() => setToastMessage(null), 3000);

    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  const filteredStudents = students.filter((s) => {
    if (s.brand !== activeBrand) return false;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.batch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFee = feeFilter === 'all' || s.feeStatus === feeFilter;
    return matchesSearch && matchesFee;
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage student registrations, batch memberships, attendance records, and tuition payments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, email, or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-indigo-600 w-full sm:w-auto"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partial">Partial Dues</option>
            <option value="Pending">Payment Pending</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Enrolled Cohort</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{std.name}</div>
                    <div className="text-slate-500 text-[11px]">{std.email} • {std.phone}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{std.batch}</div>
                    <div className="text-slate-500 text-[11px]">{std.course}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        std.feeStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : std.feeStatus === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {std.feeStatus} ({std.feePaid} / {std.totalFee})
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{std.attendancePct}%</div>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          std.attendancePct >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${std.attendancePct}%` }}
                      ></div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-500">{std.enrolledDate}</td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedStudent(std)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                      title="View Student Record"
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

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Record • ${selectedStudent.name}`}
          subtitle={`Enrolled on ${selectedStudent.enrolledDate}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-medium text-slate-900">{selectedStudent.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mobile</span>
                <span className="font-medium text-slate-900">{selectedStudent.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Enrolled Batch</span>
                <span className="font-medium text-slate-900">{selectedStudent.batch}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Attendance Rate</span>
                <span className="font-medium text-emerald-700">{selectedStudent.attendancePct}%</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px] mb-1">Fee & Tuition Summary</span>
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Paid: {selectedStudent.feePaid}</span>
                <span>Total: {selectedStudent.totalFee}</span>
                <span className="text-emerald-700">{selectedStudent.feeStatus}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Enroll Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll New Student"
        subtitle="Register learner into an active cohort"
        maxWidth="md"
      >
        <form onSubmit={handleEnrollStudent} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="ramesh@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 98480 12345"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Cohort</label>
              <input
                type="text"
                placeholder="Cohort name"
                value={newBatch}
                onChange={(e) => setNewBatch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Fee Plan</label>
              <select
                value={newFeeStatus}
                onChange={(e) => setNewFeeStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-600"
              >
                <option value="Paid">Fully Paid</option>
                <option value="Partial">Partial Installment</option>
                <option value="Pending">Payment Pending</option>
              </select>
            </div>
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
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
