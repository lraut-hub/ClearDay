
import React, { useEffect, useRef } from 'react';
import { Task } from '../types';
import { Typography, Box, Paper, Checkbox, Link, Divider } from '@mui/material';
import { toISODateString } from '../utils/dateHelpers';

interface TimelineViewProps {
  selectedDate: Date;
  tasks: Task[];
  toggleTaskCompletion: (id: string) => void;
  onRescheduleTask: (id: string) => void;
}

const PIXELS_PER_MINUTE = 2; // Adjusted for a denser view
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

  useEffect(() => {
    // Scroll to the first task of the day, or 8 AM if no tasks
    if (containerRef.current) {
        const firstTask = tasksForDay.find(t => t.status === 'pending');
        const scrollTargetTime = firstTask ? timeToMinutes(firstTask.dueTime!) : 8 * 60; // 8 AM
        const scrollTop = scrollTargetTime * PIXELS_PER_MINUTE - 30; // a small offset
        containerRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [selectedDate, tasksForDay]);


  return (
    <Box ref={containerRef} sx={{ height: '100%', overflowY: 'auto', position: 'relative' }}>
      {/* Hour markers */}
      {Array.from({ length: 24 }).map((_, hour) => (
        <Box key={hour} sx={{ position: 'absolute', top: hour * HOUR_HEIGHT, left: 0, width: '100%', display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ width: '40px', textAlign: 'right', pr: 1, flexShrink: 0, fontSize: '0.7rem' }}>
            {`${hour}:00`}
          </Typography>
          <Divider sx={{ flexGrow: 1, opacity: 0.3 }} />
        </Box>
      ))}

      {/* Timeline items */}
      <Box sx={{ position: 'relative', ml: '50px', height: `${24 * HOUR_HEIGHT}px` }}>
        {tasksForDay.map((task) => {
          const startTime = timeToMinutes(task.dueTime!);
          const duration = task.endTime ? timeToMinutes(task.endTime) - startTime : 60; // Default 60 min duration
          const visibleDuration = Math.max(15, duration); // Ensure a minimum visible height
          
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
                left: 10,
                right: 10,
                height,
                minHeight: '30px',
                bgcolor: isCompleted ? 'action.disabledBackground' : 'primary.main',
                color: isCompleted ? 'text.secondary' : 'primary.contrastText',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                overflow: 'hidden',
                opacity: isCompleted ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              <Box>
                <Typography fontWeight="bold" sx={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {task.dueTime} - {endTimeString} ({formatDuration(duration)})
                </Typography>
              </Box>
              <Checkbox 
                checked={isCompleted}
                onChange={() => toggleTaskCompletion(task.id)}
                sx={{ 
                  color: isCompleted ? 'text.secondary' : 'primary.contrastText', 
                  '&.Mui-checked': { color: isCompleted ? 'text.secondary' : 'primary.contrastText' }, 
                  p:0, 
                  mt: 0.5 
                }} 
              />
            </Paper>
          );
        })}

        {tasksForDay.length === 0 && (
            <Box sx={{ pt: 10, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">All clear for today!</Typography>
                <Link component="button" variant="body1" onClick={() => console.log('Add task clicked')}>Create a task</Link>
            </Box>
        )}
      </Box>
    </Box>
  );
};

export default TimelineView;
