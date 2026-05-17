
import React, { useState, useEffect } from 'react';
import { Task, TaskPriority } from '../types';
import { Modal, Box, Typography, TextField, Button, Stack, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import { Flag as FlagIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

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
  width: '92%',
  maxWidth: 420,
  maxHeight: '85dvh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 'var(--cd-radius-lg)',
  border: '1px solid var(--cd-outline)',
  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
  p: { xs: 2.5, sm: 3 },
  animation: 'scaleIn 300ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
};

const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({ open, onClose, onAddTask }) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [title, setTitle] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [dueDate, setDueDate] = useState(getToday());
  const [activeDateShortcut, setActiveDateShortcut] = useState<'today' | 'tomorrow' | null>('today');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [priority, setPriority] = useState<TaskPriority | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDueTime('');
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
        <Typography 
          id="quick-add-task-modal-title" 
          variant="h5" 
          component="h2" 
          sx={{ mb: 2.5, fontFamily: "'DM Sans', sans-serif" }}
        >
          New Task
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="What needs to be done?"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
            
            <Box>
                <TextField
                    label="Due Date"
                    type="date"
                    fullWidth
                    value={dueDate}
                    onChange={handleDateChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 1.5 }}
                />
                <Stack direction="row" spacing={1}>
                    <Chip 
                      label="Today" 
                      onClick={() => selectDateShortcut('today')}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: activeDateShortcut === 'today' ? 'primary.dark' : 'transparent',
                        color: activeDateShortcut === 'today' ? 'primary.light' : 'text.secondary',
                        borderColor: activeDateShortcut === 'today' ? 'primary.dark' : 'var(--cd-outline)',
                        border: '1px solid',
                        fontWeight: activeDateShortcut === 'today' ? 600 : 400,
                        '&:hover': { bgcolor: 'primary.dark', color: 'primary.light' },
                      }}
                    />
                    <Chip 
                      label="Tomorrow" 
                      onClick={() => selectDateShortcut('tomorrow')}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: activeDateShortcut === 'tomorrow' ? 'primary.dark' : 'transparent',
                        color: activeDateShortcut === 'tomorrow' ? 'primary.light' : 'text.secondary',
                        borderColor: activeDateShortcut === 'tomorrow' ? 'primary.dark' : 'var(--cd-outline)',
                        border: '1px solid',
                        fontWeight: activeDateShortcut === 'tomorrow' ? 600 : 400,
                        '&:hover': { bgcolor: 'primary.dark', color: 'primary.light' },
                      }}
                    />
                </Stack>
            </Box>

            <TextField
              label="Time (Optional)"
              type="time"
              variant="outlined"
              fullWidth
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <ToggleButton
                    value="reminder"
                    selected={reminderEnabled}
                    onChange={() => setReminderEnabled(!reminderEnabled)}
                    size="small"
                    sx={{
                      borderRadius: 'var(--cd-radius-sm) !important',
                      px: 1.5,
                      border: '1px solid var(--cd-outline) !important',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(92, 184, 130, 0.15)',
                        color: 'success.main',
                        borderColor: 'rgba(92, 184, 130, 0.3) !important',
                      },
                    }}
                >
                    <NotificationsIcon sx={{ fontSize: '1.1rem' }} />
                    <Typography sx={{ ml: 0.75, textTransform: 'none', fontWeight: 500, fontSize: '0.85rem' }}>Remind</Typography>
                </ToggleButton>

                <Stack direction="row" spacing={0.75}>
                  {(['high', 'medium'] as TaskPriority[]).map((p) => (
                    <Box
                      key={p}
                      onClick={() => setPriority(priority === p ? null : p)}
                      sx={{
                        width: 32, height: 32,
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: priority === p 
                          ? (p === 'high' ? 'error.main' : 'warning.main') 
                          : 'var(--cd-outline)',
                        bgcolor: priority === p
                          ? (p === 'high' ? 'rgba(224, 108, 108, 0.15)' : 'rgba(212, 167, 106, 0.15)')
                          : 'transparent',
                        transition: 'all 200ms ease',
                        '&:hover': {
                          borderColor: p === 'high' ? 'error.main' : 'warning.main',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 10, height: 10, borderRadius: '50%',
                          bgcolor: p === 'high' ? 'error.main' : 'warning.main',
                          opacity: priority === p ? 1 : 0.4,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
            </Stack>
            
            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
              <Button type="submit" variant="contained">Add Task</Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default QuickAddTaskModal;
