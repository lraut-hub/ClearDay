
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
import LoginScreen from './pages/LoginScreen';
import AdminConsole from './pages/AdminConsole';
import QuickAddTaskModal from './components/AddTaskModal';
import RescheduleTaskModal from './components/RescheduleTaskModal';
import { useAuth } from './hooks/useAuth';
import { syncService } from './services/syncService';
import { ThemeProvider, CssBaseline, Container, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Typography as MuiTypography } from '@mui/material';
import { Home as HomeIcon, Event as EventIcon, Timeline as TimelineIcon, Security as AdminIcon } from '@mui/icons-material';
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
  
  const { user, loading: authLoading, signOut, isAdmin, isConfigured } = useAuth();

  // Sync data from Cloud to Local on Login
  React.useEffect(() => {
    if (user) {
      syncService.fetchUserData(user.id).then(({ tasks: cloudTasks, goals: cloudGoals }) => {
        if (cloudTasks.length > 0) setTasks(cloudTasks);
        if (cloudGoals.length > 0) setGoals(cloudGoals);
      });
    }
  }, [user, setTasks, setGoals]);

  // Sync data from Local to Cloud on Change
  React.useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        syncService.saveTasks(user.id, tasks);
        syncService.saveGoals(user.id, goals);
      }, 2000); // Debounce sync
      return () => clearTimeout(timer);
    }
  }, [tasks, goals, user]);

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
      case Page.Admin:
        if (!isAdmin) {
          setActivePage(Page.Home);
          return null;
        }
        return <AdminConsole />;
      default:
        return <HomeScreen tasks={sortedTasks} setActivePage={setActivePage} toggleTaskCompletion={toggleTaskCompletion} onAddTaskClick={() => setQuickAddTaskModalOpen(true)} onRescheduleTask={handleOpenRescheduleModal} />;
    }
  };

  const navItems = [
    { icon: <HomeIcon />, label: 'Home', page: Page.Home },
    { icon: <EventIcon />, label: 'Calendar', page: Page.Schedule },
    { icon: <TimelineIcon />, label: 'Progress', page: Page.Progress },
  ];

  if (isAdmin) {
    navItems.push({ icon: <AdminIcon />, label: 'Admin Console', page: Page.Admin });
  }

  const drawerContent = (
    <Box
      sx={{ 
        width: 270, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        py: 1,
      }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
      onKeyDown={() => setDrawerOpen(false)}
    >
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2, mb: 1 }}>
        <MuiTypography
          variant="h6"
          className="cd-gradient-text"
          sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '1.3rem' }}
        >
          ClearDay
        </MuiTypography>
        <MuiTypography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Mindful productivity
        </MuiTypography>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <List sx={{ px: 1, py: 1.5, flexGrow: 0 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            onClick={() => navigate(item.page)}
            selected={activePage === item.page}
            sx={{ py: 1.2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: activePage === item.page ? 'primary.light' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: activePage === item.page ? 600 : 400,
                fontSize: '0.95rem',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ mx: 2 }} />

      {/* User Section */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'primary.dark',
            color: 'primary.light',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {user?.email?.[0].toUpperCase() || 'G'}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <MuiTypography variant="body2" fontWeight={600} noWrap sx={{ color: 'text.primary' }}>
            {user?.email?.split('@')[0] || 'Guest'}
          </MuiTypography>
          <MuiTypography 
            variant="caption" 
            sx={{ 
              color: 'primary.light', 
              fontWeight: 500, 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => user ? signOut() : setActivePage(Page.Home)}
          >
            {user ? 'Sign Out' : 'Sign In'}
          </MuiTypography>
        </Box>
      </Box>
    </Box>
  );

  if (authLoading) return null;

  // Always show LoginScreen if no user is authenticated
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginScreen />
      </ThemeProvider>
    );
  }

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
