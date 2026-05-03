
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Modal, Box, Typography, TextField, Button, Stack } from '@mui/material';

interface RescheduleTaskModalProps {
  open: boolean;
  onClose: () => void;
  onReschedule: (taskId: string, newDueDate: string, newDueTime?: string) => void;
  task: Task | null;
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
      <Box sx={style}>
        <Typography id="reschedule-task-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Reschedule Task
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, p: 1.5, bgcolor: 'secondary.main', borderRadius: 1 }}>
          {task.title}
        </Typography>
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
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 2 }}>
              <Button onClick={onClose} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Save Changes</Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default RescheduleTaskModal;
