'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiZap, FiClock, FiTarget, FiLayers } from 'react-icons/fi';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

interface ProjectOwner {
  name: string;
  avatar: string | null;
  department: string;
  year?: string;
}

interface Project {
  id: string;
  title: string;
  elevatorPitch: string;
  missingRoles: string[];
  compatibilityScore: number;
  owner: ProjectOwner;
  ownerId: string;
  tags: string[];
  matchReason: string;
  teamSize?: number;
  maxTeamSize?: number;
  timeline?: string;
  stage?: string;
  createdAt?: string;
}

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project,
  isOpen,
  onClose,
}: ProjectDetailModalProps) {
  const [isRequestingMeetup, setIsRequestingMeetup] = useState(false);
  const [meetupError, setMeetupError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Perfect';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRequestMeetup = async () => {
    setIsRequestingMeetup(true);
    setMeetupError(null);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
      const proposerName = userSnap.exists() ? (userSnap.data() as any).name : 'User';

      await addDoc(collection(db, 'meetups'), {
        projectId: project.id,
        projectName: project.title,
        proposerUid: currentUser.uid,
        proposerName,
        recipientUid: project.ownerId,
        recipientName: project.owner.name,
        campusSpot: 'library',
        proposedTime: serverTimestamp(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      onClose();
    } catch (err) {
      console.error('Failed to request meetup:', err);
      setMeetupError('Failed to send request. Please try again.');
    } finally {
      setIsRequestingMeetup(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0c12] shadow-2xl font-['Inter',sans-serif]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Minimal elegant design */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-10 group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 transition-all duration-200 group-hover:bg-[#B19EEF]/10 group-hover:border-[#B19EEF]/30">
              <svg 
                className="h-4 w-4 text-gray-500 transition-all duration-200 group-hover:text-[#B19EEF]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>

          {/* Header Section */}
          <div className="p-6 pb-0">
            {/* Match Score - Circular design */}
            <div className="flex items-start gap-5">
              {/* Score Circle */}
              <div className="relative flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#B19EEF]"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${project.compatibilityScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{project.compatibilityScore}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Match</span>
                </div>
              </div>

              {/* Title & Owner */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  {project.stage && (
                    <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-gray-400">
                      {project.stage}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white truncate">{project.title}</h2>
                
                {/* Owner */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#B19EEF] to-[#8B7BD4] text-xs font-semibold text-[#0a0a0f]">
                    {project.owner.avatar ? (
                      <img
                        src={project.owner.avatar}
                        alt={project.owner.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(project.owner.name)
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">{project.owner.name}</span>
                    <span className="text-sm text-gray-500"> · {project.owner.department}</span>
                    {project.owner.year && (
                      <span className="text-sm text-gray-600"> · {project.owner.year}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 px-6 py-4">
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
              <FiUsers className="mx-auto mb-1 text-[#B19EEF]" size={16} />
              <div className="text-lg font-semibold text-white">
                {project.teamSize || 1}/{project.maxTeamSize || 5}
              </div>
              <div className="text-xs text-gray-500">Team Size</div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
              <FiClock className="mx-auto mb-1 text-[#B19EEF]" size={16} />
              <div className="text-lg font-semibold text-white">{project.timeline || '3 months'}</div>
              <div className="text-xs text-gray-500">Timeline</div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
              <FiLayers className="mx-auto mb-1 text-[#B19EEF]" size={16} />
              <div className="text-lg font-semibold text-white">{project.createdAt || 'Recently'}</div>
              <div className="text-xs text-gray-500">Posted</div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-5 px-6 pb-6">
            {/* The Idea */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <FiTarget size={12} />
                The Idea
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {project.elevatorPitch}
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-[#B19EEF]/10 border border-[#B19EEF]/15 px-2.5 py-1 text-xs font-medium text-[#B19EEF]/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <FiUsers size={12} />
                Looking For
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.missingRoles.map((role) => (
                  <span
                    key={role}
                    className="rounded-lg border border-dashed border-[#B19EEF]/40 bg-[#B19EEF]/5 px-3 py-1.5 text-xs font-medium text-[#B19EEF]"
                  >
                    + {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions - Sticky */}
          <div className="sticky bottom-0 border-t border-white/5 bg-[#0c0c12]/95 backdrop-blur-sm p-4">
            <div className="flex gap-3">
              <button
                onClick={handleRequestMeetup}
                disabled={isRequestingMeetup}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B19EEF] to-[#9580D1] px-5 py-3 text-sm font-semibold text-[#0a0a0f] transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                <FiCalendar size={16} />
                {isRequestingMeetup ? 'Sending...' : 'Request Meetup'}
              </button>
            </div>
            {meetupError && (
              <p className="mt-2 text-center text-xs text-red-400">{meetupError}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
