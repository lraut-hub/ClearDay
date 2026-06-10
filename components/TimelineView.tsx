
import React, { useEffect, useRef, useMemo } from 'react';
import { Task } from '../types';
import { Typography, Box, Paper, Checkbox, Link, Divider } from '@mui/material';
import { toISODateString } from '../utils/dateHelpers';

interface TimelineViewProps {
  selectedDate: Date;
  tasks: Task[];
  toggleTaskCompletion: (id: string) => void;
  onRescheduleTask: (id: string) => void;
}

const PIXELS_PER_MINUTE = 2;
const HOUR_HEIGHT = PIXELS_PER_MINUTE * 60;

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${Math.round(minutes)}min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.round(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const TimelineView: React.FC<TimelineViewProps> = ({ selectedDate, tasks, toggleTaskCompletion, onRescheduleTask }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const tasksForDay = tasks
    .filter(task => task.dueDate === toISODateString(selectedDate) && task.dueTime)
    .sort((a, b) => a.dueTime!.localeCompare(b.dueTime!));

  // Current time indicator position
  const now = new Date();
  const isToday = toISODateString(selectedDate) === toISODateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    if (containerRef.current) {
        const firstTask = tasksForDay.find(t => t.status === 'pending');
        const scrollTargetTime = firstTask ? timeToMinutes(firstTask.dueTime!) : 8 * 60;
        const scrollTop = scrollTargetTime * PIXELS_PER_MINUTE - 30;
        containerRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [selectedDate, tasksForDay]);

  return (
    <Box ref={containerRef} sx={{ height: '100%', overflowY: 'auto', position: 'relative' }}>
      {/* Hour markers */}
      {Array.from({ length: 24 }).map((_, hour) => (
        <Box key={hour} sx={{ position: 'absolute', top: hour * HOUR_HEIGHT, left: 0, width: '100%', display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              width: '40px', textAlign: 'right', pr: 1, flexShrink: 0, 
              fontSize: '0.7rem',
              color: 'text.disabled',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            {`${hour}:00`}
          </Typography>
          <Divider sx={{ flexGrow: 1, opacity: 0.2, borderColor: 'var(--cd-outline-variant)' }} />
        </Box>
      ))}

      {/* Current time indicator */}
      {isToday && (
        <Box
          sx={{
            position: 'absolute',
            top: currentMinutes * PIXELS_PER_MINUTE,
            left: '40px',
            right: 0,
            height: '2px',
            bgcolor: 'error.main',
            zIndex: 10,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: -4,
              top: -3,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'error.main',
              animation: 'pulseGlow 2s infinite',
            },
          }}
        />
      )}

      {/* Timeline items */}
      <Box sx={{ position: 'relative', ml: '50px', height: `${24 * HOUR_HEIGHT}px` }}>
        {tasksForDay.map((task) => {
          const startTime = timeToMinutes(task.dueTime!);
          const duration = task.endTime ? timeToMinutes(task.endTime) - startTime : 60;
          const visibleDuration = Math.max(15, duration);
          
          const top = startTime * PIXELS_PER_MINUTE;
          const height = visibleDuration * PIXELS_PER_MINUTE;
          const isCompleted = task.status === 'completed';
          const endTimeString = task.endTime || minutesToTime(startTime + duration);

          return (
            <Paper 
              key={task.id} 
              elevation={0}
              sx={{
                position: 'absolute',
                top,
                left: 8,
                right: 16,
                height,
                minHeight: '24px',
                bgcolor: isCompleted ? '#f1f3f4' : '#1a73e8', // Google Calendar blue
                color: isCompleted ? 'text.disabled' : '#ffffff',
                borderRadius: '4px',
                p: 0.5,
                px: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                overflow: 'hidden',
                opacity: isCompleted ? 0.6 : 1,
                transition: 'all 150ms ease',
                '&:hover': {
                  filter: 'brightness(0.95)',
                  cursor: 'pointer',
                  zIndex: 2,
                },
              }}
            >
              <Box>
                <Typography 
                  fontWeight={500} 
                  sx={{ 
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    fontSize: '0.85rem',
                    lineHeight: 1.2,
                  }}
                >
                  {task.title}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.2 }}>
                  {task.dueTime} – {endTimeString}
                </Typography>
              </Box>
              <Checkbox 
                checked={isCompleted}
                onChange={() => toggleTaskCompletion(task.id)}
                sx={{ 
                  color: isCompleted ? 'text.disabled' : 'primary.light', 
                  '&.Mui-checked': { color: 'success.main' }, 
                  p: 0, 
                  mt: 0.5,
                }} 
              />
            </Paper>
          );
        })}

        {tasksForDay.length === 0 && (
            <Box sx={{ pt: 12, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                  All clear for today!
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                  Enjoy the open space.
                </Typography>
            </Box>
        )}
      </Box>
    </Box>
  );
};

export default TimelineView;
