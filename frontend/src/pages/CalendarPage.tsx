import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useAvailability } from '../hooks/useAvailability';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AvailabilityBlock {
  id: string;
  user: string;
  type: string;
  startDate: Date;
  endDate: Date;
  hoursPerDay: number;
}

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { availabilities, isLoading } = useAvailability();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group availabilities by date
  const availabilitiesByDate = useMemo(() => {
    if (!availabilities) return {};

    const grouped: Record<string, AvailabilityBlock[]> = {};

    availabilities.forEach((avail) => {
      const start = parseISO(avail.start_date);
      const end = parseISO(avail.end_date);
      const daysInRange = eachDayOfInterval({ start, end });

      daysInRange.forEach((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push({
          id: avail.id,
          user: avail.user_id || 'Unknown',
          type: avail.type,
          startDate: start,
          endDate: end,
          hoursPerDay: avail.hours_per_day,
        });
      });
    });

    return grouped;
  }, [availabilities]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-500/20 border-blue-500/40';
      case 'sick':
        return 'bg-red-500/20 border-red-500/40';
      case 'partial':
        return 'bg-yellow-500/20 border-yellow-500/40';
      case 'available':
        return 'bg-green-500/20 border-green-500/40';
      default:
        return 'bg-gray-500/20 border-gray-500/40';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark">loading...</div>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <PageTransition delay={0}>
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-3xl font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark">
            Team Calendar
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark rounded transition-colors"
            >
              <ChevronLeft size={20} className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark" />
            </button>

            <span className="text-lg font-medium text-notion-text-primary-light dark:text-notion-text-primary-dark min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>

            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark rounded transition-colors"
            >
              <ChevronRight size={20} className="text-notion-text-secondary-light dark:text-notion-text-secondary-dark" />
            </button>
          </div>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <div className="bg-white dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-notion-border-light dark:border-notion-border-dark">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayAvailabilities = availabilitiesByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] p-3 border-r border-b border-notion-border-light dark:border-notion-border-dark ${
                    index % 7 === 6 ? 'border-r-0' : ''
                  } ${!isCurrentMonth ? 'bg-notion-hover-light dark:bg-notion-hover-dark' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`text-sm mb-2 ${
                        isToday
                          ? 'w-6 h-6 flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-medium'
                          : isCurrentMonth
                          ? 'text-notion-text-primary-light dark:text-notion-text-primary-dark'
                          : 'text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    <div className="space-y-1 flex-1">
                      {dayAvailabilities.slice(0, 3).map((avail, idx) => (
                        <div
                          key={`${avail.id}-${idx}`}
                          className={`text-xs px-2 py-1 rounded border ${getTypeColor(avail.type)} truncate`}
                          title={`${avail.user} - ${avail.type}`}
                        >
                          {avail.type}
                        </div>
                      ))}
                      {dayAvailabilities.length > 3 && (
                        <div className="text-xs text-notion-text-tertiary-light dark:text-notion-text-tertiary-dark pl-2">
                          +{dayAvailabilities.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageTransition>

      {/* Legend */}
      <PageTransition delay={200}>
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-blue-500/20 border-blue-500/40"></div>
            <span className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark">Vacation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-red-500/20 border-red-500/40"></div>
            <span className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark">Sick Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-yellow-500/20 border-yellow-500/40"></div>
            <span className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-green-500/20 border-green-500/40"></div>
            <span className="text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark">Available</span>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};
