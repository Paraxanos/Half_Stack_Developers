// src/components/dashboard/SearchPeople.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiMapPin, FiCode, FiStar, FiUser } from 'react-icons/fi';
import { db } from '@/lib/firebase-client';
import { collection, getDocs, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Person {
  id: string;
  name: string;
  avatar: string | null;
  department: string;
  year: string;
  skills: string[];
  interests: string[];
  lookingFor: string;
  matchScore: number;
}

const skillFilters = ['Frontend', 'Backend', 'Mobile', 'AI/ML', 'Design', 'Business', 'IoT'];
const departmentFilters = ['Computer Science', 'Design', 'Business', 'Electronics', 'Data Science'];

const skillKeywordMap: Record<string, string[]> = {
  Frontend: ['React', 'Next.js', 'Vue', 'Angular', 'HTML', 'CSS', 'Tailwind', 'Svelte'],
  Backend: ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'Go', 'Rust'],
  Mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS'],
  'AI/ML': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'Computer Vision', 'ML', 'AI'],
  Design: ['Figma', 'UI/UX', 'Illustration', 'Adobe XD', 'Sketch', 'Prototyping'],
  Business: ['Marketing', 'Sales', 'Strategy', 'Pitching', 'Finance', 'Operations'],
  IoT: ['Arduino', 'Raspberry Pi', 'Embedded', 'PCB', 'Hardware', 'Robotics'],
};

export default function SearchPeople() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSkillFilters, setActiveSkillFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user's UID to filter them out
        const auth = getAuth();
        const currentUid = auth.currentUser?.uid;

        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);

        const fetchedPeople: Person[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.email?.includes('@')) return;
          
          // Filter out the current user from search results
          if (doc.id === currentUid) return;

          const matchScore = Math.floor(Math.random() * 25) + 75;

          fetchedPeople.push({
            id: doc.id,
            name: data.name || 'Anonymous',
            avatar: data.avatar || null,
            department: data.department || 'Unknown',
            year: data.year ? `Year ${data.year}` : '',
            skills: Array.isArray(data.skills) ? data.skills : [],
            interests: Array.isArray(data.interests) ? data.interests : [],
            // ✅ Use `bio` instead of "Open to collaboration"
            lookingFor: data.bio || 'No bio yet',
            matchScore,
          });
        });

        setPeople(fetchedPeople);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load people. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredPeople = people.filter((person) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        person.name.toLowerCase().includes(query) ||
        person.department.toLowerCase().includes(query) ||
        person.skills.some((s) => s.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    if (activeSkillFilters.length > 0) {
      const hasMatchingSkill = activeSkillFilters.some((filter) => {
        const keywords = skillKeywordMap[filter] || [filter];
        return person.skills.some((skill) =>
          keywords.some((kw) => skill.toLowerCase().includes(kw.toLowerCase()))
        );
      });
      if (!hasMatchingSkill) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-400">Loading people...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-6">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skill, or department..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#12121a] border border-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#B19EEF]/40 transition-all duration-300"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
            showFilters
              ? 'bg-[#B19EEF]/10 border-[#B19EEF]/30 text-[#B19EEF]'
              : 'bg-[#12121a] border-white/5 text-gray-400 hover:border-[#B19EEF]/30'
          }`}
        >
          <FiFilter size={16} />
          Filters
        </button>
      </div>

      {/* Skill Filters */}
      {showFilters && (
        <div className="rounded-xl bg-[#12121a] border border-white/5 p-4">
          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skillFilters.map((skill) => (
              <button
                key={skill}
                onClick={() => {
                  if (activeSkillFilters.includes(skill)) {
                    setActiveSkillFilters(activeSkillFilters.filter((s) => s !== skill));
                  } else {
                    setActiveSkillFilters([...activeSkillFilters, skill]);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSkillFilters.includes(skill)
                    ? 'bg-[#B19EEF] text-[#0a0a0f]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPeople.map((person) => (
          <div
            key={person.id}
            className="group flex flex-col h-full rounded-2xl bg-[#12121a] border border-white/5 p-5 hover:border-[#B19EEF]/30 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#B19EEF] to-[#8B7BD4] flex items-center justify-center text-lg font-semibold text-[#0a0a0f]">
                {person.avatar ? (
                  <img src={person.avatar} alt={person.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(person.name)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{person.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <FiMapPin size={12} />
                  {person.department} · {person.year}
                </div>
              </div>
            </div>

            {/* Bio - fixed height area */}
            <p className="mt-4 text-sm text-gray-400 line-clamp-2 min-h-[40px]">{person.lookingFor}</p>

            {/* Skills - flex-1 to push button down */}
            <div className="mt-4 flex flex-wrap gap-1.5 flex-1">
              {person.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400 h-fit"
                >
                  {skill}
                </span>
              ))}
              {person.skills.length > 4 && (
                <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-500 h-fit">
                  +{person.skills.length - 4}
                </span>
              )}
            </div>

            <button
              onClick={() => router.push(`/dashboard/profile/${person.id}`)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#B19EEF]/10 border border-[#B19EEF]/20 text-[#B19EEF] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#B19EEF]/20 transition-all duration-200"
            >
              <FiUser size={16} />
              View Profile
            </button>
          </div>
        ))}
      </div>

      {filteredPeople.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white">No matches found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}