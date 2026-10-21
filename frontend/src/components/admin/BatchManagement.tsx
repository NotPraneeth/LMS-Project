'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Clock,
  Users,
  Video,
  CheckCircle2,
  CalendarCheck,
  Edit2
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';

interface BatchManagementProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface BatchItem {
  id: string;
  name: string;
  courseTitle: string;
  trainer: string;
  timing: string;
  scheduleDays: string;
  startDate: string;
  enrolled: number;
  capacity: number;
  status: 'active' | 'pending';
  brand: 'teluguai' | 'genai99';
}

const INITIAL_BATCHES: BatchItem[] = [
  // TeluguAI Batches
  {
    id: 'b-1',
    name: 'Python AI Evening Cohort #12',
    courseTitle: 'FullStack Python & Vernacular AI Engineering',
    trainer: 'Suresh Varma',
    timing: '07:00 PM - 08:30 PM',
    scheduleDays: 'Mon - Fri',
    startDate: '01 Oct 2026',
    enrolled: 48,
    capacity: 50,
    status: 'active',
    brand: 'teluguai',
  },
  {
    id: 'b-2',
    name: 'Machine Learning Weekend Batch #5',
    courseTitle: 'Applied Machine Learning & Deep Learning (Telugu)',
    trainer: 'K. Venkatesh',
    timing: '10:00 AM - 01:00 PM',
    scheduleDays: 'Sat & Sun',
    startDate: '15 Sep 2026',
    enrolled: 36,
    capacity: 40,
    status: 'active',
    brand: 'teluguai',
  },
  {
    id: 'b-3',
    name: 'Prompt Engineering Express Batch #8',
    courseTitle: 'Prompt Engineering & Generative Tools',
    trainer: 'Kavitha Reddy',
    timing: '06:00 PM - 07:00 PM',
    scheduleDays: 'Tue & Thu',
    startDate: '20 Oct 2026',
    enrolled: 22,
    capacity: 60,
    status: 'pending',
    brand: 'teluguai',
  },

  // GenAI99 Batches
  {
    id: 'b-4',
    name: 'Autonomous AI Agents - Global Cohort 4',
    courseTitle: 'Autonomous AI Agents & Multi-Modal LLMs',
    trainer: 'Dr. Arjun K.',
    timing: '07:30 PM - 09:30 PM IST',
    scheduleDays: 'Mon, Wed, Fri',
    startDate: '05 Oct 2026',
    enrolled: 54,
    capacity: 60,
    status: 'active',
    brand: 'genai99',
  },
  {
    id: 'b-5',
    name: 'Enterprise Production RAG - Cohort 2',
    courseTitle: 'Enterprise Production RAG & LLMOps',
    trainer: 'Mark Davis',
    timing: '09:30 PM - 11:00 PM IST',
    scheduleDays: 'Tue & Thu',
    startDate: '10 Oct 2026',
    enrolled: 42,
    capacity: 45,
    status: 'active',
    brand: 'genai99',
  },
];

export const BatchManagement: React.FC<BatchManagementProps> = ({ activeBrand }) => {
  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newTrainer, setNewTrainer] = useState('');
  const [newTiming, setNewTiming] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newCapacity, setNewCapacity] = useState('50');

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newBatch: BatchItem = {
      id: `b-${Date.now()}`,
      name: newName,
      courseTitle: newCourse || 'AI Masterclass',
      trainer: newTrainer || 'Assigned Faculty',
      timing: newTiming || '07:00 PM - 08:30 PM',
      scheduleDays: 'Mon - Fri',
      startDate: newStartDate || '01 Nov 2026',
      enrolled: 0,
      capacity: parseInt(newCapacity) || 50,
      status: 'pending',
      brand: activeBrand,
    };

    setBatches([newBatch, ...batches]);
    setIsModalOpen(false);
    setToastMessage(`Created new cohort: ${newName}`);
    setTimeout(() => setToastMessage(null), 3000);

    setNewName('');
    setNewCourse('');
    setNewTrainer('');
    setNewTiming('');
  };

  const filteredBatches = batches.filter((b) => {
    if (b.brand !== activeBrand) return false;
    return (
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.trainer.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Batches & Scheduling</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create academic cohorts, assign trainers, set class schedules, and monitor seat capacity.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create New Batch
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batches by name, course, or trainer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Cohort Name & Course</th>
                <th className="py-3 px-4">Faculty Assigned</th>
                <th className="py-3 px-4">Schedule & Time</th>
                <th className="py-3 px-4">Enrollment Ratio</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{b.name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{b.courseTitle}</div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800">
                    {b.trainer}
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{b.timing}</div>
                    <div className="text-slate-500 text-[11px]">{b.scheduleDays}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">
                      {b.enrolled} / {b.capacity} Seats
                    </div>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min((b.enrolled / b.capacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">{b.startDate}</td>

                  <td className="py-3 px-4">
                    <StatusBadge status={b.status} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setToastMessage(`Editing schedule for ${b.name}`);
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                      title="Edit Batch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Academic Batch"
        subtitle="Schedule a new cohort with assigned instructor and timetable"
        maxWidth="md"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Batch / Cohort Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Python AI Evening Batch #14"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Course</label>
              <input
                type="text"
                placeholder="Course title"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Assigned Trainer</label>
              <input
                type="text"
                placeholder="e.g. Suresh Varma"
                value={newTrainer}
                onChange={(e) => setNewTrainer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Class Time</label>
              <input
                type="text"
                placeholder="e.g. 07:00 PM - 08:30 PM"
                value={newTiming}
                onChange={(e) => setNewTiming(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Seat Capacity</label>
              <input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
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
              Schedule Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
