import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  className?: string;
  style?: React.CSSProperties;
}

interface Props {
  events: CalendarEvent[];
  view: 'month' | 'week' | 'day';
  date: Date;
  onNavigate: (date: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onSelectSlot: (start: Date, end: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  eventPropGetter?: (event: CalendarEvent) => { className?: string; style?: React.CSSProperties };
}

export function SimpleCalendar({
  events,
  view,
  date,
  onNavigate,
  onViewChange,
  onSelectSlot,
  onSelectEvent,
  eventPropGetter,
}: Props) {
  const today = new Date();
  
  const goToPrevious = () => {
    const newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    onNavigate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onNavigate(newDate);
  };

  const goToToday = () => {
    onNavigate(new Date());
  };

  const formatDateLabel = () => {
    const options: Intl.DateTimeFormatOptions = view === 'month' 
      ? { month: 'long', year: 'numeric' }
      : view === 'week'
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="ml-2 font-semibold text-foreground">{formatDateLabel()}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange('week')}
          >
            Week
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {view === 'day' && (
          <DayView
            date={date}
            events={events}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventPropGetter}
          />
        )}
        {view === 'week' && (
          <WeekView
            date={date}
            events={events}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventPropGetter}
          />
        )}
        {view === 'month' && (
          <MonthView
            date={date}
            events={events}
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventPropGetter}
          />
        )}
      </div>
    </div>
  );
}

// Day View Component
function DayView({ date, events, onSelectSlot, onSelectEvent, eventPropGetter }: any) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter((e: CalendarEvent) => {
    const eventDate = new Date(e.start);
    return eventDate.toDateString() === date.toDateString();
  });

  return (
    <div className="border border-border rounded-lg">
      <div className="grid grid-cols-[80px_1fr]">
        <div className="bg-muted/30 border-r border-border px-2 py-1 text-xs font-medium text-center">
          Time
        </div>
        <div className="bg-muted/30 px-2 py-1 text-xs font-medium text-center">
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>
      {hours.map((hour) => (
        <div key={hour} className="grid grid-cols-[80px_1fr] border-t border-border">
          <div className="px-2 py-2 text-xs text-muted-foreground border-r border-border">
            {hour.toString().padStart(2, '0')}:00
          </div>
          <div
            className="px-2 py-2 min-h-[60px] hover:bg-accent/50 cursor-pointer relative"
            onClick={() => {
              const start = new Date(date);
              start.setHours(hour, 0, 0, 0);
              const end = new Date(start);
              end.setHours(hour + 1);
              onSelectSlot(start, end);
            }}
          >
            {dayEvents
              .filter((e: CalendarEvent) => {
                const eventHour = new Date(e.start).getHours();
                return eventHour === hour;
              })
              .map((event: CalendarEvent) => {
                const props = eventPropGetter?.(event) || {};
                return (
                  <div
                    key={event.id}
                    className={`p-2 mb-1 rounded text-xs cursor-pointer ${props.className || 'bg-primary/10 text-primary'}`}
                    style={props.style}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(event);
                    }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-[10px] opacity-75">
                      {new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(event.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Week View Component
function WeekView({ date, events, onSelectSlot, onSelectEvent, eventPropGetter }: any) {
  const getWeekDays = (d: Date) => {
    const week = [];
    const curr = new Date(d);
    const first = curr.getDate() - curr.getDay();
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr);
      day.setDate(first + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(date);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="border border-border rounded-lg overflow-x-auto">
      <div className="grid grid-cols-[80px_repeat(7,minmax(100px,1fr))]">
        <div className="bg-muted/30 border-r border-b border-border px-2 py-1 text-xs font-medium"></div>
        {weekDays.map((day, i) => (
          <div key={i} className="bg-muted/30 border-r last:border-r-0 border-b border-border px-2 py-1 text-xs font-medium text-center">
            <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="text-sm">{day.getDate()}</div>
          </div>
        ))}
      </div>
      {hours.map((hour) => (
        <div key={hour} className="grid grid-cols-[80px_repeat(7,minmax(100px,1fr))] border-t border-border">
          <div className="px-2 py-2 text-xs text-muted-foreground border-r border-border">
            {hour.toString().padStart(2, '0')}:00
          </div>
          {weekDays.map((day, i) => {
            const dayEvents = events.filter((e: CalendarEvent) => {
              const eventStart = new Date(e.start);
              return (
                eventStart.toDateString() === day.toDateString() &&
                eventStart.getHours() === hour
              );
            });

            return (
              <div
                key={i}
                className="px-1 py-2 min-h-[60px] border-r last:border-r-0 border-border hover:bg-accent/50 cursor-pointer relative"
                onClick={() => {
                  const start = new Date(day);
                  start.setHours(hour, 0, 0, 0);
                  const end = new Date(start);
                  end.setHours(hour + 1);
                  onSelectSlot(start, end);
                }}
              >
                {dayEvents.map((event: CalendarEvent) => {
                  const props = eventPropGetter?.(event) || {};
                  return (
                    <div
                      key={event.id}
                      className={`p-1 mb-1 rounded text-[10px] cursor-pointer ${props.className || 'bg-primary/10 text-primary'}`}
                      style={props.style}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Month View Component
function MonthView({ date, events, onSelectEvent, eventPropGetter }: any) {
  const getMonthDays = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add previous month's days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(prevDate);
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const monthDays = getMonthDays(date);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="border border-border rounded-lg">
      <div className="grid grid-cols-7">
        {weekDays.map((day) => (
          <div key={day} className="bg-muted/30 border-r last:border-r-0 border-b border-border px-2 py-2 text-xs font-medium text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((day, i) => {
          if (!day) return null;
          const isCurrentMonth = day.getMonth() === date.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = events.filter((e: CalendarEvent) => {
            return new Date(e.start).toDateString() === day.toDateString();
          });

          return (
            <div
              key={i}
              className={`min-h-[100px] border-r last:border-r-0 border-b last:border-b-0 p-2 ${
                !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
              } ${isToday ? 'bg-primary/5' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''
              }`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event: CalendarEvent) => {
                  const props = eventPropGetter?.(event) || {};
                  return (
                    <div
                      key={event.id}
                      className={`px-2 py-1 rounded text-[10px] cursor-pointer truncate ${props.className || 'bg-primary/10 text-primary'}`}
                      style={props.style}
                      onClick={() => onSelectEvent(event)}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
