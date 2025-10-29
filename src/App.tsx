// 1. ADDED 'useEffect' to the import list
import { useState, useEffect } from 'react';

import { JellyCalendar } from './components/JellyCalendar'; // Import your calendar
import { AIChat } from './components/AIChat';             // Import your AI chat
import AppLoader from './components/AppLoader';         // Import your loader

// 2. Define the Event interface
// This must match the interface in your other files
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

// 3. Define the initial data
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Design Review',
    startTime: '11:00',
    endTime: '12:00',
    date: new Date(2025, 9, 29), // Oct 29, 2025 (Month is 0-indexed)
    color: '#a78bfa', // Purple
  },
  {
    id: '2',
    title: 'Lunch Break',
    startTime: '12:00',
    endTime: '13:00',
    date: new Date(2025, 9, 29),
    color: '#6ee7b7', // Green
  },
  {
    id: '3',
    title: 'Client Presentation',
    startTime: '14:00',
    endTime: '15:30',
    date: new Date(2025, 9, 29),
    color: '#60a5fa', // Blue
  },
  {
    id: '4',
    title: 'Code Review',
    startTime: '16:00',
    endTime: '17:00',
    date: new Date(2025, 9, 29),
    color: '#fbbf24', // Yellow
  },
  {
    id: '5',
    title: 'Project Planning',
    startTime: '10:00',
    endTime: '11:30',
    date: new Date(2025, 9, 30), // Oct 30, 2025
    color: '#f97316', // Orange
  },
  {
    id: '6',
    title: 'Workshop',
    startTime: '13:00',
    endTime: '15:00',
    date: new Date(2025, 9, 30),
    color: '#ec4899', // Pink
  },
];

export default function App() {
  // 4. Create the state here, in the parent component
  const [events, setEvents] = useState<Event[]>(initialEvents);
  
  // A (fake) loading state for the AppLoader
  const [isLoading, setIsLoading] = useState(true);

  // 5. THIS IS THE FIXED BLOCK
  // Hide loader after 1 second (for demo)
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []); // <-- This was 'useState', now it's 'useEffect'

  // 6. Create functions to modify the state
  
  // This function adds a new event (used by AIChat)
  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(), // Create a simple unique ID
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // This function updates the event list (used by JellyCalendar drag-and-drop)
  const handleEventUpdate = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
  };

  // This function deletes an event (used by the EventDetailsDialog)
  const handleEventDelete = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  // This function reschedules an event (used by AIChat)
  const handleRescheduleEvent = (eventId: string, newDate: Date, newTime: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === eventId) {
          // Simple reschedule: doesn't calculate new end time, but good for demo
          return { ...event, date: newDate, startTime: newTime };
        }
        return event;
      })
    );
  };

  return (
    <div className="h-screen w-screen">
      <AppLoader isLoading={isLoading} />

      {/* 7. Pass the state and functions down as PROPS
      */}
      <JellyCalendar
        events={events}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />

      <AIChat
        events={events}
        onAddEvent={handleAddEvent}
        onRescheduleEvent={handleRescheduleEvent}
      />
    </div>
  );
}