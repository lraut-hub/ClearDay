
import React, { useState, useEffect } from 'react';
import { Task, TaskPriority } from '../types';
import { Modal, Box, Typography, TextField, Button, Stack, Chip, IconButton } from '@mui/material';
import { AccessTime as AccessTimeIcon, Event as EventIcon, Close as CloseIcon, Star as StarIcon } from '@mui/icons-material';

interface QuickAddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '92%', sm: 480 },
  maxWidth: '100%',
  maxHeight: '90dvh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  borderRadius: '8px', // Google Calendar uses 8px border radius
  boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)', // Material-like strong shadow
  p: 0, // padding handled inside
  animation: 'scaleInCentered 200ms cubic-bezier(0.0, 0, 0.2, 1) both',
};

const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({ open, onClose, onAddTask }) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const [title, setTitle] = useState('');
  const [dueTime, setDueTime] = useState(getCurrentTime());
  const [dueDate, setDueDate] = useState(getToday());
  const [activeDateShortcut, setActiveDateShortcut] = useState<'today' | 'tomorrow' | null>('today');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [priority, setPriority] = useState<TaskPriority | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDueTime(getCurrentTime());
      setDueDate(getToday());
      setActiveDateShortcut('today');
      setReminderEnabled(false);
      setPriority(null);
    }
  }, [open]);
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setDueDate(newDate);
    if (newDate === getToday()) {
      setActiveDateShortcut('today');
    } else if (newDate === getTomorrow()) {
      setActiveDateShortcut('tomorrow');
    } else {
      setActiveDateShortcut(null);
    }
  };
  
  const selectDateShortcut = (selection: 'today' | 'tomorrow') => {
    const newDate = selection === 'today' ? getToday() : getTomorrow();
    setDueDate(newDate);
    setActiveDateShortcut(selection);
  };
  
  const handlePriorityChange = (event: React.MouseEvent<HTMLElement>, newPriority: TaskPriority | null) => {
    setPriority(newPriority);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      dueDate: dueDate,
      dueTime: dueTime || undefined,
      reminderTime: reminderEnabled && dueTime ? dueTime : undefined,
      priority: priority || undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="quick-add-task-modal-title">
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'transparent' }}>
          <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
          <Button type="submit" variant="contained" onClick={handleSubmit} sx={{ textTransform: 'none', borderRadius: 1, boxShadow: 'none', px: 3 }}>
            Save
          </Button>
        </Box>
        
        <Box sx={{ p: { xs: 2, sm: 3 }, pt: 1 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Box sx={{ width: 40 }} /> {/* Spacer for alignment */}
                <TextField
                  placeholder="Add title"
                  variant="standard"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: '1.4rem', fontWeight: 400, borderBottom: '2px solid transparent', '&.Mui-focused': { borderBottomColor: 'primary.main' } }
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EventIcon color="action" />
                  <TextField
                      type="date"
                      variant="standard"
                      value={dueDate}
                      onChange={handleDateChange}
                      onClick={(e) => { try { (e.target as HTMLInputElement).showPicker() } catch(err) {} }}
                      InputProps={{ 
                          disableUnderline: true, 
                          sx: { 
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              '& input::-webkit-calendar-picker-indicator': { display: 'none', '-webkit-appearance': 'none' },
                              '& input': { cursor: 'pointer' }
                          } 
                      }}
                  />
                  <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                      <Chip 
                        label="Today" 
                        size="small"
                        onClick={() => selectDateShortcut('today')}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: activeDateShortcut === 'today' ? '#e8f0fe' : 'transparent',
                          color: activeDateShortcut === 'today' ? '#1a73e8' : 'text.secondary',
                          '&:hover': { bgcolor: '#f1f3f4' },
                        }}
                      />
                      <Chip 
                        label="Tomorrow" 
                        size="small"
                        onClick={() => selectDateShortcut('tomorrow')}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: activeDateShortcut === 'tomorrow' ? '#e8f0fe' : 'transparent',
                          color: activeDateShortcut === 'tomorrow' ? '#1a73e8' : 'text.secondary',
                          '&:hover': { bgcolor: '#f1f3f4' },
                        }}
                      />
                  </Stack>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccessTimeIcon color="action" />
                  <TextField
                    type="time"
                    variant="standard"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    onClick={(e) => { try { (e.target as HTMLInputElement).showPicker() } catch(err) {} }}
                    InputProps={{ 
                        disableUnderline: true, 
                        sx: { 
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            '& input::-webkit-calendar-picker-indicator': { display: 'none', '-webkit-appearance': 'none' },
                            '& input': { cursor: 'pointer' }
                        } 
                    }}
                  />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <IconButton 
                      onClick={() => setPriority(priority === 'high' ? null : 'high')} 
                      sx={{ p: 0.5, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                    >
                      <StarIcon sx={{ 
                        color: 'error.main', 
                        fontSize: '2rem', 
                        filter: priority === 'high' ? 'drop-shadow(0 0 12px rgba(224,108,108,0.8))' : 'none',
                        opacity: priority === 'high' || priority === null ? 1 : 0.4,
                        transition: 'all 0.2s'
                      }} />
                    </IconButton>
                    <IconButton 
                      onClick={() => setPriority(priority === 'medium' ? null : 'medium')} 
                      sx={{ p: 0.5, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                    >
                      <StarIcon sx={{ 
                        color: 'warning.main', 
                        fontSize: '2rem', 
                        filter: priority === 'medium' ? 'drop-shadow(0 0 12px rgba(212,167,106,0.8))' : 'none',
                        opacity: priority === 'medium' || priority === null ? 1 : 0.4,
                        transition: 'all 0.2s'
                      }} />
                    </IconButton>
                  </Box>
              </Box>
            </Stack>
          </form>
        </Box>
      </Box>
    </Modal>
  );
};

export default QuickAddTaskModal;
