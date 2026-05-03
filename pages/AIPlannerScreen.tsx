
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/geminiService';
import { Task } from '../types';
import { Typography, Box, Paper, TextField, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Part } from '@google/genai';

interface AIPlannerScreenProps {
  onAddTasks: (tasks: Omit<Task, 'id' | 'status'>[]) => void;
}

const createRecurringTasks = (args: { title: string; startDate: string; endDate: string; startTime: string; endTime?: string; }): Omit<Task, 'id' | 'status'>[] => {
    const tasks: Omit<Task, 'id' | 'status'>[] = [];
    
    // Ensure dates are parsed in UTC to avoid timezone shifts
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

const AIPlannerScreen: React.FC<AIPlannerScreenProps> = ({ onAddTasks }) => {
  const [chatHistory, setChatHistory] = useState<Part[]>([{ role: 'model', parts: [{ text: "Hello! How can I help you plan your day? You can ask me to add a task, like 'schedule a meeting for tomorrow at 2pm'." }] }]);
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
    // Check if the string matches the YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    // Check if it's a valid date that can be parsed (e.g., not 2023-02-30)
    const date = new Date(dateString);
    const time = date.getTime();
    if(isNaN(time)) return false;
    // Check that the parsed date matches the input string to catch timezone errors
    date.setUTCHours(0,0,0,0);
    return date.toISOString().startsWith(dateString);
  };
  
  const processUserMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Part = { role: 'user', parts: [{ text: message }] };
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
                        const errorMessage = "I'm sorry, I couldn't create that task. Please provide a clear title and a specific date (like 'today' or 'this Friday') so I can add it to your calendar.";
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
                        const errorMessage = "I'm sorry, I couldn't schedule that. Please provide a clear title and a specific date range (like 'from today until Friday').";
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

  const handleSendMessage = () => {
    processUserMessage(userInput);
  };

  const handleFinalize = () => {
    processUserMessage("Finalize and add the task now.");
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', bgcolor: 'background.default' }}>
      <Box component="header" sx={{ mb: 2, flexShrink: 0 }}>
          <Typography variant="h1">AI Planner</Typography>
          <Typography variant="h6" color="text.secondary">Your direct line to a clear schedule.</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {chatHistory.map((msg, index) => {
            if (msg.role === 'function' || (msg.role === 'model' && msg.parts[0].functionCall)) return null;
            const sender = msg.role === 'user' ? 'user' : 'ai';
            const text = msg.parts[0].text;
            return(
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: sender === 'ai' ? 'flex-start' : 'flex-end' }}>
                    <Paper sx={{ p: 1.5, maxWidth: '80%', bgcolor: sender === 'ai' ? 'secondary.main' : 'primary.main', color: sender === 'ai' ? 'text.primary' : 'white' }}>
                        <Typography variant="body1">{text}</Typography>
                    </Paper>
                </Box>
            )
        })}
        {isLoading && <CircularProgress size={24} sx={{ mt: 2, alignSelf: 'flex-start' }} />}
        {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
        <div ref={chatEndRef} />
      </Box>

      {canFinalize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, flexShrink: 0 }}>
              <Button variant="contained" onClick={handleFinalize} disabled={isLoading}>
                  Finalize & Add Plan
              </Button>
          </Box>
      )}

      <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, mt: 2, flexShrink: 0 }}>
        <TextField
          fullWidth
          variant="standard"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Add task 'Read chapter 5' for this Friday..."
          InputProps={{ disableUnderline: true }}
          disabled={isLoading}
        />
        <IconButton color="primary" onClick={handleSendMessage} disabled={isLoading || !userInput.trim()}>
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default AIPlannerScreen;
