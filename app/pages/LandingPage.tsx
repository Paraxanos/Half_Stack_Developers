import React from 'react';
import { Button } from '@/components/ui/button'; // or use a simple <button> if you don't have Aceternity UI installed
import PixelBlast from '../../components/PixelBlast'; // your provided component
import { FaPlay } from 'react-icons/fa'; // optional: for play icon

const LandingPage = () => {
  const handleGoogleSignIn = () => {
    // TODO: Integrate Firebase Google Auth
    console.log('Initiate Google Sign-In with university email');
  };

  const demoVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Replace with your actual demo link

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-950">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          pixelSize={2}
          color="#6366f1" // indigo-500
          liquid={true}
          liquidStrength={0.08}
          rippleIntensityScale={0.6}
          edgeFade={0.15}
          transparent={true}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
        <div className="max-w-2xl space-y-8">
          {/* Hero Headline */}
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Find your co-founder in the next building.
          </h1>

          {/* Subtle Description (optional but recommended) */}
          <p className="text-lg text-gray-300">
            Ghost Collab connects student builders at your university—so you can launch faster, together.
          </p>

          {/* Primary CTA: Sign in */}
          <div className="pt-4">
            <Button
              onClick={handleGoogleSignIn}
              className="group relative h-12 w-full max-w-xs overflow-hidden rounded-full bg-white text-gray-900 shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl md:max-w-md"
            >
              <span className="relative z-10 font-semibold">Sign in with Google</span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 transition-opacity group-hover:opacity-20"></div>
            </Button>
          </div>

          {/* Demo Link */}
          <div className="pt-2">
            <a
              href={demoVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-100 transition-colors"
            >
              <FaPlay size={12} />
              View demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;