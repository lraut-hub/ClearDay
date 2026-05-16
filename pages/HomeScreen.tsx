
import React from 'react';
import { Task, Page } from '../types';
import TaskItem from '../components/TaskItem';
import { Typography, Box, SpeedDial, SpeedDialAction, SpeedDialIcon, IconButton } from '@mui/material';
import { 
  WbSunnyOutlined as WbSunnyOutlinedIcon, 
  TrackChanges as TrackChangesIcon, 
  PlaylistAddCheck as PlaylistAddCheckIcon, 
  AutoAwesome as AutoAwesomeIcon, 
  AddCircleOutline as AddCircleOutlineIcon 
} from '@mui/icons-material';

interface HomeScreenProps {
  tasks: Task[];
  setActivePage: (page: Page) => void;
  toggleTaskCompletion: (id: string) => void;
  onAddTaskClick: () => void;
  onRescheduleTask: (id: string) => void;
}

const CalmState: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: 6 }} className="cd-animate-in">
     <Box
       sx={{
         display: 'inline-flex',
         alignItems: 'center',
         justifyContent: 'center',
         width: 80,
         height: 80,
         borderRadius: '50%',
         bgcolor: 'rgba(212, 167, 106, 0.1)',
         mb: 2.5,
         animation: 'breathe 4s ease-in-out infinite',
       }}
     >
       <WbSunnyOutlinedIcon sx={{ 
          fontSize: 40, 
          color: '#D4A76A',
        }} />
     </Box>
    <Typography 
      variant="h5" 
      sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, mb: 0.5 }}
    >
      Mind is clear
    </Typography>
    <Typography variant="body2" color="text.secondary">
        No tasks for today. Enjoy the calm.
    </Typography>
  </Box>
);

const actions = [
  { icon: <PlaylistAddCheckIcon />, name: 'Set Goals', page: Page.AddGoal },
  { icon: <TrackChangesIcon />, name: 'My Goals', page: Page.Goals },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ tasks, setActivePage, toggleTaskCompletion, onAddTaskClick, onRescheduleTask }) => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.dueDate === todayISO && task.status === 'pending');
  
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box>
      {/* Greeting */}
      <Box className="cd-animate-in" sx={{ mb: 1 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 0.25 }}>
          {greeting()}
        </Typography>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
          }}
        >
          Today,{' '}
          <Box component="span" className="cd-gradient-text">
            {today.toLocaleString(undefined, { month: 'short', day: 'numeric' })}
          </Box>
        </Typography>
      </Box>

      {/* Section Header */}
      <Box className="cd-animate-in cd-stagger-1" sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
        <Box 
          sx={{ 
            width: 3, 
            height: 20, 
            borderRadius: 'var(--cd-radius-full)',
            background: 'linear-gradient(180deg, var(--cd-primary), var(--cd-secondary))',
            mr: 1.5,
          }} 
        />
        <Typography 
          variant="h5" 
          sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, mr: 1 }}
        >
          Focus On
        </Typography>
        <IconButton 
          onClick={onAddTaskClick} 
          aria-label="add task"
          sx={{
            bgcolor: 'var(--cd-primary-container)',
            color: 'var(--cd-on-primary-container)',
            width: 32,
            height: 32,
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'var(--cd-on-primary)',
              transform: 'scale(1.1)',
            },
            transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
            <AddCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />
        </IconButton>
      </Box>

      {/* Task List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 100 }}>
        {todayTasks.length > 0 ? (
            todayTasks.map((task, index) => (
                <Box key={task.id} className={`cd-animate-in cd-stagger-${Math.min(index + 2, 5)}`}>
                  <TaskItem task={task} onToggle={toggleTaskCompletion} onReschedule={onRescheduleTask} />
                </Box>
            ))
        ) : (
            <CalmState />
        )}
      </Box>

      {/* SpeedDial */}
      <SpeedDial
        ariaLabel="AI Actions"
        sx={{ position: 'fixed', bottom: 32, right: 24 }}
        icon={<SpeedDialIcon icon={<AutoAwesomeIcon />} />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => setActivePage(action.page)}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default HomeScreen;
