'use client';

import React, { useState } from 'react';
import { CommonLogin, AuthSession } from '@/components/shared/CommonLogin';
import { authApi, type BrandId } from '@/lib/studentApi';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CounselorLayout } from '@/components/counselor/CounselorLayout';
import { TrainerLayout } from '@/components/trainer/TrainerLayout';
import { StudentLayout } from '@/components/student/StudentLayout';
import { LogOut } from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<AuthSession | null>(null);

  const handleLogout = async () => {
    // Revoke the server session row and clear the HttpOnly cookie.
    try {
      await authApi.logout();
    } catch {
      /* clearing local state regardless */
    }
    setSession(null);
  };

  // Brand switching is limited to brands the server says this user can access.
  const switchBrandIfAllowed = (newBrand: BrandId) => {
    if (!session?.accessibleBrands.includes(newBrand)) return;
    setSession({ ...session, brand: newBrand });
  };

  // If no user is logged in, show the Universal Common Login screen
  if (!session) {
    return <CommonLogin onLoginSuccess={(userSession) => setSession(userSession)} />;
  }

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Branch Admin',
    counselor: 'Counselor',
    trainer: 'Trainer',
    student: 'Student',
  };

  return (
    <div>
      {/* Top Session Breadcrumb Bar */}
      <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              session.brand === 'teluguai' ? 'bg-emerald-400' : 'bg-sky-400'
            }`}
          ></span>
          <span>
            Signed in as <strong className="text-white">{session.name}</strong> ({roleLabels[session.role]}) •{' '}
            <span
              className={`font-semibold ${
                session.brand === 'teluguai' ? 'text-emerald-400' : 'text-sky-400'
              }`}
            >
              {session.brand === 'teluguai' ? 'TeluguAI.com' : 'GenAI99.com'}
            </span>
          </span>
        </div>

        <button
          onClick={() => void handleLogout()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span>Switch Account / Logout</span>
        </button>
      </div>

      {/* Role-Based Portal Dispatcher */}
      {session.role === 'super_admin' && (
        <SuperAdminLayout
          initialBrand={session.brand}
          onLogout={() => void handleLogout()}
        />
      )}

      {session.role === 'admin' && (
        <AdminLayout
          initialBrand={session.brand}
          onLogout={() => void handleLogout()}
          onSwitchToSuperAdmin={() => setSession(null)}
        />
      )}

      {session.role === 'counselor' && (
        <CounselorLayout
          activeBrand={session.brand}
          userName={session.name}
          onLogout={() => void handleLogout()}
          onSwitchBrand={switchBrandIfAllowed}
        />
      )}

      {session.role === 'trainer' && (
        <TrainerLayout
          activeBrand={session.brand}
          userName={session.name}
          onLogout={() => void handleLogout()}
          onSwitchBrand={switchBrandIfAllowed}
        />
      )}

      {session.role === 'student' && (
        <StudentLayout
          activeBrand={session.brand}
          userName={session.name}
          userEmail={session.email}
          accessibleBrands={session.accessibleBrands}
          onLogout={() => void handleLogout()}
          onSwitchBrand={switchBrandIfAllowed}
        />
      )}
    </div>
  );
}
