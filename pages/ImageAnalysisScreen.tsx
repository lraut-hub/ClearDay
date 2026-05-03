
import React, { useState, useRef, useEffect } from 'react';
import { Page, Task } from '../types';
import { generateGoalPlan, brainstormWithAI } from '../services/geminiService';
import { Typography, Box, IconButton, Button, Paper, Stack, CircularProgress, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface ImageAnalysisScreenProps {
  onAddTasks: (tasks: Omit<Task, 'id' | 'status'>[]) => void;
  setActivePage: (page: Page) => void;
}

type View = 'upload' | 'chat' | 'proposal';
type ChatMessage = { sender: 'user' | 'ai'; text: string; imageUrl?: string };

const ImageAnalysisScreen: React.FC<ImageAnalysisScreenProps> = ({ onAddTasks, setActivePage }) => {
  const [view, setView] = useState<View>('upload');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canFinalize, setCanFinalize] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<Omit<Task, 'id' | 'status'>[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);
  
  useEffect(() => {
    // Clean up object URLs to prevent memory leaks
    return () => {
        if(imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
    }
  }, [imagePreviewUrl]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setView('chat');
      setChatHistory([{ sender: 'ai', text: "Image loaded. What would you like me to do with it? For example, 'Create a schedule from this timetable for Semester 3'."}])
    }
  };

  const generatePlan = async () => {
    setIsLoading(true);
    setCanFinalize(false);
    if (!imageFile) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: "An image file is required to generate a plan."}]);
        setIsLoading(false);
        return;
    }
    const fullConversation = [...chatHistory, {sender: 'user', text: userInput || "Finalize plan."}]
        .map(m => `${m.sender}: ${m.text}`)
        .join('\n');
    try {
        const plan = await generateGoalPlan(fullConversation, imageFile);
        if (plan && plan.length > 0) {
            setGeneratedTasks(plan);
            setView('proposal');
        } else {
            setChatHistory(prev => [...prev, { sender: 'ai', text: "I couldn't generate a plan from the image and our conversation. Could you provide more details?" }]);
        }
    } catch (e) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: "I had some trouble creating a plan from that. Could you provide more specific details or try again?" }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleUserMessageSubmit = async () => {
    if (!userInput.trim() || !imageFile) return;
    
    setCanFinalize(false);
    const userMessage: ChatMessage = { sender: 'user', text: userInput, imageUrl: imagePreviewUrl || undefined };
    const newHistory: ChatMessage[] = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setUserInput('');
    // We only show the image on the first user message
    if (imagePreviewUrl) setImagePreviewUrl(null);
    setIsLoading(true);

    const fullConversation = newHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    const triggerKeywords = ['proceed', 'create the plan', 'make the schedule', 'generate the plan', 'add to schedule', 'looks good'];
    const wantsPlan = triggerKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
    
    if (wantsPlan) {
        await generatePlan();
    } else {
        try {
            const aiResponseText = await brainstormWithAI(fullConversation, imageFile);
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
    onAddTasks(generatedTasks);
  };

  const renderContent = () => {
    switch (view) {
      case 'upload':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
            <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handleFileChange} />
            <AddPhotoAlternateIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            <Typography variant="h5" color="text.secondary">Upload an Image</Typography>
            <Typography color="text.secondary">Attach a timetable, syllabus, or notes to get started.</Typography>
            <Button variant="contained" onClick={() => fileInputRef.current?.click()}>Select Image</Button>
          </Box>
        );
      case 'chat':
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
                    <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField fullWidth variant="standard" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleUserMessageSubmit()} placeholder="Your thoughts..." InputProps={{ disableUnderline: true }} disabled={isLoading} />
                        <IconButton color="primary" onClick={handleUserMessageSubmit} disabled={isLoading || !userInput.trim()}><SendIcon /></IconButton>
                    </Paper>
                </Box>
            </Box>
        );
    case 'proposal':
        return (
            <Box>
                <Typography variant="h3" sx={{ mb: 1 }}>Here's a suggested plan</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Review this plan. You can accept it to add it to your schedule, or go back to modify it.</Typography>
                <Box sx={{ maxHeight: '40vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, p: 1, background: (theme) => theme.palette.secondary.main, borderRadius: 2 }}>
                    {generatedTasks.map((task, index) => (
                        <Paper key={index} sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                            <Typography variant="body1" fontWeight="medium">{task.title}</Typography>
                            <Typography variant="caption" color="primary.light">{new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} {task.dueTime}</Typography>
                        </Paper>
                    ))}
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={handleAcceptPlan}>Add Plan to Schedule</Button>
                    <Button variant="outlined" onClick={() => setView('chat')}>Modify Plan</Button>
                </Stack>
            </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 120px)' }}>
      <Typography variant="h6" color="text.secondary">Create a plan from an image.</Typography>
      <Box sx={{ flexGrow: 1, overflowY: view === 'chat' ? 'hidden' : 'auto', mt: 2 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default ImageAnalysisScreen;
