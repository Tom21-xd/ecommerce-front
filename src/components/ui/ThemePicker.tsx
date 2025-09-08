
"use client";
import { useEffect, useState } from "react";
import { Moon, Sun, Laptop2 } from "lucide-react";

const themes = [
  { value: "system", label: "Sistema", icon: <Laptop2 size={16} /> },
  { value: "light", label: "Claro", icon: <Sun size={16} /> },
  { value: "dark", label: "Oscuro", icon: <Moon size={16} /> },
];

export function ThemePicker() {
  const [theme, setTheme] = useState<string>("system");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
    applyTheme(saved || "system");
  }, []);

  function applyTheme(t: string) {
    setTheme(t);
    localStorage.setItem("theme", t);
    if (t === "system") {
      document.documentElement.classList.remove("dark");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    } else if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setOpen(false);
  }

  const current = themes.find(t => t.value === theme) || themes[0];

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-100 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Cambiar tema"
        type="button"
      >
        {current.icon}
        <span className="hidden sm:inline">{current.label}</span>
        <svg className="ml-1 w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 12 12"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-32 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg animate-fade-in">
          {themes.map(t => (
            <button
              key={t.value}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition ${theme === t.value ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-neutral-700 dark:text-neutral-100"}`}
              onClick={() => applyTheme(t.value)}
              type="button"
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
