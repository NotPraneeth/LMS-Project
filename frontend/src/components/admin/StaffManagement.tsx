'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';

interface StaffManagementProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'counselor' | 'trainer';
  specialization: string;
  activeBatchesCount?: number;
  assignedLeadsCount?: number;
  status: 'active' | 'inactive';
  brand: 'teluguai' | 'genai99';
}

const INITIAL_STAFF: StaffMember[] = [
  // TeluguAI Staff
  {
    id: 'st-1',
    name: 'Suresh Varma',
    email: 'suresh.trainer@teluguai.com',
    phone: '+91 98480 11223',
    role: 'trainer',
    specialization: 'FullStack Python & Vernacular AI',
    activeBatchesCount: 3,
    status: 'active',
    brand: 'teluguai',
  },
  {
    id: 'st-2',
    name: 'Ananya Rao',
    email: 'ananya.counselor@teluguai.com',
    phone: '+91 90001 98822',
    role: 'counselor',
    specialization: 'Student Admissions & Career Advisory',
    assignedLeadsCount: 48,
    status: 'active',
    brand: 'teluguai',
  },
  {
    id: 'st-3',
    name: 'K. Venkatesh',
    email: 'venkatesh.trainer@teluguai.com',
    phone: '+91 99887 55443',
    role: 'trainer',
    specialization: 'Machine Learning in Telugu',
    activeBatchesCount: 2,
    status: 'active',
    brand: 'teluguai',
  },
  {
    id: 'st-4',
    name: 'Pooja Reddy',
    email: 'pooja.counselor@teluguai.com',
    phone: '+91 91234 88776',
    role: 'counselor',
    specialization: 'Student Onboarding & Lead Conversion',
    assignedLeadsCount: 36,
    status: 'active',
    brand: 'teluguai',
  },

  // GenAI99 Staff
  {
    id: 'st-5',
    name: 'Dr. Arjun K.',
    email: 'arjun.trainer@genai99.com',
    phone: '+91 93322 11009',
    role: 'trainer',
    specialization: 'Autonomous AI Agents & Multi-Modal LLMs',
    activeBatchesCount: 4,
    status: 'active',
    brand: 'genai99',
  },
  {
    id: 'st-6',
    name: 'Neha Kapoor',
    email: 'neha.counselor@genai99.com',
    phone: '+91 98765 22110',
    role: 'counselor',
    specialization: 'Global Enterprise Admissions',
    assignedLeadsCount: 52,
    status: 'active',
    brand: 'genai99',
  },
  {
    id: 'st-7',
    name: 'Mark Davis',
    email: 'mark.trainer@genai99.com',
    phone: '+1 415 890 2231',
    role: 'trainer',
    specialization: 'RAG Architecture & Enterprise LLMOps',
    activeBatchesCount: 2,
    status: 'active',
    brand: 'genai99',
  },
];

export const StaffManagement: React.FC<StaffManagementProps> = ({ activeBrand }) => {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [activeTab, setActiveTab] = useState<'all' | 'trainer' | 'counselor'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'trainer' | 'counselor'>('trainer');
  const [newSpec, setNewSpec] = useState('');

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newMember: StaffMember = {
      id: `st-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+91 98000 00000',
      role: newRole,
      specialization: newSpec || (newRole === 'trainer' ? 'AI Instructor' : 'Admissions'),
      activeBatchesCount: newRole === 'trainer' ? 1 : undefined,
      assignedLeadsCount: newRole === 'counselor' ? 10 : undefined,
      status: 'active',
      brand: activeBrand,
    };

    setStaff([newMember, ...staff]);
    setIsModalOpen(false);
    setToastMessage(`Onboarded ${newRole.toUpperCase()}: ${newName}`);
    setTimeout(() => setToastMessage(null), 3500);

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewSpec('');
  };

  const filteredStaff = staff.filter((m) => {
    if (m.brand !== activeBrand) return false;
    const matchesTab = activeTab === 'all' || m.role === activeTab;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Faculty & Counselors</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Admin privilege: Onboard academic trainers and admission counselors for your branches.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Add Faculty or Counselor
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Staff
          </button>
          <button
            onClick={() => setActiveTab('trainer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'trainer'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Trainers (Faculty)
          </button>
          <button
            onClick={() => setActiveTab('counselor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'counselor'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Counselors (Admissions)
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Workload</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{member.name}</div>
                    <div className="text-slate-500 text-[11px]">{member.email} • {member.phone}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        member.role === 'trainer'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {member.role === 'trainer' ? 'Trainer' : 'Counselor'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {member.specialization}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {member.role === 'trainer' ? (
                      <span>{member.activeBatchesCount} Active Batches</span>
                    ) : (
                      <span>{member.assignedLeadsCount} Assigned Leads</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={member.status} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setStaff(
                          staff.map((s) =>
                            s.id === member.id
                              ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
                              : s
                          )
                        );
                        setToastMessage(`Updated status for ${member.name}`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                      title="Toggle Status"
                    >
                      {member.status === 'active' ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Faculty or Counselor"
        subtitle="Add a new instructor or counselor to your branch"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
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
              <label className="block text-slate-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="ramesh@organization.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
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
              <label className="block text-slate-700 font-medium mb-1">Role Type</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-600"
              >
                <option value="trainer">Trainer (Faculty)</option>
                <option value="counselor">Counselor (Admissions)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Specialization / Subject</label>
              <input
                type="text"
                placeholder="e.g. Python AI / LLMs / Admissions"
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
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
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
