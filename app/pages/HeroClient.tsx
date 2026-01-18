// components/landing/HeroClient.tsx
'use client';

import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const ALLOWED_EMAIL_DOMAINS = ['iiits.in'];

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
  const [showTestLogin, setShowTestLogin] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // ✅ Optional: Restrict to university emails only
      // Replace 'your-university.edu' with actual domain(s)
      // Note: This is a hint — users can still pick other accounts, but you can validate later on backend
      provider.setCustomParameters({
        // Google only supports ONE hosted domain here (UI hint only).
        // Real enforcement is done below + on backend.
        hd: 'iiits.in',
      });

      const result = await signInWithPopup(auth, provider);

      // Enforce allowed email domains (client-side)
      const email = (result.user.email || '').toLowerCase();
      const isAllowed = ALLOWED_EMAIL_DOMAINS.some((d) => email.endsWith(`@${d}`));
      if (!isAllowed) {
        await signOut(auth);
        alert(`Only ${ALLOWED_EMAIL_DOMAINS.join(' / ')} emails are allowed.`);
        return;
      }

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

  // Email/password login - also handles Google-only accounts gracefully
  const handleTestLogin = async () => {
    if (!testEmail || !testPassword) {
      alert('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      // Check what sign-in methods are available for this email
      const methods = await fetchSignInMethodsForEmail(auth, testEmail);
      
      // If account exists but only has Google provider, trigger Google sign-in
      if (methods.length > 0 && !methods.includes('password')) {
        if (methods.includes('google.com')) {
          alert('This account uses Google Sign-In. Redirecting to Google...');
          // Trigger Google sign-in with email hint
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ login_hint: testEmail });
          const result = await signInWithPopup(auth, provider);
          const idToken = await result.user.getIdToken();
          
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${idToken}` },
          });
          const data = await response.json();
          if (data.success) {
            window.location.href = '/dashboard';
          } else {
            alert('Authentication failed on server');
          }
          return;
        }
      }

      // Otherwise, try email/password login
      const result = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      const idToken = await result.user.getIdToken();

      console.log('✅ User signed in:', result.user.email);

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
        window.location.href = '/dashboard';
      } else {
        alert('Authentication failed on server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Better error messages
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        alert('Invalid email or password');
      } else if (error.code === 'auth/user-not-found') {
        alert('No account found with this email');
      } else {
        alert(`Login failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const demoVideoUrl = 'https://youtu.be/44fc9tYSw2A'; // 🔁 Replace with real demo

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
            bg-white/5
            backdrop-blur-sm
            text-white
            font-medium
            transition-all
            duration-200
            hover:bg-white/10
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

      {/* Login Button */}
      <div className="pt-1">
        {!showTestLogin ? (
          <button
            onClick={() => setShowTestLogin(true)}
            className="
              h-12 w-full max-w-xs
              rounded-xl
              border border-white/10
              bg-white/5
              backdrop-blur-sm
              text-white
              font-medium
              transition-all
              duration-200
              hover:bg-white/10
              active:scale-[0.99]
              focus:outline-none
              md:max-w-md
            "
          >
            Login
          </button>
        ) : (
          <div className="space-y-3 max-w-xs mx-auto md:max-w-md">
            <input
              type="email"
              placeholder="Email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 outline-none focus:border-white/20"
            />
            <input
              type="password"
              placeholder="Password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 outline-none focus:border-white/20"
            />
            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="
                h-12 w-full
                rounded-xl
                border border-white/10
                bg-white/5
                backdrop-blur-sm
                text-white
                font-medium
                transition-all
                duration-200
                hover:bg-white/10
                active:scale-[0.99]
                focus:outline-none
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <button
              onClick={() => setShowTestLogin(false)}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Hide
            </button>
          </div>
        )}
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