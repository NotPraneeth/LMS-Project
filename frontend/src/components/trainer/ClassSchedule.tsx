'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  Users,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../shared/Modal';

interface ClassScheduleProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface ClassSession {
  id: string;
  batchId: string;
  batchName: string;
  courseName?: string;
  course?: string;
  topic: string;
  date: string;
  timeSlot: string;
  duration: string;
  meetUrl: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  attendeesExpected: number;
  brand: 'teluguai' | 'genai99';
}

const INITIAL_SESSIONS: ClassSession[] = [
  // TeluguAI
  {
    id: 'sess-101',
    batchId: 'tc-1',
    batchName: 'Python AI Evening Cohort #12',
    course: 'FullStack Python & Vernacular AI Engineering',
    topic: 'FastAPI Integration with Pydantic Schema Validation & Telugu Prompts',
    date: 'Today',
    timeSlot: '07:00 PM - 08:30 PM',
    duration: '90 mins',
    meetUrl: 'https://meet.google.com/xyz-telugu-ai',
    status: 'upcoming',
    attendeesExpected: 48,
    brand: 'teluguai',
  },
  {
    id: 'sess-102',
    batchId: 'tc-2',
    batchName: 'Machine Learning Weekend Batch #5',
    course: 'Machine Learning & Deep Learning Foundations',
    topic: 'Supervised Learning: Random Forests and Gradient Boosted Trees in Scikit-Learn',
    date: 'Saturday, 18 Oct',
    timeSlot: '10:00 AM - 01:00 PM',
    duration: '180 mins',
    meetUrl: 'https://meet.google.com/ml-weekend-tlg',
    status: 'upcoming',
    attendeesExpected: 36,
    brand: 'teluguai',
  },
  {
    id: 'sess-103',
    batchId: 'tc-1',
    batchName: 'Python AI Evening Cohort #12',
    course: 'FullStack Python & Vernacular AI Engineering',
    topic: 'Python Object-Oriented Programming & Custom Context Managers',
    date: 'Yesterday',
    timeSlot: '07:00 PM - 08:30 PM',
    duration: '90 mins',
    meetUrl: 'https://meet.google.com/xyz-telugu-ai',
    status: 'completed',
    attendeesExpected: 48,
    brand: 'teluguai',
  },
  // GenAI99
  {
    id: 'sess-201',
    batchId: 'gc-1',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    course: 'Autonomous AI Agents & Multi-Modal LLMs',
    topic: 'Stateful Agentic Workflows with LangGraph, Human-in-the-Loop & Tool Calling',
    date: 'Today',
    timeSlot: '07:30 PM - 09:30 PM',
    duration: '120 mins',
    meetUrl: 'https://zoom.us/j/9928347192',
    status: 'upcoming',
    attendeesExpected: 52,
    brand: 'genai99',
  },
  {
    id: 'sess-202',
    batchId: 'gc-2',
    batchName: 'Enterprise Production RAG - Cohort 2',
    course: 'Production RAG Architectures with Milvus & Hybrid Search',
    topic: 'Milvus Vector Indexing, Hybrid Dense-Sparse Reranking & Cohere API',
    date: 'Tomorrow',
    timeSlot: '08:00 PM - 10:00 PM',
    duration: '120 mins',
    meetUrl: 'https://zoom.us/j/8839201948',
    status: 'upcoming',
    attendeesExpected: 44,
    brand: 'genai99',
  },
  {
    id: 'sess-203',
    batchId: 'gc-1',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    course: 'Autonomous AI Agents & Multi-Modal LLMs',
    topic: 'Function Calling Patterns with Claude 3.5 Sonnet & OpenAI Realtime API',
    date: '2 Days Ago',
    timeSlot: '07:30 PM - 09:30 PM',
    duration: '120 mins',
    meetUrl: 'https://zoom.us/j/9928347192',
    status: 'completed',
    attendeesExpected: 52,
    brand: 'genai99',
  },
];

export const ClassSchedule: React.FC<ClassScheduleProps> = ({ activeBrand }) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [sessions, setSessions] = useState<ClassSession[]>(INITIAL_SESSIONS);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New session form state
  const [newTopic, setNewTopic] = useState('');
  const [newBatch, setNewBatch] = useState(
    isTeluguAI ? 'Python AI Evening Cohort #12' : 'Autonomous AI Agents - Global Cohort 4'
  );
  const [newDate, setNewDate] = useState('Today');
  const [newTime, setNewTime] = useState('07:00 PM - 08:30 PM');
  const [newMeetUrl, setNewMeetUrl] = useState('https://meet.google.com/new-session');

  const filteredSessions = sessions.filter((s) => {
    if (s.brand !== activeBrand) return false;
    if (selectedBatch !== 'all' && s.batchName !== selectedBatch) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newSessionItem: ClassSession = {
      id: `sess-${Date.now()}`,
      batchId: 'batch-custom',
      batchName: newBatch,
      courseName: isTeluguAI ? 'Vernacular AI Masterclass' : 'Enterprise GenAI Architecture',
      topic: newTopic,
      date: newDate,
      timeSlot: newTime,
      duration: '90 mins',
      meetUrl: newMeetUrl,
      status: 'upcoming',
      attendeesExpected: isTeluguAI ? 45 : 40,
      brand: activeBrand,
    };

    setSessions([newSessionItem, ...sessions]);
    setIsModalOpen(false);
    setNewTopic('');
  };

  const handleToggleStatus = (id: string) => {
    setSessions(
      sessions.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'upcoming' ? 'completed' : 'upcoming';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const availableBatches = Array.from(
    new Set(sessions.filter((s) => s.brand === activeBrand).map((s) => s.batchName))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Class Timetable & Live Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">
            View your scheduled live classes, launch classrooms, and manage session agendas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-xs transition-colors shadow-xs ${
            isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          Schedule Live Session
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter by Cohort:</span>
        </div>

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
        >
          <option value="all">All Cohorts</option>
          {availableBatches.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'upcoming'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Session Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.map((session) => {
          const isUpcoming = session.status === 'upcoming';
          const isToday = session.date.toLowerCase().includes('today');

          return (
            <div
              key={session.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                isToday && isUpcoming
                  ? isTeluguAI
                    ? 'border-emerald-300 ring-2 ring-emerald-50'
                    : 'border-sky-300 ring-2 ring-sky-50'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {session.batchName}
                  </span>
                  <div className="flex items-center gap-2">
                    {isToday && isUpcoming && (
                      <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        session.status === 'upcoming'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {session.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">
                  {session.topic}
                </h3>

                <p className="text-xs text-slate-500 mb-4">{session.courseName || session.course}</p>

                <div className="space-y-1.5 text-xs text-slate-600 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{session.date}</span>
                    <span className="text-slate-400">•</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session.timeSlot} ({session.duration})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expected Attendance: {session.attendeesExpected} Learners</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <a
                    href={session.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs ${
                      isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Live Classroom
                  </a>

                  <button
                    onClick={() => handleToggleStatus(session.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                  >
                    {session.status === 'upcoming' ? 'Mark Done' : 'Reopen'}
                  </button>
                </div>

                <a
                  href={session.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Link
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Live Session">
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Batch / Cohort
            </label>
            <select
              value={newBatch}
              onChange={(e) => setNewBatch(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-hidden focus:border-slate-400"
            >
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Session Topic & Agenda
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Session 25: Deploying Containerized Agent to AWS ECS"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="text"
                required
                placeholder="e.g. Tomorrow or 22 Oct 2026"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Timing</label>
              <input
                type="text"
                required
                placeholder="07:00 PM - 08:30 PM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Live Classroom Link (Meet / Zoom)
            </label>
            <input
              type="url"
              required
              placeholder="https://meet.google.com/..."
              value={newMeetUrl}
              onChange={(e) => setNewMeetUrl(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs ${
                isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              Confirm Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
