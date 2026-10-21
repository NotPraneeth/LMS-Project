'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FolderOpen,
  FileText,
  HelpCircle,
  CalendarCheck,
  DollarSign,
  Award,
  LogOut,
  ArrowRightLeft,
  Menu,
  X
} from 'lucide-react';

import { StudentDashboard } from './StudentDashboard';
import { StudentCurriculum } from './StudentCurriculum';
import { StudentLiveClasses } from './StudentLiveClasses';
import { StudentMaterials } from './StudentMaterials';
import { StudentAssignments } from './StudentAssignments';
import { StudentQuizzes } from './StudentQuizzes';
import { StudentAttendance } from './StudentAttendance';
import { StudentFees } from './StudentFees';
import { StudentCertificates } from './StudentCertificates';

type BrandId = 'teluguai' | 'genai99';

interface StudentLayoutProps {
  activeBrand: BrandId;
  userName: string;
  userEmail: string;
  accessibleBrands?: BrandId[];
  onLogout: () => void;
  onSwitchBrand: (brand: BrandId) => void;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
  activeBrand,
  userName,
  userEmail,
  accessibleBrands,
  onLogout,
  onSwitchBrand,
}) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isTeluguAI = activeBrand === 'teluguai';
  const brandDisplayName = isTeluguAI ? 'TeluguAI' : 'GenAI99';
  const brandSubdomain = isTeluguAI ? 'teluguai.com' : 'genai99.com';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'curriculum', label: 'Curriculum & Lessons', icon: BookOpen },
    { id: 'live', label: 'Live Lectures & Replays', icon: Video },
    { id: 'materials', label: 'Study Materials', icon: FolderOpen },
    { id: 'assignments', label: 'Assignments & Projects', icon: FileText },
    { id: 'quizzes', label: 'Quizzes & Tests', icon: HelpCircle },
    { id: 'attendance', label: 'Attendance Record', icon: CalendarCheck },
    { id: 'fees', label: 'Tuition & Receipts', icon: DollarSign },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${
                isTeluguAI ? 'bg-emerald-600' : 'bg-sky-600'
              }`}
            >
              {isTeluguAI ? 'TA' : 'G99'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{brandDisplayName}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  Student Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">Learner: {userName} • {brandSubdomain}</p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {(() => {
            const otherBrand: BrandId = isTeluguAI ? 'genai99' : 'teluguai';
            const canSwitch = (accessibleBrands ?? [activeBrand]).includes(otherBrand);
            if (!canSwitch) return null;
            return (
              <button
                onClick={() => onSwitchBrand(otherBrand)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  isTeluguAI
                    ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch to</span>
                <span>{isTeluguAI ? 'GenAI99' : 'TeluguAI'}</span>
              </button>
            );
          })()}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white flex flex-col justify-between transition-transform duration-200 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Student Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? isTeluguAI
                        ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                        : 'bg-sky-50 text-sky-800 font-semibold border border-sky-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? isTeluguAI
                          ? 'text-emerald-600'
                          : 'text-sky-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User profile footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  isTeluguAI ? 'bg-emerald-600' : 'bg-sky-600'
                }`}
              >
                {userName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-5 sm:p-7 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <StudentDashboard
              activeBrand={activeBrand}
              studentEmail={userEmail}
              userName={userName}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'curriculum' && (
            <StudentCurriculum activeBrand={activeBrand} studentEmail={userEmail} />
          )}

          {currentTab === 'live' && (
            <StudentLiveClasses activeBrand={activeBrand} studentEmail={userEmail} />
          )}

          {currentTab === 'materials' && (
            <StudentMaterials activeBrand={activeBrand} studentEmail={userEmail} />
          )}

          {currentTab === 'assignments' && (
            <StudentAssignments activeBrand={activeBrand} studentEmail={userEmail} />
          )}

          {currentTab === 'quizzes' && (
            <StudentQuizzes activeBrand={activeBrand} studentEmail={userEmail} />
          )}

          {currentTab === 'attendance' && (
            <StudentAttendance activeBrand={activeBrand} studentEmail={userEmail} />
          )}

          {currentTab === 'fees' && (
            <StudentFees activeBrand={activeBrand} studentEmail={userEmail} />
          )}

          {currentTab === 'certificates' && (
            <StudentCertificates activeBrand={activeBrand} studentEmail={userEmail} userName={userName} />
          )}
        </main>
      </div>
    </div>
  );
};
