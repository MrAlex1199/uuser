"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

interface User {
  _id?: string;
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: string;
}

export default function MembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      role: "User"
  });

  // Load members from API
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/members');
      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        let errMsg = `Failed to fetch members: ${res.status}`;
        try {
          if (contentType.includes('application/json')) {
            const body = await res.json();
            errMsg = body?.error || body?.message || JSON.stringify(body);
          } else {
            const txt = await res.text();
            errMsg = txt;
          }
        } catch (e) {
          // ignore parse errors
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setUsers(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading members:', err);
      setError(err instanceof Error ? err.message : 'Error loading members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);



  const handleSubmit = async () => {
    if(!formData.name || !formData.email) return alert('กรอกข้อมูลให้ครบ');

    try {
      if (editingId) {
        const res = await fetch(`/api/members/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update member');
        const updated = await res.json();
        setUsers((prev) => prev.map(u => u._id === editingId ? updated.data : u));
      } else {
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create user');
        const created = await res.json();
        setUsers((prev) => [...prev, created.data]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving member:', error);
      alert(error instanceof Error ? error.message : 'Error saving member');
    }
  };

  const handleEdit = (u: User) => {
      setEditingId(u._id || null);
      setFormData({ name: u.name, email: u.email, password: u.password || "", role: u.role });
      setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
      if(confirm('ลบสมาชิก?')) {
          try {
            const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete user');
            setUsers((prev) => prev.filter(u => u._id !== id));
          } catch (error) {
            console.error('Error deleting member:', error);
            alert(error instanceof Error ? error.message : 'Error deleting member');
          }
      }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: "", email: "", password: "", role: "User" });
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <h1 className="text-3xl font-semibold mb-6 text-[var(--text)]">รายการสมาชิก</h1>
        {error && (
            <div className="mb-4">
            <p className="text-red-500">{error}</p>
            <div className="mt-2">
              <button onClick={loadMembers} className="px-3 py-1 bg-blue-600 text-white rounded-md mr-2">ลองใหม่</button>
              <button onClick={() => { navigator.clipboard?.writeText(error); }} className="px-3 py-1 border rounded-md">คัดลอกข้อผิดพลาด</button>
            </div>
          </div>
        )}
        <div className="bg-[var(--card-background)] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                    <span className="material-icons-outlined">add</span> เพิ่มสมาชิก
                </button>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 ">
                    <tr>
                        <th className="px-6 py-4 font-medium">ชื่อ</th>
                        <th className="px-6 py-4 font-medium">อีเมล</th>
                        <th className="px-6 py-4 font-medium">บทบาท</th>
                        <th className="px-6 py-4 text-center font-medium">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-slate-400">กำลังโหลด...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-slate-400">
                        <span className="material-icons-outlined text-4xl mb-2">group_off</span>
                        <div>ยังไม่มีข้อมูลสมาชิก</div>
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u._id || u.id} className="hover:bg-slate-200 transition-colors">
                          <td className="px-6 py-4">{u.name}</td>
                          <td className="px-6 py-4">{u.email}</td>
                          <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'Admin' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                  {u.role}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                              <button onClick={() => handleEdit(u)} className="p-1 hover:text-blue-600 mr-2"><span className="material-icons-outlined text-xl">edit</span></button>
                              <button onClick={() => handleDelete(u._id || '')} className="p-1 hover:text-red-500"><span className="material-icons-outlined text-xl">delete</span></button>
                          </td>
                      </tr>
                    ))
                  )}
                </tbody>
            </table>
        </div>
      </main>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-[var(--card-background)] p-6 rounded-xl w-full max-w-md relative shadow-2xl">
                 <h2 className="text-xl font-semibold mb-6 text-[var(--text)]">{editingId ? "แก้ไขข้อมูล" : "เพิ่มสมาชิก"}</h2>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm mb-1 text-slate-500 dark:text-slate-400">ชื่อ</label>
                         <input className="w-full p-2.5 border rounded-lg bg-transparent dark:border-slate-600 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-sm mb-1 text-slate-500 dark:text-slate-400">อีเมล</label>
                         <input className="w-full p-2.5 border rounded-lg bg-transparent dark:border-slate-600 dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-sm mb-1 text-slate-500 dark:text-slate-400">บทบาท</label>
                         <select className="w-full p-2.5 border rounded-lg bg-transparent dark:border-slate-600 dark:text-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                             <option value="Admin">Admin</option>
                             <option value="User">User</option>
                         </select>
                     </div>
                 </div>
                 <div className="flex justify-end gap-3 mt-8">
                    <button onClick={closeModal} className="px-5 py-2.5 border rounded-lg dark:border-slate-600 text-slate-600 dark:text-slate-300">ยกเลิก</button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg">บันทึก</button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
}
