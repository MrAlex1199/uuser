"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

interface Member {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      role: "User"
  });

  useEffect(() => {
    const stored = localStorage.getItem("member_data");
    if (stored) {
        setMembers(JSON.parse(stored));
    } else {
        const initial = [{id: 1, name: "Admin System", email: "admin@mail.com", password: "1234", role: "Admin"}];
        setMembers(initial);
        localStorage.setItem("member_data", JSON.stringify(initial));
    }
  }, []);

  const saveToStorage = (data: Member[]) => {
      localStorage.setItem("member_data", JSON.stringify(data));
      setMembers(data);
  };

  const handleSubmit = () => {
    if(!formData.name || !formData.email) return alert('กรอกข้อมูลให้ครบ');

    if (editingId) {
        const updated = members.map(m => m.id === editingId ? { ...m, ...formData, id: m.id } : m);
        saveToStorage(updated);
    } else {
        const newItem = { id: Date.now(), ...formData };
        saveToStorage([...members, newItem]);
    }
    closeModal();
  };

  const handleEdit = (m: Member) => {
      setEditingId(m.id);
      setFormData({ name: m.name, email: m.email, password: m.password || "", role: m.role });
      setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
      if(confirm('ลบสมาชิก?')) {
          saveToStorage(members.filter(m => m.id !== id));
      }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: "", email: "", password: "", role: "User" });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <h1 className="text-3xl font-semibold mb-6 text-slate-800 dark:text-white">รายการสมาชิก</h1>
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                    <span className="material-icons-outlined">add</span> เพิ่มสมาชิก
                </button>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                    <tr>
                        <th className="px-6 py-4 font-medium">ชื่อ</th>
                        <th className="px-6 py-4 font-medium">อีเมล</th>
                        <th className="px-6 py-4 font-medium">บทบาท</th>
                        <th className="px-6 py-4 text-center font-medium">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                    {members.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4">{m.name}</td>
                            <td className="px-6 py-4 text-slate-500">{m.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                    {m.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => handleEdit(m)} className="p-1 hover:text-blue-600 mr-2"><span className="material-icons-outlined text-xl">edit</span></button>
                                <button onClick={() => handleDelete(m.id)} className="p-1 hover:text-red-500"><span className="material-icons-outlined text-xl">delete</span></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {members.length === 0 && (
                <div className="py-16 text-center text-slate-400">
                    <span className="material-icons-outlined text-4xl mb-2">group_off</span>
                    <p>ยังไม่มีข้อมูลสมาชิก</p>
                </div>
            )}
        </div>
      </main>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl w-full max-w-md relative shadow-2xl">
                 <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white">{editingId ? "แก้ไขข้อมูล" : "เพิ่มสมาชิก"}</h2>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm mb-1 text-slate-500">ชื่อ</label>
                         <input className="w-full p-2.5 border rounded-lg bg-transparent dark:border-slate-600 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-sm mb-1 text-slate-500">อีเมล</label>
                         <input className="w-full p-2.5 border rounded-lg bg-transparent dark:border-slate-600 dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                     </div>
                     <div>
                         <label className="block text-sm mb-1 text-slate-500">บทบาท</label>
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