'use client';

import React from 'react';
import {
  Video,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  HelpCircle,
  ArrowRight,
  Users,
} from 'lucide-react';

import { studentApi, type BrandId, type StudentDashboard as DashboardData } from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentDashboardProps {
  activeBrand: BrandId;
  studentEmail: string;
  userName: string;
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeBrand,
  studentEmail,
  userName,
  onNavigate,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const { data, loading, error, reload } = useStudentResource<DashboardData>(
    `${studentEmail}:${activeBrand}`,
    () => studentApi.getDashboard(activeBrand),
  );

  if (loading) return <LoadingPanel label="Loading your dashboard…" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;
  if (!data) return null;

  const brandName = isTeluguAI ? 'TeluguAI' : 'GenAI99';
  const nextSession = data.nextSession;
  const pendingAssignments = Math.max(0, data.totalAssignments - data.assignmentsDone);
  const attendanceEligible = data.attendanceRate >= 80;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isTeluguAI
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              {brandName} Academy
            </span>
            <span className="text-xs text-slate-400">• Active Learner</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Namaste & Welcome, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your curriculum progress, attend live lectures, review feedback, and prepare for certification.
          </p>
        </div>

        {nextSession?.isToday && (
          <a
            href={nextSession.roomUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-xs shadow-xs transition-colors shrink-0 ${
              isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Join Live Lecture</span>
          </a>
        )}
      </div>

      {/* Enrolled Program Hero Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {data.batchName}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2">{data.courseTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Faculty: {data.instructor}</p>
          </div>

          <div className="lg:text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
              Curriculum Progress
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {data.progress}% <span className="text-xs font-normal text-slate-500">Completed</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 my-4 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isTeluguAI ? 'bg-emerald-600' : 'bg-sky-600'
            }`}
            style={{ width: `${data.progress}%` }}
          />
        </div>

        {/* 4 Stats Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-left transition-colors"
          >
            <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
              <span>Attendance</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{data.attendanceRate}%</div>
            <span
              className={`text-[11px] font-medium ${
                attendanceEligible ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {attendanceEligible ? 'Eligible for Certificate' : 'Below 80% threshold'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('assignments')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-left transition-colors"
          >
            <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
              <span>Assignments</span>
              <FileText className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {data.assignmentsDone} / {data.totalAssignments}
            </div>
            <span className="text-[11px] text-slate-500">{pendingAssignments} Pending review</span>
          </button>

          <button
            onClick={() => onNavigate('quizzes')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-left transition-colors"
          >
            <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
              <span>Quiz Average</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{data.quizAvg}%</div>
            <span className="text-[11px] text-emerald-600 font-medium">Top 10% in Cohort</span>
          </button>

          <button
            onClick={() => onNavigate('fees')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-left transition-colors"
          >
            <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
              <span>Tuition Fee</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-700 mt-1">{data.feeStatus}</div>
            <span className="text-[11px] text-slate-500">Receipts available</span>
          </button>
        </div>
      </div>

      {/* Grid: Next Live Lecture + Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Live Lecture Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          {nextSession ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-500" />
                    {nextSession.isToday ? 'Live Session Scheduled Today' : 'Upcoming Session'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Class {Math.min(data.completedSessions + 1, data.totalSessions)} of {data.totalSessions}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{nextSession.topic}</h3>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">
                      {nextSession.date} • {nextSession.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      Instructor: <strong>{nextSession.instructor}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <a
                  href={nextSession.roomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex-1 py-2.5 rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs ${
                    isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Launch Live Meeting Room
                </a>

                <button
                  onClick={() => onNavigate('curriculum')}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  View Lesson Notes
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <Calendar className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium text-slate-600">No upcoming live sessions</p>
              <p className="text-xs mt-0.5">Check back later for your next scheduled class.</p>
            </div>
          )}
        </div>

        {/* Announcements & Mentorship */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Cohort Announcements</h3>
            <p className="text-xs text-slate-500 mb-4">Direct updates from your trainers</p>

            <div className="space-y-3">
              {data.announcements.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{item.message}</p>
                </div>
              ))}

              {data.announcements.length === 0 && (
                <p className="text-xs text-slate-400">No announcements yet.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('materials')}
              className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore Study Materials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
