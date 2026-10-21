'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Eye,
  Send
} from 'lucide-react';
import { Modal } from '../shared/Modal';

interface LeadManagementProps {
  activeBrand: 'teluguai' | 'genai99';
  onNavigateToEnroll?: () => void;
}

interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  source: string;
  stage: string;
  assignedDate: string;
  notes: string;
  brand: 'teluguai' | 'genai99';
}

const INITIAL_LEADS: LeadRecord[] = [
  // TeluguAI Leads
  {
    id: 'ldr-1',
    name: 'Karthik Raja',
    email: 'karthik.r@gmail.com',
    phone: '+91 98480 33441',
    course: 'FullStack Python AI',
    source: 'Website Form',
    stage: 'In Discussion',
    assignedDate: '12 Oct 2026',
    notes: 'Looking for evening classes after 7 PM. Ready to pay full upfront.',
    brand: 'teluguai',
  },
  {
    id: 'ldr-2',
    name: 'Sireesha Devi',
    email: 'sireesha.d@gmail.com',
    phone: '+91 99881 77665',
    course: 'Machine Learning (Telugu)',
    source: 'Referral',
    stage: 'Counseling Complete',
    assignedDate: '10 Oct 2026',
    notes: 'Wants installment plan of 2 payments.',
    brand: 'teluguai',
  },
  {
    id: 'ldr-3',
    name: 'Naveen Kumar',
    email: 'naveen.k@gmail.com',
    phone: '+91 94401 22345',
    course: 'Prompt Engineering Express',
    source: 'Meta Ad Campaign',
    stage: 'Payment Pending',
    assignedDate: '13 Oct 2026',
    notes: 'Sent payment link for ₹9,999 batch.',
    brand: 'teluguai',
  },
  {
    id: 'ldr-4',
    name: 'Ravi Teja',
    email: 'raviteja@gmail.com',
    phone: '+91 98480 99881',
    course: 'FullStack Python AI',
    source: 'WhatsApp Inbound',
    stage: 'New Inquiry',
    assignedDate: 'Today',
    notes: 'Requested brochure download.',
    brand: 'teluguai',
  },

  // GenAI99 Leads
  {
    id: 'ldr-5',
    name: 'David Miller',
    email: 'david.m@cloudfin.io',
    phone: '+1 415 678 9912',
    course: 'Autonomous AI Agents',
    source: 'LinkedIn Organic',
    stage: 'In Discussion',
    assignedDate: '11 Oct 2026',
    notes: 'Looking for corporate sponsorship approval.',
    brand: 'genai99',
  },
  {
    id: 'ldr-6',
    name: 'Priya Sharma',
    email: 'priya.s@techconsult.com',
    phone: '+91 98112 33445',
    course: 'Enterprise Production RAG',
    source: 'Google Search',
    stage: 'Payment Pending',
    assignedDate: '09 Oct 2026',
    notes: 'Requested company tax invoice format.',
    brand: 'genai99',
  },
];

export const LeadManagement: React.FC<LeadManagementProps> = ({ activeBrand, onNavigateToEnroll }) => {
  const [leads, setLeads] = useState<LeadRecord[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newSource, setNewSource] = useState('Website');
  const [newNotes, setNewNotes] = useState('');

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newRec: LeadRecord = {
      id: `ldr-${Date.now()}`,
      name: newName,
      email: newEmail || 'lead@example.com',
      phone: newPhone,
      course: newCourse || 'AI Bootcamp',
      source: newSource,
      stage: 'New Inquiry',
      assignedDate: 'Today',
      notes: newNotes || 'Added directly by counselor',
      brand: activeBrand,
    };

    setLeads([newRec, ...leads]);
    setIsModalOpen(false);
    setToastMessage(`Added prospective lead: ${newName}`);
    setTimeout(() => setToastMessage(null), 3000);

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewNotes('');
  };

  const filtered = leads.filter((l) => {
    if (l.brand !== activeBrand) return false;
    return (
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.course.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Leads Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Full directory of inquiries, communication history, and admission status.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Add Prospective Lead
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, phone number, or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Lead Name</th>
                <th className="py-3 px-4">Interested Course</th>
                <th className="py-3 px-4">Lead Source</th>
                <th className="py-3 px-4">Funnel Stage</th>
                <th className="py-3 px-4">Assigned Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{l.name}</div>
                    <div className="text-slate-500 text-[11px] font-mono">{l.phone}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-800 font-medium">{l.course}</td>

                  <td className="py-3 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                      {l.source}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {l.stage}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500">{l.assignedDate}</td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedLead(l)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                        title="View Full Profile & Notes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setToastMessage(`Dispatched syllabus brochure to ${l.phone}`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-[11px] border border-emerald-200"
                        title="Send WhatsApp Brochure"
                      >
                        Send Info
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={`Lead Profile • ${selectedLead.name}`}
          subtitle={`Created on ${selectedLead.assignedDate} via ${selectedLead.source}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Phone</span>
                <span className="font-semibold text-slate-900 font-mono">{selectedLead.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-semibold text-slate-900">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Program</span>
                <span className="font-semibold text-slate-900">{selectedLead.course}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Stage</span>
                <span className="font-semibold text-indigo-700">{selectedLead.stage}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px] mb-1">Counselor Discussion Notes</span>
              <p className="text-slate-700 leading-relaxed">{selectedLead.notes}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {onNavigateToEnroll && (
                <button
                  onClick={() => {
                    setSelectedLead(null);
                    onNavigateToEnroll();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Convert to Enrolled Student &rarr;
                </button>
              )}
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Prospective Student Lead"
        subtitle="Record a new inquiry into the admissions funnel"
        maxWidth="md"
      >
        <form onSubmit={handleAddLead} className="space-y-4 text-xs">
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
              <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+91 98480 12345"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="ramesh@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Interested Program</label>
              <input
                type="text"
                placeholder="e.g. FullStack Python AI"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Lead Source</label>
              <select
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-600"
              >
                <option value="Website">Website Form</option>
                <option value="WhatsApp Inbound">WhatsApp Inbound</option>
                <option value="Referral">Student Referral</option>
                <option value="Meta Ads">Meta / Instagram Ads</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Discussion Notes / Preferences</label>
            <textarea
              rows={3}
              placeholder="Candidate background, batch timing preference, etc."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
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
              Add to Pipeline
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
