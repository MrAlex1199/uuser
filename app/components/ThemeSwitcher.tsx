"use client";

import React, { useState, useEffect } from 'react';

const themes = [
  { name: 'Default', colors: { '--background': '#0f172a', '--card-background': 'rgba(30, 41, 59, 0.5)', '--text': '#e2e8f0', '--primary': '#3b82f6' } },
  { name: 'Mint', colors: { '--background': '#0f2a2a', '--card-background': 'rgba(20, 89, 89, 0.5)', '--text': '#d1fae5', '--primary': '#6ee7b7' } },
  { name: 'Rose', colors: { '--background': '#2a0f1a', '--card-background': 'rgba(89, 20, 50, 0.5)', '--text': '#fce7f3', '--primary': '#f472b6' } },
  { name: 'Indigo', colors: { '--background': '#1a0f2a', '--card-background': 'rgba(50, 20, 89, 0.5)', '--text': '#e0e7ff', '--primary': '#818cf8' } },
];

const ThemeSwitcher = () => {
  const [activeTheme, setActiveTheme] = useState('Default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-name') || 'Default';
    setActiveTheme(savedTheme);
    const theme = themes.find(t => t.name === savedTheme);
    if (theme) {
      Object.entries(theme.colors).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
    }
  }, []);

  const changeTheme = (name: string) => {
    const theme = themes.find(t => t.name === name);
    if (theme) {
      setActiveTheme(name);
      localStorage.setItem('theme-name', name);
      Object.entries(theme.colors).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--card-background)] backdrop-blur-sm border border-white/10">
      {themes.map(theme => (
        <button
          key={theme.name}
          onClick={() => changeTheme(theme.name)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            activeTheme === theme.name ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/10'
          }`}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
