import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import TablerIcon from '../Common/TablerIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const SESSION_TIMEOUT_MESSAGE = 'Aktif bir işlem sürecinde olmadığınız için oturumunuz sonlandırılmıştır.';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, loading } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    setLogoutMessage(SESSION_TIMEOUT_MESSAGE);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError(t('auth.pleaseEnterCredentials'));
      return;
    }

    if (!formData.email.includes('@')) {
      setError(t('auth.invalidEmailFormat'));
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(false);

    if (!resetEmail || !resetEmail.includes('@')) {
      setError(t('auth.invalidEmailFormat'));
      return;
    }

    setResetSuccess(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.paper',
        color: 'text.primary',
        fontFamily:
          "'Satoshi-Variable', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      <Box
        sx={{
          flex: { xs: '0 0 auto', md: '0 0 50%' },
          px: { xs: 3, sm: 6, md: 10 },
          py: { xs: 4, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pl: { xs: 3, sm: 6, md: 10 },
            pr: { xs: 3, sm: 6, md: 4 },
            pt: { xs: 4, md: 6 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/Indiriim-Logo-wBG.png"
              alt="İndiriim Logo"
              sx={{ height: 40, borderRadius: '24px' }}
            />
            <Typography
              sx={{
                fontFamily: 'DINRoundPro-Bold, sans-serif',
                fontSize: '1rem',
                color: 'text.primary',
                lineHeight: 1.2
              }}
            >
              indiriim.com
              <br />
            Marketing App
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 420, mx: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4
            }}
          >
            <Box
              component="img"
              src={isDarkMode ? '/Indiriim-Logo-noBG%201.svg' : '/Indiriim-dark%20Logo-noBG%202.svg'}
              alt="İndiriim Logo"
              sx={{ height: 48 }}
            />
          </Box>

          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
            {t('auth.signIn')}
          </Typography>

          {logoutMessage && (
            <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
              {logoutMessage}
            </Alert>
          )}

          {!isResetMode ? (
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label={t('auth.email')}
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                required
                size="small"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: '1px solid',
                      borderColor: 'divider'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
                variant="outlined"
                error={!!error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TablerIcon name="Email" size="sm" />
                    </InputAdornment>
                  )
                }}
                autoComplete="email"
                autoFocus
                helperText={
                  loading
                    ? t('auth.loggingIn')
                    : error
                    ? error
                    : ''
                }
              />

              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                required
                size="small"
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: '1px solid',
                      borderColor: 'divider'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
                variant="outlined"
                error={!!error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TablerIcon name="Lock" size="sm" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end" disabled={loading}>
                        {showPassword ? <TablerIcon name="VisibilityOff" size="sm" /> : <TablerIcon name="Visibility" size="sm" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                autoComplete="current-password"
                helperText={error ? error : ''}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                <Link
                  href="#"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                  onClick={e => {
                    e.preventDefault();
                    setIsResetMode(true);
                  }}
                >
                  Parolayı sıfırla
                </Link>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 3 }}>
                <IconButton
                  onClick={toggleDarkMode}
                  sx={{
                    color: 'text.secondary',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 1.5,
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      transform: 'rotate(15deg)'
                    }
                  }}
                >
                  <TablerIcon name={isDarkMode ? 'Moon' : 'Sun'} size="lg" />
                </IconButton>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 999,
                    flex: 1
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.signIn')}
                </Button>
              </Box>

              <Typography variant="body2" sx={{ textAlign: 'left', color: 'text.secondary', mb: 2 }}>
                Oturum açarak indiriim.com bildirim yönetim sistemi şart ve koşullarını kabul etmiş olursunuz.
              </Typography>
            </Box>
          ) : (
            <Box component="form" noValidate onSubmit={handleResetSubmit} sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'left', fontWeight: 600 }}>
                Parola Sıfırlama
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', textAlign: 'left' }}>
                Parola sıfırlama bağlantısı için e-posta adresinizi girin.
              </Typography>

              <TextField
                fullWidth
                name="resetEmail"
                type="email"
                label={t('auth.email')}
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                size="small"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: '1px solid',
                      borderColor: 'divider'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
                variant="outlined"
                error={!!error}
                helperText={error ? error : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TablerIcon name="Email" size="sm" />
                    </InputAdornment>
                  )
                }}
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mt: 1,
                  mb: 2,
                  borderRadius: 999
                }}
              >
                Gönder
              </Button>

              <Box sx={{ textAlign: 'left' }}>
                <Link
                  href="#"
                  underline="hover"
                  onClick={e => {
                    e.preventDefault();
                    setIsResetMode(false);
                    setResetSuccess(false);
                  }}
                >
                  Geri dön
                </Link>
              </Box>

              {resetSuccess && (
                <Typography variant="body2" sx={{ mt: 1, color: 'success.main', textAlign: 'left' }}>
                  Parola sıfırlama bağlantısı e-posta adresinize gönderildi.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
          backgroundImage: 'url(/Indiriim-ntf-bg.webp)',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          width: { xs: '100%', md: '50%' },
          px: { xs: 3, sm: 6, md: 10 },
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          © 2026 indiriim.com Notification Admin v.0126 - Tüm hakları saklıdır
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
