import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: Date;
  color: string;
  location?: string;
}

interface MonthlyOverviewProps {
  currentDate: Date;
  events: Event[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
  onMonthChange: (increment: number) => void;
}

export function MonthlyOverview({
  currentDate,
  events,
  onDayClick,
  onEventClick,
  onMonthChange,
}: MonthlyOverviewProps) {
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      return (
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="p-6 bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl">{monthName}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(1)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-7 gap-4 h-full">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-gray-600 pb-2"
            >
              {day}
            </div>
          ))}

          {/* Blank cells for alignment */}
          {blanks.map((blank) => (
            <div key={`blank-${blank}`} />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  const clickedDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  );
                  onDayClick(clickedDate);
                }}
                className={`relative rounded-2xl p-3 cursor-pointer bg-white/40 backdrop-blur-sm border border-white/40 hover:border-purple-300 transition-all ${
                  isToday ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className={`text-sm mb-2 ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
                  {day}
                </div>

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dayEvents.slice(0, 6).map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{
                          scale: 1.5,
                          borderRadius: ['50%', '40%', '60%', '50%'],
                          transition: {
                            borderRadius: {
                              duration: 0.6,
                              repeat: Infinity,
                            },
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="w-3 h-3 rounded-full cursor-pointer"
                        style={{
                          backgroundColor: event.color,
                          boxShadow: `0 0 8px ${event.color}60`,
                        }}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 6 && (
                      <div className="w-3 h-3 flex items-center justify-center text-xs text-gray-600">
                        +{dayEvents.length - 6}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
