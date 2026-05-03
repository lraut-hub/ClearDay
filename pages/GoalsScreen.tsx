
import React, { useState, useRef, useEffect } from 'react';
import { Page, Goal, Task } from '../types';
import { generateGoalPlan, brainstormWithAI } from '../services/geminiService';
import { Typography, Box, Card, CardContent, IconButton, Button, Paper, Chip, Stack, CircularProgress, TextField, Badge, CardActions, Collapse, Checkbox, Link } from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface GoalsScreenProps {
  title: string;
  goals: Goal[];
  tasks: Task[];
  addGoal: (goal: Goal) => void;
  updateGoalAndTasks: (goal: Goal) => void;
  addPlanToSchedule: (tasks: Omit<Task, 'id' | 'status'>[], goalId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  setActivePage: (page: Page) => void;
  setHeaderTitle: (title: string | null) => void;
  setHeaderBackAction: (action: (() => void) | null) => void;
}

type View = 'list' | 'selectType' | 'brainstorm' | 'proposal' | 'detail';
type ChatMessage = { sender: 'user' | 'ai'; text: string; imageUrl?: string };
type WipGoal = Partial<Omit<Goal, 'id'>> & { id?: string, imageFile?: File; imagePreviewUrl?: string };

const GOAL_TYPES = ["Exam preparation", "Diet / fitness", "Work or personal project", "Skill building", "Habit formation"];

const BRAINSTORM_QUESTIONS_BY_TYPE: Record<string, string[]> = {
  'Exam preparation': [
    "Great, let's plan for your exam. What subject is it and what's the exam date? You can also attach a photo of your syllabus or notes.",
  ],
  'Diet / fitness': [
    "Let's get your health plan sorted. What's your primary objective? (e.g., lose weight, build muscle, eat healthier)",
  ],
  'default': [
     "To start, why is this goal important to you right now?",
  ]
};

// --- New ActivityBlock Component ---
const ActivityBlock: React.FC<{ task: Task; onToggle: (id: string) => void; }> = ({ task, onToggle }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasDetails = task.description && task.description.trim().length > 0;

    return (
        <Paper 
            elevation={0}
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ 
                p: 1, 
                bgcolor: 'secondary.main', 
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                    bgcolor: 'action.hover'
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox
                    checked={task.status === 'completed'}
                    onChange={(e) => {
                        e.stopPropagation(); // Prevent expansion when clicking checkbox
                        onToggle(task.id);
                    }}
                    sx={{ p: 0.5 }}
                />
                <Typography sx={{ flexGrow: 1 }}>
                    {task.dueTime && <Typography component="span" fontWeight="bold" variant="body2">{task.dueTime} &nbsp;</Typography>}
                    {task.title}
                </Typography>
            </Box>
            <Collapse in={isExpanded}>
                <Box sx={{ pt: 1.5, pl: '40px' }}>
                    {hasDetails ? (
                        task.description?.split('\n').map((line, i) => (
                            <Typography key={i} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box component="span" sx={{ mr: 1 }}>•</Box> {line}
                            </Typography>
                        ))
                    ) : (
                        <Typography variant="body2" fontStyle="italic" color="text.secondary">
                            Details not specified yet.
                        </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button size="small" variant="text" startIcon={<EditIcon fontSize="small"/>} onClick={(e) => {e.stopPropagation(); console.log('Edit details for', task.id)}}>Edit Details</Button>
                        <Button size="small" variant="text" startIcon={<AutoAwesomeIcon fontSize="small"/>} onClick={(e) => {e.stopPropagation(); console.log('Refine with AI for', task.id)}}>Refine with AI</Button>
                    </Stack>
                </Box>
            </Collapse>
        </Paper>
    )
}


const GoalPlanDisplay: React.FC<{ tasks: Omit<Task, 'id' | 'status'>[] | undefined }> = ({ tasks }) => {
    if (!tasks) return null;
  
    const groupTasksByDate = (tasksToSort: Omit<Task, 'id' | 'status'>[]) => {
        return tasksToSort.reduce((acc, task) => {
            const date = new Date(task.dueDate).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
            });
            (acc[date] = acc[date] || []).push(task);
            return acc;
        }, {} as Record<string, Omit<Task, 'id' | 'status'>[]>);
    };
  
    const tasksByDate = groupTasksByDate(tasks);
    const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
    return (
      <Box>
        {sortedDates.map((date, index) => (
          <Box key={date} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" sx={{ mb: 1.5 }}>
              {date}
            </Typography>
            <Box sx={{ borderLeft: '2px solid #374151', pl: 3, ml: 1 }}>
              <Stack spacing={1.5}>
                {tasksByDate[date].sort((a,b) => (a.dueTime || '').localeCompare(b.dueTime || '')).map((task, taskIndex) => (
                  <Paper key={taskIndex} elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'secondary.main', borderRadius: '12px' }}>
                    {task.dueTime && <Typography variant="body2" sx={{ minWidth: '45px', fontWeight: 'bold' }}>{task.dueTime}</Typography>}
                    <Typography>{task.title}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Box>
        ))}
      </Box>
    );
};


const GoalsScreen: React.FC<GoalsScreenProps> = ({ title, goals, tasks, addGoal, addPlanToSchedule, updateGoalAndTasks, toggleTaskCompletion, setActivePage, setHeaderTitle, setHeaderBackAction }) => {
  const [view, setView] = useState<View>(() => title === 'Set Goal' ? 'selectType' : 'list');
  const [wipGoal, setWipGoal] = useState<WipGoal>({});
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canFinalize, setCanFinalize] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);
  
  useEffect(() => {
    // Clean up object URLs to prevent memory leaks
    return () => {
        if(wipGoal.imagePreviewUrl) {
            URL.revokeObjectURL(wipGoal.imagePreviewUrl);
        }
    }
  }, [wipGoal.imagePreviewUrl]);

  useEffect(() => {
    if (view === 'detail' && selectedGoal) {
        setHeaderTitle(selectedGoal.title);
        setHeaderBackAction(() => () => {
            setView('list');
            setSelectedGoal(null);
        });
    } else {
        setHeaderTitle(null);
        setHeaderBackAction(null);
    }

    // Cleanup function to reset header when component unmounts
    return () => {
        setHeaderTitle(null);
        setHeaderBackAction(null);
    };
  }, [view, selectedGoal, setHeaderTitle, setHeaderBackAction]);


  const handleSelectType = (type: string) => {
    setWipGoal({ type, title: type, category: type, description: `A goal focused on ${type}.` });
    const questions = BRAINSTORM_QUESTIONS_BY_TYPE[type] || BRAINSTORM_QUESTIONS_BY_TYPE['default'];
    setChatHistory([{ sender: 'ai', text: `Let's talk about your goal: "${type}".` }, { sender: 'ai', text: questions[0] }]);
    setView('brainstorm');
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(wipGoal.imagePreviewUrl) URL.revokeObjectURL(wipGoal.imagePreviewUrl);
      setWipGoal(prev => ({ ...prev, imageFile: file, imagePreviewUrl: URL.createObjectURL(file) }));
    }
  };

  const handleClearImage = () => {
    if(wipGoal.imagePreviewUrl) URL.revokeObjectURL(wipGoal.imagePreviewUrl);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setWipGoal(prev => ({ ...prev, imageFile: undefined, imagePreviewUrl: undefined }));
  };
  
  const generatePlan = async () => {
    setIsLoading(true);
    setCanFinalize(false);
    const fullConversation = [...chatHistory, {sender: 'user', text: userInput || "Finalize plan."}]
        .map(m => `${m.sender}: ${m.text}`)
        .join('\n');
    try {
        const plan = await generateGoalPlan(fullConversation, wipGoal.imageFile);
        if (plan && plan.length > 0) {
            setWipGoal(prev => ({ ...prev, tasks: plan }));
            setView('proposal');
        } else {
            setChatHistory(prev => [...prev, { sender: 'ai', text: "I couldn't generate a plan from our conversation. Could you provide more details about your goal?" }]);
        }
    } catch (e) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: "I had some trouble creating a plan from that. Could you provide more specific details or try again?" }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleUserMessageSubmit = async () => {
    if (!userInput.trim() && !wipGoal.imageFile) return;
    
    setCanFinalize(false);
    const userMessage: ChatMessage = { sender: 'user', text: userInput, imageUrl: wipGoal.imagePreviewUrl };
    const newHistory: ChatMessage[] = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setWipGoal(prev => ({ ...prev, imagePreviewUrl: undefined })); // Clear preview for next message, but keep file
    setIsLoading(true);

    const fullConversation = newHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    const triggerKeywords = ['proceed', 'create the plan', 'make the schedule', 'generate the plan', 'add to schedule', 'looks good'];
    const wantsPlan = triggerKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
    
    if (wantsPlan) {
        await generatePlan();
    } else {
        try {
            const aiResponseText = await brainstormWithAI(fullConversation, wipGoal.imageFile);
            setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponseText }]);
            if (aiResponseText.trim().endsWith('?')) {
                setCanFinalize(true);
            }
        } catch (e) {
            setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, I ran into a little trouble there. Could you rephrase that?" }]);
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  const handleAcceptPlan = () => {
    if (!wipGoal?.tasks || !wipGoal.title || !wipGoal.type || !wipGoal.category) return;

    if (wipGoal.id) { // This is an update
      const updatedGoal: Goal = {
        id: wipGoal.id,
        title: wipGoal.title,
        description: wipGoal.description || '',
        type: wipGoal.type,
        category: wipGoal.category,
        tasks: wipGoal.tasks,
      };
      updateGoalAndTasks(updatedGoal);
    } else { // This is a new goal
      const newGoalId = crypto.randomUUID();
      const newGoal: Goal = {
        id: newGoalId,
        title: wipGoal.title,
        description: wipGoal.description || '',
        type: wipGoal.type,
        category: wipGoal.category,
        tasks: wipGoal.tasks,
      };
      addGoal(newGoal);
      addPlanToSchedule(wipGoal.tasks, newGoalId);
    }
  };

  const handleStartModify = (goal: Goal) => {
    setWipGoal(goal);
    setChatHistory([{ sender: 'ai', text: `Let's modify your goal: "${goal.title}". What would you like to change or refine?` }]);
    setView('brainstorm');
  };
  
  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setView('detail');
  };
  
  const handleBackFromCreator = () => {
    if (view === 'proposal') {
      setView('brainstorm');
    } else if (view === 'brainstorm') {
      setView('selectType');
    } else if (view === 'selectType') {
      setActivePage(Page.Goals);
      setView('list'); // Also reset view state
    }
  };

  const getGoalDeadline = (tasks: Omit<Task, 'id' | 'status'>[]): string | null => {
    if (!tasks || tasks.length === 0) return null;
    const latestDate = tasks.reduce((latest, task) => {
        const taskDate = new Date(task.dueDate);
        return taskDate > latest ? taskDate : latest;
    }, new Date(0));
    return latestDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
    });
  };


  const renderContent = () => {
    switch (view) {
      case 'selectType':
        return (
          <Box>
             <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <IconButton onClick={handleBackFromCreator} size="small"><ArrowBackIcon /></IconButton>
                <Typography variant="h3">What kind of goal is it?</Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ mb: 3 }}>This helps the AI ask the right questions to guide you.</Typography>
            <Stack spacing={2}>
              {GOAL_TYPES.map(type => <Button key={type} variant="outlined" onClick={() => handleSelectType(type)} sx={{ p: 2 }}>{type}</Button>)}
            </Stack>
          </Box>
        );
      case 'brainstorm':
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {chatHistory.map((msg, index) => (
                    <Box key={index} sx={{ maxWidth: '80%', alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end'}}>
                        {msg.imageUrl && (
                            <Paper sx={{ p: 1, mb: 0.5, bgcolor: 'primary.main', borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
                                <img src={msg.imageUrl} alt="user upload" style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain', display: 'block', borderRadius: 4 }} />
                            </Paper>
                        )}
                        {msg.text && (
                        <Paper sx={{ 
                            p: 1.5, 
                            bgcolor: msg.sender === 'ai' ? 'secondary.main' : 'primary.main', 
                            color: msg.sender === 'ai' ? 'text.primary' : 'white',
                            ...(msg.imageUrl && { borderTopLeftRadius: 0, borderTopRightRadius: 0 })
                        }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                        </Paper>
                        )}
                    </Box>
                    ))}
                    {isLoading && <CircularProgress size={24} sx={{mt: 2}}/>}
                    <div ref={chatEndRef} />
                </Box>
                
                {canFinalize && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                        <Button variant="contained" onClick={generatePlan} disabled={isLoading}>
                            Finalize & Create Plan
                        </Button>
                    </Box>
                )}
                
                <Box sx={{ flexShrink: 0, mt: 2 }}>
                    {wipGoal.imagePreviewUrl && (
                        <Badge
                            badgeContent={<IconButton size="small" sx={{bgcolor: 'background.paper', '&:hover': {bgcolor: 'background.default'}}} onClick={handleClearImage}><ClearIcon fontSize="small"/></IconButton>}
                            sx={{ mb: 1 }}
                        >
                            <Paper sx={{ p: 0.5, border: '1px solid', borderColor: 'divider' }}>
                                <img src={wipGoal.imagePreviewUrl} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 4 }}/>
                            </Paper>
                        </Badge>
                    )}
                    <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => fileInputRef.current?.click()} color={wipGoal.imageFile ? 'primary' : 'default'}><AttachFileIcon /></IconButton>
                        <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handleFileChange} />
                        <TextField fullWidth variant="standard" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleUserMessageSubmit()} placeholder="Your thoughts..." InputProps={{ disableUnderline: true }} disabled={isLoading} />
                        <IconButton color="primary" onClick={handleUserMessageSubmit} disabled={isLoading || (!userInput.trim() && !wipGoal.imageFile) }><SendIcon /></IconButton>
                    </Paper>
                </Box>
            </Box>
        );
    case 'proposal':
        return (
            <Box>
                <Typography variant="h3" sx={{ mb: 1 }}>Here's a suggested plan</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Review this long-term plan. You can accept it to add it to your schedule, or refine it.</Typography>
                <Box sx={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', p: 0.5 }}>
                   <GoalPlanDisplay tasks={wipGoal.tasks} />
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={handleAcceptPlan}>Add Plan to Schedule</Button>
                    <Button variant="outlined" onClick={() => setView('brainstorm')}>Modify Plan</Button>
                </Stack>
            </Box>
        );
      case 'detail':
        if (!selectedGoal) return null;

        const liveTasksForGoal = tasks.filter(task => task.goalId === selectedGoal.id);

        const tasksByDate = liveTasksForGoal.reduce((acc, task) => {
            const date = task.dueDate;
            (acc[date] = acc[date] || []).push(task);
            return acc;
        }, {} as Record<string, Task[]>);

        const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        return (
            <Box>
                <Typography color="text.secondary" sx={{ mb: 3 }}>{selectedGoal.description}</Typography>
                
                <Stack spacing={3}>
                    {sortedDates.map((date, index) => (
                        <Box key={date}>
                             <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>Day {index + 1}</Typography>
                             <Stack spacing={1}>
                                {tasksByDate[date]
                                    .sort((a,b) => (a.dueTime || '').localeCompare(b.dueTime || ''))
                                    .map(task => (
                                        <ActivityBlock key={task.id} task={task} onToggle={toggleTaskCompletion} />
                                    ))
                                }
                             </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
      case 'list':
      default:
        return (
          <Box>
            {goals.length === 0 ? (
              <Paper sx={{ textAlign: 'center', p: 4, mt: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                <TrackChangesIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6">Define your first long-term goal</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>Clarity on your ambitions is the first step.</Typography>
              </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {goals.map(goal => {
                        const deadline = getGoalDeadline(goal.tasks);
                        return (
                            <Card key={goal.id}>
                                <CardContent sx={{ pb: 1, cursor: 'pointer' }} onClick={() => handleViewDetails(goal)}>
                                    <Typography variant="h5" component="h3" gutterBottom>{goal.title}</Typography>
                                    <Chip label={goal.category} size="small" sx={{ mb: 2, bgcolor: 'secondary.main', color: 'text.primary' }}/>
                                    <Stack direction="row" spacing={3} color="text.secondary" alignItems="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PlaylistAddCheckIcon fontSize="small" />
                                            <Typography variant="body2">
                                                {goal.tasks.length} tasks
                                            </Typography>
                                        </Box>
                                        {deadline && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <EventIcon fontSize="small" />
                                                <Typography variant="body2">
                                                    Ends {deadline}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pr: 2 }}>
                                    <Button size="small" onClick={() => handleStartModify(goal)}>Modify Plan</Button>
                                </CardActions>
                            </Card>
                        )
                    })}
                </Box>
            )}
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 120px)' }}>
      {view !== 'detail' && (
        <Typography variant="h6" color="text.secondary">
            {view === 'list' ? "Define and track your long-term ambitions." : "Let's create clarity together."}
        </Typography>
      )}

      <Box sx={{ flexGrow: 1, overflowY: view === 'brainstorm' ? 'hidden' : 'auto', mt: view === 'list' ? 2 : 0 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default GoalsScreen;
