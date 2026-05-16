
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Modal, Box, Typography, TextField, Button, Stack } from '@mui/material';

interface RescheduleTaskModalProps {
  open: boolean;
  onClose: () => void;
  onReschedule: (taskId: string, newDueDate: string, newDueTime?: string) => void;
  task: Task | null;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '92%',
  maxWidth: 420,
  bgcolor: 'background.paper',
  borderRadius: 'var(--cd-radius-lg)',
  border: '1px solid var(--cd-outline)',
  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
  p: 3,
  animation: 'scaleIn 300ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
};

const RescheduleTaskModal: React.FC<RescheduleTaskModalProps> = ({ open, onClose, onReschedule, task }) => {
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');

  useEffect(() => {
    if (task) {
      setNewDueDate(task.dueDate);
      setNewDueTime(task.dueTime || '');
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task && newDueDate) {
      onReschedule(task.id, newDueDate, newDueTime || undefined);
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="reschedule-task-modal-title">
      <Box sx={modalStyle}>
        <Typography 
          id="reschedule-task-modal-title" 
          variant="h5" 
          component="h2" 
          sx={{ mb: 2, fontFamily: "'DM Sans', sans-serif" }}
        >
          Reschedule
        </Typography>
        <Box 
          sx={{ 
            mb: 2.5, p: 1.5, 
            bgcolor: 'var(--cd-bg-surface-high)', 
            borderRadius: 'var(--cd-radius-md)',
            border: '1px solid var(--cd-outline-variant)',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>{task.title}</Typography>
          {task.dueTime && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Currently: {task.dueDate} at {task.dueTime}
            </Typography>
          )}
        </Box>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="New Due Date"
              type="date"
              variant="outlined"
              fullWidth
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="New Time (Optional)"
              type="time"
              variant="outlined"
              fullWidth
              value={newDueTime}
              onChange={(e) => setNewDueTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
              <Button type="submit" variant="contained">Save Changes</Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default RescheduleTaskModal;
