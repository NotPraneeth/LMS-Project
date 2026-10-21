'use client';

import React, { useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  Users,
  MessageSquare,
  Clock,
  Calendar
} from 'lucide-react';

interface AnnouncementsProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  sentDate: string;
  viaWhatsApp: boolean;
  brand: 'teluguai' | 'genai99';
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'anc-1',
    title: 'Guest Lecture: Scalable AI Microservices on Saturday',
    content: 'Special industry masterclass with senior engineers this Saturday at 11:00 AM. Attendance is mandatory for all active cohort learners.',
    targetAudience: 'All Active Batches',
    sentDate: '13 Oct 2026',
    viaWhatsApp: true,
    brand: 'teluguai',
  },
  {
    id: 'anc-2',
    title: 'Dussehra Holiday Notice & Class Rescheduling',
    content: 'Live classes will remain suspended on October 20th and 21st. The makeup session timetable has been updated in the calendar.',
    targetAudience: 'All Students & Trainers',
    sentDate: '10 Oct 2026',
    viaWhatsApp: true,
    brand: 'teluguai',
  },
  {
    id: 'anc-3',
    title: 'Project Submission Deadline for Cohort 4',
    content: 'The autonomous agent milestone repository must be submitted before Sunday 11:59 PM UTC. Review rubric has been posted.',
    targetAudience: 'Autonomous AI Agents Cohort 4',
    sentDate: '12 Oct 2026',
    viaWhatsApp: true,
    brand: 'genai99',
  },
];

export const Announcements: React.FC<AnnouncementsProps> = ({ activeBrand }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Active Batches');
  const [viaWhatsApp, setViaWhatsApp] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newAnc: AnnouncementItem = {
      id: `anc-${Date.now()}`,
      title,
      content,
      targetAudience,
      sentDate: 'Just now',
      viaWhatsApp,
      brand: activeBrand,
    };

    setAnnouncements([newAnc, ...announcements]);
    setTitle('');
    setContent('');
    setToastMessage(`Notice dispatched to ${targetAudience} ${viaWhatsApp ? 'via App & WhatsApp' : ''}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = announcements.filter((a) => a.brand === activeBrand);

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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Broadcast Announcements</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Dispatch official announcements, timetable revisions, and holiday notices to students and faculty.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Compose New Notice</h2>
          <p className="text-xs text-slate-500 mb-4">Send instantly to student dashboards and WhatsApp</p>

          <form onSubmit={handlePost} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Notice Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Guest Lecture this Saturday"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-600"
              >
                <option value="All Active Batches">All Active Batches</option>
                <option value="Faculty & Trainers Only">Faculty & Trainers Only</option>
                <option value="Weekend Batches">Weekend Batches Only</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Message Content</label>
              <textarea
                rows={4}
                required
                placeholder="Write the announcement details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={viaWhatsApp}
                  onChange={(e) => setViaWhatsApp(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span>Also dispatch via WhatsApp alert template</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Publish Announcement
            </button>
          </form>
        </div>

        {/* Recent Announcements List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Recent Dispatches</h2>
            <p className="text-xs text-slate-500">History of notices sent to learners</p>
          </div>

          {filtered.map((item) => (
            <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {item.targetAudience}
                </span>
                <span className="text-slate-400 text-xs">{item.sentDate}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
              {item.viaWhatsApp && (
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Delivered to WhatsApp
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
