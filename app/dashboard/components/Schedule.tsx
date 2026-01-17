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
    day: 'Mon',
    date: 'Jan 20',
    meetups: [
      { time: '2:00 PM', person: 'Sarah Chen', projectName: 'AI Chatbot' },
    ],
  },
  {
    day: 'Tue',
    date: 'Jan 21',
    meetups: [],
  },
  {
    day: 'Wed',
    date: 'Jan 22',
    meetups: [
      { time: '3:30 PM', person: 'Alex Johnson', projectName: 'Mobile App' },
    ],
  },
  {
    day: 'Thu',
    date: 'Jan 23',
    meetups: [],
  },
  {
    day: 'Fri',
    date: 'Jan 24',
    meetups: [],
  },
  {
    day: 'Sat',
    date: 'Jan 25',
    meetups: [],
  },
  {
    day: 'Sun',
    date: 'Jan 26',
    meetups: [],
  },
];

interface DayCardProps {
  day: DaySchedule;
}

const DayCard = ({ day }: DayCardProps) => {
  const hasMeetups = day.meetups.length > 0;

  return (
    <div className={`p-3 rounded-lg border ${ 
      hasMeetups
        ? 'border-[#B19EEF] bg-[#B19EEF]/10'
        : 'border-[#333333] bg-[#0f0f14]/40'
    } backdrop-blur-sm`}>
      <div className="flex flex-col gap-2">
        {/* Day Header */}
        <div className="border-b border-[#333333] pb-2">
          <p className={`text-sm font-bold uppercase tracking-wide mb-0.5 ${hasMeetups ? 'text-[#B19EEF]' : 'text-gray-500'}`}>
            {day.day}
          </p>
          <p className="text-sm text-gray-400">{day.date}</p>
        </div>

        {/* Meetups or Empty State */}
        {hasMeetups ? (
          <div className="space-y-1.5">
            {day.meetups
              .sort((a, b) => convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time))
              .map((meetup, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <p className="text-[#B19EEF] text-sm font-semibold">{meetup.time}</p>
                  <p className="text-white text-sm font-medium line-clamp-1">{meetup.person}</p>
                  <p className="text-gray-400 text-sm line-clamp-1">{meetup.projectName}</p>
                </div>
              ))}
          </div>
        ) : (
          <div className="py-1 text-center">
            <p className="text-gray-500 text-sm">Free</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Schedule() {
  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="sticky top-0 bg-[#0f0f14]/40 py-1 z-10">
        <h3 className="text-white font-bold text-base flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-[#B19EEF] to-transparent rounded-full"></span>
          Schedule
        </h3>
      </div>
      
      {/* Grid of Day Cards */}
      <div className="grid grid-cols-1 gap-2 flex-1 min-h-0 overflow-y-auto">
        {mockScheduleData.map((day) => (
          <DayCard key={day.day} day={day} />
        ))}
      </div>
    </div>
  );
}
