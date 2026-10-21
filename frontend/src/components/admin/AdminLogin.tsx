'use client';

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (brand: 'teluguai' | 'genai99') => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [selectedBrand, setSelectedBrand] = useState<'teluguai' | 'genai99'>('teluguai');
  const [email, setEmail] = useState('kavitha.admin@teluguai.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBrandChange = (brand: 'teluguai' | 'genai99') => {
    setSelectedBrand(brand);
    setEmail(brand === 'teluguai' ? 'kavitha.admin@teluguai.com' : 'vikram.admin@genai99.com');
    setPassword('admin123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(selectedBrand);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => handleBrandChange('teluguai')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              selectedBrand === 'teluguai'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TeluguAI Admin
          </button>
          <button
            type="button"
            onClick={() => handleBrandChange('genai99')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              selectedBrand === 'genai99'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GenAI99 Admin
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div
              className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-lg mb-3 shadow-xs ${
                selectedBrand === 'teluguai' ? 'bg-emerald-600' : 'bg-sky-600'
              }`}
            >
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {selectedBrand === 'teluguai' ? 'TeluguAI' : 'GenAI99'} Admin Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage academic batches, timetable, students, and trainers.
            </p>
          </div>

          {/* 1-Click Fast Demo Logins */}
          <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Login
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onLoginSuccess('teluguai')}
                className="py-2 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors text-center"
              >
                TeluguAI Admin
              </button>
              <button
                type="button"
                onClick={() => onLoginSuccess('genai99')}
                className="py-2 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold transition-colors text-center"
              >
                GenAI99 Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
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
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
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

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600" />
                <span>Remember me</span>
              </label>
              <span className="text-slate-400">Branch Portal</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-2 py-2.5 rounded-lg text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors ${
                selectedBrand === 'teluguai'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Enter {selectedBrand === 'teluguai' ? 'TeluguAI' : 'GenAI99'} Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
