import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { Typography, Box, Card, CardContent, FormControl, Select, MenuItem, InputLabel, IconButton, Button, SelectChangeEvent, Divider, ToggleButtonGroup, ToggleButton, Switch, Alert, Stack, TextField } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Vibration as VibrationIcon, InfoOutlined as InfoOutlinedIcon, DarkModeOutlined as DarkModeIcon, LightModeOutlined as LightModeIcon, SettingsBrightnessOutlined as SystemModeIcon, AddToHomeScreen as AddToHomeScreenIcon, NotificationsActive as RemindersIcon } from '@mui/icons-material';

interface SettingsScreenProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings }) => {
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleSoundChange = (event: SelectChangeEvent) => { setSettings({ ...settings, sound: event.target.value as AppSettings['sound'] }); };
  const handleVibrationChange = (event: SelectChangeEvent) => { setSettings({ ...settings, vibration: event.target.value as AppSettings['vibration'] }); };
  const handleThemeChange = (event: React.MouseEvent<HTMLElement>, newTheme: 'dark' | 'light' | 'system' | null) => {
    if (newTheme !== null) {
      setSettings({ ...settings, theme: newTheme });
    }
  };
  
  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }
  };

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

      {/* Appearance */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Appearance</Typography>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Color Theme</Typography>
            <ToggleButtonGroup
              value={settings.theme || 'system'}
              exclusive
              onChange={handleThemeChange}
              fullWidth
              size="small"
              sx={{ bgcolor: 'background.default' }}
            >
              <ToggleButton value="light">
                <LightModeIcon sx={{ fontSize: '1.2rem', mr: 1 }} /> Light
              </ToggleButton>
              <ToggleButton value="dark">
                <DarkModeIcon sx={{ fontSize: '1.2rem', mr: 1 }} /> Dark
              </ToggleButton>
              <ToggleButton value="system">
                <SystemModeIcon sx={{ fontSize: '1.2rem', mr: 1 }} /> System
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RemindersIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Reminders</Typography>
          </Box>

          {(!isStandalone || notificationPermission !== 'granted') && (
            <Alert severity="warning" sx={{ borderRadius: 'var(--cd-radius-md)' }}>
              Reminders require ClearDay to be added to your device and notifications enabled.
              {!isStandalone && (
                 <Typography variant="body2" sx={{ mt: 1, display: 'block', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => window.dispatchEvent(new Event('open-pwa-modal'))}>
                   Add to Home Screen
                 </Typography>
              )}
              {notificationPermission !== 'granted' && (
                 <Typography variant="body2" sx={{ mt: 1, display: 'block', textDecoration: 'underline', cursor: 'pointer' }} onClick={handleRequestPermission}>
                   Enable Notifications
                 </Typography>
              )}
            </Alert>
          )}

          <Divider />

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" fontWeight={500}>Activity Reminders</Typography>
                <Typography variant="caption" color="text.secondary">Get notified before tasks start</Typography>
              </Box>
              <Switch 
                checked={settings.activityRemindersEnabled} 
                onChange={(e) => setSettings({ ...settings, activityRemindersEnabled: e.target.checked })} 
                color="primary" 
              />
            </Box>

            {settings.activityRemindersEnabled && (
              <FormControl fullWidth size="small">
                <InputLabel>Reminder Offset</InputLabel>
                <Select 
                  value={String(settings.activityReminderOffset)} 
                  label="Reminder Offset" 
                  onChange={(e) => setSettings({ ...settings, activityReminderOffset: Number(e.target.value) })}
                >
                  <MenuItem value="5">5 minutes before</MenuItem>
                  <MenuItem value="15">15 minutes before</MenuItem>
                  <MenuItem value="30">30 minutes before</MenuItem>
                  <MenuItem value="60">60 minutes before</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" fontWeight={500}>Reflection Reminder</Typography>
                <Typography variant="caption" color="text.secondary">A daily nudge to reflect</Typography>
              </Box>
              <Switch 
                checked={settings.reflectionReminderEnabled} 
                onChange={(e) => setSettings({ ...settings, reflectionReminderEnabled: e.target.checked })} 
                color="primary" 
              />
            </Box>

            {settings.reflectionReminderEnabled && (
              <TextField
                label="Reflection Time"
                type="time"
                value={settings.reflectionTime}
                onChange={(e) => setSettings({ ...settings, reflectionTime: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                size="small"
                fullWidth
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Notifications Sounds/Vibration */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Notification Alerts</Typography>

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


      {/* Add to Home Screen */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2.5 }}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Add to Home Screen</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Keep ClearDay one tap away.</Typography>
          </Box>
          <IconButton onClick={() => window.dispatchEvent(new Event('open-pwa-modal'))} sx={{ bgcolor: 'rgba(91, 164, 207, 0.08)', '&:hover': { bgcolor: 'rgba(91, 164, 207, 0.15)' } }}>
            <AddToHomeScreenIcon />
          </IconButton>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>About ClearDay</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            ClearDay is a calm productivity planner to help you organize your life mindfully.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.disabled">Version 2.0</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsScreen;