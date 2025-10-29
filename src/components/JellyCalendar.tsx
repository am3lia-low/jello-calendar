import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { JellyEvent } from './JellyEvent';
import { EventDetailsDialog } from './EventDetailsDialog';
import { MonthlyOverview } from './MonthlyOverview';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

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

interface JellyCalendarProps {
  events: Event[];
  onEventUpdate: (events: Event[]) => void;
  onEventDelete: (id: string) => void;
}

export function JellyCalendar({
  events,
  onEventUpdate,
  onEventDelete,
}: JellyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [wobbleAll, setWobbleAll] = useState(false);
  const [dragPreview, setDragPreview] = useState<{
    eventId: string;
    dayOffset: number;
    newTop: number;
    isDragging: boolean;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDays = getWeekDays();

  const getEventsForDay = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.toDateString() === date.toDateString()
    );
  };

  const calculateEventPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateEventDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;
    return endInMinutes - startInMinutes;
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleEventDragUpdate = (eventId: string, dragInfo: { dayOffset: number; newTop: number; isDragging: boolean }) => {
    setDragPreview(dragInfo.isDragging ? { eventId, ...dragInfo } : null);
  };

  const handleEventDragEnd = (eventId: string, newTime: string, dayOffset: number) => {
    setDragPreview(null);
    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        const [hours, minutes] = newTime.split(':').map(Number);
        const [endHours, endMinutes] = event.endTime.split(':').map(Number);
        const duration = (endHours * 60 + endMinutes) - (parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1]));
        
        const newEndHours = Math.floor((hours * 60 + minutes + duration) / 60);
        const newEndMinutes = (hours * 60 + minutes + duration) % 60;
        
        // Calculate new date based on day offset
        const newDate = new Date(event.date);
        newDate.setDate(newDate.getDate() + dayOffset);
        
        return {
          ...event,
          date: newDate,
          startTime: newTime,
          endTime: `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`,
        };
      }
      return event;
    });
    onEventUpdate(updatedEvents);
  };

  const handleEventEdit = (eventId: string, updates: Partial<Event>) => {
    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        return {
          ...event,
          ...updates,
        };
      }
      return event;
    });
    onEventUpdate(updatedEvents);
  };

  const handleScroll = () => {
    setWobbleAll(true);
    setTimeout(() => setWobbleAll(false), 600);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('week');
  };

  if (viewMode === 'month') {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setViewMode('week')}
            className="bg-white/80"
          >
            Back to Week View
          </Button>
        </div>
        <MonthlyOverview
          currentDate={currentDate}
          events={events}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
          onMonthChange={navigateMonth}
        />
        <EventDetailsDialog
          event={selectedEvent}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onDelete={onEventDelete}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2
              className="text-2xl cursor-pointer hover:text-purple-600 transition-colors"
              onClick={() => setViewMode('month')}
              title="Click for monthly overview"
            >
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setViewMode('month')}
            className="bg-white/80"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Month View
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const dayColors = ['#FF6B9D', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#F97316', '#EC4899'];
            const dayColor = dayColors[idx % dayColors.length];
            
            return (
              <motion.div
                key={idx}
                animate={wobbleAll ? {
                  borderRadius: ['16px', '20px', '14px', '18px', '16px'],
                  transition: {
                    borderRadius: {
                      duration: 0.5,
                      repeat: 2,
                      ease: 'easeInOut',
                    },
                  },
                } : {}}
                whileHover={{
                  scale: 1.05,
                  borderRadius: ['16px', '20px', '14px', '18px', '16px'],
                  transition: {
                    borderRadius: {
                      duration: 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  },
                }}
                className="text-center p-2 rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: isToday 
                    ? `rgba(147, 51, 234, 0.25)` 
                    : `${dayColor}20`,
                  backdropFilter: 'blur(16px) saturate(180%)',
                  boxShadow: isToday
                    ? '0 4px 20px rgba(147, 51, 234, 0.3), inset 0 2px 4px rgba(255,255,255,0.5)'
                    : `0 4px 12px ${dayColor}15, inset 0 2px 4px rgba(255,255,255,0.5)`,
                  border: isToday
                    ? '1px solid rgba(147, 51, 234, 0.4)'
                    : `1px solid ${dayColor}30`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-sm" style={{ color: isToday ? '#7c3aed' : '#374151' }}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div style={{ color: isToday ? '#7c3aed' : '#4b5563' }}>
                    {day.getDate()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ overflowX: 'clip' }}
      >
        <div className="grid grid-cols-7 gap-2 p-4 relative" style={{ overflow: 'visible' }}>
          {weekDays.map((day, dayIdx) => {
            const dayColors = ['#FF6B9D', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#F97316', '#EC4899'];
            const dayColor = dayColors[dayIdx % dayColors.length];
            
            return (
              <motion.div
                key={dayIdx}
                animate={wobbleAll ? {
                  borderRadius: ['24px', '28px', '20px', '26px', '24px'],
                  transition: {
                    borderRadius: {
                      duration: 0.5,
                      repeat: 2,
                      ease: 'easeInOut',
                    },
                  },
                } : {}}
                className="relative min-h-[1440px] rounded-3xl overflow-visible"
                style={{
                  backgroundColor: `${dayColor}08`,
                  backdropFilter: 'blur(16px) saturate(180%)',
                  boxShadow: `0 4px 12px ${dayColor}10, inset 0 2px 4px rgba(255,255,255,0.4)`,
                  border: `1px solid ${dayColor}20`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none" />
                
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-gray-200/30"
                    style={{ top: `${hour * 60}px` }}
                  >
                    <span className="text-xs text-gray-400 ml-1">
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </span>
                  </div>
                ))}

                {/* Events */}
                {getEventsForDay(day).map((event) => (
                  <JellyEvent
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    startTime={event.startTime}
                    endTime={event.endTime}
                    color={event.color}
                    duration={calculateEventDuration(event.startTime, event.endTime)}
                    top={calculateEventPosition(event.startTime)}
                    onClick={() => handleEventClick(event)}
                    onDragEnd={(newTime, dayOffset) => handleEventDragEnd(event.id, newTime, dayOffset)}
                    onDragUpdate={(dragInfo) => handleEventDragUpdate(event.id, dragInfo)}
                    wobbleAll={wobbleAll}
                    dayWidth={scrollContainerRef.current ? (scrollContainerRef.current.offsetWidth - 32 - 12) / 7 : 0}
                  />
                ))}
              </motion.div>
            );
          })}
        </div>

        {/* Drag Preview Overlay - Rendered on top of all day columns */}
        {dragPreview && dragPreview.isDragging && (() => {
          const draggedEvent = events.find(e => e.id === dragPreview.eventId);
          if (!draggedEvent) return null;
          
          const originalDayIdx = weekDays.findIndex(d => d.toDateString() === draggedEvent.date.toDateString());
          const targetDayIdx = originalDayIdx + dragPreview.dayOffset;
          
          // Don't render if target day is outside the week
          if (targetDayIdx < 0 || targetDayIdx >= 7) return null;
          
          const previewTop = Math.max(0, Math.min(1440 - calculateEventDuration(draggedEvent.startTime, draggedEvent.endTime), dragPreview.newTop));
          
          // Calculate position based on grid layout
          const gridPadding = 16; // p-4 = 1rem = 16px
          const gap = 8; // gap-2 = 0.5rem = 8px
          const totalWidth = scrollContainerRef.current ? scrollContainerRef.current.offsetWidth - (gridPadding * 2) : 0;
          const columnWidth = (totalWidth - (gap * 6)) / 7;
          const leftPosition = gridPadding + (columnWidth + gap) * targetDayIdx;
          
          return (
            <motion.div
              className="absolute pointer-events-none overflow-visible"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 0.6,
                scale: 1,
                borderRadius: ['24px', '28px', '22px', '26px', '24px'],
              }}
              transition={{
                opacity: { duration: 0.15 },
                scale: { duration: 0.15 },
                borderRadius: {
                  duration: 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              style={{
                top: `${previewTop}px`,
                left: `${leftPosition}px`,
                width: `${columnWidth}px`,
                height: `${calculateEventDuration(draggedEvent.startTime, draggedEvent.endTime)}px`,
                backgroundColor: `${draggedEvent.color}25`,
                backdropFilter: 'blur(12px) saturate(150%)',
                boxShadow: `0 16px 64px ${draggedEvent.color}70, 0 0 0 3px ${draggedEvent.color}40, inset 0 2px 12px rgba(255,255,255,0.7)`,
                border: `2px dashed ${draggedEvent.color}`,
                borderRadius: '24px',
                zIndex: 9999,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/20 to-transparent rounded-3xl" />
              <div className="absolute inset-0 bg-gradient-to-tl from-white/30 via-transparent to-transparent rounded-3xl" />
              <div className="relative z-10 p-2 h-full flex flex-col mx-2">
                <div className="truncate drop-shadow-md" style={{ color: '#1f2937', opacity: 0.7 }}>
                  {draggedEvent.title}
                </div>
                <div className="text-xs drop-shadow-sm mt-auto" style={{ color: '#059669', opacity: 0.8 }}>
                  Drop here ✨
                </div>
              </div>
            </motion.div>
          );
        })()}
      </div>

      <EventDetailsDialog
        event={selectedEvent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDelete={onEventDelete}
        onEdit={handleEventEdit}
      />
    </div>
  );
}
