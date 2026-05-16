
import React, { useState } from 'react';
import { AppSettings } from '../types';
import MobilePreviewModal from '../components/MobilePreviewModal';
import { Typography, Box, Card, CardContent, FormControl, Select, MenuItem, InputLabel, IconButton, Button, SelectChangeEvent, Divider } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Vibration as VibrationIcon, PhoneIphone as PhoneIphoneIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';

interface SettingsScreenProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings }) => {
  const [isMobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const handleSoundChange = (event: SelectChangeEvent) => { setSettings({ ...settings, sound: event.target.value as AppSettings['sound'] }); };
  const handleVibrationChange = (event: SelectChangeEvent) => { setSettings({ ...settings, vibration: event.target.value as AppSettings['vibration'] }); };
  
  const testSound = () => {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.volume = 0.5;
      audio.play();
    } catch (e) { console.error("Could not play test sound."); }
  };

  const testVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  return (
    <Box className="cd-animate-in">
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Personalize your ClearDay experience.
      </Typography>

      {/* Notifications */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Notifications</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Reminder Sound</InputLabel>
              <Select value={settings.sound || 'default'} label="Reminder Sound" onChange={handleSoundChange}>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="chime">Chime</MenuItem>
                <MenuItem value="none">Silent</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={testSound} aria-label="Test sound" sx={{ bgcolor: 'rgba(91, 164, 207, 0.08)', '&:hover': { bgcolor: 'rgba(91, 164, 207, 0.15)' } }}>
              <PlayArrowIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Vibration Pattern</InputLabel>
              <Select value={settings.vibration || 'default'} label="Vibration Pattern" onChange={handleVibrationChange}>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="strong">Strong</MenuItem>
                <MenuItem value="none">Off</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={testVibration} aria-label="Test vibration" sx={{ bgcolor: 'rgba(91, 164, 207, 0.08)', '&:hover': { bgcolor: 'rgba(91, 164, 207, 0.15)' } }}>
              <VibrationIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Mobile Preview */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2.5 }}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Mobile Preview</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>See how ClearDay looks on a phone.</Typography>
          </Box>
          <IconButton onClick={() => setMobilePreviewOpen(true)} sx={{ bgcolor: 'rgba(91, 164, 207, 0.08)', '&:hover': { bgcolor: 'rgba(91, 164, 207, 0.15)' } }}>
            <PhoneIphoneIcon />
          </IconButton>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--cd-radius-sm)', bgcolor: 'rgba(91, 164, 207, 0.08)' }}>
              <InfoOutlinedIcon sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>About ClearDay</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            ClearDay is a calm, AI-powered productivity planner. It uses Google's Gemini to help you brainstorm, plan, and schedule — mindfully.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.disabled">Version 2.0 · Built with React + Gemini</Typography>
        </CardContent>
      </Card>

      <MobilePreviewModal open={isMobilePreviewOpen} onClose={() => setMobilePreviewOpen(false)} />
    </Box>
  );
};

export default SettingsScreen;