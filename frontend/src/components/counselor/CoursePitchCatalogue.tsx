'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Copy,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CoursePitchCatalogueProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface PitchCourse {
  id: string;
  title: string;
  duration: string;
  nextBatch: string;
  timing: string;
  fullPrice: string;
  earlyBirdPrice: string;
  installmentPlan: string;
  usps: string[];
  brand: 'teluguai' | 'genai99';
}

const PITCH_DATA: PitchCourse[] = [
  // TeluguAI
  {
    id: 'pc-1',
    title: 'FullStack Python & Vernacular AI Engineering',
    duration: '16 Weeks',
    nextBatch: '01 Nov 2026',
    timing: '07:00 PM - 08:30 PM (Mon-Fri)',
    fullPrice: '₹ 29,999',
    earlyBirdPrice: '₹ 24,999 (Save ₹5,000)',
    installmentPlan: '₹ 15,000 at admission + ₹ 12,000 in 30 days',
    usps: [
      'Entire course taught in clear Telugu with English code syntax',
      '8 Real-world portfolio projects including LLM agents',
      'Daily 1-on-1 mentor doubt resolution sessions',
      'Placement prep & resume building in vernacular tech ecosystem',
    ],
    brand: 'teluguai',
  },
  {
    id: 'pc-2',
    title: 'Applied Machine Learning & Deep Learning (Telugu)',
    duration: '12 Weeks',
    nextBatch: '25 Oct 2026',
    timing: '10:00 AM - 01:00 PM (Sat & Sun)',
    fullPrice: '₹ 34,999',
    earlyBirdPrice: '₹ 29,999 (Save ₹5,000)',
    installmentPlan: '2 installments of ₹ 16,000',
    usps: [
      'Comprehensive PyTorch and Scikit-Learn foundations in Telugu',
      'Weekend classes designed for working IT professionals',
      'End-to-end model training, quantization, and evaluation',
    ],
    brand: 'teluguai',
  },

  // GenAI99
  {
    id: 'pc-3',
    title: 'Autonomous AI Agents & Multi-Modal LLMs Mastery',
    duration: '12 Weeks',
    nextBatch: '05 Nov 2026',
    timing: '07:30 PM - 09:30 PM IST (Mon, Wed, Fri)',
    fullPrice: '$599 / ₹ 47,999',
    earlyBirdPrice: '$499 / ₹ 39,999',
    installmentPlan: '2 installments of $275 / ₹ 22,000',
    usps: [
      'Production LangGraph, CrewAI, and custom tool calling',
      'Multi-modal vision and voice agent architecture',
      'Global cohort with international engineers and founders',
    ],
    brand: 'genai99',
  },
  {
    id: 'pc-4',
    title: 'Enterprise Production RAG & LLMOps Bootcamp',
    duration: '8 Weeks',
    nextBatch: '10 Nov 2026',
    timing: '09:30 PM - 11:00 PM IST (Tue & Thu)',
    fullPrice: '$499 / ₹ 39,999',
    earlyBirdPrice: '$399 / ₹ 32,999',
    installmentPlan: 'Full payment upfront or 2 splits of $225',
    usps: [
      'Advanced chunking, hybrid search, and vector DB tuning',
      'Evaluation with Ragas, TruLens, and latency optimization',
      'Certificate with verified capstone repo on GitHub',
    ],
    brand: 'genai99',
  },
];

export const CoursePitchCatalogue: React.FC<CoursePitchCatalogueProps> = ({ activeBrand }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const copy = (val: string, label: string) => {
    navigator.clipboard?.writeText(val);
    setToastMessage(`Copied ${label} to clipboard`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filtered = PITCH_DATA.filter((p) => p.brand === activeBrand);

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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Counseling Course Guide</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Quick-pitch reference: Fees, installment rules, upcoming batch timings, and selling points.
        </p>
      </div>

      {/* Pitch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {item.duration}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Next Batch: {item.nextBatch}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 mb-1">{item.title}</h2>
              <div className="text-xs text-slate-500 mb-4">{item.timing}</div>

              {/* Pricing breakdown */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard Fee:</span>
                  <span className="line-through text-slate-400">{item.fullPrice}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-emerald-700">Early-Bird Offer:</span>
                  <span className="text-emerald-700 font-bold">{item.earlyBirdPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200 text-[11px]">
                  <span>Installments:</span>
                  <span>{item.installmentPlan}</span>
                </div>
              </div>

              {/* USPs */}
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Counselor Pitch Points (USPs)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {item.usps.map((usp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <span>{usp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => copy(`${item.title} - Early Bird Offer: ${item.earlyBirdPrice}. Next batch starts ${item.nextBatch}. Syllabus: https://domain.com/syllabus`, 'Course Pitch Info')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Pitch Text
              </button>
              <button
                onClick={() => {
                  setToastMessage(`Dispatched brochure for ${item.title} via WhatsApp`);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                WhatsApp Brochure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
