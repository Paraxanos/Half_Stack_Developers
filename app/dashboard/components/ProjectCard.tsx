// src/components/dashboard/ProjectCard.tsx
'use client';

import { useState, useEffect, type KeyboardEvent } from 'react';
import { 
  FiUsers, FiZap, FiClock, FiTarget, FiArrowUpRight,
  FiLoader, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

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
  ownerId: string;
  owner: ProjectOwner;
  tags: string[];
  matchReason: string;
  stage?: string;
  timeline?: string;
  teamSize?: number;
  maxTeamSize?: number;
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

interface AlignmentAnalysis {
  text: string;
  isLoading: boolean;
  error: string | null;
  hasAttempted: boolean;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [alignment, setAlignment] = useState<AlignmentAnalysis>({
    text: '',
    isLoading: false,
    error: null,
    hasAttempted: false
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isCheckingCache, setIsCheckingCache] = useState(false);

  // Track auth state using Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Reset analysis when project changes
  useEffect(() => {
    setAlignment({ text: '', isLoading: false, error: null, hasAttempted: false });
    setIsCheckingCache(false);
  }, [project.id]);

  // Hydrate previously cached fit from backend so reload doesn't require another click.
  useEffect(() => {
    const loadCachedAlignment = async () => {
      if (!currentUser || currentUser.uid === project.ownerId || alignment.text) return;

      setIsCheckingCache(true);
      try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch('/api/gemini/alignment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ projectId: project.id, cacheOnly: true }),
        });

        if (!response.ok) return;
        const data = await response.json();
        if (typeof data?.alignment === 'string' && data.alignment.trim()) {
          setAlignment({
            text: data.alignment,
            isLoading: false,
            error: null,
            hasAttempted: true,
          });
        }
      } catch {
        // Ignore cache hydration failures and keep manual button available.
      } finally {
        setIsCheckingCache(false);
      }
    };

    void loadCachedAlignment();
  }, [alignment.text, currentUser, project.id, project.ownerId]);

  // Determine if we should show alignment features
  const shouldShowAlignment = 
    currentUser && 
    currentUser.uid !== project.ownerId &&
    !alignment.text &&
    !alignment.isLoading &&
    !isCheckingCache;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-500';
    if (score >= 80) return 'from-[#B19EEF] to-[#8B7BD4]';
    if (score >= 70) return 'from-amber-500 to-orange-500';
    return 'from-gray-500 to-gray-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Perfect';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Ideation': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Research': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'MVP': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Prototype': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Launched': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return colors[stage] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const analyzeAlignment = async () => {
    if (alignment.isLoading || !currentUser) return;
    
    setAlignment(prev => ({ ...prev, isLoading: true, error: null, hasAttempted: true }));
    
    try {
      // Get fresh ID token (force refresh to avoid expiration issues)
      const idToken = await currentUser.getIdToken(true);
      
      const response = await fetch('/api/gemini/alignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze alignment');
      }

      const { alignment: analysisText } = await response.json();
      
      setAlignment({
        text: analysisText,
        isLoading: false,
        error: null,
        hasAttempted: true
      });
    } catch (err: any) {
      console.error('Alignment analysis failed:', err);
      
      // Handle auth expiration
      if (err.message?.includes('Session expired') || err.message?.includes('Invalid token')) {
        const auth = getAuth();
        auth.signOut();
        window.location.reload();
        return;
      }
      
      setAlignment(prev => ({
        ...prev,
        error: err.message || 'Could not generate analysis. Please try again.',
        isLoading: false
      }));
    }
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full h-full flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#12121a] text-left transition-all duration-300 hover:border-[#B19EEF]/30 hover:bg-[#15151f] font-['Inter',sans-serif]"
      aria-label={`View details for project: ${project.title}`}
    >
      <div className="p-5 flex flex-col h-full">
        {/* Top row: Stage badge */}
        {project.stage && (
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStageColor(project.stage)}`}>
              {project.stage}
            </span>
          </div>
        )}

        {/* Project Title with arrow */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xl font-semibold text-white group-hover:text-[#B19EEF] transition-colors duration-300">
            {project.title}
          </h3>
          <FiArrowUpRight 
            className="text-gray-600 group-hover:text-[#B19EEF] transition-all duration-300 mt-1 flex-shrink-0" 
            size={18} 
            aria-hidden="true" 
          />
        </div>

        {/* Owner Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#B19EEF] to-[#8B7BD4] text-xs font-semibold text-[#0a0a0f] ring-2 ring-[#B19EEF]/20">
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
          <div className="flex flex-col">
            <span className="text-sm text-white/80 font-medium">{project.owner.name}</span>
            <span className="text-xs text-gray-600">
              {project.owner.department} {project.owner.year && `· ${project.owner.year}`}
            </span>
          </div>
        </div>

        {/* Elevator Pitch (truncate to 2 lines with ellipsis) */}
        <p
          className="text-sm leading-relaxed text-gray-400 mb-4 flex-1 overflow-hidden text-ellipsis break-words"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {project.elevatorPitch}
        </p>

        {/* Quick Stats Row */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          {project.teamSize && project.maxTeamSize && (
            <div className="flex items-center gap-1">
              <FiUsers size={12} className="text-[#B19EEF]/60" />
              <span>{project.teamSize}/{project.maxTeamSize}</span>
            </div>
          )}
          {project.timeline && (
            <div className="flex items-center gap-1">
              <FiClock size={12} className="text-[#B19EEF]/60" />
              <span>{project.timeline}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors duration-200 group-hover:bg-[#B19EEF]/10 group-hover:text-[#B19EEF]/80"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium text-gray-500">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* Alignment Analysis Section */}
        <div className="pt-4 border-t border-white/5">
          {/* Show analysis result */}
          {alignment.text && (
            <div 
              className="mb-3 p-3 rounded-lg bg-gradient-to-r from-[#1a132a] to-[#0f0a1a] border border-[#B19EEF]/15 animate-fade-in"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B19EEF]/20">
                  <FiZap size={10} className="text-[#B19EEF]" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {alignment.text}
                </p>
              </div>
            </div>
          )}

          {/* Show error state */}
          {alignment.error && alignment.hasAttempted && (
            <div 
              className="mb-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-2"
              role="alert"
            >
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} aria-hidden="true" />
              <span>{alignment.error}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  analyzeAlignment();
                }}
                className="ml-auto flex items-center gap-1 text-rose-200 hover:text-white text-xs font-medium"
                aria-label="Retry analysis"
              >
                <FiRefreshCw size={12} />
                Retry
              </button>
            </div>
          )}

          {/* Show "Check Fit" button when applicable */}
          {shouldShowAlignment && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                analyzeAlignment();
              }}
              disabled={alignment.isLoading}
              className={`mb-3 w-full flex items-center justify-center gap-2 py-1.5 rounded-lg transition-colors ${
                alignment.isLoading
                  ? 'bg-[#B19EEF]/20 cursor-wait'
                  : 'border border-dashed border-[#B19EEF]/30 bg-[#B19EEF]/5 text-[#B19EEF] hover:bg-[#B19EEF]/15'
              }`}
              aria-busy={alignment.isLoading}
              aria-label={`Analyze compatibility with ${project.title}`}
            >
              {alignment.isLoading ? (
                <>
                  <FiLoader className="animate-spin" size={14} aria-hidden="true" />
                  <span>Checking your fit...</span>
                </>
              ) : (
                <>
                  <FiZap size={14} aria-hidden="true" />
                  <span>Check Your Fit</span>
                </>
              )}
            </button>
          )}

          {/* "Looking for" section (always visible) */}
          <div className="flex items-center gap-1.5 mb-2">
            <FiTarget size={12} className="text-[#B19EEF]/60" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">Looking for</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.missingRoles.map((role) => (
              <span
                key={role}
                className="rounded-lg border border-[#B19EEF]/20 bg-[#B19EEF]/5 px-2.5 py-1 text-xs font-medium text-[#B19EEF] transition-all duration-200 group-hover:border-[#B19EEF]/40 group-hover:bg-[#B19EEF]/10"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}