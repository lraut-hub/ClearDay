
import React, { useState, useMemo } from 'react';
import { Typography, Box, Card, CardContent, Button, FormControl, FormLabel, Select, MenuItem, Stack, IconButton, SelectChangeEvent } from '@mui/material';
import MobilePreviewModal from '../components/MobilePreviewModal';
import PhonelinkIcon from '@mui/icons-material/Phonelink';
import { AppSettings, NotificationSound, VibrationPattern } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VibrationIcon from '@mui/icons-material/Vibration';

interface SettingsScreenProps {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const isVibrationSupported = useMemo(() => typeof window !== 'undefined' && 'vibrate' in navigator, []);

  const handleSoundChange = (event: SelectChangeEvent<NotificationSound>) => {
    const sound = event.target.value as NotificationSound;
    setSettings(prev => ({...prev, sound}));
    playSound(sound);
  };

  const handleVibrationChange = (event: SelectChangeEvent<VibrationPattern>) => {
    const vibration = event.target.value as VibrationPattern;
    setSettings(prev => ({...prev, vibration}));
    testVibration(vibration);
  };

  const playSound = (sound: NotificationSound) => {
    if (sound === 'none') return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);

    switch(sound) {
        case 'default':
            oscillator.frequency.value = 440; // A4 note
            oscillator.type = 'sine';
            break;
        case 'chime':
            oscillator.frequency.value = 523.25; // C5
            oscillator.type = 'triangle';
            // Play a second higher note
            setTimeout(() => {
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
            }, 150);
            break;
        case 'alarm':
            oscillator.frequency.value = 880; // A5
            oscillator.type = 'square';
            // Create a short second beep
            setTimeout(() => {
                oscillator.stop();
                const osc2 = audioContext.createOscillator();
                osc2.frequency.value = 880;
                osc2.type = 'square';
                osc2.connect(gainNode);
                osc2.start();
                osc2.stop(audioContext.currentTime + 0.1);
            }, 150);
            break;
    }

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const testVibration = (pattern: VibrationPattern) => {
    if (!isVibrationSupported) return;
    switch(pattern) {
        case 'default':
            navigator.vibrate([200, 100, 200]);
            break;
        case 'short':
            navigator.vibrate(150);
            break;
        case 'long':
            navigator.vibrate(500);
            break;
        case 'none':
            navigator.vibrate(0);
            break;
    }
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <header>
        <Typography variant="h1">Settings</Typography>
        <Typography variant="h6" color="text.secondary">Manage your preferences.</Typography>
      </header>

      <Card>
        <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>Reminders & Notifications</Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
                <FormControl fullWidth>
                    <FormLabel sx={{ mb: 1 }}>Reminder Sound</FormLabel>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Select value={settings.sound} onChange={handleSoundChange} fullWidth>
                            <MenuItem value="default">Default Beep</MenuItem>
                            <MenuItem value="chime">Chime</MenuItem>
                            <MenuItem value="alarm">Digital Alarm</MenuItem>
                            <MenuItem value="none">None</MenuItem>
                        </Select>
                        <IconButton onClick={() => playSound(settings.sound)} aria-label="play sound preview" disabled={settings.sound === 'none'}>
                            <PlayArrowIcon />
                        </IconButton>
                    </Stack>
                </FormControl>
                
                <FormControl fullWidth disabled={!isVibrationSupported}>
                    <FormLabel sx={{ mb: 1 }}>Vibration Pattern</FormLabel>
                     <Stack direction="row" spacing={1} alignItems="center">
                        <Select value={settings.vibration} onChange={handleVibrationChange} fullWidth>
                            <MenuItem value="default">Default Pulse</MenuItem>
                            <MenuItem value="short">Short Burst</MenuItem>
                            <MenuItem value="long">Long Buzz</MenuItem>
                            <MenuItem value="none">None</MenuItem>
                        </Select>
                        <IconButton onClick={() => testVibration(settings.vibration)} aria-label="test vibration pattern" disabled={settings.vibration === 'none'}>
                            <VibrationIcon />
                        </IconButton>
                    </Stack>
                     {!isVibrationSupported && <Typography variant="caption" color="text.secondary" sx={{mt: 1}}>Vibration is not supported on this device.</Typography>}
                </FormControl>
            </Stack>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>Mobile Preview</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Scan a QR code to open this app on your phone. Both devices must be on the same Wi-Fi network.
            </Typography>
            <Button variant="outlined" startIcon={<PhonelinkIcon />} onClick={() => setModalOpen(true)}>
                Show QR Code
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>About ClearDay</Typography>
            <Typography color="text.secondary">
              ClearDay is designed to help you find clarity and achieve your long-term goals without the pressure. We believe in mindful productivity and gentle guidance over rigid schedules.
            </Typography>
        </CardContent>
      </Card>
      <MobilePreviewModal open={isModalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
};

export default SettingsScreen;