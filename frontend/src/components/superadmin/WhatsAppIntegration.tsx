'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  RefreshCw,
  Copy,
  Zap
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { WhatsAppTemplate } from '../shared/types';

const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    name: 'lead_welcome',
    category: 'MARKETING',
    status: 'APPROVED',
    language: 'English',
    previewText: 'Hello {{1}}! Thank you for your interest in our programs. Download syllabus here: {{2}}',
    brand: 'teluguai',
    lastSent: '12 mins ago',
  },
  {
    id: 'tpl-2',
    name: 'fee_receipt',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'English',
    previewText: 'Hello {{1}}, your payment of ₹{{2}} for Batch #{{3}} is confirmed. Invoice: {{4}}',
    brand: 'teluguai',
    lastSent: '1 hour ago',
  },
  {
    id: 'tpl-3',
    name: 'class_reminder',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'English',
    previewText: 'Your live session starts at 7:00 PM today. Click to join: {{1}}',
    brand: 'genai99',
    lastSent: '3 hours ago',
  },
  {
    id: 'tpl-4',
    name: 'assessment_alert',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'English',
    previewText: 'New Assessment posted: {{1}}. Complete before Sunday 11:59 PM: {{2}}',
    brand: 'genai99',
    lastSent: 'Yesterday',
  },
];

export const WhatsAppIntegration: React.FC = () => {
  const [phoneNumberId, setPhoneNumberId] = useState('109485720938472');
  const [wabaId, setWabaId] = useState('394857102938475');
  const [webhookUrl, setWebhookUrl] = useState('https://api.domain.com/v1/webhooks/whatsapp');
  
  const [testMobile, setTestMobile] = useState('');
  const [testTemplate, setTestTemplate] = useState(INITIAL_TEMPLATES[0].id);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMobile) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setToastMessage(`Test message sent to ${testMobile}`);
      setTimeout(() => setToastMessage(null), 3000);
      setTestMobile('');
    }, 700);
  };

  const copy = (val: string, label: string) => {
    navigator.clipboard?.writeText(val);
    setToastMessage(`Copied ${label}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">WhatsApp & SMS</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure automated message delivery and view pre-approved WhatsApp templates.
          </p>
        </div>

        <button
          onClick={() => {
            setToastMessage('WhatsApp API connection verified (200 OK)');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Test Connection
        </button>
      </div>

      {/* API Credentials & Send Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">WhatsApp Cloud API Credentials</h2>
          <p className="text-xs text-slate-500 mb-4">
            Used to automatically deliver admission receipts, class reminders, and lead welcome packs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone Number ID</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => copy(phoneNumberId, 'Phone Number ID')}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">WhatsApp Business Account (WABA ID)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => copy(wabaId, 'WABA ID')}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Webhook Inbound URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Test Sandbox */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Send Test Message
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Dispatch a sample notification to verify API delivery.
            </p>

            <form onSubmit={handleSendTest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+91 98480 12345"
                  value={testMobile}
                  onChange={(e) => setTestMobile(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Template</label>
                <select
                  value={testTemplate}
                  onChange={(e) => setTestTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-indigo-600"
                >
                  {INITIAL_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full mt-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? 'Sending...' : 'Send Test'}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
            Delivery SLA: 99.4%
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Approved Message Templates</h2>
            <p className="text-xs text-slate-500">Templates verified by Meta for automated workflows</p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
            {INITIAL_TEMPLATES.length} Live
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Template Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {INITIAL_TEMPLATES.map((tpl) => (
                <tr key={tpl.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{tpl.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                      {tpl.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{tpl.language}</td>
                  <td className="py-3 px-4 max-w-sm truncate text-slate-500">{tpl.previewText}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={tpl.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-500">{tpl.lastSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
