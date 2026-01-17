'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiGithub, FiLinkedin, FiGlobe, FiMail, FiCalendar, FiBookOpen, FiMapPin } from 'react-icons/fi';
import { db } from '@/lib/firebase-client';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
  name: string;
  email: string;
  avatar: string | null;
  department?: string;
  year?: number | null;
  bio?: string;
  skills: string[];
  workStyle?: 'early-bird' | 'night-owl';
  intensity?: 'casual' | 'hardcore';
  github?: string;
  linkedin?: string;
  portfolio?: string;
  projectsJoined?: number;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
          setError('User not found');
          return;
        }

        const data = userDoc.data();
        setProfile({
          name: data.name || 'Anonymous',
          email: data.email || '',
          avatar: data.avatar || null,
          department: data.department || '',
          year: data.year || null,
          bio: data.bio || '',
          skills: data.skills || [],
          workStyle: data.workStyle || 'night-owl',
          intensity: data.intensity || 'casual',
          github: data.github || '',
          linkedin: data.linkedin || '',
          portfolio: data.portfolio || '',
          projectsJoined: data.projectsJoined || 0,
        });
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="text-red-400">{error || 'Profile not found'}</div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#B19EEF] hover:underline"
        >
          <FiArrowLeft size={16} />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft size={18} />
          Back
        </button>

        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-6 md:p-8">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#B19EEF]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B19EEF] to-[#8B7BD4] text-3xl font-bold text-white shadow-lg shadow-[#B19EEF]/20 md:h-32 md:w-32 md:text-4xl">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white md:text-3xl">{profile.name}</h2>
              
              <div className="mt-2 flex flex-wrap items-center gap-3 text-gray-400">
                {profile.email && (
                  <span className="flex items-center gap-1.5">
                    <FiMail size={14} /> {profile.email}
                  </span>
                )}
                {profile.department && (
                  <span className="flex items-center gap-1.5">
                    <FiBookOpen size={14} /> {profile.department}
                  </span>
                )}
                {profile.year && (
                  <span className="flex items-center gap-1.5">
                    <FiCalendar size={14} /> Year {profile.year}
                  </span>
                )}
              </div>

              {/* Bio */}
              <div className="mt-4">
                <p className="text-gray-400">{profile.bio || 'No bio yet.'}</p>
              </div>

              {/* Stats */}
              <div className="mt-4 flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.projectsJoined}</div>
                  <div className="text-sm text-gray-500">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.skills.length}</div>
                  <div className="text-sm text-gray-500">Skills</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {(profile.github || profile.linkedin || profile.portfolio) && (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              {profile.github && (
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-[#B19EEF]/30 hover:text-white"
                >
                  <FiGithub size={16} /> {profile.github}
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-[#B19EEF]/30 hover:text-white"
                >
                  <FiLinkedin size={16} /> {profile.linkedin}
                </a>
              )}
              {profile.portfolio && (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-[#B19EEF]/30 hover:text-white"
                >
                  <FiGlobe size={16} /> Portfolio
                </a>
              )}
            </div>
          )}
        </div>

        {/* Skills Section */}
        {profile.skills.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-[#B19EEF]/10 border border-[#B19EEF]/20 text-[#B19EEF] text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vibe Check Section */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Work Style</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xl">{profile.workStyle === 'early-bird' ? '🌅' : '🌙'}</span>
              <span className="text-gray-300 capitalize">{profile.workStyle?.replace('-', ' ') || 'Night Owl'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xl">{profile.intensity === 'hardcore' ? '🔥' : '☕'}</span>
              <span className="text-gray-300 capitalize">{profile.intensity || 'Casual'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
