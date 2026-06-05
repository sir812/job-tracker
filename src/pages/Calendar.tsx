import React, { useState } from "react";
import { useJobs } from "../context/JobContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Calendar as CalendarIcon, Clock, MapPin, AlignLeft, CalendarRange } from "lucide-react";
import { InterviewEvent } from "../data/mockData";

export const Calendar: React.FC = () => {
  const { interviews } = useJobs();
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(null);

  // May 2026 calendar parameters
  // May 1st 2026 is a Friday (so 4 empty slots at start of grid: Mon, Tue, Wed, Thu if starting week on Monday)
  // Let's build a simple grid of 31 days starting with day 1.
  // Weeks will align nicely.
  const daysInMonth = 31;
  const startOffset = 4; // empty cells at beginning of grid for May 2026 (assuming Monday start, May 1st is Friday: Mon=27, Tue=28, Wed=29, Thu=30)
  const cells: (number | null)[] = [];
  
  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }
  // Fill grid to multiple of 7
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const getDayEvents = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-05-${formattedDay}`;
    return interviews.filter((i) => i.date === dateStr);
  };

  const handleCellClick = (day: number) => {
    const events = getDayEvents(day);
    if (events.length > 0) {
      setSelectedEvent(events[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Calendar</h2>
          <p className="text-xs text-black dark:text-white mt-1">Track upcoming interviews, coding tests, and follow-ups</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 items-start select-none">
        {/* Left column: Upcoming Events list */}
        <Card className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-neutral-800 pb-4">
            <CalendarRange className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Interviews</h3>
          </div>

          <div className="flex flex-col gap-3">
            {interviews.length === 0 ? (
              <p className="text-xs text-black dark:text-white py-4 text-center">No interviews scheduled</p>
            ) : (
              interviews.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="p-3 bg-slate-50 dark:bg-black/70 hover:bg-slate-100 dark:hover:bg-black border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 rounded-xl cursor-pointer transition-all flex flex-col gap-2"
                >
                  <div>
                    <span className="text-[9px] uppercase font-bold text-black dark:text-white">{evt.company}</span>
                    <h4 className="text-xs font-bold text-black dark:text-white truncate mt-0.5">{evt.role}</h4>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-black dark:text-white mt-1">
                    <span className="font-semibold">{evt.date}</span>
                    <span>⏰ {evt.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right column: May 2026 Grid */}
        <Card className="lg:col-span-3 p-6 flex flex-col gap-4">
          {/* Calendar header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-4">
            <h3 className="text-md font-bold text-black dark:text-white">May 2026</h3>
            <span className="text-xs font-semibold text-black dark:text-white">Mon - Sun</span>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-black dark:text-white select-none">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2 h-[350px]">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="bg-slate-50 dark:bg-black/20 border border-transparent rounded-xl" />;
              }

              const events = getDayEvents(day);
              const isToday = day === 24; // Today is 2026-05-24 based on system date
              const hasEvents = events.length > 0;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleCellClick(day)}
                  className={`bg-white dark:bg-black/70 border border-slate-200 dark:border-neutral-800 rounded-xl p-2 relative flex flex-col justify-between transition-all select-none ${
                    hasEvents ? "hover:border-cyan-500/50 cursor-pointer dark:bg-black bg-slate-50" : ""
                  } ${isToday ? "border-cyan-500 ring-2 ring-cyan-500/10" : ""}`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isToday ? "text-cyan-400" : hasEvents ? "text-black dark:text-white" : "text-black"
                    }`}
                  >
                    {day}
                  </span>

                  {hasEvents && (
                    <div className="flex gap-1 items-center overflow-hidden">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full shrink-0" />
                      <span className="text-[9px] text-cyan-400 font-semibold truncate hidden md:inline">
                        {events[0].company}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Interview Details"
        size="sm"
      >
        {selectedEvent && (
          <div className="flex flex-col gap-5 select-none">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-black dark:text-white">
                {selectedEvent.company}
              </span>
              <h4 className="text-lg font-bold text-black dark:text-white mt-1">{selectedEvent.role}</h4>
              <p className="text-xs text-cyan-400 font-semibold mt-1.5">{selectedEvent.title}</p>
            </div>

            <div className="space-y-3.5 border-t border-slate-200 dark:border-neutral-800 pt-4 text-sm text-black dark:text-white">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-4.5 h-4.5 text-black dark:text-white shrink-0" />
                <span>Date: <strong className="text-black dark:text-white">{selectedEvent.date}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4.5 h-4.5 text-black dark:text-white shrink-0" />
                <span>Time: <strong className="text-black dark:text-white">{selectedEvent.time}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4.5 h-4.5 text-black dark:text-white shrink-0" />
                <span>Type: <strong className="text-black dark:text-white">{selectedEvent.type}</strong></span>
              </div>
              {selectedEvent.notes && (
                <div className="flex items-start gap-3 border-t border-slate-200 dark:border-neutral-800 pt-3.5 mt-2">
                  <AlignLeft className="w-4.5 h-4.5 text-black dark:text-white shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wide">Interview Notes</h5>
                    <p className="text-xs text-black dark:text-white leading-relaxed mt-1.5 bg-slate-50 dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-neutral-800">
                      {selectedEvent.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 dark:border-neutral-800 pt-4 mt-2">
              <Button size="sm" onClick={() => setSelectedEvent(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default Calendar;
