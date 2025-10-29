import { useState } from "react";
import { JellyCalendar } from "./components/JellyCalendar";
import { AIChat } from "./components/AIChat";

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

// Sample events
const getInitialEvents = (): Event[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  return [
    {
      id: "1",
      title: "Team Standup",
      description: "Daily team sync-up meeting",
      startTime: "09:00",
      endTime: "09:30",
      date: today,
      color: "#FF6B9D",
      location: "Conference Room A",
    },
    {
      id: "2",
      title: "Design Review",
      description: "Review new product designs",
      startTime: "11:00",
      endTime: "12:00",
      date: today,
      color: "#A78BFA",
      location: "Design Studio",
    },
    {
      id: "3",
      title: "Lunch Break",
      description: "Lunch with the team",
      startTime: "12:00",
      endTime: "13:00",
      date: today,
      color: "#34D399",
    },
    {
      id: "4",
      title: "Client Presentation",
      description: "Present Q4 roadmap to client",
      startTime: "14:00",
      endTime: "15:30",
      date: today,
      color: "#60A5FA",
      location: "Virtual - Zoom",
    },
    {
      id: "5",
      title: "Code Review",
      description: "Review PR #234",
      startTime: "16:00",
      endTime: "17:00",
      date: today,
      color: "#FBBF24",
    },
    {
      id: "6",
      title: "Project Planning",
      description: "Plan next sprint",
      startTime: "10:00",
      endTime: "11:30",
      date: tomorrow,
      color: "#F97316",
      location: "Meeting Room 3",
    },
    {
      id: "7",
      title: "Workshop",
      description: "UX Design Workshop",
      startTime: "13:00",
      endTime: "15:00",
      date: tomorrow,
      color: "#EC4899",
      location: "Studio B",
    },
    {
      id: "8",
      title: "Team Retrospective",
      description: "Sprint retrospective",
      startTime: "09:00",
      endTime: "10:00",
      date: dayAfterTomorrow,
      color: "#8B5CF6",
      location: "Conference Room A",
    },
  ];
};

function App() {
  const [events, setEvents] = useState<Event[]>(
    getInitialEvents(),
  );

  const handleAddEvent = (newEvent: Omit<Event, "id">) => {
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(),
    };
    setEvents([...events, event]);
  };

  const handleRescheduleEvent = (
    eventId: string,
    newDate: Date,
    newTime: string,
  ) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? { ...event, date: newDate, startTime: newTime }
          : event,
      ),
    );
  };

  const handleEventUpdate = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
  };

  const handleEventDelete = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <div className="w-full h-screen overflow-hidden">
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

export default App;