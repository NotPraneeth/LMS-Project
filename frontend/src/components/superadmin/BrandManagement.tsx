'use client';

import React, { useState } from 'react';
import {
  Globe,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Shield,
  ArrowRightLeft
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';

interface BrandManagementProps {
  activeBrand: 'teluguai' | 'genai99';
  onSwitchBrand: (brand: 'teluguai' | 'genai99') => void;
}

export const BrandManagement: React.FC<BrandManagementProps> = ({
  activeBrand,
  onSwitchBrand,
}) => {
  const isTeluguAI = activeBrand === 'teluguai';

  const [brandConfig, setBrandConfig] = useState({
    name: isTeluguAI ? 'TeluguAI' : 'GenAI99',
    domain: isTeluguAI ? 'https://teluguai.com' : 'https://genai99.com',
    tagline: isTeluguAI
      ? 'Vernacular Artificial Intelligence & Software Engineering Academy'
      : 'Enterprise LLMs, AI Agents & Advanced Generative AI Bootcamps',
    status: 'active' as const,
    supportEmail: isTeluguAI ? 'support@teluguai.com' : 'support@genai99.com',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(`Organization settings saved.`);
    setIsModalOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Brand Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage organization identity, custom domain, and general settings.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-start justify-between pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{brandConfig.name}</h2>
                <StatusBadge status={brandConfig.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{brandConfig.tagline}</p>
              <a
                href={brandConfig.domain}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mt-2 font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                {brandConfig.domain}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${
                isTeluguAI ? 'bg-emerald-600' : 'bg-sky-600'
              }`}
            >
              {isTeluguAI ? 'TA' : 'G99'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 text-xs text-slate-600 border-b border-slate-100">
            <div>
              <span className="text-slate-400 block mb-0.5">Support Desk</span>
              <span className="font-semibold text-slate-800">{brandConfig.supportEmail}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Primary Audience</span>
              <span className="font-semibold text-slate-800">
                {isTeluguAI ? 'Vernacular AI Learners' : 'Enterprise & Global Professionals'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Database Partition</span>
              <span className="font-mono text-emerald-700 font-semibold">{activeBrand}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Isolation Guard</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Strictly Separated
              </span>
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-500 flex items-center justify-between">
            <span>All students, trainers, courses, and fees are segregated to this workspace.</span>
          </div>
        </div>

        {/* Switch Organization Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Switch Organization</h3>
            <p className="text-xs text-slate-500 mb-4">
              Access the other independent platform workspace:
            </p>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">
                {isTeluguAI ? 'GenAI99' : 'TeluguAI'}
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                {isTeluguAI
                  ? 'Enterprise AI Agents & Bootcamps'
                  : 'Telugu Vernacular AI Academy'}
              </p>

              <button
                type="button"
                onClick={() => onSwitchBrand(isTeluguAI ? 'genai99' : 'teluguai')}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Switch to {isTeluguAI ? 'GenAI99' : 'TeluguAI'}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
            Session active
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Organization Profile"
        subtitle="Update general information and support details"
        maxWidth="md"
      >
        <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Organization Name</label>
            <input
              type="text"
              defaultValue={brandConfig.name}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Domain</label>
            <input
              type="text"
              defaultValue={brandConfig.domain}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Tagline</label>
            <input
              type="text"
              defaultValue={brandConfig.tagline}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Support Email</label>
            <input
              type="email"
              defaultValue={brandConfig.supportEmail}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
