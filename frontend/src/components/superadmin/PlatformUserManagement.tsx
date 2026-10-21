'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Key,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';
import { PlatformUser, UserRole } from '../shared/types';

interface PlatformUserManagementProps {
  activeBrand: 'teluguai' | 'genai99';
}

const ALL_USERS: PlatformUser[] = [
  // TeluguAI
  {
    id: 'usr-1',
    name: 'Suresh Varma',
    email: 'suresh@teluguai.com',
    phone: '+91 98480 12345',
    role: 'super_admin',
    brandId: 'teluguai',
    department: 'Leadership',
    status: 'active',
    lastActive: '5 mins ago',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'usr-2',
    name: 'Kavitha Reddy',
    email: 'kavitha@teluguai.com',
    phone: '+91 99887 76655',
    role: 'admin',
    brandId: 'teluguai',
    department: 'Academics & Operations',
    status: 'active',
    lastActive: '1 hour ago',
    avatarBg: 'bg-emerald-700',
  },
  {
    id: 'usr-3',
    name: 'Madhavi Latha',
    email: 'madhavi@teluguai.com',
    phone: '+91 94401 22334',
    role: 'admin',
    brandId: 'teluguai',
    department: 'Hyderabad Branch',
    status: 'active',
    lastActive: '3 hours ago',
    avatarBg: 'bg-teal-600',
  },
  {
    id: 'usr-4',
    name: 'Ananya Rao',
    email: 'ananya@teluguai.com',
    phone: '+91 90001 98822',
    role: 'counselor',
    brandId: 'teluguai',
    department: 'Admissions & Counseling',
    status: 'active',
    lastActive: '15 mins ago',
    avatarBg: 'bg-purple-600',
  },

  // GenAI99
  {
    id: 'usr-5',
    name: 'Rohan Sharma',
    email: 'rohan@genai99.com',
    phone: '+91 91234 56789',
    role: 'super_admin',
    brandId: 'genai99',
    department: 'Leadership',
    status: 'active',
    lastActive: '10 mins ago',
    avatarBg: 'bg-sky-600',
  },
  {
    id: 'usr-6',
    name: 'Vikram Joshi',
    email: 'vikram@genai99.com',
    phone: '+91 98765 43210',
    role: 'admin',
    brandId: 'genai99',
    department: 'Enterprise Bootcamps',
    status: 'active',
    lastActive: 'Yesterday',
    avatarBg: 'bg-blue-600',
  },
  {
    id: 'usr-7',
    name: 'Dr. Arjun K.',
    email: 'arjun@genai99.com',
    phone: '+91 93322 11009',
    role: 'trainer',
    brandId: 'genai99',
    department: 'LLMs & AI Faculty',
    status: 'active',
    lastActive: '45 mins ago',
    avatarBg: 'bg-amber-600',
  },
];

export const PlatformUserManagement: React.FC<PlatformUserManagementProps> = ({ activeBrand }) => {
  const [users, setUsers] = useState<PlatformUser[]>(ALL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');
  const [newDept, setNewDept] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newUser: PlatformUser = {
      id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+91 98000 00000',
      role: newRole,
      brandId: activeBrand,
      department: newDept || 'General Operations',
      status: 'active',
      lastActive: 'Just now',
      avatarBg: activeBrand === 'teluguai' ? 'bg-emerald-600' : 'bg-sky-600',
    };

    setUsers([newUser, ...users]);
    setIsCreateModalOpen(false);
    setToastMessage(`Created ${newRole.toUpperCase()}: ${newName}`);
    setTimeout(() => setToastMessage(null), 3500);

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewDept('');
  };

  const filteredUsers = users.filter((u) => {
    if (u.brandId !== activeBrand) return false;

    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admins & Staff</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create and manage branch administrators, admission counselors, and instructors.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Add Administrator
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-indigo-600 w-full sm:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admins</option>
            <option value="admin">Admins</option>
            <option value="counselor">Counselors</option>
            <option value="trainer">Trainers</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name & Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department / Branch</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${user.avatarBg} text-white font-bold flex items-center justify-center text-xs`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-slate-500 text-[11px]">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                        user.role === 'super_admin'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : user.role === 'admin'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : user.role === 'counselor'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {user.role === 'super_admin' && <Shield className="w-3 h-3" />}
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600">{user.department}</td>

                  <td className="py-3 px-4">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="py-3 px-4 text-slate-500">{user.lastActive}</td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setToastMessage(`Reset link sent to ${user.email}`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Send Password Reset"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setUsers(
                            users.map((u) =>
                              u.id === user.id
                                ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
                                : u
                            )
                          );
                          setToastMessage(`Updated status for ${user.name}`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Toggle Status"
                      >
                        {user.status === 'active' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Administrator"
        subtitle="Provision a new admin account with full branch authority"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="ramesh@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98480 12345"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-indigo-600"
              >
                <option value="admin">Admin</option>
                <option value="counselor">Counselor</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Main Campus / Admissions"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
