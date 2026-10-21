'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Clock,
  Video,
  CheckCircle2,
  BookOpen,
  Eye,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';

interface TrainerBatchesProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface TrainerCohort {
  id: string;
  name: string;
  course: string;
  schedule: string;
  timing: string;
  startDate: string;
  endDate: string;
  enrolledStudents: number;
  completedLessons: number;
  totalLessons: number;
  status: 'active' | 'completed';
  roomUrl: string;
  brand: 'teluguai' | 'genai99';
  roster: { name: string; email: string; attendance: number; assignmentsDone: number }[];
}

const INITIAL_COHORTS: TrainerCohort[] = [
  // TeluguAI
  {
    id: 'tc-1',
    name: 'Python AI Evening Cohort #12',
    course: 'FullStack Python & Vernacular AI Engineering',
    schedule: 'Mon - Fri',
    timing: '07:00 PM - 08:30 PM',
    startDate: '01 Oct 2026',
    endDate: '15 Feb 2027',
    enrolledStudents: 48,
    completedLessons: 24,
    totalLessons: 60,
    status: 'active',
    roomUrl: 'https://meet.google.com/xyz-telugu-ai',
    brand: 'teluguai',
    roster: [
      { name: 'Sai Kiran', email: 'saikiran.dev@gmail.com', attendance: 96, assignmentsDone: 4 },
      { name: 'Deepika Rani', email: 'deepika.rani@yahoo.com', attendance: 92, assignmentsDone: 4 },
      { name: 'Bhavani Shankar', email: 'bhavani.shankar@gmail.com', attendance: 88, assignmentsDone: 3 },
      { name: 'K. Sravani', email: 'sravani.k@gmail.com', attendance: 100, assignmentsDone: 4 },
    ],
  },
  {
    id: 'tc-2',
    name: 'Machine Learning Weekend Batch #5',
    course: 'Applied Machine Learning in Telugu',
    schedule: 'Sat & Sun',
    timing: '10:00 AM - 01:00 PM',
    startDate: '15 Sep 2026',
    endDate: '15 Dec 2026',
    enrolledStudents: 36,
    completedLessons: 18,
    totalLessons: 40,
    status: 'active',
    roomUrl: 'https://meet.google.com/ml-telugu-weekend',
    brand: 'teluguai',
    roster: [
      { name: 'Ravi Teja', email: 'raviteja.b@gmail.com', attendance: 90, assignmentsDone: 3 },
      { name: 'Venkat Rao', email: 'venkat.rao@gmail.com', attendance: 85, assignmentsDone: 2 },
    ],
  },

  // GenAI99
  {
    id: 'tc-3',
    name: 'Autonomous AI Agents - Global Cohort 4',
    course: 'Autonomous AI Agents & Multi-Modal LLMs',
    schedule: 'Mon, Wed, Fri',
    timing: '07:30 PM - 09:30 PM IST',
    startDate: '05 Oct 2026',
    endDate: '28 Dec 2026',
    enrolledStudents: 54,
    completedLessons: 16,
    totalLessons: 36,
    status: 'active',
    roomUrl: 'https://zoom.us/j/9988221100',
    brand: 'genai99',
    roster: [
      { name: 'Alex Morgan', email: 'alex.m@techcorp.io', attendance: 95, assignmentsDone: 4 },
      { name: 'Sarah Chen', email: 'sarah.c@cloudscale.com', attendance: 88, assignmentsDone: 3 },
    ],
  },
  {
    id: 'tc-4',
    name: 'Enterprise Production RAG - Cohort 2',
    course: 'Enterprise Production RAG & LLMOps',
    schedule: 'Tue & Thu',
    timing: '09:30 PM - 11:00 PM IST',
    startDate: '10 Oct 2026',
    endDate: '10 Dec 2026',
    enrolledStudents: 42,
    completedLessons: 10,
    totalLessons: 24,
    status: 'active',
    roomUrl: 'https://zoom.us/j/9988221101',
    brand: 'genai99',
    roster: [
      { name: 'Rahul Sen', email: 'rahul.sen@fintech.co', attendance: 100, assignmentsDone: 2 },
    ],
  },
];

export const TrainerBatches: React.FC<TrainerBatchesProps> = ({ activeBrand }) => {
  const [cohorts, setCohorts] = useState<TrainerCohort[]>(INITIAL_COHORTS);
  const [selectedCohort, setSelectedCohort] = useState<TrainerCohort | null>(null);

  const filtered = cohorts.filter((c) => c.brand === activeBrand);

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Assigned Cohorts</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View your assigned student batches, curriculum syllabus progress, and student roster.
        </p>
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((cohort) => {
          const progressPercent = Math.round((cohort.completedLessons / cohort.totalLessons) * 100);

          return (
            <div
              key={cohort.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {cohort.schedule}
                  </span>
                  <StatusBadge status={cohort.status} />
                </div>

                <h2 className="text-base font-bold text-slate-900 mb-1">{cohort.name}</h2>
                <div className="text-xs text-slate-500 mb-4">{cohort.course}</div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Class Time</span>
                    <span className="font-semibold text-slate-800">{cohort.timing}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Learners</span>
                    <span className="font-semibold text-slate-800">{cohort.enrolledStudents} Students</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Timeline</span>
                    <span className="font-semibold text-slate-800">{cohort.startDate} to {cohort.endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lessons Delivered</span>
                    <span className="font-semibold text-indigo-700">
                      {cohort.completedLessons} / {cohort.totalLessons} ({progressPercent}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setSelectedCohort(cohort)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  View Student Roster ({cohort.enrolledStudents})
                </button>

                <a
                  href={cohort.roomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  Launch Room
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Roster Modal */}
      {selectedCohort && (
        <Modal
          isOpen={!!selectedCohort}
          onClose={() => setSelectedCohort(null)}
          title={`Cohort Roster • ${selectedCohort.name}`}
          subtitle={`${selectedCohort.enrolledStudents} Enrolled Learners • ${selectedCohort.timing}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Attendance Rate</th>
                    <th className="py-2.5 px-3 text-right">Assignments Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {selectedCohort.roster.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{st.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{st.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-emerald-700">{st.attendance}%</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        {st.assignmentsDone} Completed
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCohort(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Close Roster
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
