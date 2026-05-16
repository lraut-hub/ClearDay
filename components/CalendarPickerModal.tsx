
import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { Box, Typography, IconButton, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getCalendarDays, isSameDay, toISODateString } from '../utils/dateHelpers';

interface CalendarPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  initialDate: Date;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({ open, onClose, onSelectDate, tasks, initialDate }) => {
  const [displayDate, setDisplayDate] = useState(initialDate);
  const [selectedDay, setSelectedDay] = useState(initialDate);

  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const date = task.dueDate;
      (acc[date] = acc[date] || []).push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const calendarDays = useMemo(() => getCalendarDays(displayDate), [displayDate]);
  const today = useMemo(() => new Date(), []);

  const handlePrevMonth = () => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  const handleConfirm = () => {
    onSelectDate(selectedDay);
  };
  
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 'var(--cd-radius-lg)' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <IconButton onClick={handlePrevMonth} size="small" sx={{ '&:hover': { transform: 'translateX(-2px)' } }}>
          <ArrowBackIosNewIcon fontSize="inherit" />
        </IconButton>
        <Typography 
          variant="h6" 
          component="span" 
          sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}
        >
          {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton onClick={handleNextMonth} size="small" sx={{ '&:hover': { transform: 'translateX(2px)' } }}>
          <ArrowForwardIosIcon fontSize="inherit" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75, textAlign: 'center' }}>
          {WEEKDAY_LABELS.map((day, i) => (
            <Typography 
              key={`${day}-${i}`} 
              variant="caption" 
              sx={{ 
                color: 'text.disabled', 
                fontWeight: 600, 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {day}
            </Typography>
          ))}
          {calendarDays.map((day, index) => {
            const dayISO = toISODateString(day);
            const isCurrentMonth = day.getMonth() === displayDate.getMonth();
            const isSelected = isSameDay(day, selectedDay);
            const isToday = isSameDay(day, today);
            const tasksForDay = tasksByDate[dayISO] || [];
            
            return (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconButton 
                  onClick={() => setSelectedDay(day)} 
                  disabled={!isCurrentMonth}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    fontSize: '0.85rem',
                    fontWeight: isSelected || isToday ? 600 : 400,
                    border: isToday && !isSelected ? '1.5px solid' : '1.5px solid transparent',
                    borderColor: isToday && !isSelected ? 'primary.main' : 'transparent',
                    bgcolor: isSelected ? 'primary.dark' : 'transparent',
                    color: isSelected ? 'primary.light' : isCurrentMonth ? 'text.primary' : 'text.disabled',
                    p: 0,
                    minWidth: 0,
                    transition: 'all 200ms cubic-bezier(0.2, 0, 0, 1)',
                    '&:hover': {
                      bgcolor: isSelected ? 'primary.dark' : 'rgba(91, 164, 207, 0.08)',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {day.getDate()}
                </IconButton>
                <Stack direction="row" spacing={0.3} sx={{ height: 4, mt: 0.3 }}>
                    {isCurrentMonth && tasksForDay.slice(0, 3).map((_, i) => (
                        <Box 
                          key={i} 
                          sx={{ 
                            width: 3, height: 3, borderRadius: '50%', 
                            bgcolor: isSelected ? 'primary.light' : 'primary.main', 
                            opacity: 0.8 
                          }} 
                        />
                    ))}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">Select</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarPickerModal;
