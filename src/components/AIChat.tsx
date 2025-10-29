import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

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

interface AIChatProps {
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onRescheduleEvent: (eventId: string, newDate: Date, newTime: string) => void;
  events: Event[];
}

export function AIChat({ onAddEvent, onRescheduleEvent, events }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your jelly calendar assistant 🍮 I can help you add events or reschedule them. Just tell me what you need!",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [pendingEvent, setPendingEvent] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const parseEventFromText = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Try to extract event details
    let title = '';
    let date = new Date();
    let startTime = '09:00';
    let endTime = '10:00';
    let location = '';
    let description = '';

    // Extract title (common patterns)
    const titlePatterns = [
      /(?:add|create|schedule|book)\s+(?:a\s+)?(?:meeting|event|appointment)?\s*(?:called|titled|named)?\s*["']([^"']+)["']/i,
      /(?:add|create|schedule|book)\s+["']([^"']+)["']/i,
      /(?:add|create|schedule|book)\s+(?:a\s+)?(?:meeting|event|appointment)?\s+([^at]+?)(?:\s+at|\s+on|\s+for|$)/i,
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) {
        title = match[1].trim();
        break;
      }
    }

    // Extract date
    const today = new Date();
    if (lowerText.includes('tomorrow')) {
      date = new Date(today);
      date.setDate(date.getDate() + 1);
    } else if (lowerText.includes('monday')) {
      date = getNextDayOfWeek(1);
    } else if (lowerText.includes('tuesday')) {
      date = getNextDayOfWeek(2);
    } else if (lowerText.includes('wednesday')) {
      date = getNextDayOfWeek(3);
    } else if (lowerText.includes('thursday')) {
      date = getNextDayOfWeek(4);
    } else if (lowerText.includes('friday')) {
      date = getNextDayOfWeek(5);
    } else if (lowerText.includes('saturday')) {
      date = getNextDayOfWeek(6);
    } else if (lowerText.includes('sunday')) {
      date = getNextDayOfWeek(0);
    } else if (lowerText.includes('today')) {
      date = today;
    }

    // Extract time
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3]?.toLowerCase();

      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      endTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // Extract location
    const locationMatch = text.match(/(?:at|in|@)\s+([^,.\n]+?)(?:\s+(?:on|at|for)|[,.]|$)/i);
    if (locationMatch && !locationMatch[1].match(/\d+:?\d*\s*(?:am|pm)/i)) {
      location = locationMatch[1].trim();
    }

    return { title, date, startTime, endTime, location, description };
  };

  const getNextDayOfWeek = (dayOfWeek: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntil = (dayOfWeek - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (daysUntil === 0 ? 7 : daysUntil));
    return targetDate;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    // Process the input
    setTimeout(() => {
      processUserInput(userInput);
    }, 500);
  };

  const processUserInput = (text: string) => {
    const lowerText = text.toLowerCase();

    // Check if user is responding to a question
    if (pendingEvent) {
      if (pendingEvent.waitingFor === 'title') {
        const colors = ['#FF6B9D', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#F97316'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        onAddEvent({
          ...pendingEvent.data,
          title: text,
          color: randomColor,
        });

        addAIMessage("Perfect! I've added that event to your calendar 🎉");
        setPendingEvent(null);
        return;
      } else if (pendingEvent.waitingFor === 'location') {
        const colors = ['#FF6B9D', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#F97316'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        onAddEvent({
          ...pendingEvent.data,
          location: text,
          color: randomColor,
        });

        addAIMessage("Great! Event added with the location 📍");
        setPendingEvent(null);
        return;
      }
    }

    // Check for reschedule requests
    if (lowerText.includes('reschedule') || lowerText.includes('move')) {
      // Find event to reschedule
      const eventToReschedule = events.find((e) =>
        lowerText.includes(e.title.toLowerCase())
      );

      if (eventToReschedule) {
        const parsed = parseEventFromText(text);
        if (parsed.date) {
          onRescheduleEvent(eventToReschedule.id, parsed.date, parsed.startTime);
          addAIMessage(`Done! I've rescheduled "${eventToReschedule.title}" 📅`);
        } else {
          addAIMessage("When would you like to reschedule it to?");
        }
      } else {
        addAIMessage("Which event would you like to reschedule?");
      }
      return;
    }

    // Check for add event requests
    if (
      lowerText.includes('add') ||
      lowerText.includes('create') ||
      lowerText.includes('schedule') ||
      lowerText.includes('book')
    ) {
      const parsed = parseEventFromText(text);

      if (!parsed.title) {
        setPendingEvent({
          waitingFor: 'title',
          data: parsed,
        });
        addAIMessage("What should I call this event?");
        return;
      }

      const colors = ['#FF6B9D', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#F97316'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      onAddEvent({
        title: parsed.title,
        description: parsed.description,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        date: parsed.date,
        location: parsed.location,
        color: randomColor,
      });

      addAIMessage(`Perfect! I've added "${parsed.title}" to your calendar ✨`);
      return;
    }

    // Default response
    addAIMessage(
      "I can help you add events (e.g., 'Add team meeting tomorrow at 2pm') or reschedule them (e.g., 'Reschedule team meeting to Friday'). What would you like to do?"
    );
  };

  const addAIMessage = (text: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
              size="icon"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <span>Jelly AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                  placeholder="Ask me to add or reschedule events..."
                  className="flex-1 bg-white/80"
                />
                <Button onClick={handleSend} size="icon" className="bg-gradient-to-br from-purple-500 to-pink-500">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
