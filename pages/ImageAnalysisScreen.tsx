
import React, { useState, useRef, useEffect } from 'react';
import { Page, Task } from '../types';
import { generateSchedule, brainstormWithAI } from '../services/geminiService';
import { Typography, Box, Paper, TextField, Button, IconButton, Stack, Badge, CircularProgress } from '@mui/material';
import { CloudUpload as CloudUploadIcon, AttachFile as AttachFileIcon, Clear as ClearIcon, Send as SendIcon } from '@mui/icons-material';

interface ImageAnalysisScreenProps {
    onAddTasks: (tasks: Omit<Task, 'id' | 'status'>[]) => void;
    setActivePage: (page: Page) => void;
}

type ChatMessage = { sender: 'user' | 'ai'; text: string; imageUrl?: string };

const GoalPlanDisplay: React.FC<{ tasks: Omit<Task, 'id' | 'status'>[] }> = ({ tasks }) => {
    const tasksByDate = tasks.reduce((acc, task) => {
        const date = new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        (acc[date] = acc[date] || []).push(task);
        return acc;
    }, {} as Record<string, Omit<Task, 'id' | 'status'>[]>);
    const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return (
      <Box>
        {sortedDates.map((date) => (
          <Box key={date} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{date}</Typography>
            <Box sx={{ borderLeft: '2px solid var(--cd-outline)', pl: 3, ml: 1 }}>
              <Stack spacing={1.5}>
                {tasksByDate[date].sort((a,b) => (a.dueTime || '').localeCompare(b.dueTime || '')).map((task, taskIndex) => (
                  <Paper key={taskIndex} elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'var(--cd-bg-surface-high)', borderRadius: 'var(--cd-radius-md)', border: '1px solid var(--cd-outline-variant)' }}>
                    {task.dueTime && <Typography variant="body2" sx={{ minWidth: '45px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: 'primary.light' }}>{task.dueTime}</Typography>}
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

const ImageAnalysisScreen: React.FC<ImageAnalysisScreenProps> = ({ onAddTasks, setActivePage }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [view, setView] = useState<'upload' | 'chat' | 'proposal'>('upload');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [proposedTasks, setProposedTasks] = useState<Omit<Task, 'id' | 'status'>[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isLoading]);
    useEffect(() => { return () => { if(imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); } }, [imagePreviewUrl]);

    const handleImageSelect = (file: File) => {
        if(imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        setImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file));
        setChatHistory([
            { sender: 'user', text: 'Uploaded an image.', imageUrl: URL.createObjectURL(file) },
            { sender: 'ai', text: "I can see the image. What would you like me to do with it? For example:\n• 'Extract a study schedule from this.'\n• 'What tasks can you identify here?'" }
        ]);
        setView('chat');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleImageSelect(file);
    };

    const handleDropFile = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) handleImageSelect(file);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;
        const newMessage: ChatMessage = { sender: 'user', text: userInput };
        const newHistory = [...chatHistory, newMessage];
        setChatHistory(newHistory); setUserInput('');
        setIsLoading(true);
        const triggerKeywords = ['extract', 'schedule', 'plan', 'generate', 'tasks'];
        const wantsSchedule = triggerKeywords.some(kw => userInput.toLowerCase().includes(kw));
        try {
            if (wantsSchedule && imageFile) {
                const fullConv = newHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
                const tasks = await generateSchedule(fullConv, imageFile);
                if (tasks.length > 0) { setProposedTasks(tasks); setView('proposal'); }
                else { setChatHistory(prev => [...prev, { sender: 'ai', text: "I couldn't extract any tasks. Could you be more specific?" }]); }
            } else {
                const fullConv = newHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
                const response = await brainstormWithAI(fullConv, imageFile || undefined);
                setChatHistory(prev => [...prev, { sender: 'ai', text: response }]);
            }
        } catch(e) {
            setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, something went wrong. Please try again." }]);
        } finally { setIsLoading(false); }
    };

    const handleAcceptPlan = () => {
        onAddTasks(proposedTasks);
        setActivePage(Page.Schedule);
    };

    if (view === 'upload') {
        return (
            <Box className="cd-animate-in">
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Upload a photo of a schedule, syllabus, or assignment, and let AI do the rest.
                </Typography>
                <Paper
                    variant="outlined"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropFile}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        py: 8, textAlign: 'center', cursor: 'pointer',
                        border: '2px dashed var(--cd-outline)',
                        bgcolor: 'transparent',
                        borderRadius: 'var(--cd-radius-lg)',
                        transition: 'all 300ms ease',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(91, 164, 207, 0.04)' },
                    }}
                >
                    <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'rgba(91, 164, 207, 0.08)', mb: 2 }}>
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Drag & drop an image here</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>or click to browse your files</Typography>
                </Paper>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
            </Box>
        );
    }

    if (view === 'proposal') {
        return (
            <Box className="cd-animate-in">
                <Typography variant="h3" sx={{ mb: 1, fontFamily: "'DM Sans', sans-serif" }}>Extracted Plan</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Here's what I found. Review and accept to add to your schedule.</Typography>
                <Box sx={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', p: 0.5 }}>
                    <GoalPlanDisplay tasks={proposedTasks} />
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={handleAcceptPlan}>Add to Schedule</Button>
                    <Button variant="outlined" onClick={() => setView('chat')}>Refine</Button>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {chatHistory.map((msg, i) => (
                    <Box key={i} className="cd-fade-in" sx={{ alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                        {msg.imageUrl && (
                            <Paper sx={{ p: 1, mb: 0.5, bgcolor: 'var(--cd-primary-container)', borderRadius: '16px 4px 0 0', border: '1px solid rgba(91,164,207,0.15)' }}>
                                <img src={msg.imageUrl} alt="uploaded" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', borderRadius: 4 }} />
                            </Paper>
                        )}
                        {msg.text && (
                            <Paper sx={{
                                p: 1.5,
                                bgcolor: msg.sender === 'ai' ? 'var(--cd-bg-surface)' : 'var(--cd-primary-container)',
                                color: msg.sender === 'ai' ? 'text.primary' : 'var(--cd-on-primary-container)',
                                borderRadius: msg.sender === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                                border: `1px solid ${msg.sender === 'ai' ? 'var(--cd-outline)' : 'rgba(91, 164, 207, 0.15)'}`,
                                ...(msg.imageUrl && msg.sender !== 'ai' && { borderTopLeftRadius: 0, borderTopRightRadius: 0 }),
                            }}>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.text}</Typography>
                            </Paper>
                        )}
                    </Box>
                ))}
                {isLoading && <Box sx={{ alignSelf: 'flex-start' }}><div className="cd-typing-indicator"><span></span><span></span><span></span></div></Box>}
                <div ref={chatEndRef} />
            </Box>
            <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexShrink: 0, borderRadius: 'var(--cd-radius-full)', bgcolor: 'var(--cd-bg-surface-high)', border: '1px solid var(--cd-outline)' }}>
                <TextField fullWidth variant="standard" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="e.g. 'Extract a study schedule'" InputProps={{ disableUnderline: true, sx: { pl: 1.5, fontSize: '0.95rem' } }} disabled={isLoading} />
                <IconButton onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} sx={{ bgcolor: userInput.trim() ? 'primary.dark' : 'transparent', color: userInput.trim() ? 'primary.light' : 'text.disabled', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                    <SendIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default ImageAnalysisScreen;
