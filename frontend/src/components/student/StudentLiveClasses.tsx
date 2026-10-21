'use client';

import React, { useState } from 'react';
import { Video, Clock, Users, CheckCircle2, PlayCircle, Download } from 'lucide-react';

import { studentApi, type BrandId, type ClassSession } from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentLiveClassesProps {
  activeBrand: BrandId;
  studentEmail: string;
}

export const StudentLiveClasses: React.FC<StudentLiveClassesProps> = ({
  activeBrand,
  studentEmail,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const { data: sessions, loading, error, reload } = useStudentResource<ClassSession[]>(
    `${studentEmail}:${activeBrand}`,
    () => studentApi.getLiveClasses(activeBrand),
  );

  if (loading) return <LoadingPanel label="Loading live lectures…" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;
  if (!sessions) return null;

  const filteredSessions = sessions.filter((s) => filter === 'all' || s.status === filter);
  const nextSession = sessions.find((s) => s.isToday);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Live Lectures & Replays</h1>
          <p className="text-sm text-slate-500 mt-1">
            Join scheduled interactive live classrooms and catch up on recorded sessions.
          </p>
        </div>

        {nextSession && (
          <a
            href={nextSession.roomUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-xs shadow-xs transition-colors shrink-0 ${
              isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            <Video className="w-4 h-4" />
            Join Today&apos;s Lecture
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-xs w-fit">
        {(
          [
            { id: 'all', label: 'All Classes' },
            { id: 'upcoming', label: 'Upcoming Today' },
            { id: 'completed', label: 'Past Class Replays' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
              session.isToday
                ? isTeluguAI
                  ? 'border-emerald-300 ring-2 ring-emerald-50'
                  : 'border-sky-300 ring-2 ring-sky-50'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {session.date}
                </span>

                {session.status === 'upcoming' ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-500" />
                    Live Today
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {session.attendanceStatus === 'absent' ? 'Missed' : 'Attended'}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-2">{session.topic}</h3>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{session.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instructor: {session.instructor}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {session.status === 'upcoming' ? (
                <a
                  href={session.roomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white font-semibold text-xs shadow-xs ${
                    isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Room
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  {session.recordingUrl && (
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Watch Replay
                    </a>
                  )}

                  {session.notesUrl && (
                    <a
                      href={session.notesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Class Notes
                    </a>
                  )}
                </div>
              )}

              <span className="text-[11px] text-slate-400">
                {session.status === 'upcoming' ? 'Google Meet / Zoom' : 'Archived'}
              </span>
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl py-12 text-center text-xs text-slate-400">
            No sessions in this view.
          </div>
        )}
      </div>
    </div>
  );
};
