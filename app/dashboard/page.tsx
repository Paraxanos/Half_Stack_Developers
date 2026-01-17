// src/app/dashboard/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase-client';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Sidebar from './components/Sidebar';
import ProjectGrid from './components/ProjectGrid';
import ProjectDetailModal from './components/ProjectDetailModal';
import FilterSortBar from './components/FilterSortBar';
import SearchPeople from './components/SearchPeople';
import Notifications from './components/Notifications';
import MyProfile from './components/MyProfile';
import Meetups from './components/Meetups';
import Schedule from './components/Schedule';
import { FiLoader } from 'react-icons/fi';

// Project type definition (matches your UI)
interface Project {
  id: string;
  title: string;
  elevatorPitch: string;
  missingRoles: string[];
  compatibilityScore: number;
  owner: {
    name: string;
    avatar: string | null;
    department: string;
    year?: string;
  };
  tags: string[];
  matchReason: string;
  teamSize?: number;
  maxTeamSize?: number;
  timeline?: string;
  stage?: string;
  createdAt?: string;
  createdTimestamp?: number;
}

// Role filter mapping
const roleFilterMapping: Record<string, string[]> = {
  frontend: ['Frontend Dev', 'UI Designer'],
  backend: ['Backend Dev', 'DevOps'],
  ml: ['ML Engineer', 'AI Engineer'],
  mobile: ['Mobile Dev'],
  design: ['UI Designer'],
  fullstack: ['Full Stack Dev'],
};

// Stage filter mapping
const stageFilterMapping: Record<string, string> = {
  ideation: 'Ideation',
  mvp: 'MVP',
  prototype: 'Prototype',
  launched: 'Launched',
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [currentSort, setCurrentSort] = useState('match');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from Firestore on mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setLoadingProjects(true);
        setError(null);

        // Query projects ordered by creation time (newest first)
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProjects.push({
            id: doc.id,
            title: data.title || 'Untitled Project',
            elevatorPitch: data.description || '',
            missingRoles: Array.isArray(data.roleGaps) ? data.roleGaps : [],
            compatibilityScore: Math.floor(Math.random() * 20) + 80, // TODO: Replace with real AI score
            owner: {
              name: 'Anonymous', // TODO: Fetch owner name from users/{ownerId}
              avatar: null,
              department: 'Unknown',
              year: '',
            },
            tags: Array.isArray(data.Techstack) ? data.Techstack : [],
            matchReason: 'You have relevant skills for this project.', // TODO: Real AI reason
            teamSize: data.currentnumberofmembers || 1,
            maxTeamSize: data.totalnumberofmembers || 5,
            timeline: data.timeline ? new Date(data.timeline.toDate()).toLocaleDateString() : '',
            stage: data.currentprojectstage || 'Ideation',
            createdAt: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : '',
            createdTimestamp: data.createdAt?.toDate()?.getTime() || Date.now(),
          });
        });

        setProjects(fetchedProjects);
      } catch (err: any) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [user]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Apply filters
    if (activeFilters.length > 0) {
      const roleFilters = activeFilters.filter(f => roleFilterMapping[f]);
      const stageFilters = activeFilters.filter(f => stageFilterMapping[f]);

      result = result.filter((project) => {
        const matchesRole = roleFilters.length === 0 || roleFilters.some((filter) => {
          const roles = roleFilterMapping[filter];
          return project.missingRoles.some((role) =>
            roles.some((r) => role.toLowerCase().includes(r.toLowerCase()))
          );
        });

        const matchesStage = stageFilters.length === 0 || stageFilters.some((filter) => {
          return project.stage?.toLowerCase() === stageFilterMapping[filter].toLowerCase();
        });

        return matchesRole && matchesStage;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (currentSort) {
        case 'match':
          return b.compatibilityScore - a.compatibilityScore;
        case 'recent':
          return (b.createdTimestamp || 0) - (a.createdTimestamp || 0);
        case 'trending':
          const aScore = a.compatibilityScore * 0.6 + ((a.createdTimestamp || 0) / Date.now()) * 40;
          const bScore = b.compatibilityScore * 0.6 + ((b.createdTimestamp || 0) / Date.now()) * 40;
          return bScore - aScore;
        default:
          return 0;
      }
    });

    return result;
  }, [projects, activeFilters, currentSort]);

  const userData = user
    ? {
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: null,
      }
    : null;

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleCreateProject = () => {
    router.push('/dashboard/add-project');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-[#B19EEF] animate-spin" suppressHydrationWarning />
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-['Inter',sans-serif]">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#B19EEF]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-[#8B7BD4]/10 rounded-full blur-[80px] animate-pulse delay-1000" />
        <div className="absolute -bottom-20 right-1/3 w-40 h-40 bg-[#B19EEF]/5 rounded-full blur-[60px] animate-pulse delay-500" />
      </div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(177,158,239,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(177,158,239,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0" />

      {/* Sidebar */}
      <Sidebar
        user={userData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateProject={handleCreateProject}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`relative z-10 min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div
          className={`px-4 py-8 md:px-8 pt-16 md:pt-8 w-full ${
            isSidebarCollapsed ? 'max-w-none' : 'max-w-7xl'
          }`}
        >
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {activeTab === 'explore' && (
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Explore Projects
                </span>
              )}
              {activeTab === 'meetups' && (
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Meetups
                </span>
              )}
              {activeTab === 'search' && 'Search People'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
            <p className="mt-2 text-gray-500">
              {activeTab === 'explore' &&
                `${filteredAndSortedProjects.length} projects looking for someone like you`}
              {activeTab === 'meetups' && 'Your upcoming and completed meetups'}
              {activeTab === 'search' && 'Find collaborators across departments'}
              {activeTab === 'notifications' && 'Stay updated on your matches'}
              {activeTab === 'profile' && 'Manage your skills and preferences'}
            </p>
          </div>

          {/* Tab Content */}
          {activeTab === 'explore' && (
            <>
              <FilterSortBar
                currentSort={currentSort}
                onSortChange={setCurrentSort}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
              />
              {loadingProjects ? (
                <div className="flex justify-center py-12">
                  <FiLoader className="w-6 h-6 text-[#B19EEF] animate-spin" />
                </div>
              ) : error ? (
                <div className="text-red-400 text-center py-6">{error}</div>
              ) : (
                <ProjectGrid
                  projects={filteredAndSortedProjects}
                  onProjectClick={handleProjectClick}
                />
              )}
            </>
          )}

          {activeTab === 'meetups' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Meetups Section - 2/3 width */}
              <div className="lg:col-span-2 border border-[#333333] rounded-lg p-6 bg-[#0f0f14]/40 backdrop-blur-sm hover:border-[#B19EEF] transition-colors">
                <Meetups />
              </div>

              {/* Schedule Section - 1/3 width */}
              <div className="lg:col-span-1 border border-[#333333] rounded-lg p-6 bg-[#0f0f14]/40 backdrop-blur-sm hover:border-[#B19EEF] transition-colors">
                <Schedule />
              </div>
            </div>
          )}

          {activeTab === 'search' && <SearchPeople />}
          {activeTab === 'notifications' && <Notifications />}
          {activeTab === 'profile' && <MyProfile user={userData} />}
        </div>
      </main>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}