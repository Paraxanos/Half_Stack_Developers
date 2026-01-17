'use client';

interface Meetup {
  time: string;
  person: string;
  projectName: string;
}

interface DaySchedule {
  day: string;
  date: string;
  meetups: Meetup[];
}

// Helper function to convert time to minutes for sorting
const convertTimeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Mock data
const mockScheduleData: DaySchedule[] = [
  {
    day: 'Monday',
    date: 'Jan 20',
    meetups: [
      { time: '2:00 PM', person: 'Sarah Chen', projectName: 'AI Chatbot' },
    ],
  },
  {
    day: 'Tuesday',
    date: 'Jan 21',
    meetups: [],
  },
  {
    day: 'Wednesday',
    date: 'Jan 22',
    meetups: [
      { time: '3:30 PM', person: 'Alex Johnson', projectName: 'Mobile App' },
    ],
  },
  {
    day: 'Thursday',
    date: 'Jan 23',
    meetups: [],
  },
  {
    day: 'Friday',
    date: 'Jan 24',
    meetups: [],
  },
  {
    day: 'Saturday',
    date: 'Jan 25',
    meetups: [],
  },
  {
    day: 'Sunday',
    date: 'Jan 26',
    meetups: [],
  },
];

export default function Schedule() {
  return (
    <div className="space-y-3 h-full bg-[#B19EEF]/10 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Weekly Schedule</h3>
      <div className="space-y-2">
        {mockScheduleData.map((day) => (
          <div key={day.day} className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-300 font-medium">{day.day}</span>
              <span className="text-gray-500 text-xs">{day.date}</span>
            </div>
            {day.meetups.length > 0 ? (
              <div className="space-y-1 ml-2">
                {day.meetups
                  .sort((a, b) => convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time))
                  .map((meetup, idx) => (
                    <div key={idx} className="text-xs text-gray-400">
                      <span className="text-[#B19EEF]">{meetup.time}</span> - {meetup.person}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500 ml-2">Free day</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
