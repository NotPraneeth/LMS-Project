'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Award,
  Users,
  Search,
  BookOpen
} from 'lucide-react';
import { Modal } from '../shared/Modal';

interface QuizBuilderProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface QuizItem {
  id: string;
  title: string;
  batchName: string;
  durationMinutes: number;
  passPercentage: number;
  questionsCount: number;
  studentsAttempted: number;
  passRate: number;
  status: 'active' | 'draft';
  questions: Question[];
  brand: 'teluguai' | 'genai99';
}

const INITIAL_QUIZZES: QuizItem[] = [
  // TeluguAI
  {
    id: 'qz-1',
    title: 'Python Core & Data Structures Assessment',
    batchName: 'Python AI Evening Cohort #12',
    durationMinutes: 30,
    passPercentage: 70,
    questionsCount: 15,
    studentsAttempted: 44,
    passRate: 91,
    status: 'active',
    brand: 'teluguai',
    questions: [
      {
        id: 'q1',
        questionText: 'Which Python data structure maintains unique unordered elements?',
        options: ['List', 'Dictionary', 'Set', 'Tuple'],
        correctOptionIndex: 2,
      },
      {
        id: 'q2',
        questionText: 'What is the time complexity of dictionary key lookup in Python on average?',
        options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'qz-2',
    title: 'FastAPI, Pydantic & Async Programming Mid-Term',
    batchName: 'Python AI Evening Cohort #12',
    durationMinutes: 45,
    passPercentage: 75,
    questionsCount: 20,
    studentsAttempted: 38,
    passRate: 84,
    status: 'active',
    brand: 'teluguai',
    questions: [
      {
        id: 'q3',
        questionText: 'How does FastAPI parse and validate incoming JSON request payloads?',
        options: ['Using SQLAlchemy', 'Using Pydantic BaseModel', 'Using Django ORM', 'Using Flask Request'],
        correctOptionIndex: 1,
      },
    ],
  },
  // GenAI99
  {
    id: 'qz-3',
    title: 'Multi-Agent Systems & LangGraph Flow Control',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    durationMinutes: 40,
    passPercentage: 80,
    questionsCount: 20,
    studentsAttempted: 48,
    passRate: 94,
    status: 'active',
    brand: 'genai99',
    questions: [
      {
        id: 'q4',
        questionText: 'In LangGraph, what component allows persisting state between agent execution steps?',
        options: ['Prompt Template', 'Checkpointer', 'Token Counter', 'Vector Store'],
        correctOptionIndex: 1,
      },
      {
        id: 'q5',
        questionText: 'Which mechanism prevents infinite execution loops in autonomous agents?',
        options: ['Max iteration recursion limit', 'Zero temperature', 'Greedy decoding', 'Cross entropy'],
        correctOptionIndex: 0,
      },
    ],
  },
];

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ activeBrand }) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [quizzes, setQuizzes] = useState<QuizItem[]>(INITIAL_QUIZZES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<QuizItem | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [batchName, setBatchName] = useState(
    isTeluguAI ? 'Python AI Evening Cohort #12' : 'Autonomous AI Agents - Global Cohort 4'
  );
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passPercentage, setPassPercentage] = useState(75);

  // Draft questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'dq-1',
      questionText: 'What is the primary benefit of streaming tokens in LLM chat completions?',
      options: [
        'Higher overall throughput',
        'Lower perceived latency / faster time to first token',
        'Reduced GPU memory consumption',
        'Automatic error correction',
      ],
      correctOptionIndex: 1,
    },
  ]);

  const filtered = quizzes.filter((q) => q.brand === activeBrand);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `dq-${Date.now()}`,
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
      },
    ]);
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = val;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctOptionIndex = oIdx;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newQuiz: QuizItem = {
      id: `qz-${Date.now()}`,
      title,
      batchName,
      durationMinutes,
      passPercentage,
      questionsCount: questions.length,
      studentsAttempted: 0,
      passRate: 0,
      status: 'active',
      questions,
      brand: activeBrand,
    };

    setQuizzes([newQuiz, ...quizzes]);
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quiz & Assessment Builder</h1>
          <p className="text-sm text-slate-500 mt-1">
            Design interactive multiple choice quizzes, set passing criteria, and assess mastery.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-xs transition-colors shadow-xs ${
            isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          Create New Quiz
        </button>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {quiz.batchName}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live & Active
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-3">{quiz.title}</h3>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time: <strong>{quiz.durationMinutes} mins</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pass: <strong>{quiz.passPercentage}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span><strong>{quiz.questionsCount}</strong> Questions</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span><strong>{quiz.studentsAttempted}</strong> Attempts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-xs">
                <span className="text-slate-400">Pass Rate: </span>
                <span className="font-bold text-emerald-600">{quiz.passRate}%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewQuiz(quiz)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Quiz Modal with Question Builder */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Quiz">
        <form onSubmit={handleCreateQuiz} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 3 Test: Building Agent Tools & Error Handlers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
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
                Time Limit (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pass Score (%)</label>
              <input
                type="number"
                min="40"
                max="100"
                value={passPercentage}
                onChange={(e) => setPassPercentage(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          {/* Question Bank Builder */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Question Bank ({questions.length})
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Question
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div
                key={q.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Question #{qIndex + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  required
                  placeholder="Enter multiple choice question statement..."
                  value={q.questionText}
                  onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-hidden focus:border-slate-400"
                />

                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-slate-500">
                    Options (Select radio for correct answer):
                  </span>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correctOptionIndex === optIndex}
                        onChange={() => handleCorrectOptionChange(qIndex, optIndex)}
                        className="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        className="flex-1 text-xs border border-slate-200 rounded-lg p-1.5 bg-white focus:outline-hidden focus:border-slate-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
              Publish Quiz
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      {previewQuiz && (
        <Modal
          isOpen={!!previewQuiz}
          onClose={() => setPreviewQuiz(null)}
          title={`Quiz Preview: ${previewQuiz.title}`}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>Time: {previewQuiz.durationMinutes} mins</span>
              <span>•</span>
              <span>Passing: {previewQuiz.passPercentage}%</span>
              <span>•</span>
              <span>Questions: {previewQuiz.questions.length}</span>
            </div>

            {previewQuiz.questions.map((q, idx) => (
              <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-900">
                  {idx + 1}. {q.questionText}
                </p>
                <div className="space-y-1">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`text-xs p-2 rounded-lg border ${
                        oIdx === q.correctOptionIndex
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-semibold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                      {opt}
                      {oIdx === q.correctOptionIndex && (
                        <span className="ml-2 text-[11px] font-bold text-emerald-700">✓ Correct Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
