"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-name") || "Default";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/50 via-transparent to-zinc-100/30 dark:from-zinc-900/30 dark:via-transparent dark:to-zinc-900/20 pointer-events-none" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>

        <div className="w-full max-w-md space-y-10 rounded-2xl p-10 shadow-xl ring-1 ring-zinc-200/70" style={{ background: 'var(--card-background)' }}>
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white text-2xl font-bold shadow-md">
              SC
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              SC-MANAGEMENT
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text)', opacity: 0.8 }}>
              เข้าสู่ระบบเพื่อจัดการงานของคุณ
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 text-sm rounded-md bg-red-500/20 border border-red-500/30 text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-lg border px-4 py-3 placeholder-zinc-400 focus:ring-2 focus:ring-offset-0"
                style={{ color: 'var(--text)', background: 'var(--card-background)', borderColor: 'rgba(148,163,184,0.2)' }}
                placeholder="example@sc-management.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
                  รหัสผ่าน
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 px-4 py-3 placeholder-zinc-400 focus:ring-2 focus:ring-offset-0"
                style={{ color: 'var(--text)', background: 'var(--card-background)', borderColor: 'rgba(148,163,184,0.2)' }}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:ring-offset-zinc-900"
              />
              <label htmlFor="remember" className="ml-3 block text-sm" style={{ color: 'var(--text)', opacity: 0.85 }}>
                จดจำฉัน
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors"
              style={{ background: 'var(--primary)' }}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3" style={{ background: 'transparent', color: 'var(--text)', opacity: 0.75 }}>หรือ</span>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-5 py-3.5 text-base font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/70 transition-colors"
          >
            <FcGoogle className="h-5 w-5" />
            เข้าสู่ระบบด้วย Google
          </button>

          <p className="text-center text-sm" style={{ color: 'var(--text)', opacity: 0.85 }}>
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              สมัครใช้งานฟรี
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
