'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  Layers,
  DollarSign,
  Edit2,
  CheckCircle2,
  Eye,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';

interface CourseManagementProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface CourseItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  modulesCount: number;
  enrolledStudents: number;
  fee: string;
  status: 'active' | 'inactive';
  brand: 'teluguai' | 'genai99';
  modules: { name: string; lessons: number }[];
}

const INITIAL_COURSES: CourseItem[] = [
  // TeluguAI Courses
  {
    id: 'crs-1',
    title: 'FullStack Python & Vernacular AI Engineering',
    category: 'Full-Stack Development',
    duration: '16 Weeks',
    modulesCount: 8,
    enrolledStudents: 1240,
    fee: '₹ 24,999',
    status: 'active',
    brand: 'teluguai',
    modules: [
      { name: 'Python Core & Advanced Syntax', lessons: 18 },
      { name: 'Data Structures & OOPs in Telugu', lessons: 14 },
      { name: 'PostgreSQL Database & ORM', lessons: 12 },
      { name: 'FastAPI Backend Architecture', lessons: 16 },
      { name: 'Generative AI API Integrations', lessons: 10 },
    ],
  },
  {
    id: 'crs-2',
    title: 'Applied Machine Learning & Deep Learning (Telugu)',
    category: 'Data Science & AI',
    duration: '12 Weeks',
    modulesCount: 6,
    enrolledStudents: 820,
    fee: '₹ 29,999',
    status: 'active',
    brand: 'teluguai',
    modules: [
      { name: 'NumPy, Pandas & Mathematics', lessons: 12 },
      { name: 'Supervised & Unsupervised ML', lessons: 20 },
      { name: 'PyTorch Deep Learning Fundamentals', lessons: 16 },
      { name: 'Computer Vision & NLP Essentials', lessons: 14 },
    ],
  },
  {
    id: 'crs-3',
    title: 'Prompt Engineering & Generative Tools for Developers',
    category: 'Productivity & AI',
    duration: '4 Weeks',
    modulesCount: 4,
    enrolledStudents: 880,
    fee: '₹ 9,999',
    status: 'active',
    brand: 'teluguai',
    modules: [
      { name: 'LLM Fundamentals & Prompt Syntax', lessons: 8 },
      { name: 'Cursor & GitHub Copilot Workflows', lessons: 10 },
      { name: 'Automating Tasks with AI Agents', lessons: 8 },
    ],
  },

  // GenAI99 Courses
  {
    id: 'crs-4',
    title: 'Autonomous AI Agents & Multi-Modal LLMs Mastery',
    category: 'Advanced Generative AI',
    duration: '12 Weeks',
    modulesCount: 8,
    enrolledStudents: 940,
    fee: '$499 / ₹ 39,999',
    status: 'active',
    brand: 'genai99',
    modules: [
      { name: 'LangGraph & CrewAI Frameworks', lessons: 16 },
      { name: 'Multi-Agent Tool Calling & Memory', lessons: 18 },
      { name: 'Multi-Modal Vision & Audio Agents', lessons: 14 },
      { name: 'Production Deployment & Evaluation', lessons: 12 },
    ],
  },
  {
    id: 'crs-5',
    title: 'Enterprise Production RAG & LLMOps Bootcamp',
    category: 'Enterprise Engineering',
    duration: '8 Weeks',
    modulesCount: 6,
    enrolledStudents: 580,
    fee: '$399 / ₹ 32,999',
    status: 'active',
    brand: 'genai99',
    modules: [
      { name: 'Vector DBs (Qdrant & Pinecone)', lessons: 12 },
      { name: 'Advanced Chunking & Hybrid Search', lessons: 14 },
      { name: 'Reranking & RAG Triad Evaluation', lessons: 10 },
      { name: 'Latency Optimization & Caching', lessons: 8 },
    ],
  },
  {
    id: 'crs-6',
    title: 'Fine-Tuning Open Source LLMs (Llama 3 & DeepSeek)',
    category: 'Model Specialization',
    duration: '6 Weeks',
    modulesCount: 5,
    enrolledStudents: 360,
    fee: '$349 / ₹ 28,999',
    status: 'active',
    brand: 'genai99',
    modules: [
      { name: 'LoRA, QLoRA & Parameter-Efficient Tuning', lessons: 12 },
      { name: 'Dataset Preparation & Synthetic Data', lessons: 10 },
      { name: 'Direct Preference Optimization (DPO)', lessons: 8 },
      { name: 'Quantization & vLLM Serving', lessons: 10 },
    ],
  },
];

export const CourseManagement: React.FC<CourseManagementProps> = ({ activeBrand }) => {
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newFee, setNewFee] = useState('');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newCrs: CourseItem = {
      id: `crs-${Date.now()}`,
      title: newTitle,
      category: newCategory || 'Technical Curriculum',
      duration: newDuration || '8 Weeks',
      modulesCount: 4,
      enrolledStudents: 0,
      fee: newFee || '₹ 19,999',
      status: 'active',
      brand: activeBrand,
      modules: [
        { name: 'Module 1: Orientation & Core Fundamentals', lessons: 8 },
        { name: 'Module 2: Intermediate Implementation', lessons: 12 },
      ],
    };

    setCourses([newCrs, ...courses]);
    setIsModalOpen(false);
    setToastMessage(`Course created: ${newTitle}`);
    setTimeout(() => setToastMessage(null), 3000);

    setNewTitle('');
    setNewCategory('');
    setNewDuration('');
    setNewFee('');
  };

  const filteredCourses = courses.filter((c) => {
    if (c.brand !== activeBrand) return false;
    return (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Screen Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Courses & Curriculum</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage course catalog, syllabus modules, learning assets, and tuition fees.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {c.category}
                </span>
                <StatusBadge status={c.status} />
              </div>

              <h2 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                {c.title}
              </h2>

              <div className="grid grid-cols-2 gap-2 my-4 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <span className="font-semibold text-slate-800">{c.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Syllabus</span>
                  <span className="font-semibold text-slate-800">{c.modulesCount} Modules</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Learners</span>
                  <span className="font-semibold text-slate-800">{c.enrolledStudents}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Course Fee</span>
                  <span className="font-semibold text-indigo-600">{c.fee}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedCourse(c)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                View Curriculum
              </button>
              <button
                onClick={() => {
                  setToastMessage(`Editing course ${c.title}`);
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                title="Edit Course"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Curriculum Modal */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={selectedCourse.title}
          subtitle={`Curriculum Syllabus • ${selectedCourse.duration} • ${selectedCourse.modules.length} Modules`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              {selectedCourse.modules.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{m.name}</span>
                  </div>
                  <span className="text-slate-500 font-medium">{m.lessons} Lessons</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Course"
        subtitle="Author a new technical curriculum for student cohorts"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Course Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Modern FullStack AI Engineering"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Generative AI"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g. 12 Weeks"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Tuition Fee</label>
            <input
              type="text"
              placeholder="e.g. ₹ 29,999 or $499"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
            >
              Publish Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
