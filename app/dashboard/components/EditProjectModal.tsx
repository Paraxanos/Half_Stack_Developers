'use client';

import { useEffect, useState } from 'react';
import { FiX, FiSave, FiUsers, FiClock, FiTarget, FiPlus } from 'react-icons/fi';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

interface EditableProject {
  id: string;
  title: string;
  currentMembers: number;
  totalMembers: number;
  timeline: string;
  stage: string;
  roleGaps: string[];
}

interface EditProjectModalProps {
  project: EditableProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: EditableProject) => void;
}

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

export default function EditProjectModal({
  project,
  isOpen,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const [currentMembers, setCurrentMembers] = useState(1);
  const [totalMembers, setTotalMembers] = useState(5);
  const [timeline, setTimeline] = useState('');
  const [stage, setStage] = useState('Idea');
  const [roleGaps, setRoleGaps] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);

  // Initialize form when project changes
  useEffect(() => {
    if (project) {
      setCurrentMembers(project.currentMembers || 1);
      setTotalMembers(project.totalMembers || 5);
      setTimeline(project.timeline || '');
      setStage(project.stage || 'Idea');
      setRoleGaps(project.roleGaps || []);
      setError(null);
    }
  }, [project]);

  // Handle escape key
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

  const filteredRoleSuggestions = roleInput.trim()
    ? roleSuggestions
        .filter((role) => !roleGaps.includes(role))
        .filter((role) => role.toLowerCase().includes(roleInput.trim().toLowerCase()))
        .slice(0, 6)
    : [];

  const addRole = (role: string) => {
    const trimmed = role.trim();
    if (!trimmed) return;
    if (roleGaps.some((r) => r.toLowerCase() === trimmed.toLowerCase())) return;
    setRoleGaps([...roleGaps, trimmed]);
    setRoleInput('');
    setShowRoleSuggestions(false);
  };

  const removeRole = (role: string) => {
    setRoleGaps(roleGaps.filter((r) => r !== role));
  };

  const handleSave = async () => {
    if (!project) return;

    // Validation
    if (currentMembers > totalMembers) {
      setError('Current members cannot exceed total members');
      return;
    }
    if (currentMembers < 1 || totalMembers < 1) {
      setError('Member counts must be at least 1');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const projectRef = doc(db, 'projects', project.id);
      
      const updateData: any = {
        currentnumberofmembers: currentMembers,
        totalnumberofmembers: totalMembers,
        currentprojectstage: stage,
        roleGaps: roleGaps,
        updatedAt: Timestamp.now(),
      };

      // Only update timeline if provided
      if (timeline) {
        updateData.timeline = Timestamp.fromDate(new Date(timeline));
      }

      await updateDoc(projectRef, updateData);

      // Notify parent of successful save
      onSave({
        ...project,
        currentMembers,
        totalMembers,
        timeline,
        stage,
        roleGaps,
      });

      onClose();
    } catch (err: any) {
      console.error('Failed to update project:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
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
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0c12] shadow-2xl font-['Inter',sans-serif]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 transition-all duration-200 group-hover:bg-[#B19EEF]/10 group-hover:border-[#B19EEF]/30">
              <FiX className="h-4 w-4 text-gray-500 transition-all duration-200 group-hover:text-[#B19EEF]" />
            </div>
          </button>

          {/* Header */}
          <div className="p-6 pb-0">
            <h2 className="text-xl font-bold text-white">Edit Project</h2>
            <p className="mt-1 text-sm text-gray-400">{project.title}</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {/* Team Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <FiUsers size={14} className="text-[#B19EEF]" />
                  Current Members
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalMembers}
                  value={currentMembers}
                  onChange={(e) => setCurrentMembers(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <FiUsers size={14} className="text-[#B19EEF]" />
                  Total Members
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalMembers}
                  onChange={(e) => setTotalMembers(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FiClock size={14} className="text-[#B19EEF]" />
                Timeline (Target Date)
              </label>
              <input
                type="date"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
              />
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FiTarget size={14} className="text-[#B19EEF]" />
                Current Stage
              </label>
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
            </div>

            {/* Looking For Roles */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FiUsers size={14} className="text-[#B19EEF]" />
                Looking For Roles
              </label>

              {/* Current Roles */}
              <div className="flex flex-wrap gap-2 mb-2">
                {roleGaps.map((role) => (
                  <span
                    key={role}
                    className="group flex items-center gap-1.5 rounded-lg border border-[#B19EEF]/30 bg-[#B19EEF]/10 px-3 py-1.5 text-sm text-[#B19EEF]"
                  >
                    {role}
                    <button
                      onClick={() => removeRole(role)}
                      className="text-[#B19EEF]/60 transition-colors hover:text-red-400"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Role Input */}
              <div className="relative">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#12121a] px-4 py-3">
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onFocus={() => setShowRoleSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 150)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRole(roleInput);
                      }
                    }}
                    placeholder="Add a role..."
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                  />
                  <button
                    onClick={() => addRole(roleInput)}
                    className="text-gray-400 hover:text-[#B19EEF] transition-colors"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showRoleSuggestions && filteredRoleSuggestions.length > 0 && (
                  <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-xl border border-white/10 bg-[#1a1a24] p-2 shadow-xl">
                    {filteredRoleSuggestions.map((role) => (
                      <button
                        key={role}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addRole(role)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#B19EEF]/10 hover:text-[#B19EEF] transition-colors"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 p-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B19EEF] to-[#9580D1] px-4 py-3 text-sm font-semibold text-[#0a0a0f] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              <FiSave size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
