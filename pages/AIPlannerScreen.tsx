
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/geminiService';
import { Task } from '../types';
import { Typography, Box, Paper, TextField, Button, Alert, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
// Chat entry type matching the shape used by the AI service
type ChatEntry = { role: string; parts: { text?: string; functionCall?: any }[] };

interface AIPlannerScreenProps {
  onAddTasks: (tasks: Omit<Task, 'id' | 'status'>[]) => void;
}

const createRecurringTasks = (args: { title: string; startDate: string; endDate: string; startTime: string; endTime?: string; }): Omit<Task, 'id' | 'status'>[] => {
    const tasks: Omit<Task, 'id' | 'status'>[] = [];
    let currentDate = new Date(args.startDate + 'T00:00:00Z');
    const finalDate = new Date(args.endDate + 'T00:00:00Z');
    while (currentDate <= finalDate) {
        tasks.push({
            title: args.title,
            dueDate: currentDate.toISOString().split('T')[0],
            dueTime: args.startTime,
            endTime: args.endTime,
        });
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return tasks;
};

// Typing indicator component
const TypingIndicator = () => (
  <div className="cd-typing-indicator">
    <span></span><span></span><span></span>
  </div>
);

const AIPlannerScreen: React.FC<AIPlannerScreenProps> = ({ onAddTasks }) => {
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([{ role: 'model', parts: [{ text: "Hello! How can I help you plan your day? You can ask me to add a task, like 'schedule a meeting for tomorrow at 2pm'." }] }]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canFinalize, setCanFinalize] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const isValidDate = (dateString: string | undefined): boolean => {
    if (!dateString) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    const time = date.getTime();
    if(isNaN(time)) return false;
    date.setUTCHours(0,0,0,0);
    return date.toISOString().startsWith(dateString);
  };
  
  const processUserMessage = async (message: string) => {
    if (!message.trim()) return;
    const userMessage: ChatEntry = { role: 'user', parts: [{ text: message }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setCanFinalize(false);
    setIsLoading(true);
    setError(null);

    try {
        const response = await chatWithAI(newHistory);
        if (response.functionCalls && response.functionCalls.length > 0) {
            for (const fc of response.functionCalls) {
                 if (fc.name === 'addTask') {
                    const taskArgs = fc.args as Partial<Omit<Task, 'id' | 'status'>>;
                    if (!taskArgs.title || !isValidDate(taskArgs.dueDate)) {
                        const errorMessage = "I'm sorry, I couldn't create that task. Please provide a clear title and a specific date.";
                        setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: errorMessage }] }]);
                    } else {
                        const validTaskData = taskArgs as Omit<Task, 'id' | 'status'>;
                        onAddTasks([validTaskData]);
                        const confirmationMessage = `✅ Added "${validTaskData.title}" to your schedule.`;
                        setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: confirmationMessage }] }]);
                    }
                } else if (fc.name === 'addRecurringTasks') {
                    const taskArgs = fc.args as { title: string; startDate: string; endDate: string; startTime: string; endTime?: string; };
                    if (!taskArgs.title || !isValidDate(taskArgs.startDate) || !isValidDate(taskArgs.endDate)) {
                        const errorMessage = "I'm sorry, I couldn't schedule that. Please provide a clear title and a specific date range.";
                        setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: errorMessage }] }]);
                    } else {
                        const newTasks = createRecurringTasks(taskArgs);
                        onAddTasks(newTasks);
                        const confirmationMessage = `✅ Scheduled "${taskArgs.title}" daily until ${new Date(taskArgs.endDate).toLocaleDateString()}.`;
                        setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: confirmationMessage }] }]);
                    }
                }
            }
        } else if (response.text) {
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
            if (response.text.trim().endsWith('?')) {
                setCanFinalize(true);
            }
        }
    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I ran into a problem. Please try again."}] }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendMessage = () => { processUserMessage(userInput); };
  const handleFinalize = () => { processUserMessage("Finalize and add the task now."); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Box component="header" sx={{ mb: 2, flexShrink: 0 }} className="cd-animate-in">
          <Typography variant="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>AI Planner</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Your direct line to a clear schedule.
          </Typography>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {chatHistory.map((msg, index) => {
            if (msg.role === 'function' || (msg.role === 'model' && msg.parts[0].functionCall)) return null;
            const isAI = msg.role !== 'user';
            const text = msg.parts[0].text;
            return(
                <Box 
                  key={index} 
                  className="cd-fade-in"
                  sx={{ 
                    display: 'flex', flexDirection: 'column', 
                    alignItems: isAI ? 'flex-start' : 'flex-end',
                  }}
                >
                    <Paper sx={{ 
                      p: 1.5, 
                      maxWidth: '80%', 
                      bgcolor: isAI ? 'var(--cd-bg-surface)' : 'var(--cd-primary-container)',
                      color: isAI ? 'text.primary' : 'var(--cd-on-primary-container)',
                      borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      border: `1px solid ${isAI ? 'var(--cd-outline)' : 'rgba(91, 164, 207, 0.15)'}`,
                    }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{text}</Typography>
                    </Paper>
                </Box>
            )
        })}
        {isLoading && (
          <Box sx={{ alignSelf: 'flex-start' }}>
            <TypingIndicator />
          </Box>
        )}
        {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
        <div ref={chatEndRef} />
      </Box>

      {canFinalize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, flexShrink: 0 }}>
              <Button variant="contained" onClick={handleFinalize} disabled={isLoading}>
                  Finalize & Add Plan
              </Button>
          </Box>
      )}

      {/* Input Bar */}
      <Paper sx={{ 
        p: 1, display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexShrink: 0,
        borderRadius: 'var(--cd-radius-full)',
        bgcolor: 'var(--cd-bg-surface-high)',
        border: '1px solid var(--cd-outline)',
      }}>
        <TextField
          fullWidth
          variant="standard"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Add task 'Read chapter 5' for this Friday..."
          InputProps={{ 
            disableUnderline: true,
            sx: { pl: 1.5, fontSize: '0.95rem' },
          }}
          disabled={isLoading}
        />
        <IconButton 
          onClick={handleSendMessage} 
          disabled={isLoading || !userInput.trim()}
          sx={{
            bgcolor: userInput.trim() ? 'primary.dark' : 'transparent',
            color: userInput.trim() ? 'primary.light' : 'text.disabled',
            transition: 'all 200ms ease',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'var(--cd-on-primary)',
            },
          }}
        >
          <SendIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default AIPlannerScreen;
