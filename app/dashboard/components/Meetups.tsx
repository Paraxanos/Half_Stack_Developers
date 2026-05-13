'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiCheckCircle, FiZap, FiUsers, FiCoffee, FiLoader, FiInbox, FiCheck, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { db } from '@/lib/firebase-client';
import { collection, query, where, getDocs, or, orderBy, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';

interface Meetup {
  id: string;
  date: string;
  time: string;
  person: string;
  department?: string;
  skills?: string[];
  location: string;
  projectName: string;
  message?: string;
  status: 'pending' | 'completed' | 'accepted' | 'declined';
  isIncomingRequest?: boolean;
  proposerUid?: string;
  recipientUid?: string;
  proposerEmail?: string;
  recipientEmail?: string;
}

interface MeetupCardProps {
  meetup: Meetup;
  onAccept?: (meetupId: string) => Promise<void>;
  onDecline?: (meetupId: string) => Promise<void>;
  showActions?: boolean;
}

const MeetupCard = ({ meetup, onAccept, onDecline, showActions }: MeetupCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  // Styling based on status
  let avatarBg = 'bg-[#B19EEF]/20 text-[#B19EEF]';
  let cardBorder = 'border-white/10 hover:border-[#B19EEF]/40';
  let cardBg = 'bg-white/[0.03] hover:bg-white/[0.05]';

  if (meetup.status === 'accepted') {
    avatarBg = 'bg-emerald-500/15 text-emerald-300';
    cardBorder = 'border-emerald-500/30 hover:border-emerald-500/50';
    cardBg = 'bg-emerald-500/5 hover:bg-emerald-500/10';
  } else if (meetup.status === 'declined') {
    avatarBg = 'bg-red-500/15 text-red-300';
    cardBorder = 'border-red-500/30 hover:border-red-500/50';
    cardBg = 'bg-red-500/5 hover:bg-red-500/10';
  }

  return (
    <div 
      className={`group flex-shrink-0 w-[280px] rounded-xl border ${cardBorder} ${cardBg} p-4 transition-all cursor-pointer flex flex-col`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${avatarBg} font-semibold text-sm`}>
          {getInitials(meetup.person)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start">
            <p className="text-white font-medium truncate">{meetup.person}</p>
            {isExpanded ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
          </div>
          <p className="text-xs text-[#B19EEF] truncate">{meetup.projectName}</p>
          
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FiCalendar size={11} className="text-gray-500" />
              {meetup.date}
            </span>
            <span className="flex items-center gap-1">
              <FiClock size={11} className="text-gray-500" />
              {meetup.time}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <FiMapPin size={11} />
            <span className="truncate">{meetup.location}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3" onClick={(e) => e.stopPropagation()}>
          {meetup.department && (
            <div className="text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Department:</span> {meetup.department}
            </div>
          )}
          {meetup.skills && meetup.skills.length > 0 && (
            <div className="text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Skills:</span> {meetup.skills.slice(0,3).join(', ')}{meetup.skills.length > 3 ? '...' : ''}
            </div>
          )}
          {meetup.message && (
            <div className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg italic">
              "{meetup.message}"
            </div>
          )}

          {showActions && onAccept && onDecline && meetup.status === 'pending' && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAccept(meetup.id); }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
              >
                <FiCheck size={12} /> Accept
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDecline(meetup.id); }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
              >
                <FiX size={12} /> Decline
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Meetups() {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setError('Not signed in');
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, 'meetups'),
          or(
            where('proposerUid', '==', uid),
            where('recipientUid', '==', uid)
          ),
          orderBy('proposedTime', 'desc')
        );

        const snapshot = await getDocs(q);
        const meetupList: Meetup[] = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();

          // Check if meetup is older than 30 days, clean it up
          const proposedDateObj = data.proposedTimeTimestamp?.toDate?.() || data.proposedTime?.toDate?.();
          if (proposedDateObj && proposedDateObj < thirtyDaysAgo) {
            try {
              await deleteDoc(doc(db, 'meetups', docSnap.id));
            } catch (delErr) {
              console.error('Failed to clean up old meetup:', delErr);
            }
            continue; // Skip adding to the list
          }

          // Determine other user's UID
          const otherUid = data.proposerUid === uid 
            ? data.recipientUid 
            : data.proposerUid;

          // Check if this is an incoming request (user is recipient and status is pending)
          const isIncomingRequest = data.recipientUid === uid && data.status === 'pending';

          // Fetch real name from users collection
          const userDoc = await getDoc(doc(db, 'users', otherUid));
          let otherName = 'Unknown';
          let department = '';
          let skills: string[] = [];

          if (userDoc.exists()) {
            const userData = userDoc.data();
            otherName = userData.name || 'Unknown';
            department = userData.department || '';
            skills = userData.skills || [];
          }

          // Format date and time from proposedTime
          const dateStr = proposedDateObj 
            ? proposedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'TBD';
          const timeStr = proposedDateObj
            ? proposedDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'TBD';

          meetupList.push({
            id: docSnap.id,
            date: dateStr,
            time: timeStr,
            person: otherName,
            department,
            skills,
            location: data.campusSpot === 'library' ? 'Library' : data.campusSpot === 'cafe' ? 'Central Cafe' : data.campusSpot || 'Location TBD',
            projectName: data.projectName || data.projectname || 'Untitled Project',
            message: data.message,
            status: data.status || 'pending',
            isIncomingRequest,
            proposerUid: data.proposerUid,
            recipientUid: data.recipientUid,
          });
        }

        setMeetups(meetupList);
        setError(null);
      } catch (err: any) {
        console.error('Meetups error:', err);
        setError('Failed to load meetups. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetups();
  }, []);

  // Separate incoming requests from confirmed meetups
  const incomingRequests = meetups.filter(m => m.isIncomingRequest);
  const pendingMeetups = meetups.filter(m => m.status === 'pending' && !m.isIncomingRequest);
  const acceptedMeetups = meetups.filter(m => m.status === 'accepted');
  const completedMeetups = meetups.filter(m => m.status === 'completed');
  const declinedMeetups = meetups.filter(m => m.status === 'declined');

  // Handle accepting/declining requests
  const handleRequestAction = async (meetupId: string, action: 'accepted' | 'declined') => {
    try {
      // Update status in Firestore
      await updateDoc(doc(db, 'meetups', meetupId), { 
        status: action,
        acceptedAt: new Date(),
      });
      
      // If accepted, send confirmation emails
      if (action === 'accepted') {
        try {
          const auth = getAuth();
          const token = await auth.currentUser?.getIdToken();
          
          await fetch('/api/meetups/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              meetupId,
              type: 'confirmation',
            }),
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the acceptance if email fails
        }
      }
      
      // Update local state and show toast notification
      setMeetups(prev => prev.map(m =>
        m.id === meetupId
          ? { ...m, status: action, isIncomingRequest: false }
          : m
      ));

      if (action === 'accepted') {
        toast.success('Meetup request accepted!');
      } else {
        toast.error('Meetup request declined.');
      }

    } catch (err) {
      console.error('Failed to update request:', err);
      toast.error('Failed to update request status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <FiLoader className="animate-spin mr-2" size={20} />
        Loading your meetups...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="flex flex-wrap items-center gap-3">
        {incomingRequests.length > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm">
            <FiInbox size={14} className="text-amber-400" />
            <span className="text-amber-400 font-medium">{incomingRequests.length}</span>
            <span className="text-gray-400">pending requests</span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-[#B19EEF]/30 bg-[#B19EEF]/10 px-3 py-1.5 text-sm">
          <FiCalendar size={14} className="text-[#B19EEF]" />
          <span className="text-[#B19EEF] font-medium">{pendingMeetups.length + acceptedMeetups.length}</span>
          <span className="text-gray-400">upcoming</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm">
          <FiCheckCircle size={14} className="text-emerald-400" />
          <span className="text-emerald-400 font-medium">{completedMeetups.length}</span>
          <span className="text-gray-400">completed</span>
        </div>
      </div>

      {/* Pending Requests Section */}
      {incomingRequests.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-white">
            <FiInbox size={16} className="text-amber-400" />
            <h3 className="font-semibold">Pending Requests</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {incomingRequests.map(request => (
              <MeetupCard
                key={request.id}
                meetup={request}
                showActions
                onAccept={(id) => handleRequestAction(id, 'accepted')}
                onDecline={(id) => handleRequestAction(id, 'declined')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming & Accepted */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-white">
          <FiCalendar size={16} className="text-[#B19EEF]" />
          <h3 className="font-semibold">Upcoming</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {(pendingMeetups.length > 0 || acceptedMeetups.length > 0) ? (
            [...acceptedMeetups, ...pendingMeetups].map(meetup => (
              <MeetupCard key={meetup.id} meetup={meetup} />
            ))
          ) : (
            <div className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="text-sm font-medium text-gray-300">No upcoming meetups yet</p>
              <p className="mt-1 text-xs text-gray-500">Go meet people and build something awesome.</p>
            </div>
          )}
        </div>
      </div>

      {/* Declined Meetups (if any) */}
      {declinedMeetups.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-white">
            <FiX size={16} className="text-red-400" />
            <h3 className="font-semibold text-red-400">Declined Requests</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 opacity-80">
            {declinedMeetups.map(meetup => (
              <MeetupCard key={meetup.id} meetup={meetup} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-white">
          <FiCheckCircle size={16} className="text-emerald-400" />
          <h3 className="font-semibold">Completed</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {completedMeetups.length > 0 ? (
            completedMeetups.map(meetup => (
              <MeetupCard key={meetup.id} meetup={meetup} />
            ))
          ) : (
            <div className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="text-sm font-medium text-gray-300">No completed meetups yet</p>
              <p className="mt-1 text-xs text-gray-500">Your finished meetups will show here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#B19EEF]/5 to-transparent p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <FiZap size={14} className="text-[#B19EEF]" />
          Meetup Tips
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-2 rounded-lg bg-white/[0.02] p-3">
            <FiCoffee size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-300">Be on time</p>
              <p className="text-[11px] text-gray-500">First impressions matter</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-white/[0.02] p-3">
            <FiUsers size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-300">Share ideas openly</p>
              <p className="text-[11px] text-gray-500">Collaboration is key</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-white/[0.02] p-3">
            <FiCalendar size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-300">Follow up</p>
              <p className="text-[11px] text-gray-500">Stay connected after</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
