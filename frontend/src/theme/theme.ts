import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617', // slate-950
      paper: '#0f172a',   // slate-900
    },
    primary: {
      main: '#10b981',   // emerald-500
      light: '#34d399',  // emerald-400
      dark: '#059669',   // emerald-600
      contrastText: '#020617',
    },
    secondary: {
      main: '#38bdf8',   // sky-400
    },
    error: {
      main: '#f43f5e',   // rose-500
    },
    warning: {
      main: '#f59e0b',   // amber-500
    },
    info: {
      main: '#6366f1',   // indigo-500
    },
    success: {
      main: '#10b981',
    },
    text: {
      primary: '#f8fafc',  // slate-50
      secondary: '#94a3b8', // slate-400
    },
    divider: '#1e293b',    // slate-800
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#020617',
          color: '#f8fafc',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0f172a',
          borderColor: '#1e293b',
          borderWidth: 1,
          borderStyle: 'solid',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0f172a',
          borderColor: '#1e293b',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(16, 185, 129, 0.35)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#1e293b',
          padding: '12px 16px',
        },
        head: {
          backgroundColor: '#020617',
          color: '#94a3b8',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#020617',
            '& fieldset': {
              borderColor: '#1e293b',
            },
            '&:hover fieldset': {
              borderColor: '#334155',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10b981',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#020617',
          '& fieldset': {
            borderColor: '#1e293b',
          },
          '&:hover fieldset': {
            borderColor: '#334155',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#10b981',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f172a',
          borderColor: '#1e293b',
          borderWidth: 1,
          borderStyle: 'solid',
        },
      },
    },
  },
});
