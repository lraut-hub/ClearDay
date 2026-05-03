
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
  <Box sx={{ textAlign: 'center', py: 4 }}>
     <WbSunnyOutlinedIcon sx={{ 
        fontSize: 60, 
        color: 'warning.light', 
        mb: 2,
        // Glowing effect
        filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.7))'
      }} />
    <Typography variant="h6" sx={{fontWeight: 'medium'}}>Mind is clear</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        No tasks for today.
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
  
  return (
    <Box>
      <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
        Today, {today.toLocaleString(undefined, { month: 'short', day: 'numeric' })}
      </Typography>

       <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 500, mr: 1 }}>Focus On</Typography>
          <IconButton onClick={onAddTaskClick} color="primary" aria-label="add task">
              <AddCircleOutlineIcon />
          </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 100 }}>
        {todayTasks.length > 0 ? (
            todayTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} onReschedule={onRescheduleTask} />
            ))
        ) : (
            <CalmState />
        )}
      </Box>

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
            sx={{ 
                bgcolor: 'background.paper', 
                '&:hover': { bgcolor: 'secondary.main' }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default HomeScreen;
