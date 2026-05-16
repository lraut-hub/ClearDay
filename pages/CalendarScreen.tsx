
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task } from '../types';
import TimelineView from '../components/TimelineView';
import CalendarPickerModal from '../components/CalendarPickerModal';
import { Typography, Box, IconButton } from '@mui/material';
import { ArrowBackIosNew as ArrowBackIosNewIcon, ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { toISODateString, isSameDay, getWeekDays } from '../utils/dateHelpers';

interface CalendarScreenProps {
  tasks: Task[];
  toggleTaskCompletion: (id: string) => void;
  onRescheduleTask: (id: string) => void;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ tasks, toggleTaskCompletion, onRescheduleTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPickerOpen, setPickerOpen] = useState(false);
  const weekContainerRef = useRef<HTMLDivElement>(null);
  
  const today = useMemo(() => new Date(), []);

  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const date = task.dueDate;
      (acc[date] = acc[date] || []).push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  useEffect(() => {
    const selectedElement = document.getElementById(`day-${toISODateString(selectedDate)}`);
    if (selectedElement && weekContainerRef.current) {
        const container = weekContainerRef.current;
        const scrollLeft = selectedElement.offsetLeft - container.offsetLeft - (container.offsetWidth / 2) + (selectedElement.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    if (day.getMonth() !== currentDate.getMonth() || day.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(day);
    }
  };

  const weekForDisplay = useMemo(() => getWeekDays(currentDate, 7), [currentDate]);

  const renderDay = (day: Date) => {
    const dayISO = toISODateString(day);
    const isSelected = isSameDay(day, selectedDate);
    const isToday = isSameDay(day, today);
    const hasTasks = (tasksByDate[dayISO] || []).some(t => t.status === 'pending');

    return (
        <Box 
          id={`day-${dayISO}`} 
          key={dayISO}
          onClick={() => handleSelectDay(day)} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 52,
            height: 70,
            borderRadius: 'var(--cd-radius-md)',
            p: 1,
            border: '1.5px solid',
            borderColor: isToday && !isSelected ? 'primary.main' : isSelected ? 'primary.dark' : 'transparent',
            bgcolor: isSelected ? 'primary.dark' : 'transparent',
            color: isSelected ? 'primary.light' : 'text.primary',
            cursor: 'pointer',
            transition: 'all 250ms cubic-bezier(0.2, 0, 0, 1)',
            '&:hover': {
                transform: 'translateY(-3px)',
                bgcolor: isSelected ? 'primary.dark' : 'rgba(91, 164, 207, 0.08)',
                boxShadow: isSelected ? '0 6px 20px rgba(91, 164, 207, 0.2)' : '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
            <Typography 
              variant="caption" 
              sx={{ 
                color: isSelected ? 'primary.light' : 'text.disabled',
                textTransform: 'uppercase', 
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
                {day.toLocaleDateString(undefined, { weekday: 'short' })}
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '1.15rem',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
              }}
            >
              {day.getDate()}
            </Typography>
            <Box sx={{ height: 4, mt: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {hasTasks && (
                  <Box sx={{ 
                    width: 4, height: 4, borderRadius: '50%', 
                    bgcolor: isSelected ? 'primary.light' : 'primary.main',
                    boxShadow: isSelected ? 'none' : '0 0 6px rgba(91, 164, 207, 0.4)',
                  }} />
                )}
            </Box>
        </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 100px)' }}>
      <Box component="header" sx={{ flexShrink: 0 }} className="cd-animate-in">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
                variant="h4" 
                component="h2" 
                onClick={() => setPickerOpen(true)}
                sx={{ 
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700, 
                  cursor: 'pointer',
                  transition: 'color 200ms ease',
                  '&:hover': { color: 'primary.main' },
                }}
            >
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Typography>
            <Box>
                <IconButton onClick={handlePrevMonth} aria-label="previous month" sx={{ '&:hover': { transform: 'translateX(-2px)' } }}>
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={handleNextMonth} aria-label="next month" sx={{ '&:hover': { transform: 'translateX(2px)' } }}>
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
        
        <Box 
            ref={weekContainerRef}
            sx={{ 
                display: 'flex', 
                gap: 1, 
                overflowX: 'auto', 
                pb: 1,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            {weekForDisplay.map(day => renderDay(day))}
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
           <TimelineView
              selectedDate={selectedDate}
              tasks={tasks}
              toggleTaskCompletion={toggleTaskCompletion}
              onRescheduleTask={onRescheduleTask}
           />
      </Box>

      <CalendarPickerModal
        open={isPickerOpen}
        onClose={() => setPickerOpen(false)}
        tasks={tasks}
        initialDate={selectedDate}
        onSelectDate={(newDate) => {
            handleSelectDay(newDate);
            setPickerOpen(false);
        }}
      />
    </Box>
  );
};

export default CalendarScreen;
