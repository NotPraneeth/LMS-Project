'use client';

import React from 'react';
import {
  Users,
  PhoneCall,
  UserCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  Calendar,
  MessageSquare,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface CounselorDashboardProps {
  activeBrand: 'teluguai' | 'genai99';
  onNavigate: (tab: string) => void;
}

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({
  activeBrand,
  onNavigate,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const stats = isTeluguAI
    ? {
        brandName: 'TeluguAI',
        activeLeads: 54,
        callsToday: 12,
        convertedMonth: 28,
        conversionRate: '24.2%',
        revenueGenerated: '₹ 6,99,972',
      }
    : {
        brandName: 'GenAI99',
        activeLeads: 38,
        callsToday: 9,
        convertedMonth: 19,
        conversionRate: '28.5%',
        revenueGenerated: '$9,481 / ₹ 7,85,000',
      };

  const upcomingCalls = isTeluguAI
    ? [
        {
          id: 'c-1',
          time: '11:30 AM',
          student: 'Karthik Raja',
          phone: '+91 98480 33441',
          program: 'FullStack Python AI',
          intent: 'Interested in evening batch & placements',
        },
        {
          id: 'c-2',
          time: '02:00 PM',
          student: 'Sireesha Devi',
          phone: '+91 99881 77665',
          program: 'Machine Learning in Telugu',
          intent: 'Requested syllabus comparison & fee installment',
        },
        {
          id: 'c-3',
          time: '04:30 PM',
          student: 'Naveen Kumar',
          phone: '+91 94401 22345',
          program: 'Prompt Engineering Express',
          intent: 'Ready to enroll if payment link sent today',
        },
      ]
    : [
        {
          id: 'c-4',
          time: '12:00 PM UTC',
          student: 'David Miller',
          phone: '+1 415 678 9912',
          program: 'Autonomous AI Agents',
          intent: 'Enterprise team enrollment (3 seats)',
        },
        {
          id: 'c-5',
          time: '03:30 PM UTC',
          student: 'Priya Sharma',
          phone: '+91 98112 33445',
          program: 'Enterprise Production RAG',
          intent: 'Clarifying prerequisites & live project work',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Counselor Dashboard</h1>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isTeluguAI
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              {stats.brandName} Admissions
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Track your lead pipeline, schedule admissions consultations, and enroll learners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('enrolment')}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Enroll Student
          </button>
          <button
            onClick={() => onNavigate('leads')}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>My Active Leads</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.activeLeads}</div>
            <p className="text-xs text-slate-500 mt-1">Under follow-up</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Calls Scheduled Today</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.callsToday} Calls</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Next call in 45 mins</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Monthly Enrolled</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.convertedMonth} Students</div>
            <p className="text-xs text-slate-500 mt-1">Conversion rate: {stats.conversionRate}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tuition Revenue Closed</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.revenueGenerated}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">On track for target</p>
          </div>
        </div>
      </div>

      {/* Today's Follow-up Calls & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Today&apos;s Follow-up Queue</h2>
              <p className="text-xs text-slate-500">Students expecting consultation calls today</p>
            </div>
            <button
              onClick={() => onNavigate('followups')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Full Task Queue &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {upcomingCalls.map((call) => (
              <div
                key={call.id}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{call.student}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{call.phone}</span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    Course: <strong className="text-slate-800">{call.program}</strong>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Note: {call.intent}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded">
                    {call.time}
                  </span>
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-xs">
                    <PhoneCall className="w-3.5 h-3.5" />
                    Call Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Counselor Shortcuts */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Counseling Tools</h2>
            <p className="text-xs text-slate-500 mb-4">Quick tools for student counseling</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('pipeline')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Visual Lead Pipeline</div>
                  <div className="text-[11px] text-slate-500">Drag & drop leads across stages</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('catalogue')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Course Pricing & Batches</div>
                  <div className="text-[11px] text-slate-500">Quick pitch points & discount rules</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('enrolment')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Convert Lead to Student</div>
                  <div className="text-[11px] text-slate-500">Assign batch and issue invoice</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('payments')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Track Fee Payments</div>
                  <div className="text-[11px] text-slate-500">Monitor installments & pending dues</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Branch: Admissions Desk</span>
            <span className="text-emerald-600 font-medium">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
