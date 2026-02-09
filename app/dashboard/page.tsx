"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";

// กำหนด Type สำหรับข้อมูล Asset
interface Asset {
  _id?: string;
  id?: number;
  scCode: string;
  projectName: string;
  startDate: string;
  duration: string;
  endDate: string;
  status: string;
  remark: string;
}

interface User {
  name: string;
  email: string;
  role: string;
}

export default function AssetDashboard() {
  // --- State Management ---
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // State สำหรับ Form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({
    scCode: "",
    projectName: "",
    startDate: "",
    duration: "1",
    endDate: "",
    status: "",
    remark: "",
  });

  // --- Effects ---

  // 1. Load Data from API on Mount
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
        // Fallback to localStorage if API fails
        const storedData = localStorage.getItem("asset_data");
        if (storedData) {
          setAssets(JSON.parse(storedData));
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadAssets();

    const loadUser = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  // 3. Calculate Warranty Date whenever StartDate or Duration changes in Form
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      calculateWarranty();
    } else {
      setFormData((prev) => ({ ...prev, endDate: "", status: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.duration]);

  // --- Logic Functions ---

  const calculateWarranty = () => {
    if (!formData.startDate) return;
      const dataToExport = assets.map((a) => ({ ...a }));
    const start = new Date(formData.startDate);
    const durationYears = parseInt(formData.duration || "1");
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + durationYears);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isExpired = today > end;
    
    const endDateFormatted = end.toLocaleDateString("th-TH");
    
    setFormData((prev) => ({
      ...prev,
      endDate: endDateFormatted,
      status: isExpired ? "หมดประกัน" : "อยู่ในประกัน",
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.scCode || !formData.projectName || !formData.startDate) {
      alert("กรุณากรอกข้อมูล SC-CODE, ชื่อโครงการ/รายการ และวันเริ่มประกันให้ครบถ้วน");
      return;
    }

    try {
      const assetData = {
        scCode: formData.scCode,
        projectName: formData.projectName,
        startDate: formData.startDate,
        duration: formData.duration,
        endDate: formData.endDate,
        status: formData.status,
        remark: formData.remark || "",
      };

      if (editingId !== null) {
        // Update existing asset
        const res = await fetch(`/api/assets/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData),
        });
        if (!res.ok) throw new Error('Failed to update asset');
        const updated = await res.json();
        setAssets((prev) => prev.map((a) => (a._id === editingId ? updated.data : a)));
      } else {
        // Create new asset
        const res = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData),
        });
        if (!res.ok) throw new Error('Failed to create asset');
        const created = await res.json();
        setAssets((prev) => [...prev, created.data]);
      }

      closeModal();
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Error saving asset. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่ต้องการลบรายการนี้?")) {
      try {
        const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete asset');
        setAssets((prev) => prev.filter((a) => a._id !== id));
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error deleting asset. Please try again.');
      }
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingId(asset._id || null);
    setFormData({ ...asset });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      scCode: "",
      projectName: "",
      startDate: "",
      duration: "1",
      endDate: "",
      status: "",
      remark: "",
    });
  };

  const exportToExcel = () => {
    const dataToExport = assets.map((a) => ({ ...a }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asset Data");
    XLSX.writeFile(wb, "Asset_Overview.xlsx");
  };

  // --- Filtering & Stats ---

  const filteredAssets = assets.filter(
    (asset) =>
      asset.scCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: assets.length,
    inWarranty: assets.filter((a) => a.status === "อยู่ในประกัน").length,
    expired: assets.filter((a) => a.status === "หมดประกัน").length,
  };

  // --- Render ---

  return (
    <div style={{ backgroundImage: "url('https://source.unsplash.com/random/1920x1080?abstract')" } as React.CSSProperties}
         className="bg-[var(--background)] text-[var(--text)] min-h-screen flex font-sans bg-cover bg-center">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto backdrop-blur-3xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text)]">SC-MANAGEMENT</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--card-background)] backdrop-blur-sm border rounded-full" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-medium">User: <span className="font-bold">{user?.name} ({user?.role})</span></span>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text)]">สรุปรายการประกันทั้งหมด</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--primary)] hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <span className="material-icons-outlined">add</span>
            เพิ่มข้อมูล
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--card-background)] backdrop-blur-sm p-6 rounded-2xl border flex justify-between items-center group hover:border-white/20 transition-all" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-sm mb-1">รวมโครงการทั้งหมด</p>
              <h3 className="text-4xl font-bold text-green-400">{stats.total.toLocaleString()}</h3>
            </div>
            <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center text-[var(--primary)]">
              <span className="material-icons-outlined text-3xl">inventory_2</span>
            </div>
          </div>
          <div className="bg-[var(--card-background)] backdrop-blur-sm p-6 rounded-2xl border flex justify-between items-center group hover:border-white/20 transition-all" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className=" text-sm mb-1">จำนวนโครงการที่อยู่ในประกัน</p>
              <h3 className="text-4xl font-bold text-green-400">{stats.inWarranty.toLocaleString()}</h3>
            </div>
            <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center text-green-400">
              <span className="material-icons-outlined text-3xl">check_circle_outline</span>
            </div>
          </div>
          <div className="bg-[var(--card-background)] backdrop-blur-sm p-6 rounded-2xl border flex justify-between items-center group hover:border-white/20 transition-all" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className=" text-sm mb-1">หมดประกันแล้ว</p>
              <h3 className="text-4xl font-bold text-red-400">{stats.expired.toLocaleString()}</h3>
            </div>
            <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center text-red-400">
              <span className="material-icons-outlined text-3xl">event_busy</span>
            </div>
          </div>
        </div>

        {/* Table & Search */}
        <div className="bg-[var(--card-background)] backdrop-blur-sm rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-1 w-full max-w-md gap-3">
              <div className="relative flex-1">
                <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2  text-xl">search</span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรือ SC-CODE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/20 border rounded-xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all text-sm outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-2.5 border rounded-xl text-slate-300 hover:bg-black/20 transition-colors text-sm font-medium"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="material-icons-outlined text-green-400">file_download</span>
              Export Excel
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/20 border-y" style={{ borderColor: 'var(--border)' }}>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">SC-CODE</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">ชื่อโครงการ/รายการ</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">สถานะประกัน</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">วันเริ่ม-วันหมดประกัน</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider w-48">Remark</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-sm text-center italic">
                      <div className="flex flex-col items-center py-10">
                        <span className="material-icons-outlined text-5xl text-slate-700 mb-2">folder_open</span>
                        ยังไม่มีข้อมูลที่แสดงในขณะนี้
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr key={asset._id || asset.id || `${asset.scCode}-${asset.projectName}`} className="hover:bg-black/10 transition-colors" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-6 py-4 text-sm font-medium">{asset.scCode}</td>
                      <td className="px-6 py-4 text-sm">{asset.projectName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 text-lg font-medium rounded-full ${
                          asset.status === 'อยู่ในประกัน' 
                            ? 'bg-red-900/30 text-green-400' 
                            : 'bg-green-900/30 text-red-400'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {new Date(asset.startDate).toLocaleDateString('th-TH')} - {asset.endDate}
                      </td>
                      <td className="px-6 py-4 text-sm w-48 break-words whitespace-normal">
                        {asset.remark}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(asset)} className="p-1.5  hover:text-[var(--primary)] transition-colors">
                            <span className="material-icons-outlined text-xl">edit</span>
                          </button>
                          <button onClick={() => handleDelete(asset._id || '')} className="p-1.5  hover:text-red-500 transition-colors">
                            <span className="material-icons-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t flex justify-between items-center text-sm" style={{ borderColor: 'var(--border)' }}>
            <p>แสดง 1 ถึง {filteredAssets.length} จากทั้งหมด {assets.length} รายการ</p>
            <div className="flex gap-2">
              <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-black/20 transition-colors disabled:opacity-50" style={{ borderColor: 'var(--border)' }}>
                <span className="material-icons-outlined text-lg">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--primary)] text-white">1</button>
              <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-black/20 transition-colors disabled:opacity-50" style={{ borderColor: 'var(--border)' }}>
                <span className="material-icons-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card-background)] border rounded-2xl shadow-lg w-full max-w-md p-6 relative" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 hover:text-slate-300 transition-colors"
            >
              <span className="material-icons-outlined">close</span>
            </button>
            <h2 className="text-2xl font-semibold mb-6">
              {editingId ? "แก้ไขข้อมูลสินทรัพย์" : "เพิ่มข้อมูลสินทรัพย์ใหม่"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SC-CODE</label>
                <input
                  type="text"
                  name="scCode"
                  value={formData.scCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-black/20 border rounded-xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all text-sm outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อโครงการ</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-black/20 border rounded-xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all text-sm outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วันเริ่มประกัน</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-black/20 border rounded-xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all text-sm outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ระยะเวลาประกัน</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-black/20 border rounded-xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all text-sm outline-none"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="1">1 ปี</option>
                  <option value="2">2 ปี</option>
                  <option value="3">3 ปี</option>
                  <option value="5">5 ปี</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วันหมดประกัน</label>
                <input
                  type="text"
                  value={formData.endDate}
                  readOnly
                  className="w-full px-4 py-2.5 bg-black/20 border rounded-xl text-sm outline-none cursor-not-allowed text-slate-500"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สถานะประกัน</label>
                <input
                  type="text"
                  value={formData.status}
                  readOnly
                  className={`w-full px-4 py-2.5 bg-black/20 border rounded-xl text-sm outline-none font-medium cursor-not-allowed ${
                    formData.status === 'อยู่ในประกัน' ? 'text-green-400' : 'text-red-400'
                  }`}
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">รายละเอียด</label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-black/20 border rounded-xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all text-sm outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="บันทึกเพิ่มเติม"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border text-slate-300 hover:bg-black/20 transition-colors font-medium"
                style={{ borderColor: 'var(--border)' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white transition-colors font-medium"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
