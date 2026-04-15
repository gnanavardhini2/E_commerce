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
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import API from '../api';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      if (res.data && res.data.token) {
        toast.success('Login successful');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        login(res.data.user, res.data.token);
        if (res.data.user?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      console.log(error.response?.data);
      const msg = error.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
      <Box sx={{ width: '100%', maxWidth: 890 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          minHeight: { xs: 'auto', md: 540 },
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid #d1d5db',
          boxShadow: '0 16px 30px rgba(15, 23, 42, 0.14)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
          p: { xs: 1.5, md: 2 },
          backgroundColor: '#f8fafc',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 3,
            color: '#f8fafc',
            background: 'linear-gradient(165deg, #2563eb 0%, #1d4ed8 72%, #60a5fa 100%)',
            borderRadius: 3,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, mt: 1 }}>
              Simplify
            </Typography>
            <Typography sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>
              Shopping With
            </Typography>
            <Typography sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>
              Our Dashboard.
            </Typography>
            <Typography sx={{ mt: 1.5, maxWidth: 240, opacity: 0.95, fontSize: 13 }}>
              Simplify your ecommerce management with our user-friendly dashboard.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            <Box
              component="img"
              src="https://img.icons8.com/color/144/shop.png"
              alt="Online shop"
              sx={{ width: 120, height: 120, objectFit: 'contain', mr: 0.5 }}
            />
            <Box
              component="img"
              src="https://img.icons8.com/color/144/delivery.png"
              alt="Fast delivery"
              sx={{ width: 132, height: 132, objectFit: 'contain' }}
            />
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2.5, sm: 3.5, md: 4 }, backgroundColor: '#ffffff', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: '#2563eb' }}>
              <LocalCafeIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Vardhininanicart</Typography>
          </Box>
          <Typography sx={{ textAlign: 'center', color: '#111827', mb: 0.5, fontSize: 34, fontWeight: 800 }}>
            Welcome Back
          </Typography>
          <Typography sx={{ textAlign: 'center', color: '#6b7280', mb: 2.6, fontSize: 13 }}>
            Please login to your account
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%' }} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailError) {
                  setEmailError('');
                }
              }}
              autoComplete="email"
              error={!!emailError}
              helperText={emailError || ' '}
              inputProps={{ 'aria-label': 'Email address' }}
              sx={{
                mt: 0,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                    WebkitTextFillColor: '#111827',
                    transition: 'background-color 9999s ease-out 0s',
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                    WebkitTextFillColor: '#111827',
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                    WebkitTextFillColor: '#111827',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                  },
                },
                '& .MuiFormHelperText-root': {
                  minHeight: 0,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: '#64748b' }} fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (passwordError) {
                  setPasswordError('');
                }
              }}
              autoComplete="current-password"
              error={!!passwordError}
              helperText={passwordError || 'Minimum 6 characters.'}
              inputProps={{ 'aria-label': 'Password' }}
              sx={{
                mt: 0.3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                    WebkitTextFillColor: '#111827',
                    transition: 'background-color 9999s ease-out 0s',
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                    WebkitTextFillColor: '#111827',
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                    WebkitTextFillColor: '#111827',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#64748b' }} fontSize="small" />
                  </InputAdornment>
                ),
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

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                mt: 0.3,
              }}
            >
              <Button
                size="small"
                aria-label="Go to forgot password page"
                sx={{ textTransform: 'none', fontWeight: 700, minHeight: 24, color: '#374151', fontSize: 12 }}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 1.8,
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
                '&:focus-visible': {
                  outline: '3px solid #93c5fd',
                  outlineOffset: '2px',
                },
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>

            <Typography
              sx={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: 12.5,
                mb: 1,
                mt: 2.2,
              }}
            >
              Secure login with encrypted session
            </Typography>

            <Typography
              sx={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: 14,
              }}
            >
              Don't have an account?{' '}
              <Button
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none', fontWeight: 800, p: 0, minWidth: 0 }}
              >
                Register now
              </Button>
            </Typography>
          </form>
        </Box>
      </Paper>
      <Typography sx={{ textAlign: 'center', mt: 1.5, color: '#6b7280', fontSize: 12.5, fontWeight: 600 }}>
        Secured by Vardhininanicart
      </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
