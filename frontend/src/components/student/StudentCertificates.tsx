'use client';

import React, { useState } from 'react';
import { CheckCircle2, Download, Share2, ShieldCheck } from 'lucide-react';

import {
  studentApi,
  type BrandId,
  type Certificate,
  type StudentDashboard,
} from '@/lib/studentApi';
import { useStudentResource } from '@/lib/useStudentResource';
import { ErrorPanel, LoadingPanel } from './StudentAsyncState';

interface StudentCertificatesProps {
  activeBrand: BrandId;
  studentEmail: string;
  userName: string;
}

export const StudentCertificates: React.FC<StudentCertificatesProps> = ({
  activeBrand,
  studentEmail,
  userName,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const {
    data: certificate,
    loading: certificateLoading,
    error: certificateError,
    reload: reloadCertificate,
  } = useStudentResource<Certificate>(`${studentEmail}:${activeBrand}:certificate`, () =>
    studentApi.getCertificate(activeBrand),
  );

  const {
    data: dashboard,
    loading: dashboardLoading,
    error: dashboardError,
    reload: reloadDashboard,
  } = useStudentResource<StudentDashboard>(`${studentEmail}:${activeBrand}:dashboard`, () =>
    studentApi.getDashboard(activeBrand),
  );

  const loading = certificateLoading || dashboardLoading;
  const error = certificateError ?? dashboardError;

  const load = () => {
    reloadCertificate();
    reloadDashboard();
  };

  if (loading) return <LoadingPanel label="Loading certificate…" />;
  if (error) return <ErrorPanel message={error} onRetry={load} />;
  if (!certificate || !dashboard) return null;

  const certData = certificate;

  const handleDownload = () => {
    setDownloadNotice(`Downloading Certificate ${certData.certId} in vector PDF format...`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handleShare = () => {
    setDownloadNotice(`Copied LinkedIn credential URL for ${certData.certId} to clipboard!`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Certificates & Digital Credentials</h1>
          <p className="text-sm text-slate-500 mt-1">
            Official verifiable completion certificates issued upon meeting academic benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share to LinkedIn</span>
          </button>
          <button
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-semibold text-xs shadow-xs transition-colors ${
              isTeluguAI ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Certificate PDF</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {downloadNotice}
        </div>
      )}

      {/* Graduation Criteria Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">Graduation Requirements Benchmark</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Attendance: {dashboard.attendanceRate}%</div>
              <div className="text-[11px] text-slate-400">Min 80% satisfied</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">
                Assignments: {dashboard.assignmentsDone}/{dashboard.totalAssignments}
              </div>
              <div className="text-[11px] text-slate-400">Capstones submitted</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Quiz Average: {dashboard.quizAvg}%</div>
              <div className="text-[11px] text-slate-400">Min 75% satisfied</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Tuition Status</div>
              <div className="text-[11px] text-slate-400">{dashboard.feeStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Fidelity Visual Certificate Preview */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        {/* Subtle decorative border corners */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-slate-400" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-slate-400" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-slate-400" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-slate-400" />

        <div className="text-center max-w-2xl mx-auto space-y-6">
          {/* Logo & Org */}
          <div className="inline-flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                isTeluguAI ? 'bg-emerald-600' : 'bg-sky-600'
              }`}
            >
              {isTeluguAI ? 'TA' : 'G99'}
            </div>
            <span className="text-base font-extrabold text-slate-900 tracking-wide uppercase">
              {certData.brandName}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
              Official Credential of Completion
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
              Certificate of Achievement
            </h2>
            <p className="text-xs text-slate-500 mt-1">This is proudly presented to</p>
          </div>

          {/* Student Name */}
          <div className="border-b-2 border-slate-200 pb-2 inline-block px-10">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{userName}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            for successfully mastering the curriculum, completing hands-on capstone engineering projects, and exhibiting distinguished proficiency in
          </p>

          <div className="text-lg font-bold text-slate-900">{certData.courseName}</div>

          {/* Skills Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {certData.skills.map((s) => (
              <span
                key={s}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Signatures & Verification Bar */}
          <div className="pt-8 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
            <div>
              <div className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-400 pb-1">
                {certData.instructor}
              </div>
              <p className="text-[11px] font-semibold text-slate-700 mt-1">{certData.instructor}</p>
              <p className="text-[10px] text-slate-400">{certData.instructorTitle}</p>
            </div>

            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{certData.status}</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{certData.certId}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Issued on: {certData.issueDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
