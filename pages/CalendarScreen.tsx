
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task } from '../types';
import TimelineView from '../components/TimelineView';
import CalendarPickerModal from '../components/CalendarPickerModal';
import { Typography, Box, IconButton, Button, Stack } from '@mui/material';
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
    // Scroll the selected day into view when the component mounts or date changes
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
    // Also move the calendar context to the month of the selected day if it's different
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
    
    const dayStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 48,
        height: 64,
        borderRadius: '12px',
        p: 1,
        border: '1px solid',
        borderColor: isToday && !isSelected ? 'primary.main' : 'transparent',
        bgcolor: isSelected ? 'primary.main' : 'background.paper',
        color: isSelected ? 'primary.contrastText' : 'text.primary',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
    };

    return (
        <Box id={`day-${dayISO}`} onClick={() => handleSelectDay(day)} sx={dayStyles}>
            <Typography variant="caption" color={isSelected ? 'inherit' : 'text.secondary'} sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                {day.toLocaleDateString(undefined, { weekday: 'short' })}
            </Typography>
            <Typography variant="h6" component="span" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>{day.getDate()}</Typography>
            <Box sx={{ height: 4, mt: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {hasTasks && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: isSelected ? 'primary.contrastText' : 'primary.main' }} />}
            </Box>
        </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 100px)' }}>
      <Box component="header" sx={{ flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
                variant="h4" 
                component="h2" 
                onClick={() => setPickerOpen(true)}
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            >
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Typography>
            <Box>
                <IconButton onClick={handlePrevMonth} aria-label="previous month"><ArrowBackIosNewIcon fontSize="small" /></IconButton>
                <IconButton onClick={handleNextMonth} aria-label="next month"><ArrowForwardIosIcon fontSize="small" /></IconButton>
            </Box>
        </Box>
        
        <Box 
            ref={weekContainerRef}
            sx={{ 
                display: 'flex', 
                gap: 1.5, 
                overflowX: 'auto', 
                pb: 1,
                scrollbarWidth: 'none', // For Firefox
                '&::-webkit-scrollbar': { display: 'none' } // For Chrome, Safari, and Opera
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
