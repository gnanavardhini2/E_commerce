import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/auth/register', { name, email, password });
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e5e7eb',
        px: { xs: 1.5, sm: 2.5 },
        py: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 4,
            p: { xs: 2.5, sm: 3.5, md: 4 },
            border: '1px solid #d1d5db',
            boxShadow: '0 16px 30px rgba(15, 23, 42, 0.14)',
            backgroundColor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: '#2563eb' }}>
              <LocalCafeIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>VardhiniChaiCart</Typography>
          </Box>
          <Typography sx={{ textAlign: 'center', color: '#111827', mb: 0.5, fontSize: 34, fontWeight: 800 }}>
            Create Account
          </Typography>
          <Typography sx={{ textAlign: 'center', color: '#6b7280', mb: 2.6, fontSize: 13 }}>
            Join now to place orders, track deliveries, and save favorites.
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                height: 44,
                fontWeight: 700,
                letterSpacing: 0.3,
                borderRadius: 2,
                textTransform: 'none',
                background: '#2563eb',
                boxShadow: '0 8px 18px rgba(37, 99, 235, 0.28)',
                '&:hover': {
                  background: '#1d4ed8',
                },
              }}
            >
              Register
            </Button>

            <Typography
              sx={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: 14,
                mt: 2.2,
              }}
            >
              Already have an account?{' '}
              <Button
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', fontWeight: 800, p: 0, minWidth: 0 }}
              >
                Login now
              </Button>
            </Typography>
          </form>
        </Paper>
        <Typography sx={{ textAlign: 'center', mt: 1.5, color: '#6b7280', fontSize: 12.5, fontWeight: 600 }}>
          Secured by VardhiniChaiCart
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
