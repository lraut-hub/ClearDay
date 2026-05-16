
import { createTheme } from '@mui/material/styles';

// ClearDay Design Tokens — from DESIGN.md
const tokens = {
  bg: {
    base: '#0F1419',
    surface: '#171D24',
    surfaceHigh: '#1E2630',
    surfaceHighest: '#263040',
  },
  primary: {
    main: '#5BA4CF',
    container: '#1A3A4D',
    onPrimary: '#FFFFFF',
    onContainer: '#A8D8F0',
  },
  secondary: {
    main: '#7A9E7E',
    container: '#1C2E1E',
    onContainer: '#B5D4B8',
  },
  tertiary: {
    main: '#D4A76A',
    container: '#3D2E1A',
  },
  semantic: {
    success: '#5CB882',
    error: '#E06C6C',
    warning: '#D4A76A',
  },
  text: {
    primary: '#E8ECF0',
    secondary: '#8899A6',
    disabled: '#4A5568',
  },
  outline: '#2A3442',
  outlineVariant: '#1E2832',
};

const motion = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.primary.main,
      dark: tokens.primary.container,
      light: tokens.primary.onContainer,
      contrastText: tokens.primary.onPrimary,
    },
    secondary: {
      main: tokens.secondary.main,
      dark: tokens.secondary.container,
      light: tokens.secondary.onContainer,
    },
    background: {
      default: tokens.bg.base,
      paper: tokens.bg.surface,
    },
    text: {
      primary: tokens.text.primary,
      secondary: tokens.text.secondary,
      disabled: tokens.text.disabled,
    },
    success: { main: tokens.semantic.success },
    error: { main: tokens.semantic.error },
    warning: { main: tokens.semantic.warning },
    divider: tokens.outlineVariant,
    action: {
      hover: 'rgba(91, 164, 207, 0.08)',
      selected: 'rgba(91, 164, 207, 0.12)',
      disabledBackground: tokens.bg.surfaceHigh,
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
      lineHeight: 1.2,
      color: tokens.text.primary,
    },
    h2: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.25px',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '1.375rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.25px',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.25px',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.15px',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.4px',
      color: tokens.text.secondary,
    },
    button: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      letterSpacing: '0.3px',
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.bg.base,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 20, 25, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${tokens.outlineVariant}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none' as const,
          fontWeight: 600,
          padding: '10px 24px',
          transition: `all 300ms ${motion.standard}`,
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundColor: tokens.primary.container,
          color: tokens.primary.onContainer,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: tokens.primary.main,
            color: tokens.primary.onPrimary,
            boxShadow: `0 4px 16px rgba(91, 164, 207, 0.25)`,
          },
        },
        outlined: {
          borderColor: tokens.outline,
          color: tokens.primary.main,
          '&:hover': {
            borderColor: tokens.primary.main,
            backgroundColor: 'rgba(91, 164, 207, 0.08)',
          },
        },
        text: {
          color: tokens.primary.main,
          '&:hover': {
            backgroundColor: 'rgba(91, 164, 207, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: tokens.bg.surface,
          backgroundImage: 'none',
          border: `1px solid ${tokens.outline}`,
          boxShadow: 'none',
          transition: `all 300ms ${motion.standard}`,
          '&:hover': {
            borderColor: tokens.bg.surfaceHighest,
            backgroundColor: tokens.bg.surfaceHigh,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: tokens.bg.surface,
          backgroundImage: 'none',
          border: `1px solid ${tokens.outline}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundColor: tokens.bg.surfaceHigh,
          border: `1px solid ${tokens.outline}`,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: tokens.bg.surfaceHigh,
            '& fieldset': {
              borderColor: tokens.outline,
              transition: `border-color 200ms ${motion.standard}`,
            },
            '&:hover fieldset': {
              borderColor: tokens.text.disabled,
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.primary.main,
              borderWidth: '1.5px',
            },
          },
          '& .MuiInputLabel-root': {
            color: tokens.text.secondary,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: tokens.text.disabled,
          transition: `all 200ms ${motion.standard}`,
          '&.Mui-checked': {
            color: tokens.semantic.success,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          backgroundColor: tokens.bg.surfaceHighest,
          color: tokens.text.secondary,
          border: `1px solid ${tokens.outline}`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: `all 200ms ${motion.standard}`,
          '&:hover': {
            backgroundColor: 'rgba(91, 164, 207, 0.1)',
          },
        },
      },
    },
    MuiSpeedDial: {
      styleOverrides: {
        fab: {
          backgroundColor: tokens.primary.container,
          color: tokens.primary.onContainer,
          boxShadow: `0 4px 20px rgba(91, 164, 207, 0.2)`,
          '&:hover': {
            backgroundColor: tokens.primary.main,
            color: tokens.primary.onPrimary,
          },
        },
      },
    },
    MuiSpeedDialAction: {
      styleOverrides: {
        fab: {
          backgroundColor: tokens.bg.surfaceHigh,
          color: tokens.text.primary,
          border: `1px solid ${tokens.outline}`,
          '&:hover': {
            backgroundColor: tokens.bg.surfaceHighest,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: tokens.text.secondary,
          borderColor: tokens.outline,
          borderRadius: 10,
          transition: `all 300ms ${motion.standard}`,
          '&.Mui-selected, &.Mui-selected:hover': {
            color: tokens.primary.onContainer,
            backgroundColor: tokens.primary.container,
            borderColor: tokens.primary.container,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.bg.surfaceHigh,
          backgroundImage: 'none',
          borderRight: `1px solid ${tokens.outline}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 8px',
          transition: `all 200ms ${motion.standard}`,
          '&.Mui-selected': {
            backgroundColor: tokens.primary.container,
            color: tokens.primary.onContainer,
            '&:hover': {
              backgroundColor: tokens.primary.container,
            },
            '& .MuiListItemIcon-root': {
              color: tokens.primary.onContainer,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardInfo: {
          backgroundColor: tokens.primary.container,
          color: tokens.primary.onContainer,
        },
        standardError: {
          backgroundColor: 'rgba(224, 108, 108, 0.15)',
          color: tokens.semantic.error,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: tokens.outlineVariant,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: tokens.primary.main,
        },
      },
    },
  },
});