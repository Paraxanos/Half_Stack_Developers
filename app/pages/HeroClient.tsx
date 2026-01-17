// components/landing/HeroClient.tsx
'use client';

import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// 🔥 Replace with your Firebase config (from Firebase Console > Project Settings > SDK setup)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (safe to call multiple times)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function HeroClient() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // ✅ Optional: Restrict to university emails only
      // Replace 'your-university.edu' with actual domain(s)
      // Note: This is a hint — users can still pick other accounts, but you can validate later on backend
      provider.setCustomParameters({
        hd: 'iiits.in', 
      });

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(); // 🔑 This is your auth token

      // 💡 Log token for manual API testing (remove in production)
      console.log('✅ Firebase ID Token (copy this for Postman):', idToken);

      // ✅ Send token to your backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Backend verified user:', data.user);
        // Redirect to dashboard or home
        window.location.href = '/dashboard'; // or your protected route
      } else {
        alert('Authentication failed on server');
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      alert(`Login failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const demoVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // 🔁 Replace with real demo

  return (
    <div className="max-w-3xl space-y-6 text-center">
      {/* Main Title */}
      <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
        Ghost-Collab
      </h1>

      {/* Animated Subtitle */}
      <div>
        <TextGenerateEffect
          words="Find your co-founder in the next building."
          className="text-2xl md:text-3xl text-gray-100"
          duration={0.6}
        />
      </div>

      {/* Animated Sub-Sub-Title */}
      <div>
        <TextGenerateEffect
          words="Ghost Collab connects student builders at your university—so you can launch faster, together."
          className="text-lg md:text-xl text-gray-300 mt-3 leading-relaxed"
          duration={0.8}
        />
      </div>

      {/* 🔮 Nearly Invisible Sign-In Button */}
      <div className="pt-8">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="
            h-12 w-full max-w-xs
            rounded-xl
            border border-white/10
            bg-white/3
            backdrop-blur-sm
            text-white
            font-medium
            transition-all
            duration-200
            hover:bg-white/6
            active:scale-[0.99]
            focus:outline-none
            disabled:opacity-50
            disabled:cursor-not-allowed
            md:max-w-md
          "
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>

      {/* 🔮 Nearly Invisible Demo Link */}
      <div className="pt-3">
        <a
          href={demoVideoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2
            px-4 py-2
            rounded-xl
            border border-white/10
            bg-white/2
            backdrop-blur-sm
            text-indigo-200
            font-medium
            transition-all
            duration-200
            hover:bg-white/5
            hover:text-indigo-100
          "
        >
          <FaPlay size={12} />
          View demo
        </a>
      </div>
    </div>
  );
}