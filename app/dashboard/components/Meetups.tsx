'use client';

import { useState } from 'react';

interface Meetup {
  id: string;
  time: string;
  person: string;
  location: string;
  projectName: string;
  status: 'pending' | 'completed';
}

// Mock data
const mockMeetups: Meetup[] = [
  {
    id: '1',
    time: '2:00 PM',
    person: 'Sarah Chen',
    location: 'Library - Room 201',
    projectName: 'AI Chatbot',
    status: 'pending',
  },
  {
    id: '2',
    time: '3:30 PM',
    person: 'Alex Johnson',
    location: 'Cafe Central',
    projectName: 'Mobile App',
    status: 'pending',
  },
  {
    id: '3',
    time: '1:00 PM',
    person: 'Emily Zhang',
    location: 'Lab 5',
    projectName: 'Data Pipeline',
    status: 'completed',
  },
  {
    id: '4',
    time: '10:00 AM',
    person: 'Marcus Williams',
    location: 'Office A',
    projectName: 'Web Platform',
    status: 'completed',
  },
];

interface MeetupCardProps {
  meetup: Meetup;
}

const MeetupCard = ({ meetup }: MeetupCardProps) => {
  const badgeColor = meetup.status === 'pending' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white';

  return (
    <div className="p-3 border border-[#333333] rounded-lg bg-[#0f0f14]/50 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[#B19EEF] text-sm font-semibold tracking-wide uppercase mb-1">{meetup.time}</p>
          <p className="text-white font-semibold text-base mb-1 line-clamp-1">{meetup.person}</p>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">📍</span>
            <p className="text-gray-400 text-sm line-clamp-1">{meetup.location}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className={`inline-block text-sm px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${badgeColor}`}>
            {meetup.projectName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Meetups() {
  const pendingMeetups = mockMeetups.filter(m => m.status === 'pending');
  const completedMeetups = mockMeetups.filter(m => m.status === 'completed');

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Pending Meetups */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mb-2 flex items-center gap-2 sticky top-0 bg-[#0f0f14]/40 py-1 z-10">
          <div className="w-1 h-5 bg-gradient-to-b from-[#B19EEF] to-transparent rounded-full"></div>
          <h3 className="text-white font-bold text-base tracking-tight">Upcoming</h3>
          <span className="ml-auto text-[#B19EEF] text-xs font-semibold">{pendingMeetups.length}</span>
        </div>
        <div className="space-y-2">
          {pendingMeetups.length > 0 ? (
            pendingMeetups.map(meetup => (
              <MeetupCard key={meetup.id} meetup={meetup} />
            ))
          ) : (
            <p className="text-gray-500 text-xs">No upcoming meetups</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-[#333333] via-[#B19EEF]/20 to-[#333333]"></div>

      {/* Completed Meetups */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mb-2 flex items-center gap-2 sticky top-0 bg-[#0f0f14]/40 py-1 z-10">
          <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-transparent rounded-full"></div>
          <h3 className="text-white font-bold text-base tracking-tight">Completed</h3>
          <span className="ml-auto text-emerald-500 text-xs font-semibold">{completedMeetups.length}</span>
        </div>
        <div className="space-y-2">
          {completedMeetups.length > 0 ? (
            completedMeetups.map(meetup => (
              <MeetupCard key={meetup.id} meetup={meetup} />
            ))
          ) : (
            <p className="text-gray-500 text-xs">No completed meetups</p>
          )}
        </div>
      </div>
    </div>
  );
}
