
import React, { useState, useRef } from 'react';
import { Task } from '../types';
import { Card, CardContent, Checkbox, Typography, Box, Chip, IconButton } from '@mui/material';
import { Notifications as NotificationsIcon, EditCalendar as EditCalendarIcon } from '@mui/icons-material';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onReschedule: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onReschedule }) => {
  const { id, title, description, dueDate, dueTime, status, reminderTime, priority } = task;
  const isCompleted = status === 'completed';

  const [translateX, setTranslateX] = useState(0);
  const dragStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleDragStart = (e: React.TouchEvent) => {
    dragStartX.current = e.targetTouches[0].clientX;
    if(cardRef.current) cardRef.current.style.transition = 'none';
  };

  const handleDragMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - dragStartX.current;
    if (Math.abs(diff) > 10) { // Only start swiping after a small threshold
        setTranslateX(diff);
    }
  };

  const handleDragEnd = () => {
    if(cardRef.current) cardRef.current.style.transition = 'transform 0.3s ease, background-color 0.3s ease, background-image 0.3s ease';

    if (translateX > 100) { // Swipe right to complete
      onToggle(id);
    } else if (translateX < -100) { // Swipe left to reschedule
      onReschedule(id);
    }
    
    // Reset position after action or if not swiped far enough
    setTranslateX(0);
    dragStartX.current = 0;
  };

  const getBorderColor = () => {
    if (isCompleted) return 'transparent';
    if (priority === 'high') return 'error.main';
    if (priority === 'medium') return 'warning.main';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = dueDate.split('-').map(p => parseInt(p, 10));
    const taskDueDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const diffTime = taskDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'error.main'; // Overdue
    if (diffDays === 0) return 'warning.main'; // Due today
    if (diffDays <= 2) return 'primary.main'; // Due soon
    
    return 'transparent';
  };

  const borderColor = getBorderColor();

  return (
    <Card 
      ref={cardRef}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      sx={{ 
        position: 'relative', // For gradient overlay
        transform: `translateX(${translateX}px)`,
        transition: 'transform 0.3s ease, background-color 0.3s ease, background-image 0.3s ease',
        backgroundColor: isCompleted ? 'action.disabledBackground' : 'background.paper',
        backgroundImage: isCompleted ? 'none' : 
                         translateX > 50 ? 'linear-gradient(to right, rgba(16, 185, 129, 0.5), transparent)' : 
                         translateX < -50 ? 'linear-gradient(to left, rgba(96, 165, 250, 0.5), transparent)' : 'none',
        opacity: isCompleted ? 0.7 : 1,
        borderLeft: '4px solid',
        borderColor: borderColor,
        cursor: 'grab',
        overflow: 'visible' // Allow content to appear over gradient
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, pl: 1.5, '&:last-child': { pb: 2 } }}>
        <Checkbox
          checked={isCompleted}
          onChange={() => onToggle(id)}
          sx={{ mt: -1 }}
        />
        <Box flexGrow={1}>
          <Typography 
            variant="body1" 
            sx={{ 
              textDecoration: isCompleted ? 'line-through' : 'none', 
              color: isCompleted ? 'text.secondary' : 'text.primary',
              fontWeight: 500
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography 
              variant="body2" 
              sx={{ 
                textDecoration: isCompleted ? 'line-through' : 'none', 
                color: 'text.secondary',
                mt: 0.5
              }}
            >
              {description}
            </Typography>
          )}
          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            {reminderTime && !isCompleted && (
              <Chip 
                icon={<NotificationsIcon fontSize="small" />} 
                label={`Reminder at ${reminderTime}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' }}>
            {dueTime && (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                {dueTime}
            </Typography>
            )}
            {!isCompleted && (
              <IconButton 
                  size="small" 
                  onClick={() => onReschedule(id)} 
                  aria-label="reschedule task"
                  sx={{ mt: 'auto', alignSelf: 'flex-end', color: 'text.secondary' }}
              >
                  <EditCalendarIcon fontSize="small" />
              </IconButton>
            )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
