
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  IconButton, 
  InputAdornment, 
  Divider,
  Alert,
  Fade,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Google as GoogleIcon, 
  CloudQueue as CloudIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import { supabase } from '../services/supabaseClient';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #1A2632 0%, #0F1419 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: 3
      }}
    >
      {/* Abstract Background Decoration */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '-10%', 
          left: '-10%', 
          width: '40%', 
          height: '40%', 
          background: 'radial-gradient(circle, rgba(91, 164, 207, 0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} 
      />

      <Fade in={true} timeout={1000}>
        <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box 
              sx={{ 
                display: 'inline-flex', 
                p: 1.5, 
                borderRadius: 'var(--cd-radius-lg)', 
                background: 'linear-gradient(135deg, var(--cd-primary) 0%, #3D8CB8 100%)',
                boxShadow: '0 8px 24px rgba(91, 164, 207, 0.2)',
                mb: 2
              }}
            >
              <CloudIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: "'DM Sans', sans-serif", 
                fontWeight: 700,
                color: 'var(--cd-text-primary)',
                letterSpacing: '-0.02em',
                mb: 1
              }}
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--cd-text-secondary)', fontWeight: 500 }}>
              {isLogin ? 'Your mind is clear, let\'s keep it that way.' : 'Start your journey to calm productivity.'}
            </Typography>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 'var(--cd-radius-lg)',
              background: 'rgba(23, 29, 36, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--cd-outline)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
          >
            <form onSubmit={handleAuth}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 'var(--cd-radius-md)', background: 'rgba(224, 108, 108, 0.1)', color: 'var(--cd-error)' }}>
                  {error}
                </Alert>
              )}
              {message && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 'var(--cd-radius-md)', background: 'rgba(92, 184, 130, 0.1)', color: 'var(--cd-success)' }}>
                  {message}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--cd-radius-md)',
                      backgroundColor: 'rgba(15, 20, 25, 0.4)',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--cd-radius-md)',
                      backgroundColor: 'rgba(15, 20, 25, 0.4)',
                    }
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 'var(--cd-radius-md)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, var(--cd-primary) 0%, #3D8CB8 100%)',
                    boxShadow: '0 4px 12px rgba(91, 164, 207, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6AB5E0 0%, var(--cd-primary) 100%)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Sign In' : 'Join ClearDay')}
                </Button>

                <Divider sx={{ my: 1, '&::before, &::after': { borderColor: 'var(--cd-outline-variant)' } }}>
                  <Typography variant="caption" sx={{ color: 'var(--cd-text-disabled)', px: 1 }}>OR</Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{ 
                    py: 1.2, 
                    borderRadius: 'var(--cd-radius-md)',
                    textTransform: 'none',
                    borderColor: 'var(--cd-outline)',
                    color: 'var(--cd-text-primary)',
                    '&:hover': {
                      borderColor: 'var(--cd-text-secondary)',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  Continue with Google
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'var(--cd-text-secondary)' }}>
                {isLogin ? "New to ClearDay?" : "Already have an account?"}{' '}
                <Box 
                  component="span" 
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{ 
                    color: 'var(--cd-primary)', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {isLogin ? 'Create one now' : 'Sign in here'}
                </Box>
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, opacity: 0.6 }}>
            <SparkleIcon sx={{ fontSize: 16, color: 'var(--cd-tertiary)' }} />
            <Typography variant="caption" sx={{ color: 'var(--cd-text-secondary)', fontWeight: 500, letterSpacing: '0.05em' }}>
              POWERED BY GEMINI AI
            </Typography>
          </Box>
        </Container>
      </Fade>
    </Box>
  );
}
