'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  Users,
  UserCheck,
  DollarSign,
  Bell,
  LogOut,
  ArrowRightLeft,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

import { AdminDashboard } from './AdminDashboard';
import { CourseManagement } from './CourseManagement';
import { BatchManagement } from './BatchManagement';
import { StudentManagement } from './StudentManagement';
import { StaffManagement } from './StaffManagement';
import { AttendanceManagement } from './AttendanceManagement';
import { FeeManagement } from './FeeManagement';
import { Announcements } from './Announcements';
import { AdminLogin } from './AdminLogin';

interface AdminLayoutProps {
  initialBrand?: 'teluguai' | 'genai99';
  onLogout?: () => void;
  onSwitchToSuperAdmin?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  initialBrand = 'teluguai',
  onLogout,
  onSwitchToSuperAdmin,
}) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeBrand, setActiveBrand] = useState<'teluguai' | 'genai99'>(initialBrand);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isTeluguAI = activeBrand === 'teluguai';
  const brandDisplayName = isTeluguAI ? 'TeluguAI' : 'GenAI99';
  const brandSubdomain = isTeluguAI ? 'teluguai.com' : 'genai99.com';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses & Curriculum', icon: BookOpen },
    { id: 'batches', label: 'Batches & Timetable', icon: Calendar },
    { id: 'students', label: 'Student Directory', icon: GraduationCap },
    { id: 'staff', label: 'Faculty & Counselors', icon: Users },
    { id: 'attendance', label: 'Attendance Tracker', icon: UserCheck },
    { id: 'fees', label: 'Fees & Invoicing', icon: DollarSign },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const handleSwitchBrand = (brand: 'teluguai' | 'genai99') => {
    setActiveBrand(brand);
    setCurrentTab('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={(brand) => {
          setActiveBrand(brand);
          setIsAuthenticated(true);
          setCurrentTab('dashboard');
        }}
      />
    );
  }

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
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isTeluguAI
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}
                >
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-500">{brandSubdomain}</p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {onSwitchToSuperAdmin && (
            <button
              onClick={onSwitchToSuperAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              title="Return to Super Admin root portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Super Admin Portal</span>
            </button>
          )}

          <button
            onClick={() => handleSwitchBrand(isTeluguAI ? 'genai99' : 'teluguai')}
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
            onClick={() => {
              if (onLogout) onLogout();
              else setIsAuthenticated(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white flex flex-col justify-between transition-transform duration-200 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Menu
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
                          ? 'text-emerald-700'
                          : 'text-sky-700'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50/50">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Branch Access</span>
              <span className="font-medium text-emerald-600">Active</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Campus: <span className="font-semibold text-slate-700">{brandDisplayName}</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <AdminDashboard
              activeBrand={activeBrand}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'courses' && (
            <CourseManagement activeBrand={activeBrand} />
          )}

          {currentTab === 'batches' && (
            <BatchManagement activeBrand={activeBrand} />
          )}

          {currentTab === 'students' && (
            <StudentManagement activeBrand={activeBrand} />
          )}

          {currentTab === 'staff' && (
            <StaffManagement activeBrand={activeBrand} />
          )}

          {currentTab === 'attendance' && (
            <AttendanceManagement activeBrand={activeBrand} />
          )}

          {currentTab === 'fees' && (
            <FeeManagement activeBrand={activeBrand} />
          )}

          {currentTab === 'announcements' && (
            <Announcements activeBrand={activeBrand} />
          )}
        </main>
      </div>
    </div>
  );
};
