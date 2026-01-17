// src/app/dashboard/add-project/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiPlus, FiX, FiSave } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase-client';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

type ProjectStatus = 'open' | 'in-progress' | 'completed';

const statusOptions: ProjectStatus[] = ['open', 'in-progress', 'completed'];

const stageOptions = [
  'Idea',
  'Design',
  'Prototype',
  'MVP',
  'Pilot',
  'Scaling',
];

const roleSuggestions = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Mobile Developer',
  'UI/UX Designer',
  'Product Designer',
  'Product Manager',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Embedded Engineer',
  'AR/VR Developer',
  'Game Developer',
  'Security Engineer',
  'QA Engineer',
  'Growth Marketer',
  'Community Manager',
];

const techSuggestions = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Express',
  'Firebase',
  'Supabase',
  'PostgreSQL',
  'MongoDB',
  'Tailwind CSS',
  'Python',
  'FastAPI',
  'Django',
  'Flask',
  'Swift',
  'Kotlin',
  'Flutter',
  'React Native',
  'Unity',
  'Figma',
  'Docker',
  'AWS',
  'GCP',
  'Vercel',
  'OpenAI',
  'TensorFlow',
  'PyTorch',
  'Raspberry Pi',
  'Arduino',
];

export default function AddProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('open');
  const [timeline, setTimeline] = useState('');
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [roleGaps, setRoleGaps] = useState<string[]>([]);
  const [totalMembers, setTotalMembers] = useState(3);
  const [currentMembers, setCurrentMembers] = useState(1);
  const [githubRepo, setGithubRepo] = useState('');
  const [stage, setStage] = useState(stageOptions[0]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const filteredRoleSuggestions = useMemo(() => {
    if (!roleInput.trim()) return [];
    return roleSuggestions
      .filter((role) => !roleGaps.includes(role))
      .filter((role) => role.toLowerCase().includes(roleInput.trim().toLowerCase()))
      .slice(0, 6);
  }, [roleInput, roleGaps]);

  const filteredTechSuggestions = useMemo(() => {
    if (!techInput.trim()) return [];
    return techSuggestions
      .filter((tech) => !techStack.includes(tech))
      .filter((tech) => tech.toLowerCase().includes(techInput.trim().toLowerCase()))
      .slice(0, 8);
  }, [techInput, techStack]);

  const canSubmit = useMemo(() => {
    if (!title.trim() || !description.trim()) return false;
    if (roleGaps.length === 0 || techStack.length === 0) return false;
    if (totalMembers < 1 || currentMembers < 1) return false;
    if (currentMembers > totalMembers) return false;
    return true;
  }, [title, description, roleGaps, techStack, totalMembers, currentMembers]);

  const addItem = (value: string, list: string[], setter: (next: string[]) => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) return;
    setter([...list, trimmed]);
  };

  const removeItem = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.filter((item) => item !== value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      setFormError('You must be signed in to create a project.');
      return;
    }

    if (!canSubmit) {
      setFormError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      // 🔥 Write to Firestore with your exact schema
      const newProject = {
        ownerId: user.uid,
        title: title.trim(),
        description: description.trim(),
        roleGaps,
        status,
        createdAt: Timestamp.now(),
        timeline: timeline ? Timestamp.fromDate(new Date(timeline)) : null,
        Techstack: techStack,
        totalnumberofmembers: totalMembers,
        currentnumberofmembers: currentMembers,
        github_link: githubRepo.trim() || null, // ✅ matches your field name
        currentprojectstage: stage,
      };

      await addDoc(collection(db, 'projects'), newProject);

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Firestore write error:', error);
      setFormError('Failed to save project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-['Inter',sans-serif]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#B19EEF]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-[#8B7BD4]/10 rounded-full blur-[80px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.06]"
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        <div className="rounded-2xl border border-white/10 bg-[#0c0c12]/95 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white md:text-3xl">Add a Project</h1>
            <p className="mt-2 text-sm text-gray-400">
              Share your idea and find the right collaborators.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Project Title *</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                  placeholder="Dorm Coffee Drone"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Status *</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#12121a]">
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-300">Description *</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[140px] w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                placeholder="I want to build a drone that delivers coffee..."
                required
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Timeline (target date)</span>
                <input
                  type="date"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Current Project Stage</span>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                >
                  {stageOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#12121a]">
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Total Members *</span>
                <input
                  type="number"
                  min={1}
                  value={totalMembers}
                  onChange={(e) => setTotalMembers(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Current Members *</span>
                <input
                  type="number"
                  min={1}
                  value={currentMembers}
                  onChange={(e) => setCurrentMembers(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-medium text-gray-300">GitHub Repository</span>
              <input
                type="url"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                placeholder="https://github.com/org/project"
              />
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Role Gaps */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Role Gaps *</span>
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem(roleInput, roleGaps, setRoleGaps);
                          setRoleInput('');
                        }
                      }}
                      className="flex-1 rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                      placeholder="Mechanical Engineer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addItem(roleInput, roleGaps, setRoleGaps);
                        setRoleInput('');
                      }}
                      className="flex items-center justify-center rounded-xl bg-[#B19EEF] px-3 text-[#0a0a0f] hover:opacity-90"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  {filteredRoleSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-[#101018] p-2 shadow-xl">
                      <div className="mb-1 px-2 text-xs font-medium text-gray-500">Suggestions</div>
                      <div className="flex flex-wrap gap-2">
                        {filteredRoleSuggestions.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              addItem(role, roleGaps, setRoleGaps);
                              setRoleInput('');
                            }}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-200 transition hover:border-[#B19EEF]/40 hover:text-white"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {roleGaps.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 rounded-full border border-[#B19EEF]/20 bg-[#B19EEF]/10 px-3 py-1 text-xs text-[#B19EEF]"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => removeItem(role, roleGaps, setRoleGaps)}
                        className="text-[#B19EEF]/80 hover:text-[#B19EEF]"
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Tech Stack *</span>
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem(techInput, techStack, setTechStack);
                          setTechInput('');
                        }
                      }}
                      className="flex-1 rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                      placeholder="React, Firebase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addItem(techInput, techStack, setTechStack);
                        setTechInput('');
                      }}
                      className="flex items-center justify-center rounded-xl bg-[#B19EEF] px-3 text-[#0a0a0f] hover:opacity-90"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  {filteredTechSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-[#101018] p-2 shadow-xl">
                      <div className="mb-1 px-2 text-xs font-medium text-gray-500">Suggestions</div>
                      <div className="flex flex-wrap gap-2">
                        {filteredTechSuggestions.map((tech) => (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => {
                              addItem(tech, techStack, setTechStack);
                              setTechInput('');
                            }}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-200 transition hover:border-[#B19EEF]/40 hover:text-white"
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeItem(tech, techStack, setTechStack)}
                        className="text-gray-400 hover:text-white"
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">Fields marked with * are required.</p>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B19EEF] to-[#8B7BD4] px-6 py-3 text-sm font-semibold text-[#0a0a0f] transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiSave size={16} />
                {submitting ? 'Saving...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}