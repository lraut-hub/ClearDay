
import React, { useState, useEffect } from 'react';
import { Task, TaskPriority } from '../types';
import { Modal, Box, Typography, TextField, Button, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Flag as FlagIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

interface QuickAddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
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
      <Box sx={style}>
        <Typography id="quick-add-task-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Quick Add Task
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Task name"
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
                    sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1}>
                    <Button fullWidth variant={activeDateShortcut === 'today' ? 'contained' : 'outlined'} onClick={() => selectDateShortcut('today')}>Today</Button>
                    <Button fullWidth variant={activeDateShortcut === 'tomorrow' ? 'contained' : 'outlined'} onClick={() => selectDateShortcut('tomorrow')}>Tomorrow</Button>
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
                    color="success"
                    size="small"
                >
                    <NotificationsIcon />
                    <Typography sx={{ ml: 1, textTransform: 'none', fontWeight: 500 }}>Reminder</Typography>
                </ToggleButton>

                <ToggleButtonGroup value={priority} exclusive onChange={handlePriorityChange} aria-label="priority" size="small">
                  <ToggleButton value="high" aria-label="high priority"><FlagIcon sx={{ color: 'error.main' }} /></ToggleButton>
                  <ToggleButton value="medium" aria-label="medium priority"><FlagIcon sx={{ color: 'warning.main' }} /></ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button onClick={onClose} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Add Task</Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default QuickAddTaskModal;
