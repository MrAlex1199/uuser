"use client";

import { useEffect } from "react";

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
  { name: "Default", colors: lightTheme },
  { name: "Dark", colors: darkTheme },
];

const applyTheme = (themeName: string) => {
  const theme = themes.find((t) => t.name === themeName);
  if (!theme) return;
  Object.entries(theme.colors).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value as string);
  });
  if (themeName === "Dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const ThemeInitializer: React.FC = () => {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme-name");
      let initial = "Default";
      if (saved && themes.find((t) => t.name === saved)) {
        initial = saved;
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        initial = "Dark";
      }
      applyTheme(initial);
    } catch (e) {
      // ignore (localStorage not available)
    }
  }, []);

  return null;
};

export default ThemeInitializer;
