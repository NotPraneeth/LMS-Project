'use client';

import React, { useState } from 'react';
import { ExternalLink, Upload, Calendar, Award, Loader2 } from 'lucide-react';

import { studentApi, type Assignment, type BrandId } from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { Modal } from '../shared/Modal';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentAssignmentsProps {
  activeBrand: BrandId;
  studentEmail: string;
}

export const StudentAssignments: React.FC<StudentAssignmentsProps> = ({
  activeBrand,
  studentEmail,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [activeModalItem, setActiveModalItem] = useState<Assignment | null>(null);
  const [repoInput, setRepoInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, loading, error, reload, mutate } = useStudentResource<Assignment[]>(
    `${studentEmail}:${activeBrand}`,
    () => studentApi.getAssignments(activeBrand),
  );
  const assignments = data ?? [];

  const openSubmitModal = (item: Assignment) => {
    setActiveModalItem(item);
    setRepoInput(item.submittedRepoUrl || '');
    setNotesInput(item.submissionNotes || '');
    setSubmitError(null);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalItem || !repoInput.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await studentApi.submitAssignment(
        activeModalItem.id,
        { repoUrl: repoInput.trim(), notes: notesInput.trim() },
        activeBrand,
      );
      mutate((prev) => (prev ?? []).map((a) => (a.id === updated.id ? updated : a)));
      setActiveModalItem(null);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingPanel label="Loading assignments…" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assignments & Capstone Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit homework repositories, view evaluation marks, and read instructor critiques.
          </p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {item.module}
                </span>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    item.status === 'graded'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.status === 'submitted'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : item.status === 'resubmit'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  {item.status === 'graded' && '✓ Graded & Approved'}
                  {item.status === 'submitted' && '⏳ Submitted (Under Faculty Review)'}
                  {item.status === 'resubmit' && '⚠ Revision Requested'}
                  {item.status === 'pending' && 'Open for Submission'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Due: <strong className="text-slate-800">{item.dueDate}</strong>
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-1">{item.instructions}</p>
            </div>

            {/* Score & Feedback Box if Graded */}
            {item.status === 'graded' && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Score Awarded: {item.score} / {item.maxScore} Marks
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Evaluation Complete</span>
                </div>
                {item.instructorFeedback && (
                  <p className="text-emerald-900 text-xs italic">&quot;{item.instructorFeedback}&quot;</p>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 text-xs">
                {item.starterRepoUrl && (
                  <a
                    href={item.starterRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Starter Template
                  </a>
                )}

                {item.submittedRepoUrl && (
                  <a
                    href={item.submittedRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    My Submitted Code
                  </a>
                )}
              </div>

              <div>
                {item.status === 'pending' || item.status === 'resubmit' ? (
                  <button
                    onClick={() => openSubmitModal(item)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-semibold text-xs shadow-xs ${
                      isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{item.status === 'resubmit' ? 'Resubmit Solution' : 'Submit Solution'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openSubmitModal(item)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                  >
                    Update Submission Link
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {activeModalItem && (
        <Modal
          isOpen={!!activeModalItem}
          onClose={() => (submitting ? undefined : setActiveModalItem(null))}
          title={`Submit Assignment: ${activeModalItem.title}`}
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-800">Due Date:</strong> {activeModalItem.dueDate} •{' '}
              <strong className="text-slate-800">Max Score:</strong> {activeModalItem.maxScore} pts
            </div>

            {submitError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Repository or Google Colab Link
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/your-username/project-repo"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes for Instructor (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention how to run your tests, any unique features, or questions for your trainer..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-60 ${
                  isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {submitting ? 'Submitting…' : 'Confirm & Submit Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
