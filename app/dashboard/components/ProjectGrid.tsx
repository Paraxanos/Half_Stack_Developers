'use client';

import ProjectCard from './ProjectCard';

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
  tags: string[];
  matchReason: string;
  teamSize?: number;
  maxTeamSize?: number;
  timeline?: string;
  stage?: string;
  createdAt?: string;
}

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export default function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        {/* Ghost illustration placeholder */}
        <div className="mb-6 text-8xl">👻</div>
        <h2 className="text-2xl font-semibold text-white">No projects yet</h2>
        <p className="mt-2 text-gray-400">
          Be the first to haunt this space—create a project!
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
      {projects.map((project) => (
        <div key={project.id} className="mb-6 break-inside-avoid">
          <ProjectCard
            project={project}
            onClick={() => onProjectClick(project)}
          />
        </div>
      ))}
    </div>
  );
}
