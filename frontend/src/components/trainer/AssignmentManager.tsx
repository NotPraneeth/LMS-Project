'use client';

import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Award
} from 'lucide-react';
import { Modal } from '../shared/Modal';

interface AssignmentManagerProps {
  activeBrand: 'teluguai' | 'genai99';
  onViewSubmissions?: (assignmentId: string) => void;
}

interface AssignmentItem {
  id: string;
  title: string;
  batchName: string;
  dueDate: string;
  maxScore: number;
  totalSubmissions: number;
  enrolledStudents: number;
  gradedCount: number;
  averageScore: number;
  status: 'active' | 'reviewing' | 'closed';
  instructions: string;
  referenceUrl: string;
  brand: 'teluguai' | 'genai99';
}

const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  // TeluguAI
  {
    id: 'asg-1',
    title: 'Project 3: Telugu Voice Assistant with Whisper & FastAPI',
    batchName: 'Python AI Evening Cohort #12',
    dueDate: '20 Oct 2026',
    maxScore: 100,
    totalSubmissions: 34,
    enrolledStudents: 48,
    gradedCount: 22,
    averageScore: 88,
    status: 'active',
    instructions: 'Build an end-to-end FastAPI service that accepts Telugu audio (.wav), transcribes it using OpenAI Whisper API, and generates a Telugu summary with GPT-4o.',
    referenceUrl: 'https://github.com/teluguai/project-3-whisper-starter',
    brand: 'teluguai',
  },
  {
    id: 'asg-2',
    title: 'Assignment 2: Vector Search & Embeddings with ChromaDB',
    batchName: 'Python AI Evening Cohort #12',
    dueDate: '12 Oct 2026',
    maxScore: 50,
    totalSubmissions: 46,
    enrolledStudents: 48,
    gradedCount: 46,
    averageScore: 44,
    status: 'closed',
    instructions: 'Index 500 Telugu news articles into ChromaDB and write cosine similarity search queries.',
    referenceUrl: 'https://github.com/teluguai/assignment-2-chromadb',
    brand: 'teluguai',
  },
  {
    id: 'asg-3',
    title: 'Lab 4: Supervised Classification with Scikit-Learn',
    batchName: 'Machine Learning Weekend Batch #5',
    dueDate: '22 Oct 2026',
    maxScore: 100,
    totalSubmissions: 28,
    enrolledStudents: 36,
    gradedCount: 10,
    averageScore: 82,
    status: 'reviewing',
    instructions: 'Implement Random Forest and tune hyperparameters with GridSearchCV to achieve > 92% F1 score.',
    referenceUrl: 'https://github.com/teluguai/ml-lab-4-classification',
    brand: 'teluguai',
  },
  // GenAI99
  {
    id: 'asg-4',
    title: 'Capstone 1: Self-Correcting Coding Agent with LangGraph',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    dueDate: '25 Oct 2026',
    maxScore: 100,
    totalSubmissions: 42,
    enrolledStudents: 52,
    gradedCount: 28,
    averageScore: 91,
    status: 'active',
    instructions: 'Implement a reflective agent that generates Python code, runs unit tests in an isolated sandbox, catches stack traces, and self-repairs code within 3 retry loops.',
    referenceUrl: 'https://github.com/genai99-enterprise/langgraph-coding-agent-starter',
    brand: 'genai99',
  },
  {
    id: 'asg-5',
    title: 'Benchmark: Hybrid RAG vs Vanilla RAG on Financial 10-K Filings',
    batchName: 'Enterprise Production RAG - Cohort 2',
    dueDate: '18 Oct 2026',
    maxScore: 100,
    totalSubmissions: 36,
    enrolledStudents: 44,
    gradedCount: 36,
    averageScore: 89,
    status: 'reviewing',
    instructions: 'Use Milvus + BM25 hybrid indexing on SEC 10-K documents and compare retrieval precision using RAGAS metric framework.',
    referenceUrl: 'https://github.com/genai99-enterprise/rag-benchmarks-milvus',
    brand: 'genai99',
  },
];

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  activeBrand,
  onViewSubmissions,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [batchName, setBatchName] = useState(
    isTeluguAI ? 'Python AI Evening Cohort #12' : 'Autonomous AI Agents - Global Cohort 4'
  );
  const [dueDate, setDueDate] = useState('28 Oct 2026');
  const [maxScore, setMaxScore] = useState(100);
  const [instructions, setInstructions] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');

  const filtered = assignments.filter((a) => a.brand === activeBrand);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAssignment: AssignmentItem = {
      id: `asg-${Date.now()}`,
      title,
      batchName,
      dueDate,
      maxScore,
      totalSubmissions: 0,
      enrolledStudents: isTeluguAI ? 48 : 52,
      gradedCount: 0,
      averageScore: 0,
      status: 'active',
      instructions,
      referenceUrl,
      brand: activeBrand,
    };

    setAssignments([newAssignment, ...assignments]);
    setIsModalOpen(false);
    setTitle('');
    setInstructions('');
    setReferenceUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assignments & Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish capstones, coding homework, evaluate student progress, and set grading criteria.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-xs transition-colors shadow-xs ${
            isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          Create New Assignment
        </button>
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => {
          const submissionPercentage = Math.round(
            (item.totalSubmissions / item.enrolledStudents) * 100
          );
          const pendingGrading = item.totalSubmissions - item.gradedCount;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.batchName}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        item.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'reviewing'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.status === 'active' && 'Active • Submissions Open'}
                      {item.status === 'reviewing' && 'Reviewing Submissions'}
                      {item.status === 'closed' && 'Closed'}
                    </span>
                    <span className="text-xs text-slate-400">Max Score: {item.maxScore} pts</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.instructions}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due Date: <strong className="text-slate-800">{item.dueDate}</strong></span>
                    </div>

                    {item.referenceUrl && (
                      <a
                        href={item.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Starter Repo / Guidelines
                      </a>
                    )}
                  </div>
                </div>

                {/* Submission & Grading Metrics */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:border-l lg:border-slate-100 lg:pl-6">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 gap-4">
                      <span className="text-slate-500">Submissions</span>
                      <span className="font-bold text-slate-900">
                        {item.totalSubmissions} / {item.enrolledStudents} ({submissionPercentage}%)
                      </span>
                    </div>
                    <div className="w-40 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          isTeluguAI ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${submissionPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Graded: {item.gradedCount}</span>
                      {pendingGrading > 0 && (
                        <span className="text-amber-600 font-semibold">{pendingGrading} to review</span>
                      )}
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Avg Score
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {item.averageScore > 0 ? `${item.averageScore} / ${item.maxScore}` : 'N/A'}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewSubmissions && onViewSubmissions(item.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
                  >
                    <span>View Submissions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Assignment">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignment Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Capstone 2: Multi-Modal RAG with Milvus and Telugu Audio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Cohort
              </label>
              <select
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-slate-400"
              >
                <option value={isTeluguAI ? 'Python AI Evening Cohort #12' : 'Autonomous AI Agents - Global Cohort 4'}>
                  {isTeluguAI ? 'Python AI Evening Cohort #12' : 'Autonomous AI Agents - Global Cohort 4'}
                </option>
                <option value={isTeluguAI ? 'Machine Learning Weekend Batch #5' : 'Enterprise Production RAG - Cohort 2'}>
                  {isTeluguAI ? 'Machine Learning Weekend Batch #5' : 'Enterprise Production RAG - Cohort 2'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Submission Due Date
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 28 Oct 2026, 11:59 PM"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Score Points
            </label>
            <input
              type="number"
              required
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Problem Statement & Instructions
            </label>
            <textarea
              rows={3}
              required
              placeholder="Outline problem requirements, test cases, and grading criteria..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Starter Repo / Guideline URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://github.com/..."
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
