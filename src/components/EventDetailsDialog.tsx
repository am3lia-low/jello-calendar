import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Calendar, Clock, MapPin, FileText, Trash2, Edit2, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface EventDetailsDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: Partial<Event>) => void;
}

export function EventDetailsDialog({
  event,
  open,
  onOpenChange,
  onDelete,
  onEdit,
}: EventDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const [editedStartTime, setEditedStartTime] = useState('');
  const [editedEndTime, setEditedEndTime] = useState('');

  useEffect(() => {
    if (event) {
      setEditedTitle(event.title);
      setEditedDescription(event.description || '');
      setEditedLocation(event.location || '');
      setEditedDate(event.date.toISOString().split('T')[0]);
      setEditedStartTime(event.startTime);
      setEditedEndTime(event.endTime);
    }
  }, [event]);

  if (!event) return null;

  const handleSave = () => {
    if (onEdit) {
      const updates: Partial<Event> = {
        title: editedTitle,
        description: editedDescription,
        location: editedLocation,
        date: new Date(editedDate),
        startTime: editedStartTime,
        endTime: editedEndTime,
      };
      onEdit(event.id, updates);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setEditedTitle(event.title);
    setEditedDescription(event.description || '');
    setEditedLocation(event.location || '');
    setEditedDate(event.date.toISOString().split('T')[0]);
    setEditedStartTime(event.startTime);
    setEditedEndTime(event.endTime);
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/80 backdrop-blur-xl border-white/20">
        <div
          className="absolute inset-0 opacity-10 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${event.color}40 0%, ${event.color}10 100%)`,
          }}
        />
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: event.color,
                boxShadow: `0 0 12px ${event.color}60`,
              }}
            />
            {isEditing ? 'Edit Event' : event.title}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update event details' : 'Event details and information'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-4 mt-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-white/60 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="bg-white/60 backdrop-blur-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={editedStartTime}
                    onChange={(e) => setEditedStartTime(e.target.value)}
                    className="bg-white/60 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={editedEndTime}
                    onChange={(e) => setEditedEndTime(e.target.value)}
                    className="bg-white/60 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  placeholder="Add location"
                  className="bg-white/60 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Add description"
                  className="bg-white/60 backdrop-blur-sm min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="text-gray-900">{formatDate(event.date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="text-gray-900">
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-gray-900">{event.location}</div>
                  </div>
                </div>
              )}

              {event.description && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-gray-900">{event.description}</div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex gap-2">
                {onEdit && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete(event.id);
                      onOpenChange(false);
                    }}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
