"use client";

import React, { useState, useEffect } from 'react';

const lightTheme = {
  '--background': '#f8fafc',
  '--card-background': 'rgba(255, 255, 255, 0.95)',
  '--text': '#1f2937',
  '--primary': '#2563eb',
  '--border': 'rgba(100, 116, 139, 0.2)',
};

const darkTheme = {
  '--background': '#0b1220',
  '--card-background': 'rgba(15, 23, 42, 0.88)',
  '--text': '#e6eef8',
  '--primary': '#60a5fa',
  '--border': 'rgba(255,255,255,0.08)',
};

const themes = [
  { name: 'Default', colors: lightTheme },
  { name: 'Dark', colors: darkTheme },
];

const applyTheme = (themeName: string) => {
  const theme = themes.find((t) => t.name === themeName);
  if (!theme) return;
  Object.entries(theme.colors).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value as string);
  });
  if (themeName === 'Dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
};

const ThemeSwitcher: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState('Default');

  useEffect(() => {
    const saved = localStorage.getItem('theme-name');
    let initial = 'Default';
    if (saved && themes.find((t) => t.name === saved)) initial = saved;
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) initial = 'Dark';
    setActiveTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next = activeTheme === 'Dark' ? 'Default' : 'Dark';
    setActiveTheme(next);
    localStorage.setItem('theme-name', next);
    applyTheme(next);
  };

  const isDark = activeTheme === 'Dark';

  return (
    <button
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
      className="inline-flex items-center p-1 rounded-full bg-[var(--card-background)] border backdrop-blur-sm shadow-sm"
      style={{ borderColor: 'var(--border)' }}
      title="Toggle theme"
    >
      <div
        className={`relative flex items-center w-14 h-7 rounded-full transition-colors duration-300 ${
          isDark ? 'bg-[#102033]' : 'bg-white/90'
        }`}
      >
        <span
          className={`absolute left-1 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-transform duration-300 ${
            isDark ? 'translate-x-7 bg-[var(--primary)] text-white' : 'translate-x-0 bg-[var(--primary)]/10 text-[var(--primary)]'
          }`}
        >
          {isDark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zm7.03-16.24l1.79-1.8-1.79-1.79-1.8 1.79 1.8 1.8zM20 11v2h3v-2h-3zM4.22 19.78l1.8-1.8-1.8-1.79-1.79 1.79 1.79 1.8zM12 6a6 6 0 100 12 6 6 0 000-12z" fill="currentColor" />
            </svg>
          )}
        </span>
      </div>
    </button>
  );
};

export default ThemeSwitcher;
