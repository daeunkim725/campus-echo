import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { eachDayOfInterval, startOfMonth, endOfMonth, getDay, format, parseISO, isSameDay, isBefore, isAfter } from "date-fns";

export default function EventCalendarView({ events, onSelectDate, schoolConfig }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a 7-day week grid with empty cells
  const firstDayOfWeek = getDay(monthStart);
  const calendarGrid = [...Array(firstDayOfWeek).fill(null), ...daysInMonth];

  // Map events by date
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(event => {
      if (event.event_date) {
        const dateKey = format(parseISO(event.event_date), "yyyy-MM-dd");
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(event);
      }
    });
    return map;
  }, [events]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day) => {
    setSelectedDate(day);
    onSelectDate(day);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarGrid.map((day, idx) => {
          if (!day) {
            return <div key={idx} className="aspect-square" />;
          }

          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] || [];
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();

          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={idx}
              onClick={() => handleSelectDate(day)}
              disabled={!isCurrentMonth}
              className={`aspect-square p-1 rounded-lg text-xs transition-all ${
                !isCurrentMonth
                  ? "opacity-40 cursor-default"
                  : isSelected
                  ? "border-2 hover:opacity-90"
                  : isToday
                  ? "ring-2 ring-offset-1 hover:opacity-90"
                  : "hover:bg-slate-50 cursor-pointer"
              }`}
              style={isSelected ? { borderColor: schoolConfig?.primary } : isToday ? { "--tw-ring-color": schoolConfig?.primary } : {}}
            >
              <div className="h-full flex flex-col items-center justify-start">
                <span className={`font-medium ${isCurrentMonth ? "text-slate-900" : "text-slate-300"}`}>
                  {day.getDate()}
                </span>
                {isToday && (
                  <span className="text-[9px] text-slate-500">today</span>
                )}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center w-full">
                    {dayEvents.slice(0, 2).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: schoolConfig?.primary }}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-500 w-full">
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}