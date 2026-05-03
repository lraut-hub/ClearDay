
// Fix: Corrected import statement for React and its hooks.
import React, { useState, useCallback, useMemo } from 'react';
import { Page, Task, TaskStatus, Goal, AppSettings } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import HomeScreen from './pages/HomeScreen';
import AIPlannerScreen from './pages/AIPlannerScreen';
import CalendarScreen from './pages/CalendarScreen';
import GoalsScreen from './pages/GoalsScreen';
import SettingsScreen from './pages/SettingsScreen';
import ProgressScreen from './pages/ProgressScreen';
import ImageAnalysisScreen from './pages/ImageAnalysisScreen';
import QuickAddTaskModal from './components/AddTaskModal';
import RescheduleTaskModal from './components/RescheduleTaskModal';
import { ThemeProvider, CssBaseline, Container, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Typography as MuiTypography } from '@mui/material';
import { Home as HomeIcon, Event as EventIcon, Timeline as TimelineIcon } from '@mui/icons-material';
import { theme } from './theme';

export default function App() {
  const [activePage, setActivePage] = useState<Page>(Page.Home);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', { sound: 'default', vibration: 'default' });
  const [isQuickAddTaskModalOpen, setQuickAddTaskModalOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isRescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [taskToReschedule, setTaskToReschedule] = useState<Task | null>(null);

  // State for dynamic header content
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  const [headerBackAction, setHeaderBackAction] = useState<(() => void) | null>(null);

  const handleAddTask = useCallback((newTaskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: crypto.randomUUID(),
      status: 'pending',
    };
    setTasks(prevTasks => [...prevTasks, newTask].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    setQuickAddTaskModalOpen(false);
  }, [setTasks]);
  
  const handleAddStandaloneTasks = useCallback((newTasksData: Omit<Task, 'id' | 'status'>[]) => {
    const newTasks: Task[] = newTasksData.map(taskData => ({
      ...taskData,
      id: crypto.randomUUID(),
      status: 'pending',
    }));
    setTasks(prevTasks => [...prevTasks, ...newTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    setActivePage(Page.Schedule);
  }, [setTasks]);

  const handleAddGoalPlan = useCallback((newTasksData: Omit<Task, 'id' | 'status'>[], goalId: string) => {
    const newTasks: Task[] = newTasksData.map(taskData => ({
      ...taskData,
      id: crypto.randomUUID(),
      status: 'pending',
      goalId,
    }));
    setTasks(prevTasks => [...prevTasks, ...newTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    setActivePage(Page.Schedule);
  }, [setTasks]);

  const handleAddGoal = useCallback((newGoal: Goal) => {
    setGoals(prevGoals => [...prevGoals, newGoal]);
  }, [setGoals]);

  const handleUpdateGoalAndTasks = useCallback((updatedGoal: Goal) => {
    setGoals(prevGoals => prevGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g));

    const newTasksForGoal: Task[] = updatedGoal.tasks.map(taskData => ({
      ...taskData,
      id: crypto.randomUUID(),
      status: 'pending',
      goalId: updatedGoal.id,
    }));

    setTasks(prevTasks => {
      const otherTasks = prevTasks.filter(t => t.goalId !== updatedGoal.id);
      const updatedTasks = [...otherTasks, ...newTasksForGoal];
      return updatedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });
    
    setActivePage(Page.Schedule);
  }, [setGoals, setTasks]);

  const handleOpenRescheduleModal = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        setTaskToReschedule(task);
        setRescheduleModalOpen(true);
    }
  }, [tasks]);

  const handleRescheduleTask = useCallback((taskId: string, newDueDate: string, newDueTime?: string) => {
      setTasks(prevTasks => prevTasks.map(task => 
          task.id === taskId ? { ...task, dueDate: newDueDate, dueTime: newDueTime } : task
      ));
      setRescheduleModalOpen(false);
      setTaskToReschedule(null);
  }, [setTasks]);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: task.status === 'completed' ? 'pending' : 'completed' };
        }
        return task;
      })
    );
  }, [setTasks]);
  
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, [setTasks]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        const dateA = new Date(a.dueDate + 'T' + (a.dueTime || '00:00')).getTime();
        const dateB = new Date(b.dueDate + 'T' + (b.dueTime || '00:00')).getTime();
        return dateA - dateB;
    });
  }, [tasks]);
  
  const navigate = (page: Page) => {
    setActivePage(page);
    setDrawerOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case Page.Home:
        return <HomeScreen tasks={sortedTasks} setActivePage={setActivePage} toggleTaskCompletion={toggleTaskCompletion} onAddTaskClick={() => setQuickAddTaskModalOpen(true)} onRescheduleTask={handleOpenRescheduleModal} />;
      case Page.Planner:
        return <AIPlannerScreen onAddTasks={handleAddStandaloneTasks} />;
      case Page.ImageAnalysis:
        return <ImageAnalysisScreen onAddTasks={handleAddStandaloneTasks} setActivePage={setActivePage} />;
      case Page.Schedule:
        return <CalendarScreen tasks={sortedTasks} onRescheduleTask={handleOpenRescheduleModal} toggleTaskCompletion={toggleTaskCompletion} />;
      case Page.Goals:
        return <GoalsScreen 
                  title="My Goals"
                  goals={goals} 
                  tasks={tasks}
                  addGoal={handleAddGoal} 
                  addPlanToSchedule={handleAddGoalPlan}
                  updateGoalAndTasks={handleUpdateGoalAndTasks}
                  toggleTaskCompletion={toggleTaskCompletion}
                  setActivePage={setActivePage}
                  setHeaderTitle={setHeaderTitle}
                  setHeaderBackAction={setHeaderBackAction}
                />;
      case Page.AddGoal:
        return <GoalsScreen 
                  title="Set Goal"
                  goals={goals} 
                  tasks={tasks}
                  addGoal={handleAddGoal} 
                  addPlanToSchedule={handleAddGoalPlan}
                  updateGoalAndTasks={handleUpdateGoalAndTasks}
                  toggleTaskCompletion={toggleTaskCompletion}
                  setActivePage={setActivePage}
                  setHeaderTitle={setHeaderTitle}
                  setHeaderBackAction={setHeaderBackAction}
                />;
      case Page.Settings:
        return <SettingsScreen settings={settings} setSettings={setSettings} />;
      case Page.Progress:
        return <ProgressScreen tasks={sortedTasks} goals={goals} deleteTask={deleteTask} />;
      default:
        return <HomeScreen tasks={sortedTasks} setActivePage={setActivePage} toggleTaskCompletion={toggleTaskCompletion} onAddTaskClick={() => setQuickAddTaskModalOpen(true)} onRescheduleTask={handleOpenRescheduleModal} />;
    }
  };

  const drawerContent = (
    <Box
      sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
      onKeyDown={() => setDrawerOpen(false)}
    >
      <List>
          <ListItemButton onClick={() => navigate(Page.Home)} selected={activePage === Page.Home}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate(Page.Schedule)} selected={activePage === Page.Schedule}>
            <ListItemIcon><EventIcon /></ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate(Page.Progress)} selected={activePage === Page.Progress}>
            <ListItemIcon><TimelineIcon /></ListItemIcon>
            <ListItemText primary="Progress" />
          </ListItemButton>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar>A</Avatar>
          <Box>
            <MuiTypography variant="body1" fontWeight="bold">Alex</MuiTypography>
            <MuiTypography variant="body2" color="text.secondary">alex@email.com</MuiTypography>
          </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header 
          activePage={activePage} 
          setActivePage={setActivePage} 
          onMenuClick={() => setDrawerOpen(true)}
          titleOverride={headerTitle}
          onBack={headerBackAction}
        />
        <Drawer anchor="left" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
            {drawerContent}
        </Drawer>
        <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 2 }}>
          {renderPage()}
        </Container>
        {isQuickAddTaskModalOpen && (
          <QuickAddTaskModal
            open={isQuickAddTaskModalOpen}
            onClose={() => setQuickAddTaskModalOpen(false)}
            onAddTask={handleAddTask}
          />
        )}
        <RescheduleTaskModal
          open={isRescheduleModalOpen}
          onClose={() => { setRescheduleModalOpen(false); setTaskToReschedule(null); }}
          onReschedule={handleRescheduleTask}
          task={taskToReschedule}
        />
      </Box>
    </ThemeProvider>
  );
}
