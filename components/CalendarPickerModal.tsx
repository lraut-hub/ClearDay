
import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { Modal, Box, Typography, IconButton, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <IconButton onClick={handlePrevMonth} size="small"><ArrowBackIosNewIcon fontSize="inherit" /></IconButton>
        <Typography variant="h6" component="span" fontWeight="bold">
          {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton onClick={handleNextMonth} size="small"><ArrowForwardIosIcon fontSize="inherit" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
          {WEEKDAY_LABELS.map(day => (
            <Typography key={day} variant="caption" color="text.secondary" fontWeight="medium">{day}</Typography>
          ))}
          {calendarDays.map((day, index) => {
            const dayISO = toISODateString(day);
            const isCurrentMonth = day.getMonth() === displayDate.getMonth();
            const isSelected = isSameDay(day, selectedDay);
            const isToday = isSameDay(day, today);
            const tasksForDay = tasksByDate[dayISO] || [];
            
            const dayStyle = {
                display: 'flex',
                flexDirection: 'column',
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: isSelected ? '1px solid' : '1px solid transparent',
                borderColor: isSelected ? 'primary.main' : 'transparent',
                bgcolor: isToday ? 'action.hover' : 'transparent',
                color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                p:0,
                minWidth: 0,
            };

            return (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconButton onClick={() => setSelectedDay(day)} sx={dayStyle} disabled={!isCurrentMonth}>
                  {day.getDate()}
                </IconButton>
                <Stack direction="row" spacing={0.5} sx={{ height: 4, mt: 0.5 }}>
                    {isCurrentMonth && tasksForDay.slice(0, 4).map((_, i) => (
                        <Box key={i} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.7 }} />
                    ))}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm}>OK</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarPickerModal;
