'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  AlertCircle
} from 'lucide-react';

import { authApi, ApiError, type BrandId, type UserRole } from '@/lib/studentApi';

export interface AuthSession {
  email: string;
  name: string;
  role: UserRole;
  brand: BrandId;
  accessibleBrands: BrandId[];
}

interface CommonLoginProps {
  onLoginSuccess: (session: AuthSession) => void;
}

// Preset accounts for seamless 1-click testing. All demo users are seeded in
// the LMS database (backend/seed.py) with password `admin123`.
const DEMO_ACCOUNTS: {
  brand: BrandId;
  brandLabel: string;
  accounts: {
    role: UserRole;
    roleLabel: string;
    email: string;
    name: string;
    color: string;
  }[];
}[] = [
  {
    brand: 'teluguai',
    brandLabel: 'TeluguAI.com',
    accounts: [
      { role: 'super_admin', roleLabel: 'Super Admin', email: 'superadmin@lakes.dev', name: 'Platform Owner', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
      { role: 'admin', roleLabel: 'Admin', email: 'admin@teluguai.com', name: 'Kavya Reddy (Admin)', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
      { role: 'counselor', roleLabel: 'Counselor', email: 'counselor@teluguai.com', name: 'Praveen Kumar (Admissions)', color: 'border-purple-300 bg-purple-50 text-purple-800' },
      { role: 'trainer', roleLabel: 'Trainer', email: 'trainer@teluguai.com', name: 'Ravi Shankar (Faculty)', color: 'border-amber-300 bg-amber-50 text-amber-800' },
      { role: 'student', roleLabel: 'Student', email: 'student@teluguai.com', name: 'Sai Kiran (Learner)', color: 'border-blue-300 bg-blue-50 text-blue-800' },
    ],
  },
  {
    brand: 'genai99',
    brandLabel: 'GenAI99.com',
    accounts: [
      { role: 'super_admin', roleLabel: 'Super Admin', email: 'superadmin@lakes.dev', name: 'Platform Owner', color: 'border-sky-300 bg-sky-50 text-sky-800' },
      { role: 'admin', roleLabel: 'Admin', email: 'admin@genai99.com', name: 'Anita Desai (Admin)', color: 'border-sky-300 bg-sky-50 text-sky-800' },
      { role: 'counselor', roleLabel: 'Counselor', email: 'counselor@genai99.com', name: 'Vivek Joshi (Admissions)', color: 'border-purple-300 bg-purple-50 text-purple-800' },
      { role: 'trainer', roleLabel: 'Trainer', email: 'trainer@genai99.com', name: 'Dr. Arun Mehta (Faculty)', color: 'border-amber-300 bg-amber-50 text-amber-800' },
      { role: 'student', roleLabel: 'Student', email: 'student@genai99.com', name: 'Meghana Rao (Learner)', color: 'border-blue-300 bg-blue-50 text-blue-800' },
    ],
  },
];

export const CommonLogin: React.FC<CommonLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('student@teluguai.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const doLogin = async (loginEmail: string, loginPassword: string, brand?: BrandId) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.login(loginEmail, loginPassword, brand);
      onLoginSuccess({
        email: res.email,
        name: res.name,
        role: res.role,
        brand: res.brand.id,
        accessibleBrands: res.accessibleBrands.map((b) => b.id),
      });
    } catch (e) {
      setErrorMessage(
        e instanceof ApiError ? e.message : 'Login failed. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    void doLogin(email, password);
  };

  // Demo accounts authenticate through the same real login endpoint.
  const handleQuickLogin = (demoEmail: string, demoBrand: BrandId) => {
    setEmail(demoEmail);
    setPassword('admin123');
    void doLogin(demoEmail, 'admin123', demoBrand);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-lg mb-3 bg-slate-900 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Unified Platform Login</h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your registered email and password. Your brand and role are
              resolved by the LMS backend.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@teluguai.com or admin@genai99.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-lg text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* 1-Click Fast Demo Accounts Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            1-Click Demo Accounts (Instant Test)
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Seeded accounts — every password is <code className="font-mono">admin123</code>.
            The Super Admin button signs into that brand column.
          </p>

          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((group) => (
              <div key={group.brand} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      group.brand === 'teluguai' ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                  ></span>
                  {group.brandLabel}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {group.accounts.map((acc) => (
                    <button
                      key={`${group.brand}-${acc.role}`}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLogin(acc.email, group.brand)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all hover:scale-[1.02] shadow-2xs disabled:opacity-60 ${acc.color}`}
                      title={`Sign in as ${acc.name} (${acc.email})`}
                    >
                      {acc.roleLabel}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
