"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import * as XLSX from "xlsx";

interface Asset {
  _id?: string;
  scCode: string;
  projectName: string;
  startDate: string;
  duration: string;
  endDate?: string;
  status?: string;
  remark: string;
}

export default function WarrantyPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Logic การคำนวณวันหมดประกัน
  const getEndDate = (startDateStr: string, durationYears: string) => {
    if (!startDateStr) return null;
    const start = new Date(startDateStr);
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + parseInt(durationYears));
    return end;
  };

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/assets');
        if (!res.ok) throw new Error('Failed to fetch assets');
        const data = await res.json();
        setAssets(data.data || []);
      } catch (error) {
        console.error('Error loading assets:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem("asset_data");
        if (stored) setAssets(JSON.parse(stored));
      } finally {
        setIsLoading(false);
      }
    };
    loadAssets();
  }, []);

  const today = new Date();
  today.setHours(0,0,0,0);

  // Filter รายการที่อยู่ในประกัน (คำนวณสด)
  const warrantyAssets = assets.filter((asset) => {
    const end = getEndDate(asset.startDate, asset.duration || "1");
    const isWarranty = end && today <= end;
    
    // ค้นหา
    const matchesSearch = asset.scCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.projectName.toLowerCase().includes(searchTerm.toLowerCase());

    return isWarranty && matchesSearch;
  });

  const exportToExcel = () => {
     if (warrantyAssets.length === 0) return alert('ไม่มีข้อมูล');
     const data = warrantyAssets.map(a => {
        const end = getEndDate(a.startDate, a.duration);
        return {
            'SC-CODE': a.scCode,
            'ชื่อโครงการ': a.projectName,
            'ระยะเวลา': a.duration,
            'วันเริ่ม': new Date(a.startDate).toLocaleDateString('th-TH'),
            'วันหมด': end?.toLocaleDateString('th-TH'),
            'หมายเหตุ': a.remark
        };
     });
     const ws = XLSX.utils.json_to_sheet(data);
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, "InWarranty");
     XLSX.writeFile(wb, "Report_InWarranty.xlsx");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f172a] font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-white">รายการโครงการที่อยู่ในประกัน</h1>
            <p className="text-slate-500 text-sm">ตรวจสอบข้อมูลการรับประกัน</p>
        </header>

        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-700">
                <div className="relative w-full md:w-80">
                    <span className="material-icons-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
                    <input 
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 dark:text-slate-100" 
                        placeholder="ค้นหาชื่อ หรือ SC-CODE..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <span className="material-icons-outlined text-lg">download</span>
                    <span>Export Excel</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-[12px] uppercase text-slate-500">
                            <th className="px-4 py-3 font-bold">SC-CODE</th>
                            <th className="px-4 py-3 font-bold">ชื่อโครงการ/รายการ</th>
                            <th className="px-4 py-3 font-bold text-center">สถานะประกัน</th>
                            <th className="px-4 py-3 font-bold text-center">วันเริ่ม - วันหมดประกัน</th>
                            <th className="px-4 py-3 font-bold">REMARK</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-700 dark:text-slate-200">
                        {warrantyAssets.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-16 text-center text-slate-400">ไม่พบรายการที่อยู่ในประกัน</td></tr>
                        ) : (
                            warrantyAssets.map(a => {
                                const end = getEndDate(a.startDate, a.duration || "1");
                                return (
                                    <tr key={a._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 font-medium">{a.scCode}</td>
                                        <td className="px-4 py-3">{a.projectName}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">อยู่ในประกัน</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                                            {new Date(a.startDate).toLocaleDateString('th-TH')} - {end?.toLocaleDateString('th-TH')}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{a.remark || '-'}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700">แสดงทั้งหมด {warrantyAssets.length} รายการ</div>
        </div>
      </main>
    </div>
  );
}
