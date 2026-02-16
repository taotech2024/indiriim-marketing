import React from 'react';
import { Box, CssBaseline, ThemeProvider as MuiThemeProvider, Typography, createTheme, Drawer } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme as useAppTheme } from './contexts/ThemeContext';
import LoginPage from './components/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import TemplatesPage from './pages/TemplatesPage';
import AudiencesPage from './pages/AudiencesPage';
import SettingsPage from './pages/SettingsPage';
import NotificationCreatePage from './pages/NotificationCreatePage';
import AIAssistantPage from './pages/AIAssistantPage';
import AutomationsPage from './pages/AutomationsPage';
import TablerIcon from './components/Common/TablerIcon';
import ApiErrorSnackbar from './components/ApiErrorSnackbar';

const ReportsPage: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
      Raporlar
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      Kanal bazlı gönderim, açılma, tıklama ve conversion metriklerini burada takip edeceksin.
    </Typography>
  </Box>
);





const ComplaintsPage: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
      Şikayetler
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      CRM’den gelen şikayet kayıtları, LLM destekli yanıt önerileri ve durum takibi için kullanılacak
      ekran.
    </Typography>
  </Box>
);

const NavContent: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <nav className="flex flex-col">
    <NavLink
      onClick={onClick}
      to="/dashboard"
      className={({ isActive }) =>
        [
          'px-6 py-4 transition-colors flex items-center gap-3 border-b border-slate-200 dark:border-slate-800',
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        ].join(' ')
      }
    >
      <TablerIcon name="Dashboard" size="sm" />
      <span>Dashboard</span>
    </NavLink>
    <NavLink
      onClick={onClick}
      to="/notifications"
      className={({ isActive }) =>
        [
          'px-6 py-4 transition-colors flex items-center gap-3 border-b border-slate-200 dark:border-slate-800',
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        ].join(' ')
      }
    >
      <TablerIcon name="Bell" size="sm" />
      <span>Kampanyalar</span>
    </NavLink>
    <NavLink
      onClick={onClick}
      to="/automations"
      className={({ isActive }) =>
        [
          'px-6 py-4 transition-colors flex items-center gap-3 border-b border-slate-200 dark:border-slate-800',
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        ].join(' ')
      }
    >
      <TablerIcon name="Dashboard" size="sm" />
      <span>Otomasyonlar</span>
    </NavLink>
    <NavLink
      onClick={onClick}
      to="/segments"
      className={({ isActive }) =>
        [
          'px-6 py-4 transition-colors flex items-center gap-3 border-b border-slate-200 dark:border-slate-800',
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        ].join(' ')
      }
    >
      <TablerIcon name="Users" size="sm" />
      <span>Segment Yönetimi</span>
    </NavLink>
    <NavLink
      onClick={onClick}
      to="/templates"
      className={({ isActive }) =>
        [
          'px-6 py-4 transition-colors flex items-center gap-3 border-b border-slate-200 dark:border-slate-800',
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        ].join(' ')
      }
    >
      <TablerIcon name="Templates" size="sm" />
      <span>Şablonlar</span>
    </NavLink>
    <NavLink
      onClick={onClick}
      to="/complaints"
      className={({ isActive }) =>
        [
          'px-6 py-4 transition-colors flex items-center gap-3 border-b border-slate-200 dark:border-slate-800',
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        ].join(' ')
      }
    >
      <TablerIcon name="message-circle" size="sm" />
      <span>Şikayetler</span>
    </NavLink>
    <NavLink
      onClick={onClick}
      to="/reports"
      className={({ isActive }) =>
        [
          'px-6 py-4 transition-colors flex items-center gap-3 border-b border-slate-200 dark:border-slate-800',
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        ].join(' ')
      }
    >
      <TablerIcon name="Dashboard" size="sm" />
      <span>Raporlar</span>
    </NavLink>
    <NavLink
      onClick={onClick}
      to="/settings"
      className={({ isActive }) =>
        [
          'px-6 py-4 transition-colors flex items-center gap-3 border-b border-slate-200 dark:border-slate-800',
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        ].join(' ')
      }
    >
      <TablerIcon name="Settings" size="sm" />
      <span>Ayarlar</span>
    </NavLink>
  </nav>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const muiTheme = useMuiTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary,
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            backgroundColor: muiTheme.palette.background.default,
            color: muiTheme.palette.text.primary
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <div className="flex items-center gap-3 mb-6 px-2">
            <img
              src="/Indiriim-Logo-wBG.png"
              alt="indiriim.com"
              className="h-8"
              style={{ borderRadius: 24 }}
            />
            <div className="flex flex-col">
              <span
                className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                style={{ fontFamily: 'DINRoundPro-Bold, sans-serif' }}
              >
                indiriim.com
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Marketing App
              </span>
            </div>
          </div>
          <NavContent onClick={handleDrawerToggle} />
        </Box>
      </Drawer>
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: muiTheme.palette.divider }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleDrawerToggle}
            className="sm:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <TablerIcon name="Menu2" size="md" />
          </button>
          <img
            src="/Indiriim-Logo-wBG.png"
            alt="indiriim.com"
            className="h-8"
            style={{ borderRadius: 24 }}
          />
          <div className="flex flex-col">
            <span
              className="text-sm font-semibold text-slate-800 dark:text-slate-100"
              style={{ fontFamily: 'DINRoundPro-Bold, sans-serif' }}
            >
              indiriim.com
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Marketing App
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">{user?.name}</span>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-transform transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
          >
            <TablerIcon name={isDarkMode ? 'Moon' : 'Sun'} size="md" />
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            title="Çıkış Yap"
          >
            <TablerIcon name="Logout" size="sm" />
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside
          className="hidden sm:flex flex-col w-64 border-r text-sm sticky top-0 h-screen"
          style={{
            borderColor: muiTheme.palette.divider,
            backgroundColor: muiTheme.palette.background.default
          }}
        >
          <div className="flex-1 overflow-y-auto pt-4">
            <NavContent />
          </div>


        </aside>
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/notifications/new" element={<NotificationCreatePage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/segments" element={<AudiencesPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { isDarkMode } = useAppTheme();

  const theme = React.useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily:
            "'Satoshi-Variable', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        },
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#8a81f8' : '#5246e5',
            light: isDarkMode ? '#cbc7fe' : '#8a81f8',
            dark: isDarkMode ? '#5246e5' : '#4338ca'
          },
          secondary: {
            main: '#34c759'
          },
          background: {
            default: isDarkMode ? '#17191c' : '#ffffff',
            paper: isDarkMode ? '#17191c' : '#ffffff'
          },
          text: {
            primary: isDarkMode ? '#f4f6f7' : '#17191c',
            secondary: isDarkMode ? '#cbd2d6' : '#383c41'
          }
        },
        shape: {
          borderRadius: 0
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              },
              sizeLarge: {
                height: 56,
                padding: '0 32px',
                fontSize: '1rem'
              },
              sizeMedium: {
                height: 48,
                padding: '0 24px',
                fontSize: '0.9375rem'
              },
              sizeSmall: {
                height: 36,
                padding: '0 16px',
                fontSize: '0.8125rem'
              },
              outlined: {
                borderWidth: '1.5px',
                '&:hover': {
                  borderWidth: '1.5px'
                }
              }
            }
          },
          MuiTextField: {
            defaultProps: {
              InputLabelProps: { shrink: true }
            }
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                position: 'relative',
                transform: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: 8,
                color: isDarkMode ? '#cbd2d6' : '#383c41',
                '&.Mui-focused': {
                  color: isDarkMode ? '#8a81f8' : '#5246e5'
                }
              }
            }
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 0,
                backgroundColor: isDarkMode ? '#17191c' : '#f4f6f7',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#1f2937' : '#e4e7e9'
                },
                '&.Mui-focused': {
                  backgroundColor: isDarkMode ? '#17191c' : '#ffffff',
                  boxShadow: isDarkMode ? '0 0 0 1px #8a81f8' : '0 0 0 1px #5246e5',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 0
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 0
                },
                '&.Mui-error': {
                  backgroundColor: isDarkMode ? '#3f1a1a' : '#fef2f2',
                  boxShadow: '0 0 0 1px #ef4444'
                }
              },
              input: {
                padding: '12px 16px',
                height: '24px',
                '&::placeholder': {
                  color: isDarkMode ? '#6b7280' : '#9ca3af',
                  opacity: 1
                }
              }
            }
          }
        }
      }),
    [isDarkMode]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <ApiErrorSnackbar />
      <div className={isDarkMode ? 'dark' : ''}>
        <BrowserRouter basename={process.env.PUBLIC_PATH || '/'}>
          <AppContent />
        </BrowserRouter>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
