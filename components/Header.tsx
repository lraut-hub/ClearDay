
import React from 'react';
import { Page } from '../types';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { Menu as MenuIcon, Settings as SettingsIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onMenuClick: () => void;
  titleOverride?: string | null;
  onBack?: (() => void) | null;
}

const pageTitles: { [key in Page]?: string } = {
    [Page.Schedule]: 'Calendar',
    [Page.Planner]: 'AI Planner',
    [Page.Goals]: 'My Goals',
    [Page.AddGoal]: 'Set Goal',
    [Page.Settings]: 'Settings',
    [Page.Progress]: 'Progress',
    [Page.ImageAnalysis]: 'Image Analysis',
};

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, onMenuClick, titleOverride, onBack }) => {
  const handleBack = onBack || (() => setActivePage(Page.Home));
  
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        {activePage === Page.Home ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{
              transition: 'all 200ms cubic-bezier(0.2, 0, 0, 1)',
              '&:hover': {
                transform: 'scale(1.08)',
                backgroundColor: 'rgba(91, 164, 207, 0.1)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleBack}
            sx={{
              transition: 'all 200ms cubic-bezier(0.2, 0, 0, 1)',
              '&:hover': {
                transform: 'translateX(-2px)',
                backgroundColor: 'rgba(91, 164, 207, 0.1)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            letterSpacing: '-0.2px',
          }}
        >
          {titleOverride || (activePage === Page.Home ? (
            <Box 
              component="span" 
              className="cd-gradient-text"
              sx={{ 
                fontWeight: 700,
                fontSize: '1.15rem',
              }}
            >
              ClearDay
            </Box>
          ) : (
            pageTitles[activePage] || 'ClearDay'
          ))}
        </Typography>

        <IconButton 
          color="inherit" 
          onClick={() => setActivePage(Page.Settings)}
          sx={{
            transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
            '&:hover': {
              transform: 'rotate(45deg)',
              backgroundColor: 'rgba(91, 164, 207, 0.1)',
            },
          }}
        >
          <SettingsIcon sx={{ fontSize: '1.3rem' }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
