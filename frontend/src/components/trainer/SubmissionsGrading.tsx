'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  MessageSquare,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Modal } from '../shared/Modal';

interface SubmissionsGradingProps {
  activeBrand: 'teluguai' | 'genai99';
  selectedAssignmentFilter?: string;
}

interface StudentSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  batchName: string;
  submissionDate: string;
  repoUrl: string;
  studentNotes: string;
  maxScore: number;
  score: number | null;
  feedback: string;
  status: 'pending' | 'graded' | 'resubmit';
  brand: 'teluguai' | 'genai99';
}

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  // TeluguAI
  {
    id: 'sub-1',
    studentName: 'Sai Kiran',
    studentEmail: 'saikiran.dev@gmail.com',
    assignmentTitle: 'Project 3: Telugu Voice Assistant with Whisper & FastAPI',
    batchName: 'Python AI Evening Cohort #12',
    submissionDate: 'Yesterday at 11:20 PM',
    repoUrl: 'https://github.com/saikiran-dev/telugu-voice-assistant',
    studentNotes: 'Implemented FastAPI streaming with chunked audio decoding. Tested with 15 Telugu spoken audio samples.',
    maxScore: 100,
    score: null,
    feedback: '',
    status: 'pending',
    brand: 'teluguai',
  },
  {
    id: 'sub-2',
    studentName: 'Deepika Rani',
    studentEmail: 'deepika.rani@yahoo.com',
    assignmentTitle: 'Project 3: Telugu Voice Assistant with Whisper & FastAPI',
    batchName: 'Python AI Evening Cohort #12',
    submissionDate: '2 days ago',
    repoUrl: 'https://github.com/deepikarani/fastapi-whisper-telugu',
    studentNotes: 'Added custom Pydantic models for validation and response metadata formatting.',
    maxScore: 100,
    score: 96,
    feedback: 'Outstanding architecture! Clean error handling for unrecognised Telugu phonemes and crisp documentation.',
    status: 'graded',
    brand: 'teluguai',
  },
  {
    id: 'sub-3',
    studentName: 'Bhavani Shankar',
    studentEmail: 'bhavani.shankar@gmail.com',
    assignmentTitle: 'Project 3: Telugu Voice Assistant with Whisper & FastAPI',
    batchName: 'Python AI Evening Cohort #12',
    submissionDate: '3 days ago',
    repoUrl: 'https://github.com/bhavani-s/voice-bot-telugu',
    studentNotes: 'Audio transcription works but latency is around 4 seconds.',
    maxScore: 100,
    score: null,
    feedback: 'Please implement asynchronous audio processing and caching to reduce latency below 1.5s.',
    status: 'resubmit',
    brand: 'teluguai',
  },
  {
    id: 'sub-4',
    studentName: 'K. Sravani',
    studentEmail: 'sravani.k@gmail.com',
    assignmentTitle: 'Lab 4: Supervised Classification with Scikit-Learn',
    batchName: 'Machine Learning Weekend Batch #5',
    submissionDate: '13 Oct 2026',
    repoUrl: 'https://github.com/sravani-k/ml-random-forests',
    studentNotes: 'Achieved 94.2% test F1 score with 5-fold cross-validation.',
    maxScore: 100,
    score: 95,
    feedback: 'Great visualization of ROC-AUC curve and confusion matrix.',
    status: 'graded',
    brand: 'teluguai',
  },
  // GenAI99
  {
    id: 'sub-5',
    studentName: 'Dr. Arjun Mehta',
    studentEmail: 'arjun.mehta@healthtech.ai',
    assignmentTitle: 'Capstone 1: Self-Correcting Coding Agent with LangGraph',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    submissionDate: 'Today at 08:45 AM',
    repoUrl: 'https://github.com/arjunmehta/langgraph-reflection-agent',
    studentNotes: 'Built state graph with cycle detection and Python AST validation sandbox.',
    maxScore: 100,
    score: null,
    feedback: '',
    status: 'pending',
    brand: 'genai99',
  },
  {
    id: 'sub-6',
    studentName: 'Priyanka Sharma',
    studentEmail: 'priyanka.s@fintechcorp.io',
    assignmentTitle: 'Capstone 1: Self-Correcting Coding Agent with LangGraph',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    submissionDate: 'Yesterday at 04:10 PM',
    repoUrl: 'https://github.com/priyanka-s/langgraph-code-agent',
    studentNotes: 'Integrated Claude 3.5 Sonnet tool call parser and unit test runner.',
    maxScore: 100,
    score: 98,
    feedback: 'Exceptional work. Self-correction converges within 1-2 attempts on 95% of synthetic test cases.',
    status: 'graded',
    brand: 'genai99',
  },
  {
    id: 'sub-7',
    studentName: 'Rohan Nambiar',
    studentEmail: 'rohan.n@cloudscale.net',
    assignmentTitle: 'Benchmark: Hybrid RAG vs Vanilla RAG on Financial 10-K Filings',
    batchName: 'Enterprise Production RAG - Cohort 2',
    submissionDate: '12 Oct 2026',
    repoUrl: 'https://github.com/rohan-n/milvus-hybrid-search-bench',
    studentNotes: 'Benchmarked 2,000 queries with reciprocal rank fusion (RRF).',
    maxScore: 100,
    score: 92,
    feedback: 'Very thorough metrics. Consider evaluating token cost trade-offs next.',
    status: 'graded',
    brand: 'genai99',
  },
];

export const SubmissionsGrading: React.FC<SubmissionsGradingProps> = ({
  activeBrand,
  selectedAssignmentFilter,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded' | 'resubmit'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubmission, setActiveSubmission] = useState<StudentSubmission | null>(null);

  // Evaluation form modal state
  const [scoreInput, setScoreInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [decisionStatus, setDecisionStatus] = useState<'graded' | 'resubmit'>('graded');

  const filtered = submissions.filter((s) => {
    if (s.brand !== activeBrand) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (
      searchTerm &&
      !s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !s.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const openEvaluationModal = (sub: StudentSubmission) => {
    setActiveSubmission(sub);
    setScoreInput(sub.score ?? 85);
    setFeedbackInput(sub.feedback || '');
    setDecisionStatus(sub.status === 'resubmit' ? 'resubmit' : 'graded');
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === activeSubmission.id
          ? {
              ...s,
              score: decisionStatus === 'graded' ? scoreInput : null,
              feedback: feedbackInput,
              status: decisionStatus,
            }
          : s
      )
    );

    setActiveSubmission(null);
  };

  const pendingCount = submissions.filter(
    (s) => s.brand === activeBrand && s.status === 'pending'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Submissions & Grading Queue</h1>
            {pendingCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {pendingCount} Awaiting Review
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Review code repositories, assess lab assignments, and provide qualitative feedback.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or assignment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'pending', 'graded', 'resubmit'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all'
                ? 'All Submissions'
                : status === 'pending'
                ? 'Pending Review'
                : status === 'graded'
                ? 'Graded'
                : 'Revision Requested'}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Assignment / Cohort</th>
              <th className="py-3 px-4">Submitted At</th>
              <th className="py-3 px-4">Code / Project Link</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Review Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div>
                    <p className="font-bold text-slate-900">{item.studentName}</p>
                    <p className="text-[11px] text-slate-400">{item.studentEmail}</p>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div>
                    <p className="font-semibold text-slate-800 line-clamp-1">
                      {item.assignmentTitle}
                    </p>
                    <p className="text-[11px] text-slate-500">{item.batchName}</p>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-500 text-[11px]">{item.submissionDate}</td>

                <td className="py-3.5 px-4">
                  <a
                    href={item.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                </td>

                <td className="py-3.5 px-4">
                  {item.score !== null ? (
                    <span className="font-bold text-slate-900">
                      {item.score} / {item.maxScore}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not graded</span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      item.status === 'graded'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {item.status === 'graded' && <CheckCircle2 className="w-3 h-3" />}
                    {item.status === 'pending' && <Clock className="w-3 h-3" />}
                    {item.status === 'resubmit' && <AlertCircle className="w-3 h-3" />}
                    {item.status === 'graded' && 'Graded'}
                    {item.status === 'pending' && 'Pending'}
                    {item.status === 'resubmit' && 'Needs Revision'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => openEvaluationModal(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                      item.status === 'pending'
                        ? isTeluguAI
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-sky-600 hover:bg-sky-700 text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.status === 'pending' ? 'Review & Grade' : 'Edit Evaluation'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {activeSubmission && (
        <Modal
          isOpen={!!activeSubmission}
          onClose={() => setActiveSubmission(null)}
          title={`Grade Submission: ${activeSubmission.studentName}`}
        >
          <form onSubmit={handleSaveEvaluation} className="space-y-4">
            {/* Submission metadata preview */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  {activeSubmission.assignmentTitle}
                </span>
                <span className="text-slate-400">{activeSubmission.submissionDate}</span>
              </div>

              {activeSubmission.studentNotes && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-slate-600 italic">
                  "{activeSubmission.studentNotes}"
                </div>
              )}

              <div>
                <a
                  href={activeSubmission.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Student Code in New Tab ({activeSubmission.repoUrl})
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evaluation Outcome
                </label>
                <select
                  value={decisionStatus}
                  onChange={(e) => setDecisionStatus(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-slate-400 font-medium"
                >
                  <option value="graded">Approve & Grade</option>
                  <option value="resubmit">Request Resubmission</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marks Awarded (Max: {activeSubmission.maxScore})
                </label>
                <input
                  type="number"
                  min="0"
                  max={activeSubmission.maxScore}
                  disabled={decisionStatus === 'resubmit'}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400 font-bold disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructor Constructive Critique & Feedback
              </label>
              <textarea
                rows={4}
                required
                placeholder="Give constructive feedback highlighting architectural strengths and areas of improvement..."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSubmission(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs ${
                  isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                Save Evaluation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
