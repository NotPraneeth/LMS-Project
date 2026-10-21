'use client';

import React, { useMemo, useState } from 'react';
import { FolderOpen, FileText, Code, Download, BookOpen, Search } from 'lucide-react';

import { studentApi, type BrandId, type Material, type MaterialType } from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentMaterialsProps {
  activeBrand: BrandId;
  studentEmail: string;
}

export const StudentMaterials: React.FC<StudentMaterialsProps> = ({ activeBrand, studentEmail }) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: materials, loading, error, reload } = useStudentResource<Material[]>(
    `${studentEmail}:${activeBrand}`,
    () => studentApi.getMaterials(activeBrand),
  );

  const filtered = useMemo(
    () =>
      (materials ?? []).filter((m) => {
        if (categoryFilter !== 'all' && m.type !== categoryFilter) return false;
        if (
          searchTerm &&
          !m.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !m.module.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [materials, categoryFilter, searchTerm],
  );

  const getBadge = (type: MaterialType) => {
    switch (type) {
      case 'slides':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <FileText className="w-3 h-3" /> Slides PDF
          </span>
        );
      case 'notebook':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Code className="w-3 h-3" /> Jupyter Notebook
          </span>
        );
      case 'code':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <Code className="w-3 h-3" /> Source Code / Dataset
          </span>
        );
      case 'cheatsheet':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <BookOpen className="w-3 h-3" /> Cheatsheet
          </span>
        );
    }
  };

  if (loading) return <LoadingPanel label="Loading study materials…" />;
  if (error) return <ErrorPanel message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Study Materials & Code Lab</h1>
          <p className="text-sm text-slate-500 mt-1">
            Download slides, lesson notebooks, starter code repositories, and cheat sheets.
          </p>
        </div>
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
          {['all', 'slides', 'notebook', 'code', 'cheatsheet'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Material Title</th>
              <th className="py-3 px-4">Curriculum Module</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Download / Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((mat) => (
              <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:text-indigo-600 hover:underline"
                      >
                        {mat.title}
                      </a>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-600">{mat.module}</td>
                <td className="py-3.5 px-4">{getBadge(mat.type)}</td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{mat.size}</td>
                <td className="py-3.5 px-4 text-slate-400 text-[11px]">{mat.updatedDate}</td>

                <td className="py-3.5 px-4 text-right">
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                      isTeluguAI
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Get Resource</span>
                  </a>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                  No materials match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
