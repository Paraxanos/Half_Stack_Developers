// components/landing/HeroClient.tsx
'use client';

import { FaPlay } from 'react-icons/fa';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'; // adjust path if needed

export default function HeroClient() {
  const handleGoogleSignIn = () => {
    console.log('Sign in with Google');
  };

  const demoVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // replace

  return (
    <div className="max-w-3xl space-y-6 text-center">
      {/* Main Title – Static */}
      <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
        Ghost-Collab
      </h1>

      {/* Animated Subtitle – Larger */}
      <div>
        <TextGenerateEffect
          words="Find your co-founder in the next building."
          className="text-2xl md:text-3xl text-gray-100" // ↑ increased from xl → 2xl/3xl
          duration={0.6}
        />
      </div>

      {/* Animated Sub-Sub-Title – Larger & better line height */}
      <div>
        <TextGenerateEffect
          words="Ghost Collab connects student builders at your university—so you can launch faster, together."
          className="text-lg md:text-xl text-gray-300 mt-3 leading-relaxed" // ↑ from base/lg → lg/xl
          duration={0.8}
        />
      </div>

      {/* Sign In Button */}
      <div className="pt-8">
        <button
          onClick={handleGoogleSignIn}
          className="
            relative h-12 w-full max-w-xs rounded-xl
            border border-white/20 bg-white/5 backdrop-blur-xl
            text-white font-semibold
            transition-all duration-300 hover:bg-white/10 active:scale-[0.98]
            focus:outline-none focus:ring-1 focus:ring-white/40
            shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]
            before:absolute before:inset-0 before:rounded-xl
            before:bg-gradient-to-b before:from-white/10 before:to-transparent
            before:opacity-0 hover:before:opacity-100 before:transition-opacity
            md:max-w-md
          "
        >
          Sign in with Google
        </button>
      </div>

      {/* View Demo Link */}
      <div className="pt-3">
        <a
          href={demoVideoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-lg
            border border-white/15 bg-white/5 backdrop-blur-lg
            text-indigo-200 font-medium transition-all
            hover:bg-white/10 hover:text-indigo-100
            shadow-[0_4px_20px_0_rgba(0,0,0,0.15)]
          "
        >
          <FaPlay size={12} />
          View demo
        </a>
      </div>
    </div>
  );
}