
import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, Button, IconButton, Stack } from '@mui/material';
import { Close as CloseIcon, GetApp as InstallIcon, TouchApp as TapIcon } from '@mui/icons-material';

interface PWAInstallModalProps {
  userLoggedIn: boolean;
}

export default function PWAInstallModal({ userLoggedIn }: PWAInstallModalProps) {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e);
      if (userLoggedIn && !localStorage.getItem('cd_pwa_dismissed')) {
        setOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and standalone not active, we can show a tip
    if (isIOSDevice && !(window.navigator as any).standalone && userLoggedIn && !localStorage.getItem('cd_pwa_dismissed')) {
      setOpen(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [userLoggedIn]);

  useEffect(() => {
    if (userLoggedIn && (promptEvent || (isIOS && !(window.navigator as any).standalone)) && !localStorage.getItem('cd_pwa_dismissed')) {
      setOpen(true);
    }
  }, [userLoggedIn, promptEvent, isIOS]);

  const handleInstall = async () => {
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('cd_pwa_dismissed', 'true');
        setOpen(false);
      }
    } else if (isIOS) {
      // User has to manually add on iOS
      alert("To install on iOS: Tap the Share button (square with arrow pointing up) at the bottom of Safari, then tap 'Add to Home Screen'.");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('cd_pwa_dismissed', 'true');
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDismiss}
      PaperProps={{
        sx: {
          borderRadius: 'var(--cd-radius-lg)',
          background: 'rgba(23, 29, 36, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--cd-outline)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          maxWidth: 380,
          m: 2,
          p: 3,
          position: 'relative',
        }
      }}
    >
      <IconButton 
        onClick={handleDismiss}
        sx={{ position: 'absolute', top: 12, right: 12, color: 'text.secondary' }}
      >
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Box sx={{ textAlign: 'center', my: 1 }}>
        <Box 
          sx={{ 
            width: 56, 
            height: 56, 
            borderRadius: 'var(--cd-radius-lg)', 
            background: 'linear-gradient(135deg, var(--cd-primary) 0%, #3D8CB8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
            boxShadow: '0 8px 24px rgba(91, 164, 207, 0.3)',
          }}
        >
          <InstallIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>

        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: "'DM Sans', sans-serif", mb: 1 }}>
          Install ClearDay App
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
          Add ClearDay directly to your phone's Home Screen for instant offline access and full-screen experience. <b style={{ color: 'var(--cd-primary)' }}>No app store installation needed!</b>
        </Typography>

        {isIOS && !promptEvent ? (
          <Box sx={{ background: 'rgba(91, 164, 207, 0.1)', p: 2, borderRadius: 'var(--cd-radius-md)', border: '1px solid var(--cd-outline)', mb: 3, textAlign: 'left' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TapIcon sx={{ color: 'var(--cd-primary)', fontSize: 24 }} />
              <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1.4 }}>
                <b>iOS Safari:</b> Tap the Share button below, then select <b>"Add to Home Screen"</b>.
              </Typography>
            </Stack>
          </Box>
        ) : null}

        <Stack spacing={1.5}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleInstall}
            sx={{ 
              py: 1.5, 
              borderRadius: 'var(--cd-radius-md)', 
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--cd-primary) 0%, #3D8CB8 100%)',
            }}
          >
            Add to Home Screen
          </Button>
          <Button 
            variant="text" 
            fullWidth 
            onClick={handleDismiss}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Maybe Later
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
