
import React, { useState, useRef } from 'react';
import { Task } from '../types';
import { Card, CardContent, Checkbox, Typography, Box, Chip, IconButton } from '@mui/material';
import { Notifications as NotificationsIcon, EditCalendar as EditCalendarIcon } from '@mui/icons-material';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onReschedule: (id: string) => void;
}

const priorityConfig = {
  high: { color: '#E06C6C', label: 'High' },
  medium: { color: '#D4A76A', label: 'Med' },
  low: { color: '#5BA4CF', label: 'Low' },
};

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
    if (Math.abs(diff) > 10) {
        setTranslateX(diff);
    }
  };

  const handleDragEnd = () => {
    if(cardRef.current) cardRef.current.style.transition = 'all 300ms cubic-bezier(0.2, 0, 0, 1)';

    if (translateX > 100) {
      onToggle(id);
    } else if (translateX < -100) {
      onReschedule(id);
    }
    
    setTranslateX(0);
    dragStartX.current = 0;
  };

  const getTimeUrgency = () => {
    if (isCompleted || priority) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = dueDate.split('-').map(p => parseInt(p, 10));
    const taskDueDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const diffDays = Math.ceil((taskDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 2) return 'soon';
    return null;
  };

  const urgency = getTimeUrgency();
  const pConfig = priority ? priorityConfig[priority] : null;
  const dotColor = pConfig?.color || (urgency === 'overdue' ? '#E06C6C' : urgency === 'today' ? '#D4A76A' : urgency === 'soon' ? '#5BA4CF' : null);

  // Swipe gradient backgrounds
  const getSwipeBg = () => {
    if (translateX > 50) return 'linear-gradient(90deg, rgba(92, 184, 130, 0.15) 0%, transparent 60%)';
    if (translateX < -50) return 'linear-gradient(270deg, rgba(91, 164, 207, 0.15) 0%, transparent 60%)';
    return 'none';
  };

  return (
    <Card 
      ref={cardRef}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      className="cd-animate-in"
      sx={{ 
        position: 'relative',
        transform: `translateX(${translateX}px)`,
        transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
        backgroundImage: getSwipeBg(),
        opacity: isCompleted ? 0.55 : 1,
        cursor: 'grab',
        overflow: 'visible',
        '&:hover': {
          transform: `translateX(${translateX}px) translateY(-2px)`,
          boxShadow: isCompleted ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      {/* Priority / Urgency Dot */}
      {dotColor && !isCompleted && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: dotColor,
            boxShadow: `0 0 8px ${dotColor}40`,
          }}
        />
      )}

      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, pl: 1.5, '&:last-child': { pb: 2 } }}>
        <Checkbox
          checked={isCompleted}
          onChange={() => onToggle(id)}
          sx={{ 
            mt: -0.5,
            '& .MuiSvgIcon-root': {
              fontSize: '1.3rem',
            },
          }}
        />
        <Box flexGrow={1} sx={{ minWidth: 0 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              textDecoration: isCompleted ? 'line-through' : 'none', 
              color: isCompleted ? 'text.disabled' : 'text.primary',
              fontWeight: 500,
              transition: 'all 300ms ease',
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
                mt: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {description}
            </Typography>
          )}
          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {reminderTime && !isCompleted && (
              <Chip 
                icon={<NotificationsIcon sx={{ fontSize: '0.85rem !important' }} />} 
                label={reminderTime}
                size="small"
                sx={{ 
                  height: 24,
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(91, 164, 207, 0.1)',
                  borderColor: 'rgba(91, 164, 207, 0.2)',
                  color: 'primary.light',
                }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
            {dueTime && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  color: isCompleted ? 'text.disabled' : 'text.secondary',
                  fontSize: '0.85rem',
                }}
              >
                {dueTime}
              </Typography>
            )}
            {!isCompleted && (
              <IconButton 
                  size="small" 
                  onClick={() => onReschedule(id)} 
                  aria-label="reschedule task"
                  sx={{ 
                    mt: 'auto',
                    color: 'text.disabled',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
              >
                  <EditCalendarIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
