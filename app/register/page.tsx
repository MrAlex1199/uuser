"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("User");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-name') || 'Default';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
    } catch (error) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-md" style={{ background: 'var(--card-background)', backdropFilter: 'blur(10px)' }}>
        <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--text)' }}>
          Create an account
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 text-sm rounded-md bg-red-500/20 border border-red-500/30" style={{ color: '#fca5a5' }}>
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium block mb-1"
              style={{ color: 'var(--text)' }}
            >
              Name
            </label>
              <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--card-background)', color: 'var(--text)', border: '1px solid rgba(0,0,0,0.06)' }}
              placeholder="Your Name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium block mb-1"
              style={{ color: 'var(--text)' }}
            >
              Email address
            </label>
              <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--card-background)', color: 'var(--text)', border: '1px solid rgba(0,0,0,0.06)' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium block mb-1"
              style={{ color: 'var(--text)' }}
            >
              Password
            </label>
              <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 mt-1 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--card-background)', color: 'var(--text)', border: '1px solid rgba(0,0,0,0.06)' }}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="text-sm font-medium block mb-1"
              style={{ color: 'var(--text)' }}
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
              style={{ background: 'var(--card-background)', color: 'var(--text)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
