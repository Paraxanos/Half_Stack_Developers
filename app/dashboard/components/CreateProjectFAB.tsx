'use client';

import { FiPlus } from 'react-icons/fi';

interface CreateProjectFABProps {
  onClick: () => void;
}

export default function CreateProjectFAB({ onClick }: CreateProjectFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40 hover:rotate-90 active:scale-95 font-['Inter',sans-serif]"
      aria-label="Create new project"
    >
      <FiPlus size={24} strokeWidth={2.5} />
    </button>
  );
}
