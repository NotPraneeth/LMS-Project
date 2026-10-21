'use client';

import React, { useState } from 'react';
import {
  Users,
  PhoneCall,
  UserCheck,
  ArrowRight,
  MessageSquare,
  Clock,
  Plus,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface LeadPipelineProps {
  activeBrand: 'teluguai' | 'genai99';
}

interface PipelineLead {
  id: string;
  name: string;
  phone: string;
  course: string;
  stage: 'new' | 'discussion' | 'counseling_done' | 'payment_pending' | 'enrolled';
  source: string;
  feeInterest: string;
  brand: 'teluguai' | 'genai99';
}

const INITIAL_PIPELINE: PipelineLead[] = [
  // TeluguAI Leads
  { id: 'p-1', name: 'Ravi Teja', phone: '+91 98480 99881', course: 'FullStack Python AI', stage: 'new', source: 'Website', feeInterest: '₹ 24,999', brand: 'teluguai' },
  { id: 'p-2', name: 'Karthik Raja', phone: '+91 98480 33441', course: 'FullStack Python AI', stage: 'discussion', source: 'WhatsApp Ad', feeInterest: '₹ 24,999', brand: 'teluguai' },
  { id: 'p-3', name: 'Sireesha Devi', phone: '+91 99881 77665', course: 'Machine Learning (Telugu)', stage: 'counseling_done', source: 'Referral', feeInterest: '₹ 29,999', brand: 'teluguai' },
  { id: 'p-4', name: 'Naveen Kumar', phone: '+91 94401 22345', course: 'Prompt Engineering Express', stage: 'payment_pending', source: 'Meta Ad', feeInterest: '₹ 9,999', brand: 'teluguai' },
  { id: 'p-5', name: 'Sai Kiran', phone: '+91 98480 44556', course: 'FullStack Python AI', stage: 'enrolled', source: 'Website', feeInterest: '₹ 24,999', brand: 'teluguai' },

  // GenAI99 Leads
  { id: 'p-6', name: 'David Miller', phone: '+1 415 678 9912', course: 'Autonomous AI Agents', stage: 'discussion', source: 'LinkedIn', feeInterest: '$499', brand: 'genai99' },
  { id: 'p-7', name: 'Priya Sharma', phone: '+91 98112 33445', course: 'Enterprise Production RAG', stage: 'payment_pending', source: 'Google Search', feeInterest: '₹ 32,999', brand: 'genai99' },
  { id: 'p-8', name: 'Alex Morgan', phone: '+1 415 555 0192', course: 'Autonomous AI Agents', stage: 'enrolled', source: 'Enterprise Referral', feeInterest: '$499', brand: 'genai99' },
];

export const LeadPipeline: React.FC<LeadPipelineProps> = ({ activeBrand }) => {
  const [pipelineLeads, setPipelineLeads] = useState<PipelineLead[]>(INITIAL_PIPELINE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stages: { key: PipelineLead['stage']; title: string; countColor: string }[] = [
    { key: 'new', title: '1. New Inquiries', countColor: 'bg-slate-100 text-slate-700' },
    { key: 'discussion', title: '2. In Discussion', countColor: 'bg-blue-50 text-blue-700' },
    { key: 'counseling_done', title: '3. Demo / Consultation', countColor: 'bg-purple-50 text-purple-700' },
    { key: 'payment_pending', title: '4. Payment Link Sent', countColor: 'bg-amber-50 text-amber-700' },
    { key: 'enrolled', title: '5. Enrolled Student', countColor: 'bg-emerald-50 text-emerald-700' },
  ];

  const advanceStage = (id: string, currentStage: PipelineLead['stage']) => {
    const stageFlow: PipelineLead['stage'][] = ['new', 'discussion', 'counseling_done', 'payment_pending', 'enrolled'];
    const currIdx = stageFlow.indexOf(currentStage);
    if (currIdx < stageFlow.length - 1) {
      const nextStage = stageFlow[currIdx + 1];
      setPipelineLeads(pipelineLeads.map((l) => (l.id === id ? { ...l, stage: nextStage } : l)));
      setToastMessage(`Moved lead to ${nextStage.replace('_', ' ').toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const filtered = pipelineLeads.filter((l) => l.brand === activeBrand);

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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admissions Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visual stage-by-stage progression from initial inquiry to enrolled paying student.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
          Total Leads in Funnel: <strong className="text-slate-900 font-bold">{filtered.length}</strong>
        </div>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const leadsInStage = filtered.filter((l) => l.stage === stage.key);
          return (
            <div key={stage.key} className="bg-slate-100/60 border border-slate-200 rounded-xl p-3 min-w-[220px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-800">{stage.title}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.countColor}`}>
                  {leadsInStage.length}
                </span>
              </div>

              {/* Lead Cards in Stage */}
              <div className="space-y-2.5">
                {leadsInStage.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="font-semibold text-slate-900">{lead.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{lead.phone}</div>
                    <div className="text-slate-700 font-medium text-[11px] mt-1 line-clamp-1">
                      {lead.course}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Source: {lead.source}</span>
                      <span className="font-semibold text-indigo-600">{lead.feeInterest}</span>
                    </div>

                    {lead.stage !== 'enrolled' && (
                      <button
                        onClick={() => advanceStage(lead.id, lead.stage)}
                        className="w-full mt-2.5 py-1 px-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Advance Stage</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                ))}

                {leadsInStage.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
