'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  BookOpen,
  FileText,
  FileCheck,
  HelpCircle,
  Award,
  LogOut,
  ArrowRightLeft,
  Menu,
  X
} from 'lucide-react';

import { TrainerDashboard } from './TrainerDashboard';
import { TrainerBatches } from './TrainerBatches';
import { ClassSchedule } from './ClassSchedule';
import { AttendanceMarker } from './AttendanceMarker';
import { LearningMaterials } from './LearningMaterials';
import { AssignmentManager } from './AssignmentManager';
import { SubmissionsGrading } from './SubmissionsGrading';
import { QuizBuilder } from './QuizBuilder';
import { StudentProgressReports } from './StudentProgressReports';

interface TrainerLayoutProps {
  activeBrand: 'teluguai' | 'genai99';
  userName: string;
  onLogout: () => void;
  onSwitchBrand: (brand: 'teluguai' | 'genai99') => void;
}

export const TrainerLayout: React.FC<TrainerLayoutProps> = ({
  activeBrand,
  userName,
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
    { id: 'batches', label: 'My Cohorts', icon: Users },
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    { id: 'attendance', label: 'Live Attendance', icon: UserCheck },
    { id: 'materials', label: 'Learning Materials', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'submissions', label: 'Submissions & Grading', icon: FileCheck },
    { id: 'quizzes', label: 'Quiz Builder', icon: HelpCircle },
    { id: 'progress', label: 'Student Progress', icon: Award },
  ];

  const handleNavigate = (tab: string) => {
    // Handle aliases if needed
    if (tab === 'schedule') setCurrentTab('timetable');
    else if (tab === 'grading') setCurrentTab('submissions');
    else setCurrentTab(tab);
  };

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
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                  Faculty Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">Instructor: {userName} • {brandSubdomain}</p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSwitchBrand(isTeluguAI ? 'genai99' : 'teluguai')}
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
              Faculty Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'timetable' && currentTab === 'schedule') ||
                (item.id === 'submissions' && currentTab === 'grading');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigate(item.id);
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
                <p className="text-[11px] text-slate-400 truncate">Senior Faculty</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-5 sm:p-7 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <TrainerDashboard activeBrand={activeBrand} onNavigate={handleNavigate} />
          )}

          {currentTab === 'batches' && (
            <TrainerBatches activeBrand={activeBrand} />
          )}

          {(currentTab === 'timetable' || currentTab === 'schedule') && (
            <ClassSchedule activeBrand={activeBrand} />
          )}

          {currentTab === 'attendance' && (
            <AttendanceMarker activeBrand={activeBrand} />
          )}

          {currentTab === 'materials' && (
            <LearningMaterials activeBrand={activeBrand} />
          )}

          {currentTab === 'assignments' && (
            <AssignmentManager
              activeBrand={activeBrand}
              onViewSubmissions={() => setCurrentTab('submissions')}
            />
          )}

          {(currentTab === 'submissions' || currentTab === 'grading') && (
            <SubmissionsGrading activeBrand={activeBrand} />
          )}

          {currentTab === 'quizzes' && (
            <QuizBuilder activeBrand={activeBrand} />
          )}

          {currentTab === 'progress' && (
            <StudentProgressReports activeBrand={activeBrand} />
          )}
        </main>
      </div>
    </div>
  );
};
