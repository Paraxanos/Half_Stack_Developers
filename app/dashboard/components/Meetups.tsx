// src/components/dashboard/Meetups.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-client';
import { collection, query, where, getDocs, or, orderBy, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Meetup {
  id: string;
  time: string;
  person: string;
  location: string;
  projectName: string;
  status: 'pending' | 'completed';
}

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

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();

          // Determine other user's UID
          const otherUid = data.proposerUid === uid 
            ? data.recipientUid 
            : data.proposerUid;

          // Fetch real name from users collection
          const userDoc = await getDoc(doc(db, 'users', otherUid));
          const otherName = userDoc.exists() ? userDoc.data().name || 'Unknown' : 'Unknown';

          meetupList.push({
            id: docSnap.id,
            time: data.proposedTime 
              ? new Date(data.proposedTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'TBD',
            person: otherName, // ✅ Real name
            location: data.campusSpot === 'library' ? 'Library' : 'Central Cafe',
            projectName: data.projectname || 'Untitled Project',
            status: data.status || 'pending',
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

  const pendingMeetups = meetups.filter(m => m.status === 'pending');
  const completedMeetups = meetups.filter(m => m.status === 'completed');

  if (loading) {
    return <div className="text-gray-400">Loading your meetups...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-6">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-3">Upcoming</h3>
        <div className="space-y-3">
          {pendingMeetups.length > 0 ? (
            pendingMeetups.map(meetup => (
              <MeetupCard key={meetup.id} meetup={meetup} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No upcoming meetups</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Completed</h3>
        <div className="space-y-3">
          {completedMeetups.length > 0 ? (
            completedMeetups.map(meetup => (
              <MeetupCard key={meetup.id} meetup={meetup} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No completed meetups</p>
          )}
        </div>
      </div>
    </div>
  );
}

const MeetupCard = ({ meetup }: { meetup: Meetup }) => {
  const badgeColor = meetup.status === 'pending' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white';

  return (
    <div className="p-4 border border-[#333333] rounded-lg hover:border-[#B19EEF] transition-colors bg-[#0f0f14]/40 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-gray-400 text-sm">{meetup.time}</p>
          <p className="text-white font-medium">{meetup.person}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
          {meetup.projectName}
        </span>
      </div>
      <p className="text-gray-400 text-sm">{meetup.location}</p>
    </div>
  );
};