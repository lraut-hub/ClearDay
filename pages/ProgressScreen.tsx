
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

const StatCard: React.FC<{ icon: React.ReactElement; count: number; label: string; color: string }> = ({ icon, count, label, color }) => (
    <Card className="cd-animate-in">
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 'var(--cd-radius-md)',
              bgcolor: `${color}15`, flexShrink: 0,
            }}>
              {React.cloneElement(icon as any, { sx: { fontSize: 28, color } })}
            </Box>
            <Box>
                <Typography variant="h4" component="p" sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2 }}>{count}</Typography>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
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
    return {
      completedTasks: filteredTasks.filter(task => task.status === 'completed'),
      pendingTasks: filteredTasks.filter(task => task.status === 'pending' && task.dueDate >= todayISO),
      overdueTasks: filteredTasks.filter(task => task.status === 'pending' && task.dueDate < todayISO),
    };
  }, [tasks, selectedFilter]);

  const handleGenerateReflection = async () => {
    setIsLoading(true); setError(null); setReflection(null);
    try { const result = await reflectOnTasks(completedTasks); setReflection(result); }
    catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const completedTasksByDate = completedTasks.reduce((acc, task) => {
    const date = new Date(task.dueDate).toDateString();
    (acc[date] = acc[date] || []).push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  const sortedDates = Object.keys(completedTasksByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }} className="cd-animate-in">
         <Typography variant="body1" color="text.secondary">Reflect on your journey, track achievements.</Typography>
        <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="progress-filter-label" sx={{ fontSize: '0.9rem' }}>Filter</InputLabel>
            <Select labelId="progress-filter-label" value={selectedFilter} label="Filter" onChange={(e: SelectChangeEvent) => setSelectedFilter(e.target.value)} size="small">
                <MenuItem value="all">All Activity</MenuItem>
                <MenuItem value="daily">Daily Tasks Only</MenuItem>
                {goals.map(goal => (<MenuItem key={goal.id} value={goal.id}>{goal.title}</MenuItem>))}
            </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
            <StatCard icon={<CheckCircleOutlineIcon />} count={completedTasks.length} label="Completed" color="#5CB882" />
        </Grid>
        <Grid item xs={12} sm={4}>
            <StatCard icon={<HourglassEmptyIcon />} count={pendingTasks.length} label="Pending" color="#D4A76A" />
        </Grid>
        <Grid item xs={12} sm={4}>
            <StatCard icon={<ErrorOutlineIcon />} count={overdueTasks.length} label="Overdue" color="#E06C6C" />
        </Grid>
      </Grid>

      <Card className="cd-animate-in cd-stagger-2">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--cd-radius-sm)', bgcolor: 'rgba(91, 164, 207, 0.1)' }}>
              <PsychologyOutlinedIcon sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>AI Reflection</Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Discover patterns in your completed tasks. Our AI offers a neutral summary of where your energy has gone.
          </Typography>
          <Button variant="contained" onClick={handleGenerateReflection} disabled={isLoading || completedTasks.length < 3}>
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Generate Reflection'}
          </Button>
          {completedTasks.length < 3 && (
             <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 1 }}>
                Complete at least 3 tasks to generate a reflection.
            </Typography>
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {reflection && (
            <Paper variant="outlined" sx={{ p: 2.5, mt: 2, bgcolor: 'var(--cd-bg-surface-high)', borderLeft: '3px solid var(--cd-primary)', borderColor: 'var(--cd-primary)' }}>
                <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{reflection}</Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      {completedTasks.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} className="cd-animate-in cd-stagger-3">
          <Typography variant="h3" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Completed Tasks</Typography>
          {sortedDates.map(date => (
            <Box key={date}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                {new Date(date).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {completedTasksByDate[date].map(task => (
                  <Paper key={task.id} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.65, bgcolor: 'var(--cd-bg-surface)', border: '1px solid var(--cd-outline-variant)' }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>{task.title}</Typography>
                        {task.description && <Typography variant="body2" color="text.disabled" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</Typography>}
                    </Box>
                    <IconButton onClick={() => deleteTask(task.id)} size="small" sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' }, flexShrink: 0 }}>
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
