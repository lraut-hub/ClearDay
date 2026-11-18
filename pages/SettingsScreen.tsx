import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { Typography, Box, Card, CardContent, FormControl, Select, MenuItem, InputLabel, IconButton, Button, SelectChangeEvent, Divider, ToggleButtonGroup, ToggleButton, Switch, Alert, Stack, TextField, FormControlLabel } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Vibration as VibrationIcon, InfoOutlined as InfoOutlinedIcon, DarkModeOutlined as DarkModeIcon, LightModeOutlined as LightModeIcon, SettingsBrightnessOutlined as SystemModeIcon, AddToHomeScreen as AddToHomeScreenIcon, NotificationsActive as RemindersIcon } from '@mui/icons-material';

interface SettingsScreenProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  actualThemeMode?: 'light' | 'dark';
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings, actualThemeMode = 'dark' }) => {
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

  const playTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      gainNode.connect(ctx.destination);

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.connect(gainNode);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (settings.sound === 'alarm') {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        g.connect(ctx.destination);
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(g);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      } else if (settings.sound === 'none') {
        // silent
      } else {
        // default / chime: C5 → E5
        playTone(523, ctx.currentTime, 0.6);
        playTone(659, ctx.currentTime + 0.6, 0.6);
      }
    } catch (e) { console.error('Could not play test sound.', e); }
  };

  const testVibration = () => {
    if (navigator.vibrate) {
      if (settings.vibration === 'short') navigator.vibrate(100);
      else if (settings.vibration === 'long') navigator.vibrate([200, 100, 200]);
      else if (settings.vibration === 'none') return;
      else navigator.vibrate([100, 50, 100]);
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {settings.theme === 'system' ? (
                <>
                  <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <span>
                    Auto-switching active: <strong>{actualThemeMode === 'dark' ? '🌙 Nighttime (Dark theme)' : '☀️ Daytime (Light theme)'}</strong> (Day: 6 AM – 7 PM, Night: 7 PM – 6 AM).
                  </span>
                </>
              ) : (
                `Manual override: using ${settings.theme} theme.`
              )}
            </Typography>
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

      {/* Notification Alerts */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Notification Alerts</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Reminder Sound</InputLabel>
              <Select value={settings.sound || 'default'} label="Reminder Sound" onChange={handleSoundChange}>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="chime">Chime</MenuItem>
                <MenuItem value="alarm">Alarm</MenuItem>
                <MenuItem value="none">Silent</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={playTestSound} aria-label="Test sound" sx={{ bgcolor: 'rgba(91, 164, 207, 0.08)', '&:hover': { bgcolor: 'rgba(91, 164, 207, 0.15)' } }}>
              <PlayArrowIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Vibration Pattern</InputLabel>
              <Select value={settings.vibration || 'default'} label="Vibration Pattern" onChange={handleVibrationChange}>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="short">Short</MenuItem>
                <MenuItem value="long">Long</MenuItem>
                <MenuItem value="none">Off</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={testVibration} aria-label="Test vibration" sx={{ bgcolor: 'rgba(91, 164, 207, 0.08)', '&:hover': { bgcolor: 'rgba(91, 164, 207, 0.15)' } }}>
              <VibrationIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Reminder Defaults */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Reminder Defaults</Typography>

          {/* Default reminder offset */}
          <FormControl fullWidth size="small">
            <InputLabel>Default Reminder Offset</InputLabel>
            <Select
              value={String(settings.activityReminderOffset)}
              label="Default Reminder Offset"
              onChange={(e) => setSettings({ ...settings, activityReminderOffset: Number(e.target.value) })}
            >
              <MenuItem value="5">5 minutes before</MenuItem>
              <MenuItem value="10">10 minutes before</MenuItem>
              <MenuItem value="15">15 minutes before</MenuItem>
              <MenuItem value="30">30 minutes before</MenuItem>
              <MenuItem value="60">60 minutes before</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          {/* Goal deadline reminder */}
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" fontWeight={500}>Goal Deadline Reminder</Typography>
                <Typography variant="caption" color="text.secondary">Be reminded before goal deadlines</Typography>
              </Box>
              <Switch
                checked={settings.goalRemindersEnabled}
                onChange={(e) => setSettings({ ...settings, goalRemindersEnabled: e.target.checked })}
                color="primary"
              />
            </Box>
            {settings.goalRemindersEnabled && (
              <FormControl fullWidth size="small">
                <InputLabel>Days Before Deadline</InputLabel>
                <Select
                  value={String(settings.goalReminderDaysBefore)}
                  label="Days Before Deadline"
                  onChange={(e) => setSettings({ ...settings, goalReminderDaysBefore: Number(e.target.value) })}
                >
                  <MenuItem value="1">1 day before</MenuItem>
                  <MenuItem value="3">3 days before</MenuItem>
                  <MenuItem value="7">7 days before</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>

          <Divider />

          {/* Do Not Disturb */}
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" fontWeight={500}>Do Not Disturb</Typography>
                <Typography variant="caption" color="text.secondary">Mute reminders during set hours</Typography>
              </Box>
              <Switch
                checked={settings.dndEnabled}
                onChange={(e) => setSettings({ ...settings, dndEnabled: e.target.checked })}
                color="primary"
              />
            </Box>
            {settings.dndEnabled && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="From"
                  type="time"
                  value={settings.dndFrom}
                  onChange={(e) => setSettings({ ...settings, dndFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="To"
                  type="time"
                  value={settings.dndTo}
                  onChange={(e) => setSettings({ ...settings, dndTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                />
              </Box>
            )}
          </Stack>

          <Divider />

          {/* Snooze duration */}
          <FormControl fullWidth size="small">
            <InputLabel>Snooze Duration</InputLabel>
            <Select
              value={String(settings.snoozeDuration)}
              label="Snooze Duration"
              onChange={(e) => setSettings({ ...settings, snoozeDuration: Number(e.target.value) })}
            >
              <MenuItem value="5">5 minutes</MenuItem>
              <MenuItem value="10">10 minutes</MenuItem>
              <MenuItem value="15">15 minutes</MenuItem>
              <MenuItem value="30">30 minutes</MenuItem>
            </Select>
          </FormControl>
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
