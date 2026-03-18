import React, { useState, useMemo } from 'react';
import { useAvailability } from '../hooks/useAvailability';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, parseISO, isToday } from 'date-fns';
import { DateDetailsModal } from '../components/DateDetailsModal';
import { QuickAddModal } from '../components/QuickAddModal';
import { TeamMemberFilter } from '../components/TeamMemberFilter';
import { useModal } from '../hooks/useModal';

interface AvailabilityBlock {
  id: string;
  user: string;
  type: string;
  startDate: Date;
  endDate: Date;
  hoursPerDay: number;
}

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { availabilities, isLoading, createAvailability } = useAvailability();
  const { showAlert, ModalComponent } = useModal();

  // Modal state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateDetails, setShowDateDetails] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Filter state
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Role-based permissions
  const isApprover = user?.role === 'ba' || user?.role === 'manager';
  const isDeveloper = user?.role === 'dev';

  // Filter availabilities based on role
  const filteredAvailabilities = useMemo(() => {
    if (!availabilities) return [];

    // Developers only see their own entries
    if (isDeveloper) {
      return availabilities.filter(a => a.user_id === user?.id);
    }

    // BA/Manager/Marek see all entries
    return availabilities;
  }, [availabilities, isDeveloper, user?.id]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Mock team members
  const teamMembers = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Developer User', role: 'DEV', initials: 'DU', color: 'bg-orange-500', status: 'IN', hours: '10-18' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'BA User', role: 'BA', initials: 'BU', color: 'bg-purple-600', status: 'IN', hours: '8-17' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Manager User', role: 'MANAGER', initials: 'MU', color: 'bg-green-600', status: 'OUT', hours: '' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Marek', role: 'MANAGER', initials: 'M', color: 'bg-blue-600', status: 'IN', hours: '9-17' },
    { id: '00000000-0000-0000-0000-000000000005', name: 'Client User', role: 'CLIENT', initials: 'CU', color: 'bg-pink-600', status: 'PARTIAL', hours: '9-13' },
  ];

  // Filter availabilities by team members
  const filteredByTeamMembers = useMemo(() => {
    if (!filteredAvailabilities) return [];
    if (selectedTeamMembers.length === 0) return filteredAvailabilities;
    return filteredAvailabilities.filter(a => selectedTeamMembers.includes(a.user_id));
  }, [filteredAvailabilities, selectedTeamMembers]);

  // Group availabilities by date
  const availabilitiesByDateFiltered = useMemo(() => {
    if (!filteredByTeamMembers || filteredByTeamMembers.length === 0) return {};

    const grouped: Record<string, AvailabilityBlock[]> = {};

    filteredByTeamMembers.forEach((avail) => {
      try {
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
      } catch (error) {
        console.error('Error parsing availability dates:', error, avail);
      }
    });

    return grouped;
  }, [filteredByTeamMembers]);

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

  // Date click handler
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayAvails = availabilitiesByDateFiltered[dateKey] || [];

    if (dayAvails.length > 0) {
      setShowDateDetails(true);
    } else {
      setShowQuickAdd(true);
    }
  };

  // Quick add submission
  const handleQuickAddSubmit = async (data: any) => {
    if (!user?.id) {
      showAlert('You must be logged in to add availability.', 'Authentication Required');
      return;
    }

    try {
      await createAvailability.mutateAsync({
        ...data,
        user_id: user.id,
      });
      showAlert('Availability added successfully!', 'Success');
      setShowQuickAdd(false);
    } catch (error) {
      console.error('Failed to add availability:', error);
      showAlert('Failed to add availability. Please try again.', 'Error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-[#999999]">loading...</div>
      </div>
    );
  }

  return (
    <>
      {ModalComponent}
      <DateDetailsModal
        isOpen={showDateDetails}
        onClose={() => setShowDateDetails(false)}
        date={selectedDate}
        availabilities={selectedDate && filteredByTeamMembers ? filteredByTeamMembers.filter(a => {
          try {
            const start = parseISO(a.start_date);
            const end = parseISO(a.end_date);
            return selectedDate >= start && selectedDate <= end;
          } catch (error) {
            return false;
          }
        }) : []}
        teamMembers={teamMembers}
      />
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        date={selectedDate}
        onSubmit={handleQuickAddSubmit}
      />
      <div className="h-full bg-white">
        {/* Header */}
        <div className="border-b border-[#e5e5e5] px-12 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">
                {format(currentDate, 'MMMM yyyy').toUpperCase()}
              </div>
              <h1 className="text-2xl font-normal text-[#000000]">Team Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <TeamMemberFilter
                teamMembers={teamMembers}
                selectedMembers={selectedTeamMembers}
                onSelectionChange={setSelectedTeamMembers}
              />
              <button className="px-4 py-2 text-sm text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide">
                SEARCH
              </button>
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="px-12 py-8">
        <div className="grid grid-cols-[1fr_300px] gap-8">
          {/* Calendar */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">
                {format(currentDate, 'MMMM yyyy').toUpperCase()} — ABSENCES AND AVAILABILITY
              </div>
              <div className="flex gap-2">
                {(['today', 'week', 'month', 'year'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                      viewMode === mode
                        ? 'bg-[#000000] text-white'
                        : 'text-[#666666] hover:text-[#000000] border border-[#e5e5e5]'
                    }`}
                  >
                    {mode === 'today' ? 'Today' : mode === 'week' ? 'Week' : mode === 'month' ? 'Month' : 'Year'}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-[#e5e5e5]">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-[#e5e5e5] bg-[#fafafa]">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div
                    key={idx}
                    className="p-3 text-center text-[10px] text-[#999999] font-medium tracking-wider uppercase"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayAvailabilities = availabilitiesByDateFiltered[dateKey] || [];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      className={`min-h-[80px] p-2 border-r border-b border-[#e5e5e5] cursor-pointer transition-colors ${
                        index % 7 === 6 ? 'border-r-0' : ''
                      } ${!isCurrentMonth ? 'bg-[#fafafa]' : 'hover:bg-[#f5f5f5]'} ${
                        isTodayDate ? 'bg-[#000000] hover:bg-[#000000]/90' : ''
                      }`}
                    >
                      <div className={`text-sm mb-1 ${isTodayDate ? 'text-white' : 'text-[#000000]'}`}>
                        {format(day, 'd')}
                      </div>
                      {dayAvailabilities.length > 0 && (
                        <div className="space-y-1">
                          {dayAvailabilities.slice(0, 2).map((avail) => (
                            <div
                              key={avail.id}
                              className={`text-[8px] px-1 py-0.5 ${getTypeColor(avail.type)} border rounded`}
                            >
                              {avail.type.substring(0, 3)}
                            </div>
                          ))}
                          {dayAvailabilities.length > 2 && (
                            <div className={`text-[8px] px-1 ${isTodayDate ? 'text-white' : 'text-[#999999]'}`}>
                              +{dayAvailabilities.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 text-[10px] text-[#999999] font-medium tracking-wider uppercase">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#3b82f6]"></div>
                <span>IN</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ef4444]"></div>
                <span>OUT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#f59e0b]"></div>
                <span>PARTIAL</span>
              </div>
            </div>
          </div>

          {/* Team list */}
          <div>
            <div className="mb-6">
              <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">
                TODAY MAR 6 — 4/5 IN
              </div>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${member.color} text-white flex items-center justify-center text-xs font-semibold`}>
                      {member.initials}
                    </div>
                    <div>
                      <div className="text-sm text-[#000000] font-medium">{member.name}</div>
                      <div className="text-xs text-[#999999]">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${
                      member.status === 'OUT' ? 'text-[#ef4444]' :
                      member.status === 'PARTIAL' ? 'text-[#f59e0b]' :
                      'text-[#3b82f6]'
                    }`}>
                      {member.status}
                    </div>
                    <div className="text-xs text-[#999999]">{member.hours}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
    </>
  );
};
