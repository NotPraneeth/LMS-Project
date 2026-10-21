'use client';

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Play,
  RotateCcw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import {
  studentApi,
  type BrandId,
  type QuizAttemptResult,
  type QuizPublic,
} from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { Modal } from '../shared/Modal';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentQuizzesProps {
  activeBrand: BrandId;
  studentEmail: string;
}

export const StudentQuizzes: React.FC<StudentQuizzesProps> = ({ activeBrand, studentEmail }) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const [activeQuiz, setActiveQuiz] = useState<QuizPublic | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, loading, error, reload, mutate } = useStudentResource<QuizPublic[]>(
    `${studentEmail}:${activeBrand}`,
    () => studentApi.getQuizzes(activeBrand),
  );
  const quizzes = data ?? [];

  const startQuiz = (quiz: QuizPublic) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setResult(null);
    setSubmitError(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleFinishQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const attempt = await studentApi.submitQuizAttempt(
        activeQuiz.id,
        answers,
        activeBrand,
      );
      setResult(attempt);
      mutate((prev) =>
        (prev ?? []).map((q) =>
          q.id === activeQuiz.id
            ? {
                ...q,
                status: 'completed',
                lastScore: attempt.scorePercent,
                attemptsCount: q.attemptsCount + 1,
              }
            : q,
        ),
      );
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingPanel label="Loading assessments…" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quizzes & Assessment Tests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Test your conceptual knowledge, earn badge points, and qualify for program certification.
          </p>
        </div>
      </div>

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {quiz.questionCount} Questions
                </span>

                {quiz.status === 'completed' ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {quiz.lastScore !== undefined && quiz.lastScore >= quiz.passPercentage
                      ? `Passed (${quiz.lastScore}%)`
                      : `Attempted (${quiz.lastScore ?? 0}%)`}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Ready to Take
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{quiz.title}</h3>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Time: <strong>{quiz.durationMinutes} mins</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Passing: <strong>{quiz.passPercentage}%</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                {quiz.status === 'completed' ? `Last attempt: ${quiz.lastScore ?? 0}%` : 'Untaken test'}
              </span>

              <button
                onClick={() => startQuiz(quiz)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                  quiz.status === 'completed'
                    ? 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    : isTeluguAI
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                {quiz.status === 'completed' ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Assessment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Quiz Taker Modal */}
      {activeQuiz && (
        <Modal
          isOpen={!!activeQuiz}
          onClose={() => (submitting ? undefined : setActiveQuiz(null))}
          title={`Assessment: ${activeQuiz.title}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {result ? (
              /* Results View */
              <div className="space-y-4 text-center py-2">
                <div
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                    result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {result.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {result.passed ? 'Congratulations! You Passed!' : 'Needs Review'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You answered {result.correctCount} out of {result.totalQuestions} questions correctly.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                  <div className="text-3xl font-extrabold text-slate-900">{result.scorePercent}%</div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Passing Requirement: {result.passPercentage}%
                  </span>
                </div>

                {/* Review Question Answers */}
                <div className="space-y-3 text-left pt-2">
                  <h4 className="text-xs font-bold text-slate-900">Review Answers & Explanations:</h4>
                  {result.review.map((q, idx) => (
                    <div
                      key={q.questionId}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        q.isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900">
                          {idx + 1}. {q.questionText}
                        </p>
                        {q.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Your choice:{' '}
                        <strong>
                          {q.selectedOptionIndex !== null ? q.options[q.selectedOptionIndex] : 'None'}
                        </strong>
                      </p>
                      {!q.isCorrect && (
                        <p className="text-emerald-800 text-[11px] font-semibold">
                          Correct answer: {q.options[q.correctOptionIndex]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                  >
                    Close Results
                  </button>
                </div>
              </div>
            ) : (
              /* Questions Taking View */
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <span>Questions: {activeQuiz.questions.length}</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Time Limit: {activeQuiz.durationMinutes} mins
                  </span>
                </div>

                {submitError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs">
                    {submitError}
                  </div>
                )}

                {activeQuiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <p className="text-xs font-bold text-slate-900">
                      {qIdx + 1}. {q.questionText}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                            answers[q.id] === oIdx
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-q-${q.id}`}
                            checked={answers[q.id] === oIdx}
                            onChange={() => handleSelectOption(q.id, oIdx)}
                            className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>
                            <strong className="mr-1">{String.fromCharCode(65 + oIdx)}.</strong>
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Answered: {answeredCount} of {activeQuiz.questions.length}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setActiveQuiz(null)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishQuiz}
                      disabled={answeredCount === 0 || submitting}
                      className={`px-4 py-2 rounded-lg text-white font-semibold text-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5 ${
                        isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                      }`}
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {submitting ? 'Grading…' : 'Submit Assessment'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
