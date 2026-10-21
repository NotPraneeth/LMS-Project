'use client';

import React from 'react';
import {
  Users,
  Video,
  Clock,
  Calendar,
  FileCheck,
  CheckCircle2,
  BookOpen,
  ArrowUpRight,
  Plus,
  HelpCircle,
  FileText
} from 'lucide-react';

interface TrainerDashboardProps {
  activeBrand: 'teluguai' | 'genai99';
  onNavigate: (tab: string) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({
  activeBrand,
  onNavigate,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const stats = isTeluguAI
    ? {
        brandName: 'TeluguAI',
        batches: 3,
        students: 124,
        classesToday: 2,
        pendingReviews: 14,
        attendanceRate: '94.2%',
      }
    : {
        brandName: 'GenAI99',
        batches: 2,
        students: 96,
        classesToday: 1,
        pendingReviews: 9,
        attendanceRate: '96.8%',
      };

  const nextClass = isTeluguAI
    ? {
        batch: 'Python AI Evening Cohort #12',
        course: 'FullStack Python & Vernacular AI Engineering',
        time: '07:00 PM - 08:30 PM IST',
        topic: 'Session 24: Building FastAPIs & Pydantic Data Models',
        roomUrl: 'https://meet.google.com/xyz-telugu-ai',
        enrolled: 48,
      }
    : {
        batch: 'Autonomous AI Agents - Global Cohort 4',
        course: 'Autonomous AI Agents & Multi-Modal LLMs',
        time: '07:30 PM - 09:30 PM IST',
        topic: 'Session 16: Multi-Agent Collaboration with LangGraph & CrewAI',
        roomUrl: 'https://zoom.us/j/9988221100',
        enrolled: 54,
      };

  const pendingSubmissions = isTeluguAI
    ? [
        { id: 'sub-1', student: 'Sai Kiran', task: 'Assignment 4: REST API with PostgreSQL', submittedAt: 'Today 11:20 AM' },
        { id: 'sub-2', student: 'Bhavani Shankar', task: 'Assignment 4: REST API with PostgreSQL', submittedAt: 'Yesterday' },
        { id: 'sub-3', student: 'Deepika Rani', task: 'Quiz 3: Python Generator Functions', submittedAt: 'Yesterday' },
      ]
    : [
        { id: 'sub-4', student: 'Alex Morgan', task: 'Capstone 1: Custom LangGraph Agent Tool', submittedAt: 'Today 09:00 AM' },
        { id: 'sub-5', student: 'Sarah Chen', task: 'Capstone 1: Custom LangGraph Agent Tool', submittedAt: 'Yesterday' },
      ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Faculty Dashboard</h1>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isTeluguAI
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              {stats.brandName} Instructor
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Overview of your active cohorts, today&apos;s lectures, attendance tracking, and grading queue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('materials')}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Materials
          </button>
          <button
            onClick={() => onNavigate('assignments')}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            New Assignment
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>My Active Cohorts</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.batches} Batches</div>
            <p className="text-xs text-slate-500 mt-1">{stats.students} Enrolled students</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Lectures Today</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{stats.classesToday} Sessions</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Next starting soon</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700">{stats.pendingReviews} To Grade</div>
            <p className="text-xs text-slate-500 mt-1">Assignments & Quizzes</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700">{stats.attendanceRate}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">High cohort engagement</p>
          </div>
        </div>
      </div>

      {/* Next Live Class Launcher */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Upcoming Live Session
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">• {nextClass.time}</span>
          </div>

          <h2 className="text-lg font-bold text-slate-900">{nextClass.topic}</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {nextClass.batch} • {nextClass.course} • {nextClass.enrolled} Enrolled Learners
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={nextClass.roomUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Video className="w-4 h-4" />
            Launch Live Classroom
          </a>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Grading Queue & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Submissions Awaiting Feedback</h3>
              <p className="text-xs text-slate-500">Student homework ready for score and feedback</p>
            </div>
            <button
              onClick={() => onNavigate('submissions')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Review All ({stats.pendingReviews}) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{sub.student}</div>
                  <div className="text-slate-600 mt-0.5">{sub.task}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Submitted: {sub.submittedAt}</div>
                </div>

                <button
                  onClick={() => onNavigate('submissions')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium self-start sm:self-auto"
                >
                  Grade Submission
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Faculty Shortcuts</h3>
            <p className="text-xs text-slate-500 mb-4">Quick tools for class delivery</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('timetable')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Weekly Timetable</div>
                  <div className="text-[11px] text-slate-500">View upcoming lecture slots</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('materials')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Learning Materials</div>
                  <div className="text-[11px] text-slate-500">Upload code repos, slides & recordings</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('quizzes')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Quiz & Test Builder</div>
                  <div className="text-[11px] text-slate-500">Create multiple choice tests</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('progress')}
                className="w-full p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">Progress & Certificates</div>
                  <div className="text-[11px] text-slate-500">Review student completion criteria</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Faculty Role: Verified Instructor</span>
            <span className="text-emerald-600 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
