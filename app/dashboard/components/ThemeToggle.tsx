'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FiMoon, FiSun } from 'react-icons/fi';

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export default function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-xl border border-white/10 bg-white/5 px-3 py-2`}>
        <div className="h-5 w-5 rounded-full bg-white/10" />
        {!isCollapsed && <span className="h-4 w-16 rounded bg-white/10" />}
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`group flex w-full items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition-all duration-300 ease-out hover:bg-white/10 ${
        isCollapsed ? 'justify-center' : 'gap-3'
      }`}
      aria-label="Toggle theme"
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        isDark ? 'bg-[#B19EEF]/20 text-[#B19EEF]' : 'bg-amber-400/20 text-amber-400'
      }`}>
        {isDark ? <FiMoon size={16} /> : <FiSun size={16} />}
      </div>
      {!isCollapsed && (
        <div className="flex flex-1 items-center justify-between">
          <span className="text-gray-300">{isDark ? 'Dark mode' : 'Light mode'}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${
            isDark ? 'bg-[#B19EEF]/15 text-[#B19EEF]' : 'bg-amber-400/20 text-amber-400'
          }`}>
            {isDark ? 'ON' : 'ON'}
          </span>
        </div>
      )}
    </button>
  );
}
