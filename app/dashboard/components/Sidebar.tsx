'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiCompass, 
  FiPlusSquare, 
  FiSearch, 
  FiBell, 
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiClock
} from 'react-icons/fi';

interface User {
  name: string;
  email: string;
  avatar: string | null;
}

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateProject: () => void;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}

const navItems = [
  { id: 'explore', label: 'Explore', icon: FiCompass },
  { id: 'meetups', label: 'Meetups', icon: FiClock },
  { id: 'search', label: 'Search People', icon: FiSearch },
  { id: 'notifications', label: 'Notifications', icon: FiBell, badge: 3 },
  { id: 'profile', label: 'Profile', icon: FiUser },
];

export default function Sidebar({
  user,
  activeTab,
  onTabChange,
  onCreateProject,
  isCollapsed,
  onCollapseChange,
}: SidebarProps) {
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-white/5">
        <a href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden">
            <img src="/ghost-collab.jpg" alt="Ghost Collab" className="h-full w-full object-cover" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-white">
              Ghost<span className="text-[#B19EEF]">Collab</span>
            </span>
          )}
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileOpen(false);
              }}
              className={`group relative flex w-full items-center rounded-xl px-3 py-3 text-left transition-all duration-300 ease-out ${
                isActive
                  ? 'bg-[#B19EEF]/15 text-[#B19EEF]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
            >
              <Icon size={22} className={isActive ? 'text-[#B19EEF]' : ''} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {item.badge && (
                <span className={`absolute ${isCollapsed ? 'right-1 top-1' : 'right-3'} flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B19EEF] px-1.5 text-xs font-bold text-[#0a0a0f]`}>
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#B19EEF]" />
              )}
            </button>
          );
        })}

        {/* Add Project Button */}
        <button
          onClick={() => {
            onCreateProject();
            setIsMobileOpen(false);
          }}
          className={`mt-4 flex w-full items-center rounded-xl bg-gradient-to-r from-[#B19EEF] to-[#8B7BD4] px-3 py-3 font-semibold text-[#0a0a0f] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-[#B19EEF]/25 ${
            isCollapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <FiPlusSquare size={22} />
          {!isCollapsed && <span>Add Project</span>}
        </button>
      </nav>

      {/* User Section */}
      <div className="border-t border-white/5 p-3 space-y-3">
        <div className={`flex items-center gap-3 rounded-xl p-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B19EEF] to-[#8B7BD4] text-sm font-semibold text-[#0a0a0f]">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Sign out"
            >
              <FiLogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-[#12121a] text-white md:hidden"
      >
        <FiMenu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-[#0a0a0f] border-r border-white/5 transition-transform duration-300 md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-2 text-gray-400 hover:text-white"
        >
          <FiX size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-full flex-col bg-[#0a0a0f] border-r border-white/5 transition-[width] duration-300 ease-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
        
        {/* Collapse Toggle - Sleek pill button */}
        <button
          onClick={() => onCollapseChange(!isCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#B19EEF]/10 border border-[#B19EEF]/20 text-[#B19EEF] transition-all duration-300 hover:bg-[#B19EEF]/20 hover:scale-110 hover:shadow-lg hover:shadow-[#B19EEF]/20">
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>
      </aside>
    </>
  );
}
