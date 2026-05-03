
import React, { useState, useMemo } from 'react';
import { Task, Goal } from '../types';
import { reflectOnTasks } from '../services/geminiService';
import { Typography, Box, Card, CardContent, Paper, IconButton, Button, CircularProgress, Alert, Grid, FormControl, Select, MenuItem, InputLabel, SelectChangeEvent } from '@mui/material';
import { 
  CheckCircleOutline as CheckCircleOutlineIcon, 
  Delete as DeleteIcon, 
  PsychologyOutlined as PsychologyOutlinedIcon, 
  HourglassEmpty as HourglassEmptyIcon, 
  ErrorOutline as ErrorOutlineIcon 
} from '@mui/icons-material';

interface ProgressScreenProps {
    tasks: Task[];
    goals: Goal[];
    deleteTask: (id: string) => void;
}

const StatCard: React.FC<{ icon: React.ReactElement; count: number; label: string; }> = ({ icon, count, label }) => (
    <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {icon}
            <Box>
                <Typography variant="h4" component="p" fontWeight="bold">{count}</Typography>
                <Typography color="text.secondary">{label}</Typography>
            </Box>
        </CardContent>
    </Card>
);

const ProgressScreen: React.FC<ProgressScreenProps> = ({ tasks, goals, deleteTask }) => {
  const [reflection, setReflection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const { completedTasks, pendingTasks, overdueTasks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split('T')[0];

    const filteredTasks = tasks.filter(task => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'daily') return !task.goalId;
      return task.goalId === selectedFilter;
    });

    const completed = filteredTasks.filter(task => task.status === 'completed');
    const pending = filteredTasks.filter(task => task.status === 'pending' && task.dueDate >= todayISO);
    const overdue = filteredTasks.filter(task => task.status === 'pending' && task.dueDate < todayISO);
    
    return { completedTasks: completed, pendingTasks: pending, overdueTasks: overdue };
  }, [tasks, selectedFilter]);

  const handleGenerateReflection = async () => {
    setIsLoading(true);
    setError(null);
    setReflection(null);
    try {
      const result = await reflectOnTasks(completedTasks);
      setReflection(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const completedTasksByDate = completedTasks.reduce((acc, task) => {
    const date = new Date(task.dueDate).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedDates = Object.keys(completedTasksByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
         <Typography variant="h6" color="text.secondary">Reflect on your journey, track your achievements.</Typography>
        <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="progress-filter-label">Filter</InputLabel>
            <Select
                labelId="progress-filter-label"
                value={selectedFilter}
                label="Filter"
                onChange={(e: SelectChangeEvent) => setSelectedFilter(e.target.value)}
                size="small"
            >
                <MenuItem value="all">All Activity</MenuItem>
                <MenuItem value="daily">Daily Tasks Only</MenuItem>
                {goals.map(goal => (
                    <MenuItem key={goal.id} value={goal.id}>{goal.title}</MenuItem>
                ))}
            </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
            <StatCard icon={<CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'success.main' }} />} count={completedTasks.length} label="Completed" />
        </Grid>
        <Grid item xs={12} sm={4}>
            <StatCard icon={<HourglassEmptyIcon sx={{ fontSize: 40, color: 'warning.main' }} />} count={pendingTasks.length} label="Pending" />
        </Grid>
        <Grid item xs={12} sm={4}>
            <StatCard icon={<ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} />} count={overdueTasks.length} label="Overdue" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PsychologyOutlinedIcon color="primary" />
            <Typography variant="h5" component="h2">AI-Assisted Reflection</Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Discover patterns in your completed tasks. Our AI can offer a neutral summary of where your energy has gone.
          </Typography>

          <Button 
            variant="contained" 
            onClick={handleGenerateReflection}
            disabled={isLoading || completedTasks.length < 3}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Generate Reflection'}
          </Button>
          
          {completedTasks.length < 3 && (
             <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                Complete at least 3 tasks to generate a reflection.
            </Typography>
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {reflection && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{reflection}</Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      {completedTasks.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h3">Completed Tasks Log</Typography>
          {sortedDates.map(date => (
            <Box key={date}>
              <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" sx={{ mb: 1 }}>
                {new Date(date).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {completedTasksByDate[date].map(task => (
                  <Paper key={task.id} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.8 }}>
                    <Box>
                        <Typography sx={{ textDecoration: 'line-through' }}>{task.title}</Typography>
                        {task.description && <Typography variant="body2" color="text.secondary">{task.description}</Typography>}
                    </Box>
                    <IconButton onClick={() => deleteTask(task.id)} size="small">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProgressScreen;
