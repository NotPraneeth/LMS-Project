'use client';

import React from 'react';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Server,
  Building2,
  GraduationCap,
  MessageSquare,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  Activity,
  Plus,
  Layers,
  Calendar,
  BookOpen
} from 'lucide-react';

interface PlatformDashboardProps {
  activeBrand: 'teluguai' | 'genai99';
  onNavigate: (screen: string) => void;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({
  activeBrand,
  onNavigate,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const stats = isTeluguAI
    ? {
        name: 'TeluguAI',
        admins: 4,
        counselors: 14,
        trainers: 22,
        students: 2940,
        revenue: '₹ 84,20,000',
        batches: 18,
        courses: 14,
        accentBg: 'bg-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
    : {
        name: 'GenAI99',
        admins: 4,
        counselors: 10,
        trainers: 16,
        students: 1880,
        revenue: '₹ 58,15,000',
        batches: 12,
        courses: 9,
        accentBg: 'bg-sky-600',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${stats.badgeBg}`}>
              {stats.name}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            High-level overview of staff, admissions, active cohorts, and fee collection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('users')}
            className={`px-3.5 py-2 rounded-lg text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-colors ${
              isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Admin
          </button>
          <button
            onClick={() => onNavigate('whatsapp')}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            WhatsApp Logs
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Branch Admins</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.admins} Active</div>
            <p className="text-xs text-slate-500 mt-1">Super Admin provisioned</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Counselors & Trainers</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.counselors} Counselors</div>
            <p className="text-xs text-slate-500 mt-1">+ {stats.trainers} Faculty Members</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.students.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Across {stats.batches} live batches</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Fees Collected</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.revenue}</div>
            <p className="text-xs text-slate-500 mt-1">Reconciled & Settled</p>
          </div>
        </div>
      </div>

      {/* Operations & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Current Academic Cohorts</h3>
              <p className="text-xs text-slate-500">Live batches running under {stats.name}</p>
            </div>
            <button
              onClick={() => onNavigate('brand')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Details &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-800">
                {isTeluguAI ? 'Full-Stack AI Bootcamp (Telugu)' : 'Enterprise AI Agents (Cohort 4)'}
              </div>
              <div className="text-slate-500 mt-1">240 Enrolled • Trainer: Suresh V.</div>
              <div className="mt-2 text-[11px] text-emerald-700 font-medium">Classes Daily: 7:00 PM - 9:00 PM</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-800">
                {isTeluguAI ? 'Python & Data Engineering' : 'Advanced RAG & LLMOps'}
              </div>
              <div className="text-slate-500 mt-1">180 Enrolled • Trainer: Kavitha R.</div>
              <div className="mt-2 text-[11px] text-emerald-700 font-medium">Classes: Mon, Wed, Fri</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-800">Payment Gateway Status</div>
              <div className="text-slate-500 mt-1">
                {isTeluguAI ? 'Razorpay UPI & Netbanking' : 'Stripe Global Multi-Currency'}
              </div>
              <div className="mt-2 text-[11px] text-emerald-700 font-medium">Webhook Connected (0 Errors)</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-800">WhatsApp Notification Status</div>
              <div className="text-slate-500 mt-1">Meta Business Cloud API v21.0</div>
              <div className="mt-2 text-[11px] text-emerald-700 font-medium">Auto-Delivery Active</div>
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-500 mb-4">Direct shortcuts to common tasks</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('users')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Manage Admins</div>
                  <div className="text-[11px] text-slate-500">Create or deactivate branch admins</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('roles')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Roles & Permissions</div>
                  <div className="text-[11px] text-slate-500">View access rules for counselors & trainers</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('audit')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Activity Logs</div>
                  <div className="text-[11px] text-slate-500">View recent changes and login events</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Database Status</span>
            <span className="text-emerald-600 font-medium">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
