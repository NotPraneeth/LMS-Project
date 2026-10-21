'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  RotateCcw,
  Save,
  CheckCircle2
} from 'lucide-react';
import { PermissionItem } from '../shared/types';

const INITIAL_PERMISSIONS: PermissionItem[] = [
  {
    id: 'perm-1',
    module: 'Platform Administration',
    action: 'Manage Organization Profile',
    description: 'Configure brand identity, domains, and global preferences',
    superAdmin: true,
    admin: false,
    counselor: false,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-2',
    module: 'Platform Administration',
    action: 'Payment & Storage Gateways',
    description: 'Configure Razorpay, Stripe, and Cloud Storage credentials',
    superAdmin: true,
    admin: false,
    counselor: false,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-3',
    module: 'User Management',
    action: 'Create & Manage Admins',
    description: 'Provision branch administrators and assign permissions',
    superAdmin: true,
    admin: false,
    counselor: false,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-4',
    module: 'User Management',
    action: 'Create Counselors & Trainers',
    description: 'Onboard academic instructors and admission counselors',
    superAdmin: true,
    admin: true,
    counselor: false,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-5',
    module: 'User Management',
    action: 'Enroll Students',
    description: 'Create student accounts and assign them to batches',
    superAdmin: true,
    admin: true,
    counselor: true,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-6',
    module: 'Courses & Curriculum',
    action: 'Create & Publish Courses',
    description: 'Author curriculum, modules, lessons, and pricing',
    superAdmin: true,
    admin: true,
    counselor: false,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-7',
    module: 'Courses & Curriculum',
    action: 'Upload Learning Materials',
    description: 'Attach video recordings, notes, and code repositories',
    superAdmin: true,
    admin: true,
    counselor: false,
    trainer: true,
    student: false,
  },
  {
    id: 'perm-8',
    module: 'Batches & Scheduling',
    action: 'Create & Schedule Batches',
    description: 'Set batch start dates, timetable slots, and capacities',
    superAdmin: true,
    admin: true,
    counselor: false,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-9',
    module: 'Batches & Scheduling',
    action: 'Conduct Live Classes & Attendance',
    description: 'Host live sessions and record daily attendance',
    superAdmin: true,
    admin: true,
    counselor: false,
    trainer: true,
    student: false,
  },
  {
    id: 'perm-10',
    module: 'Admissions & CRM',
    action: 'Manage Leads & Follow-ups',
    description: 'Lead pipeline, calling logs, and consultation meetings',
    superAdmin: true,
    admin: true,
    counselor: true,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-11',
    module: 'Finance & Invoicing',
    action: 'Issue Invoices & Receipts',
    description: 'Manage fees, manual payments, and transaction records',
    superAdmin: true,
    admin: true,
    counselor: true,
    trainer: false,
    student: false,
  },
  {
    id: 'perm-12',
    module: 'Assessments',
    action: 'Create Quizzes & Grade Homework',
    description: 'Author tests, review student code, and assign marks',
    superAdmin: true,
    admin: true,
    counselor: false,
    trainer: true,
    student: false,
  },
];

export const RolePermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>(INITIAL_PERMISSIONS);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const modules = Array.from(new Set(INITIAL_PERMISSIONS.map((p) => p.module)));

  const togglePermission = (
    id: string,
    role: 'superAdmin' | 'admin' | 'counselor' | 'trainer' | 'student'
  ) => {
    if (role === 'superAdmin') return;
    setPermissions(
      permissions.map((p) => (p.id === id ? { ...p, [role]: !p[role] } : p))
    );
  };

  const handleSave = () => {
    setToastMessage('Permissions saved successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    setPermissions(INITIAL_PERMISSIONS);
    setToastMessage('Reset to system defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPermissions =
    selectedModule === 'all'
      ? permissions
      : permissions.filter((p) => p.module === selectedModule);

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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure access privileges for Admins, Counselors, Trainers, and Students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Module Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedModule('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedModule === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {modules.map((mod) => (
          <button
            key={mod}
            onClick={() => setSelectedModule(mod)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedModule === mod
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-2/5">Permission / Action</th>
                <th className="py-3 px-3 text-center">Super Admin</th>
                <th className="py-3 px-3 text-center">Admin</th>
                <th className="py-3 px-3 text-center">Counselor</th>
                <th className="py-3 px-3 text-center">Trainer</th>
                <th className="py-3 px-3 text-center">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPermissions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.action}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                  </td>

                  {/* Super Admin */}
                  <td className="py-3 px-3 text-center">
                    <div className="w-5 h-5 rounded mx-auto flex items-center justify-center bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </td>

                  {/* Admin */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => togglePermission(item.id, 'admin')}
                      className={`w-5 h-5 rounded mx-auto flex items-center justify-center transition-colors ${
                        item.admin
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-300 text-transparent hover:border-slate-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* Counselor */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => togglePermission(item.id, 'counselor')}
                      className={`w-5 h-5 rounded mx-auto flex items-center justify-center transition-colors ${
                        item.counselor
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-300 text-transparent hover:border-slate-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* Trainer */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => togglePermission(item.id, 'trainer')}
                      className={`w-5 h-5 rounded mx-auto flex items-center justify-center transition-colors ${
                        item.trainer
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-300 text-transparent hover:border-slate-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* Student */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => togglePermission(item.id, 'student')}
                      className={`w-5 h-5 rounded mx-auto flex items-center justify-center transition-colors ${
                        item.student
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-300 text-transparent hover:border-slate-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
