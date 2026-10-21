'use client';

import React from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  Video,
  CheckCircle2,
  BookOpen,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  activeBrand: 'teluguai' | 'genai99';
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeBrand, onNavigate }) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const data = isTeluguAI
    ? {
        brandName: 'TeluguAI',
        batches: 18,
        students: 2940,
        classesToday: 6,
        feesMonth: '₹ 14,80,000',
        trainers: 22,
        counselors: 14,
      }
    : {
        brandName: 'GenAI99',
        batches: 12,
        students: 1880,
        classesToday: 4,
        feesMonth: '₹ 11,20,000 / $13,400',
        trainers: 16,
        counselors: 10,
      };

  const todaysSchedule = isTeluguAI
    ? [
        {
          id: 'sc-1',
          time: '07:00 PM - 08:30 PM',
          batch: 'FullStack Python AI - Cohort 12',
          trainer: 'Suresh Varma',
          students: 45,
          status: 'Upcoming',
        },
        {
          id: 'sc-2',
          time: '08:30 PM - 10:00 PM',
          batch: 'Machine Learning in Telugu - Cohort 5',
          trainer: 'K. Venkatesh',
          students: 38,
          status: 'Upcoming',
        },
        {
          id: 'sc-3',
          time: '06:00 PM - 07:00 PM',
          batch: 'Prompt Engineering & Tools',
          trainer: 'Kavitha Reddy',
          students: 60,
          status: 'Completed',
        },
      ]
    : [
        {
          id: 'sc-4',
          time: '07:30 PM - 09:30 PM',
          batch: 'Enterprise AI Agents - Global Cohort 4',
          trainer: 'Dr. Arjun K.',
          students: 54,
          status: 'Upcoming',
        },
        {
          id: 'sc-5',
          time: '09:30 PM - 11:00 PM',
          batch: 'RAG Architectures & LLMOps - Cohort 2',
          trainer: 'Mark Davis',
          students: 42,
          status: 'Upcoming',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isTeluguAI
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              {data.brandName} Campus
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Branch management for batches, live class timetables, student enrollments, and tuition fees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('batches')}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Batch
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
            Enroll Student
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Batches</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{data.batches}</div>
            <p className="text-xs text-slate-500 mt-1">Currently in progress</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Enrolled</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{data.students.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Active learners</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sessions Today</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{data.classesToday} Classes</div>
            <p className="text-xs text-slate-500 mt-1">Scheduled for today</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Fees Collected (MTD)</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{data.feesMonth}</div>
            <p className="text-xs text-slate-500 mt-1">Reconciled this month</p>
          </div>
        </div>
      </div>

      {/* Today's Timetable & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Today&apos;s Class Schedule</h2>
              <p className="text-xs text-slate-500">Live sessions and assigned faculty</p>
            </div>
            <button
              onClick={() => onNavigate('batches')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Full Timetable &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {todaysSchedule.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{cls.batch}</div>
                  <div className="text-slate-500 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {cls.time}
                    </span>
                    <span>•</span>
                    <span>Trainer: <strong className="text-slate-800">{cls.trainer}</strong></span>
                    <span>•</span>
                    <span>{cls.students} Enrolled</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      cls.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {cls.status}
                  </span>
                  <button
                    onClick={() => onNavigate('attendance')}
                    className="px-3 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Branch Administration */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Branch Shortcuts</h2>
            <p className="text-xs text-slate-500 mb-4">Direct shortcuts for administrative tasks</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('students')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Enroll New Student</div>
                  <div className="text-[11px] text-slate-500">Register and assign batch</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('staff')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Add Faculty / Counselor</div>
                  <div className="text-[11px] text-slate-500">Manage trainers & admissions team</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Course Curriculum</div>
                  <div className="text-[11px] text-slate-500">Update modules & syllabus</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('fees')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Fee Invoices & Dues</div>
                  <div className="text-[11px] text-slate-500">Record payments and issue receipts</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Branch Role: Academic Admin</span>
            <span className="text-emerald-600 font-medium">Authorized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
