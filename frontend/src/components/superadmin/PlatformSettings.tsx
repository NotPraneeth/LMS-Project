'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  HardDrive,
  Mail,
  Shield,
  Save,
  CheckCircle2
} from 'lucide-react';

export const PlatformSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'storage' | 'email' | 'security'>('payments');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [razorpayKey, setRazorpayKey] = useState('rzp_live_99A82B710K2');
  const [stripeKey, setStripeKey] = useState('pk_live_51P882199...xyz');
  const [s3Bucket, setS3Bucket] = useState('teluguai-genai99-secure-lms-assets');
  const [sessionTimeout, setSessionTimeout] = useState('45');
  const [enforce2FA, setEnforce2FA] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Settings saved successfully.');
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Integrations & Keys</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure payment gateways, cloud file storage, email relays, and platform security.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          Save Configuration
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Payment Gateways
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'storage'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          Cloud Storage
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'email'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Email SMTP
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Security Policies
        </button>
      </div>

      {/* Tab 1: Payments */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Razorpay (India / INR)</span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              UPI, Netbanking, and Debit/Credit cards for student tuition.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Key ID</label>
                <input
                  type="text"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Key Secret</label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Stripe (Global / USD & EUR)</span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              International payment processing for overseas learners.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Publishable Key</label>
                <input
                  type="text"
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Secret Key</label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Storage */}
      {activeTab === 'storage' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Cloud File Storage (AWS S3)</h2>
          <p className="text-xs text-slate-500 mb-4">
            Private bucket for course recordings, notes, and assignment submissions.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">S3 Bucket Name</label>
              <input
                type="text"
                value={s3Bucket}
                onChange={(e) => setS3Bucket(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Region</label>
              <input
                type="text"
                defaultValue="ap-south-1 (Mumbai)"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Email */}
      {activeTab === 'email' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Transactional Email Service</h2>
          <p className="text-xs text-slate-500 mb-4">
            Automated delivery for invoice PDFs, student onboarding letters, and password resets.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Sender Email</label>
              <input
                type="email"
                defaultValue="no-reply@domain.com"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Resend / SMTP API Key</label>
              <input
                type="password"
                defaultValue="••••••••••••••••••••••••"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Session & Security Policies</h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Require Two-Factor Authentication (2FA)</span>
                <span className="text-slate-500 text-[11px]">Enforce OTP on login for all Admins and Counselors</span>
              </div>
              <input
                type="checkbox"
                checked={enforce2FA}
                onChange={(e) => setEnforce2FA(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Session Timeout</span>
                <span className="text-slate-500 text-[11px]">Automatically log out after inactivity</span>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-800 text-xs"
              >
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
