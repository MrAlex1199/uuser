"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ThemeSwitcher from "../components/ThemeSwitcher";
import * as XLSX from "xlsx";

interface Asset {
  id: number;
  scCode: string;
  projectName: string;
  startDate: string;
  duration: string;
  endDate: string;
  status: string;
  remark: string;
}

export default function ExpiredPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Asset>>({});

  useEffect(() => {
    const storedData = localStorage.getItem("asset_data");
    if (storedData) {
      setAssets(JSON.parse(storedData));
    }
  }, []);

  // Filter เฉพาะที่หมดประกัน
  const expiredAssets = assets.filter(
    (a) => a.status === "หมดประกัน" && 
    (a.scCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
     a.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (asset: Asset) => {
    setFormData(asset);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("ยืนยันการลบข้อมูล?")) {
      const updated = assets.filter((a) => a.id !== id);
      setAssets(updated);
      localStorage.setItem("asset_data", JSON.stringify(updated));
    }
  };

  const handleSave = () => {
    if (!formData.scCode || !formData.projectName || !formData.startDate) return;
    
    // Recalculate End Date on Save
    const start = new Date(formData.startDate);
    const duration = parseInt(formData.duration || "1");
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + duration);
    const endDateFormatted = end.toLocaleDateString("th-TH");

    const updatedAsset = { 
        ...formData, 
        endDate: endDateFormatted,
        status: "หมดประกัน" // ยังคงสถานะเดิมตามหน้านี้
    } as Asset;

    const updatedList = assets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a));
    setAssets(updatedList);
    localStorage.setItem("asset_data", JSON.stringify(updatedList));
    setIsModalOpen(false);
  };

  const exportToExcel = () => {
    if (expiredAssets.length === 0) return alert('ไม่มีข้อมูลให้ Export');
        // Export assets as-is
        const data = expiredAssets.map((a) => ({ ...a }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expired_Assets");
    XLSX.writeFile(wb, "Report_Expired_Assets.xlsx");
  };

    return (
        <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar /> {/* เรียกใช้ Sidebar */}
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text)]">รายการโครงการที่หมดประกัน</h1>
        </header>

        <div className="bg-[var(--card-background)] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-700">
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <span className="material-icons-outlined text-sm">search</span>
                    </span>
                    <input 
                        className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--card-background)] border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--text)]" 
                        placeholder="ค้นหาชื่อ หรือ SC-CODE..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-green-600">
                    <span className="material-icons-outlined text-lg">download</span>
                    <span>Export Excel</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SC-CODE</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ชื่อโครงการ</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">สถานะ</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">ระยะเวลาประกัน</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">REMARK</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {expiredAssets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <span className="material-icons-outlined text-slate-300 text-5xl mb-4">folder_open</span>
                                    <p className="text-slate-400 text-sm">ไม่พบข้อมูลที่ค้นหา</p>
                                </td>
                            </tr>
                        ) : (
                            expiredAssets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-slate-700 dark:text-slate-200">
                                    <td className="px-4 py-4 text-sm font-medium">{asset.scCode}</td>
                                    <td className="px-4 py-4 text-sm">{asset.projectName}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">หมดประกัน</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="text-[10px] text-slate-400 font-medium">ระยะเวลา {asset.duration} ปี</div>
                                        <div className="text-xs text-slate-500">เริ่ม: {new Date(asset.startDate).toLocaleDateString('th-TH')}</div>
                                        <div className="font-bold text-red-500 dark:text-red-400">สิ้นสุด: {asset.endDate}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-500 truncate max-w-[150px]">{asset.remark}</td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleEdit(asset)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><span className="material-icons-outlined text-lg">edit</span></button>
                                            <button onClick={() => handleDelete(asset.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><span className="material-icons-outlined text-lg">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>

      {/* Modal logic simplified for brevity - can be expanded similar to Dashboard modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white">แก้ไขข้อมูล (หมดประกัน)</h2>
                {/* Form fields here matching state */}
                <div className="space-y-4">
                    <input className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={formData.scCode} onChange={e => setFormData({...formData, scCode: e.target.value})} placeholder="SC-CODE" />
                    <input className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} placeholder="Project Name" />
                    <input type="date" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    <textarea className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={formData.remark} onChange={e => setFormData({...formData, remark: e.target.value})} placeholder="Remark" />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-xl dark:border-slate-700 text-slate-600 dark:text-slate-300">ยกเลิก</button>
                    <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-xl">บันทึก</button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
}