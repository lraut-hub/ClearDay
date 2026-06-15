import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, Button, IconButton, Stack } from '@mui/material';
import { Close as CloseIcon, TouchApp as TapIcon, AddToHomeScreen as AddToHomeScreenIcon } from '@mui/icons-material';

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
      checkAndShowPrompt();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Global event listener for manual trigger
    const handleManualOpen = () => {
      setOpen(true);
    };
    window.addEventListener('open-pwa-modal', handleManualOpen);

    // Initial check for iOS
    if (isIOSDevice) {
      checkAndShowPrompt();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-modal', handleManualOpen);
    };
  }, [userLoggedIn]);

  useEffect(() => {
    if (userLoggedIn) {
      checkAndShowPrompt();
    }
  }, [userLoggedIn, promptEvent, isIOS]);

  const checkAndShowPrompt = () => {
    if (!userLoggedIn) return;

    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      localStorage.setItem('addToHomeScreenPromptOptOut', 'true');
      return;
    }

    const optOut = localStorage.getItem('addToHomeScreenPromptOptOut') === 'true';
    if (optOut) return;

    const dismissCount = parseInt(localStorage.getItem('addToHomeScreenDismissalCount') || '0', 10);
    const lastDismissalStr = localStorage.getItem('addToHomeScreenLastDismissal');

    if (lastDismissalStr) {
      const lastDismissal = new Date(lastDismissalStr).getTime();
      const now = new Date().getTime();
      const daysSinceDismissal = (now - lastDismissal) / (1000 * 60 * 60 * 24);

      if (dismissCount === 1 && daysSinceDismissal < 7) return;
      if (dismissCount === 2 && daysSinceDismissal < 30) return;
      if (dismissCount >= 3) return; // Stop after 3rd dismissal
    }

    // Mark as seen but not answered
    localStorage.setItem('addToHomeScreenPromptSeen', 'true');
    localStorage.setItem('addToHomeScreenPromptAnswered', 'false');

    // Only open automatically if not already open
    if ((promptEvent || isIOS) && !open) {
      setOpen(true);
    }
  };

  const handleInstall = async () => {
    localStorage.setItem('addToHomeScreenPromptAnswered', 'true');
    
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('addToHomeScreenPromptOptOut', 'true');
        setOpen(false);
      }
    } else if (isIOS) {
      // Just close modal since they have to follow instructions
      setOpen(false);
    }
  };

  const handleNotNow = () => {
    const dismissCount = parseInt(localStorage.getItem('addToHomeScreenDismissalCount') || '0', 10);
    localStorage.setItem('addToHomeScreenDismissalCount', (dismissCount + 1).toString());
    localStorage.setItem('addToHomeScreenLastDismissal', new Date().toISOString());
    localStorage.setItem('addToHomeScreenPromptAnswered', 'true');
    setOpen(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('addToHomeScreenPromptOptOut', 'true');
    localStorage.setItem('addToHomeScreenPromptAnswered', 'true');
    setOpen(false);
  };

  const handleClose = () => {
    // Treat as seen but not answered
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 'var(--cd-radius-lg)',
          background: 'rgba(23, 29, 36, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--cd-outline)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          width: { xs: '90%', sm: 420 },
          maxWidth: '100%',
          m: 2,
          p: 3,
          position: 'relative',
        }
      }}
    >
      <IconButton 
        onClick={handleClose}
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
          <AddToHomeScreenIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>

        <Typography variant="h6" fontWeight={700} sx={{ fontFamily: "'DM Sans', sans-serif", mb: 1 }}>
          Keep ClearDay one tap away
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
          Add ClearDay to your Home Screen and App Menu for faster access and a smoother experience.
        </Typography>

        {isIOS && !promptEvent ? (
          <Box sx={{ background: 'rgba(91, 164, 207, 0.1)', p: 2, borderRadius: 'var(--cd-radius-md)', border: '1px solid var(--cd-outline)', mb: 3, textAlign: 'left' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TapIcon sx={{ color: 'var(--cd-primary)', fontSize: 24 }} />
              <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1.4 }}>
                1. Tap the <b>Share</b> button below.<br/>
                2. Select <b>"Add to Home Screen"</b>.<br/>
                3. Confirm.
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
            onClick={handleNotNow}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Not Now
          </Button>
          <Typography 
            variant="caption" 
            onClick={handleDontShowAgain}
            sx={{ 
              color: 'text.disabled', 
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'inline-block',
              mt: 1,
              '&:hover': { color: 'text.secondary' } 
            }}
          >
            Don't Show Again
          </Typography>
        </Stack>
      </Box>
    </Dialog>
  );
}
