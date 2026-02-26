'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase-client';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Project {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
}

interface UserProfile {
  uid: string;
  name: string;
  email: string;
}

const campusLocations = [
  { id: 'library', name: 'Library', emoji: '📚' },
  { id: 'cafe', name: 'Central Cafe', emoji: '☕' },
  { id: 'lab', name: 'Computer Lab', emoji: '💻' },
  { id: 'quad', name: 'Main Quad', emoji: '🌳' },
  { id: 'auditorium', name: 'Auditorium', emoji: '🎭' },
  { id: 'cafeteria', name: 'Cafeteria', emoji: '🍽️' },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
];

export default function ScheduleMeetupPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('library');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const auth = getAuth();
        
        // Fetch current user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUser({
            uid: user.uid,
            name: data.name || user.displayName || user.email?.split('@')[0] || 'User',
            email: data.email || user.email || '',
          });
        } else {
          setCurrentUser({
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
          });
        }

        // Fetch project details
        const projectId = params.projectId as string;
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        
        if (!projectDoc.exists()) {
          setError('Project not found');
          return;
        }

        const projectData = projectDoc.data();
        
        // Check if user is the project owner (can't request meetup with yourself)
        if (projectData.ownerId === user.uid) {
          setError("You can't request a meetup with your own project");
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }

        // Fetch project owner's name
        const ownerDoc = await getDoc(doc(db, 'users', projectData.ownerId));
        const ownerName = ownerDoc.exists() ? ownerDoc.data().name : 'Project Owner';

        setProject({
          id: projectId,
          title: projectData.title || 'Untitled Project',
          ownerId: projectData.ownerId,
          ownerName,
        });
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load project details');
      }
    };

    fetchData();
  }, [user, params.projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedLocation) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user || !currentUser || !project) {
      setError('Authentication required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create meetup document
      const meetupData = {
        projectId: project.id,
        projectName: project.title,
        proposerUid: user.uid,
        proposerName: currentUser.name,
        proposerEmail: currentUser.email,
        recipientUid: project.ownerId,
        recipientName: project.ownerName,
        campusSpot: selectedLocation,
        proposedDate: selectedDate,
        proposedTime: selectedTime,
        message: message.trim(),
        status: 'pending',
        createdAt: Timestamp.now(),
        proposedTimeTimestamp: Timestamp.fromDate(new Date(`${selectedDate}T${selectedTime}`)),
      };

      const meetupDoc = await addDoc(collection(db, 'meetups'), meetupData);
      const meetupId = meetupDoc.id;

      // Send request notification email to recipient
      try {
        const auth = getAuth();
        const token = await user.getIdToken();
        
        await fetch('/api/meetups/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            meetupId,
            type: 'request',
          }),
        });
      } catch (emailError) {
        console.error('Failed to send request notification email:', emailError);
        // Don't fail the request if email fails
      }

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push('/dashboard?tab=meetups');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send meetup request:', err);
      setError('Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-[#B19EEF] animate-spin" />
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 rounded-xl bg-[#B19EEF] text-[#0a0a0f] font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
          <p className="text-gray-400">
            Your meetup request has been sent to {project?.ownerName}
          </p>
          <p className="text-gray-500 text-sm mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-['Inter',sans-serif]">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#B19EEF]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-[#8B7BD4]/10 rounded-full blur-[80px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-10 md:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.06]"
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Schedule Meetup</h1>
          <p className="mt-2 text-sm text-gray-400">
            Request a meeting with <span className="text-[#B19EEF] font-medium">{project?.ownerName}</span> to discuss{' '}
            <span className="text-[#B19EEF] font-medium">{project?.title}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="rounded-2xl border border-white/10 bg-[#0c0c12]/95 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiCalendar className="text-[#B19EEF]" size={18} />
              Select Date & Time
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Date Picker */}
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Date *</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                  required
                />
              </label>

              {/* Time Picker */}
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-300">Time *</span>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time} className="bg-[#12121a]">
                      {time}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Location Selection */}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-300 block mb-3">
                <FiMapPin className="inline mr-1" size={14} />
                Meeting Location *
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {campusLocations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => setSelectedLocation(location.id)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      selectedLocation === location.id
                        ? 'bg-[#B19EEF] text-[#0a0a0f] border-[#B19EEF] shadow-lg shadow-[#B19EEF]/25'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{location.emoji}</span>
                    <span>{location.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Message */}
            <div className="mt-4">
              <label className="space-y-2 block">
                <span className="text-sm font-medium text-gray-300">
                  Message (optional)
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal note to your meetup request..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60 resize-none"
                />
              </label>
            </div>
          </div>

          {/* Summary Card */}
          {selectedDate && selectedTime && (
            <div className="rounded-2xl border border-[#B19EEF]/20 bg-[#B19EEF]/5 p-6">
              <h3 className="text-sm font-semibold text-[#B19EEF] mb-3">Meeting Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <FiCalendar size={14} />
                  <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FiClock size={14} />
                  <span>{selectedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FiMapPin size={14} />
                  <span>{campusLocations.find(l => l.id === selectedLocation)?.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center gap-2">
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !selectedDate || !selectedTime}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B19EEF] to-[#8B7BD4] px-6 py-4 text-base font-semibold text-[#0a0a0f] transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <FiLoader className="animate-spin" size={18} />
                Sending Request...
              </>
            ) : (
              <>
                <FiCheck size={18} />
                Send Meetup Request
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            The recipient will receive an email notification once they accept your request.
          </p>
        </form>
      </div>
    </div>
  );
}
