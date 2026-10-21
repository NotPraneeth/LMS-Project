'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Code,
  Video,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  FolderOpen,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Modal } from '../shared/Modal';

interface LearningMaterialsProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface MaterialItem {
  id: string;
  title: string;
  module: string;
  batchName: string;
  type: 'slides' | 'notebook' | 'video' | 'cheatsheet';
  sizeOrDuration: string;
  uploadDate: string;
  linkUrl: string;
  brand: 'teluguai' | 'genai99';
}

const INITIAL_MATERIALS: MaterialItem[] = [
  // TeluguAI
  {
    id: 'mat-1',
    title: 'FastAPI Architecture & Telugu Code Walkthrough',
    module: 'Module 4: Web APIs & Backend Systems',
    batchName: 'Python AI Evening Cohort #12',
    type: 'slides',
    sizeOrDuration: '4.8 MB (PDF)',
    uploadDate: 'Yesterday',
    linkUrl: 'https://storage.teluguai.com/materials/fastapi-arch.pdf',
    brand: 'teluguai',
  },
  {
    id: 'mat-2',
    title: 'Session 24 Jupyter Notebook: Pydantic & Async Endpoints',
    module: 'Module 4: Web APIs & Backend Systems',
    batchName: 'Python AI Evening Cohort #12',
    type: 'notebook',
    sizeOrDuration: '1.2 MB (.ipynb)',
    uploadDate: 'Yesterday',
    linkUrl: 'https://github.com/teluguai/cohort-12-fastapi-notebook',
    brand: 'teluguai',
  },
  {
    id: 'mat-3',
    title: 'Session 23 Class Recording: Telugu Prompt Engineering Foundations',
    module: 'Module 3: Prompt Engineering & LLM APIs',
    batchName: 'Python AI Evening Cohort #12',
    type: 'video',
    sizeOrDuration: '1 hr 32 mins',
    uploadDate: '3 days ago',
    linkUrl: 'https://play.teluguai.com/replays/cohort12-session23',
    brand: 'teluguai',
  },
  {
    id: 'mat-4',
    title: 'Machine Learning Mathematics & Telugu Quick Reference Cheatsheet',
    module: 'Module 1: Linear Algebra & Probability',
    batchName: 'Machine Learning Weekend Batch #5',
    type: 'cheatsheet',
    sizeOrDuration: '2.1 MB (PDF)',
    uploadDate: '10 Oct 2026',
    linkUrl: 'https://storage.teluguai.com/materials/ml-maths-cheatsheet.pdf',
    brand: 'teluguai',
  },
  // GenAI99
  {
    id: 'mat-5',
    title: 'LangGraph Multi-Agent Architecture Blueprint & State Graphs',
    module: 'Module 3: Autonomous Agent Workflows',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    type: 'slides',
    sizeOrDuration: '6.4 MB (PDF)',
    uploadDate: 'Today',
    linkUrl: 'https://vault.genai99.com/slides/langgraph-state-graphs.pdf',
    brand: 'genai99',
  },
  {
    id: 'mat-6',
    title: 'Production Agentic Tools & Human-in-the-Loop Starter Repo',
    module: 'Module 3: Autonomous Agent Workflows',
    batchName: 'Autonomous AI Agents - Global Cohort 4',
    type: 'notebook',
    sizeOrDuration: 'GitHub Repo',
    uploadDate: 'Yesterday',
    linkUrl: 'https://github.com/genai99-enterprise/agentic-tools-starter',
    brand: 'genai99',
  },
  {
    id: 'mat-7',
    title: 'Hybrid Search Benchmarks: Dense vs Sparse Vectors in Milvus',
    module: 'Module 2: Advanced Vector Indexing',
    batchName: 'Enterprise Production RAG - Cohort 2',
    type: 'cheatsheet',
    sizeOrDuration: '1.9 MB (PDF)',
    uploadDate: '12 Oct 2026',
    linkUrl: 'https://vault.genai99.com/benchmarks/milvus-hybrid-search.pdf',
    brand: 'genai99',
  },
];

export const LearningMaterials: React.FC<LearningMaterialsProps> = ({ activeBrand }) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [module, setModule] = useState('Module 4: Enterprise Development');
  const [batchName, setBatchName] = useState(
    isTeluguAI ? 'Python AI Evening Cohort #12' : 'Autonomous AI Agents - Global Cohort 4'
  );
  const [type, setType] = useState<'slides' | 'notebook' | 'video' | 'cheatsheet'>('slides');
  const [linkUrl, setLinkUrl] = useState('');
  const [size, setSize] = useState('3.5 MB (PDF)');

  const filteredMaterials = materials.filter((m) => {
    if (m.brand !== activeBrand) return false;
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (
      searchTerm &&
      !m.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !m.module.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !linkUrl.trim()) return;

    const newMaterial: MaterialItem = {
      id: `mat-${Date.now()}`,
      title,
      module,
      batchName,
      type,
      sizeOrDuration: size,
      uploadDate: 'Just now',
      linkUrl,
      brand: activeBrand,
    };

    setMaterials([newMaterial, ...materials]);
    setIsModalOpen(false);
    setTitle('');
    setLinkUrl('');
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const getTypeBadge = (mType: MaterialItem['type']) => {
    switch (mType) {
      case 'slides':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <FileText className="w-3 h-3" /> Slides (PDF)
          </span>
        );
      case 'notebook':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Code className="w-3 h-3" /> Jupyter / Code
          </span>
        );
      case 'video':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <Video className="w-3 h-3" /> Lecture Replay
          </span>
        );
      case 'cheatsheet':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <BookOpen className="w-3 h-3" /> Reference Doc
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Learning Materials & Resources</h1>
          <p className="text-sm text-slate-500 mt-1">
            Distribute class slides, starter repositories, lab notebooks, and session video replays.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-xs transition-colors shadow-xs ${
            isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          Upload New Resource
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search material title or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'slides', 'notebook', 'video', 'cheatsheet'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTypeFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                typeFilter === filter
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter === 'all' ? 'All Types' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Resource Title</th>
              <th className="py-3 px-4">Curriculum Module</th>
              <th className="py-3 px-4">Cohort</th>
              <th className="py-3 px-4">Resource Type</th>
              <th className="py-3 px-4">Size / Duration</th>
              <th className="py-3 px-4">Uploaded</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMaterials.map((mat) => (
              <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <a
                        href={mat.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:underline hover:text-indigo-600"
                      >
                        {mat.title}
                      </a>
                      <p className="text-[11px] text-slate-400">ID: {mat.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-700 font-medium">{mat.module}</td>

                <td className="py-3.5 px-4">
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {mat.batchName}
                  </span>
                </td>

                <td className="py-3.5 px-4">{getTypeBadge(mat.type)}</td>

                <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                  {mat.sizeOrDuration}
                </td>

                <td className="py-3.5 px-4 text-slate-500 text-[11px]">{mat.uploadDate}</td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={mat.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Open or Download"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(mat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Learning Material">
        <form onSubmit={handleCreateMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Session 24 Code Repo: Multi-Agent Collaboration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Curriculum Module
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Module 3: Vector Databases"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resource Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-slate-400"
              >
                <option value="slides">Slides (PDF Presentation)</option>
                <option value="notebook">Jupyter Notebook / Code</option>
                <option value="video">Lecture Video Replay</option>
                <option value="cheatsheet">Cheatsheet / Notes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                File Size or Duration
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 4.2 MB (PDF) or 1 hr 15 mins"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              File URL / GitHub / Cloud Storage Link
            </label>
            <input
              type="url"
              required
              placeholder="https://storage... or https://github.com/..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
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
              Save Resource
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
