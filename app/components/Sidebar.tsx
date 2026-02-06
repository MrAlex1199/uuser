"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`group flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors ${
        isActive ? 'text-white' : ''
      }`}>
      <div
        className={`p-3 rounded-lg transition-colors ${
          isActive ? 'bg-[var(--primary)]' : 'group-hover:bg-white/10'
        }`}
      >
        <span className="material-icons-outlined">{icon}</span>
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

const Sidebar = () => {
    const router = useRouter();

    const handleLogout = async () => {
      try {
        const response = await fetch('/api/logout', {
          method: 'GET',
        });
        if (response.ok) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
  return (
    <aside className="w-20 lg:w-24 bg-black/10 backdrop-blur-3xl border-r border-white/10 flex flex-col items-center py-8 gap-10 shrink-0 sticky top-0 h-screen">
      <div className="p-3 bg-[var(--primary)] rounded-xl shadow-lg shadow-blue-500/30">
        <span className="material-icons-outlined text-white text-3xl">layers</span>
      </div>
      <nav className="flex flex-col gap-8 flex-1">
        <NavItem href="/dashboard" icon="dashboard" label="Dashboard" />
        <NavItem href="/dashboard/warranty" icon="check_circle" label="อยู่ในประกัน" />
        <NavItem href="/dashboard/expired" icon="event_busy" label="หมดประกัน" />
        <NavItem href="/dashboard/members" icon="people" label="สมาชิก" />
      </nav>
      <button
        onClick={handleLogout}
        className="text-slate-400 hover:text-red-500 transition-colors">

        <span className="material-icons-outlined">logout</span>

  </button>
    </aside>
  );
};

export default Sidebar;