
import React from 'react';
import { Page } from '../types';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
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
      <Toolbar>
        {activePage === Page.Home ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 1 }}
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            sx={{ mr: 1 }}
            onClick={handleBack}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          {titleOverride || (activePage === Page.Home ? 
            <span style={{ color: 'var(--mui-palette-primary-main)' }}>ClearDay</span> : 
            (pageTitles[activePage] || 'ClearDay'))
          }
        </Typography>

        <IconButton color="inherit" onClick={() => setActivePage(Page.Settings)}>
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
