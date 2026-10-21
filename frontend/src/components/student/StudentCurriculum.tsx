'use client';

import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  Code,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

import { studentApi, type BrandId, type Lesson, type Module } from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { Modal } from '../shared/Modal';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentCurriculumProps {
  activeBrand: BrandId;
  studentEmail: string;
}

const findLesson = (modules: Module[], lessonId: string): Lesson | undefined =>
  modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);

export const StudentCurriculum: React.FC<StudentCurriculumProps> = ({
  activeBrand,
  studentEmail,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [marking, setMarking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, reload, mutate } = useStudentResource<Module[]>(
    `${studentEmail}:${activeBrand}`,
    () => studentApi.getCurriculum(activeBrand),
  );
  const curriculum = data ?? [];

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const markLessonCompleted = async (lessonId: string) => {
    if (!selectedLesson || selectedLesson.id !== lessonId) return;
    setMarking(true);
    setActionError(null);
    try {
      const modules = await studentApi.completeLesson(lessonId, activeBrand);
      mutate(() => modules);
      const updated = findLesson(modules, lessonId);
      if (updated) setSelectedLesson(updated);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <LoadingPanel label="Loading curriculum…" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;

  const totalLessons = curriculum.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = curriculum.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.status === 'completed').length,
    0,
  );
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Curriculum & Syllabus</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access recorded lessons, interactive code demos, lecture transcripts, and slides.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Progress</div>
            <div className="text-sm font-bold text-slate-800">
              {completedLessons} / {totalLessons} Lessons
            </div>
          </div>
          <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${isTeluguAI ? 'bg-emerald-600' : 'bg-sky-600'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-700">{progressPercent}%</span>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {curriculum.map((mod) => {
          const isExpanded = expandedModules[mod.id] ?? true;
          const modCompleted = mod.lessons.filter((l) => l.status === 'completed').length;

          return (
            <div
              key={mod.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
            >
              {/* Module Header Toggle */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isTeluguAI ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    M{mod.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{mod.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{mod.lessons.length} Lessons</span>
                      <span>•</span>
                      <span>{mod.totalDuration}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">
                        {modCompleted}/{mod.lessons.length} Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Lessons List */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {mod.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {lesson.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : lesson.status === 'in_progress' ? (
                          <PlayCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {idx + 1}. {lesson.title}
                            </span>
                            {lesson.status === 'in_progress' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Current Topic
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{lesson.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:inline">{lesson.duration}</span>

                        {lesson.status !== 'locked' ? (
                          <button
                            onClick={() => setSelectedLesson(lesson)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                              lesson.status === 'in_progress'
                                ? isTeluguAI
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-sky-600 hover:bg-sky-700 text-white'
                                : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {lesson.status === 'completed' ? 'Review Lesson' : 'Watch Lecture'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium px-3 py-1.5">Locked</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lesson Details & Replay Modal */}
      {selectedLesson && (
        <Modal
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          title={`Lesson: ${selectedLesson.title}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Simulated Video Player */}
            <div className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden relative flex flex-col items-center justify-center text-white shadow-inner">
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-xs hover:bg-white/30 cursor-pointer transition-all">
                <PlayCircle className="w-12 h-12 text-white" />
              </div>
              <span className="text-xs text-slate-300 mt-3 font-medium">
                High-Definition Lecture Stream (Telugu & English Audio)
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Duration: {selectedLesson.duration}</span>
            </div>

            {/* Lesson summary */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900">Key Takeaways & Concepts</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedLesson.summary}</p>
            </div>

            {/* Code Snippet if present */}
            {selectedLesson.codeSnippet && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-slate-500" />
                    Lecture Code Sample
                  </span>
                  <span className="text-[11px] text-slate-400">Python 3.11</span>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto">
                  {selectedLesson.codeSnippet}
                </pre>
              </div>
            )}

            {actionError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs">
                {actionError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {selectedLesson.status !== 'completed' ? (
                <button
                  onClick={() => markLessonCompleted(selectedLesson.id)}
                  disabled={marking}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-semibold text-xs shadow-xs disabled:opacity-60 ${
                    isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  {marking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {marking ? 'Saving…' : 'Mark as Completed'}
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Lesson Completed
                </span>
              )}

              <button
                onClick={() => setSelectedLesson(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
