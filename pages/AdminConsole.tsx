
import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Avatar, 
  Chip, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Divider,
  Button,
  LinearProgress
} from '@mui/material';
import { 
  BarChart as StatsIcon, 
  People as PeopleIcon, 
  Security as AdminIcon,
  Storage as DbIcon,
  Speed as PerformanceIcon,
  AutoAwesome as AiIcon
} from '@mui/icons-material';

const MOCK_STATS = [
  { label: 'Total Users', value: '1,284', delta: '+12%', icon: <PeopleIcon />, color: 'var(--cd-primary)' },
  { label: 'Active Today', value: '432', delta: '+5%', icon: <StatsIcon />, color: 'var(--cd-secondary)' },
  { label: 'AI Requests', value: '12.4k', delta: '+18%', icon: <AiIcon />, color: 'var(--cd-tertiary)' },
  { label: 'DB Storage', value: '142MB', delta: 'Healthy', icon: <DbIcon />, color: 'var(--cd-success)' },
];

const RECENT_USERS = [
  { name: 'Sarah Miller', email: 'sarah.m@example.com', status: 'Active', time: '2m ago' },
  { name: 'James Wilson', email: 'j.wilson@example.com', status: 'Syncing', time: '15m ago' },
  { name: 'Elena Rodriguez', email: 'elena.r@example.com', status: 'Active', time: '1h ago' },
  { name: 'David Chen', email: 'd.chen@example.com', status: 'Offline', time: '3h ago' },
];

export default function AdminConsole() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: 'var(--cd-radius-md)', 
            background: 'var(--cd-primary-container)',
            color: 'var(--cd-primary)',
            display: 'flex'
          }}
        >
          <AdminIcon />
        </Box>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: "'DM Sans', sans-serif", 
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--cd-text-primary)'
            }}
          >
            Admin Console
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--cd-text-secondary)', fontWeight: 500 }}>
            System-wide management and intelligence.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {MOCK_STATS.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 'var(--cd-radius-lg)', 
                background: 'var(--cd-bg-surface)',
                border: '1px solid var(--cd-outline)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'transform var(--cd-duration-short) var(--cd-ease-standard)',
                '&:hover': { transform: 'translateY(-4px)', borderColor: 'var(--cd-primary)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                <Chip 
                  label={stat.delta} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(92, 184, 130, 0.1)', 
                    color: 'var(--cd-success)', 
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 20
                  }} 
                />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--cd-text-primary)' }}>{stat.value}</Typography>
                <Typography variant="caption" sx={{ color: 'var(--cd-text-secondary)', fontWeight: 500 }}>{stat.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 'var(--cd-radius-lg)', 
              background: 'var(--cd-bg-surface)',
              border: '1px solid var(--cd-outline)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'var(--cd-text-primary)' }}>
              Recent User Activity
            </Typography>
            <List>
              {RECENT_USERS.map((user, i) => (
                <React.Fragment key={i}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'var(--cd-bg-surface-high)', color: 'var(--cd-text-primary)' }}>
                        {user.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography variant="body2" fontWeight={600}>{user.name}</Typography>}
                      secondary={<Typography variant="caption" color="var(--cd-text-secondary)">{user.email}</Typography>}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip 
                        label={user.status} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          borderColor: 'var(--cd-outline)',
                          color: user.status === 'Active' ? 'var(--cd-success)' : 'var(--cd-text-secondary)'
                        }} 
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'var(--cd-text-disabled)' }}>
                        {user.time}
                      </Typography>
                    </Box>
                  </ListItem>
                  {i < RECENT_USERS.length - 1 && <Divider sx={{ borderColor: 'var(--cd-outline-variant)' }} />}
                </React.Fragment>
              ))}
            </List>
            <Button fullWidth sx={{ mt: 2, textTransform: 'none', color: 'var(--cd-primary)' }}>
              View All Users
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 'var(--cd-radius-lg)', 
              background: 'var(--cd-bg-surface)',
              border: '1px solid var(--cd-outline)',
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'var(--cd-text-primary)' }}>
              System Health
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--cd-text-secondary)', fontWeight: 600 }}>API LATENCY</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--cd-success)', fontWeight: 700 }}>240ms</Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--cd-bg-surface-high)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--cd-success)' } }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--cd-text-secondary)', fontWeight: 600 }}>DB LOAD</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--cd-warning)', fontWeight: 700 }}>42%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={42} sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--cd-bg-surface-high)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--cd-warning)' } }} />
              </Box>
              
              <Divider sx={{ my: 1, borderColor: 'var(--cd-outline-variant)' }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PerformanceIcon sx={{ color: 'var(--cd-primary)', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Premium Clusters Active</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StatsIcon sx={{ color: 'var(--cd-secondary)', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Global Syncing: Stable</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
