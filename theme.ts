
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6', // Brighter blue for primary actions
    },
    secondary: {
      main: '#374151', 
    },
    background: {
      default: '#111827', // Main dark background color
      paper: '#1F2937', // Lighter background for cards and surfaces
    },
    text: {
      primary: '#F9FAFB', // Off-white for primary text
      secondary: '#9CA3AF', // Muted gray for secondary text
    },
    success: {
      main: '#10B981',
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.5px',
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 600,
        letterSpacing: '-0.25px',
    },
    h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid #374151',
        }
      }
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                textTransform: 'none',
                transition: 'all 0.3s ease-in-out',
            },
            textPrimary: {
                color: '#60A5FA', // Lighter blue for text buttons
            }
        }
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 16,
                backgroundColor: '#1F2937',
                backgroundImage: 'none',
                border: '1px solid #374151',
                boxShadow: 'none',
            }
        }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 16,
                backgroundColor: '#1F2937',
                backgroundImage: 'none',
                border: '1px solid #374151',
            }
        }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#9CA3AF',
          borderColor: '#374151',
          transition: 'all 0.3s ease',
          '&.Mui-selected, &.Mui-selected:hover': {
            color: 'white',
            backgroundColor: '#60A5FA',
          },
        },
      },
    },
  }
});