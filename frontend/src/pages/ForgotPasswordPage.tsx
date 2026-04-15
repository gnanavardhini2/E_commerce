import React, { useState } from 'react';
import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      setLoading(true);
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res?.data?.message || 'If your email is registered, you will receive a reset link shortly.');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 1.5, sm: 2.5 },
        py: 3,
        background: '#e5e7eb',
      }}
    >
      <Container maxWidth="sm" sx={{ p: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 4 },
            borderRadius: 4,
            border: '1px solid #d1d5db',
            boxShadow: '0 16px 30px rgba(15, 23, 42, 0.14)',
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: '#2563eb' }}>
              <LocalCafeIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Vardhininanicart</Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, textAlign: 'center', mb: 0.5, color: '#111827', fontSize: 34 }}>
            Forgot Password
          </Typography>
          <Typography sx={{ textAlign: 'center', color: '#6b7280', mb: 2.6, fontSize: 13 }}>
            Enter your email and we will send you a reset link.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                  },
                },
              }}
            />

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                height: 44,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                background: '#2563eb',
                boxShadow: '0 8px 18px rgba(37, 99, 235, 0.28)',
                '&:hover': {
                  background: '#1d4ed8',
                },
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Button
              fullWidth
              sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700 }}
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </form>
        </Paper>
        <Typography sx={{ textAlign: 'center', mt: 1.5, color: '#6b7280', fontSize: 12.5, fontWeight: 600 }}>
          Secured by Vardhininanicart
        </Typography>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
