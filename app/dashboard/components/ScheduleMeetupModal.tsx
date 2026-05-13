'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiCheck, FiLoader, FiAlertCircle, FiX } from 'react-icons/fi';
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

interface ScheduleMeetupModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ScheduleMeetupModal({
  projectId,
  isOpen,
  onClose,
  onSuccess
}: ScheduleMeetupModalProps) {
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
  const [initialLoading, setInitialLoading] = useState(true);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // document.body.style.overflow = 'hidden'; // Managed by parent modal usually, or we can add
      
      const fetchData = async () => {
        if (!user || !projectId) return;
        setInitialLoading(true);
        setError(null);
        setSuccess(false);
        try {
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
          const projectDoc = await getDoc(doc(db, 'projects', projectId));
          
          if (!projectDoc.exists()) {
            setError('Project not found');
            setInitialLoading(false);
            return;
          }

          const projectData = projectDoc.data();
          
          // Check if user is the project owner
          if (projectData.ownerId === user.uid) {
            setError("You can't request a meetup with your own project");
            setInitialLoading(false);
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
        } finally {
          setInitialLoading(false);
        }
      };

      fetchData();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, user, projectId, onClose]);

  if (!isOpen) return null;

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
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send meetup request:', err);
      setError('Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0c12] shadow-2xl font-['Inter',sans-serif]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 transition-all duration-200 hover:bg-[#B19EEF]/10 hover:border-[#B19EEF]/30"
          >
            <FiX className="h-4 w-4 text-gray-500 hover:text-[#B19EEF]" />
          </button>

          <div className="p-6">
            {initialLoading || authLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FiLoader className="w-8 h-8 text-[#B19EEF] animate-spin mb-4" />
                <p className="text-gray-400">Loading details...</p>
              </div>
            ) : success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
                <p className="text-gray-400">
                  Your meetup request has been sent to {project?.ownerName}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Schedule Meetup</h2>
                  <p className="text-sm text-gray-400">
                    Request a meeting with <span className="text-[#B19EEF] font-medium">{project?.ownerName}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-gray-300">Date *</span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={today}
                        className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
                        required
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-gray-300">Time *</span>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#B19EEF]/60"
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

                  <div>
                    <span className="text-sm font-medium text-gray-300 block mb-2">
                      <FiMapPin className="inline mr-1" size={14} />
                      Meeting Location *
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {campusLocations.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => setSelectedLocation(location.id)}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                            selectedLocation === location.id
                              ? 'bg-[#B19EEF] text-[#0a0a0f] border-[#B19EEF] shadow-lg shadow-[#B19EEF]/25'
                              : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-base">{location.emoji}</span>
                          <span className="truncate">{location.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="space-y-2 block">
                      <span className="text-sm font-medium text-gray-300">Personal Note (optional)</span>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Say hello, mention what you'd like to discuss..."
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B19EEF]/60 resize-none"
                      />
                    </label>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-center gap-2">
                      <FiAlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !selectedDate || !selectedTime}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B19EEF] to-[#8B7BD4] px-6 py-3.5 text-sm font-semibold text-[#0a0a0f] transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 mt-4"
                  >
                    {submitting ? (
                      <>
                        <FiLoader className="animate-spin" size={16} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiCheck size={16} />
                        Send Request
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
