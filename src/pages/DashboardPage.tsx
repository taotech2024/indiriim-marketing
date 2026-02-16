import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, LinearProgress, Button, Skeleton, Grid } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import TablerIcon from '../components/Common/TablerIcon';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../utils/sessionManager';
import { canManage } from '../utils/roleUtils';
import { fetchDashboardSummary, type DashboardSummary } from '../api/dashboard';

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  aiBadge?: boolean;
}

const getQuickActionsForRole = (role?: UserRole | null): QuickAction[] => {
  const adminAndManager: QuickAction[] = [
    {
      id: 'admin-ai-assistant',
      icon: 'Robot',
      title: 'AI Asistan',
      description: 'Son kampanya analizi: %15 artış tespit edildi.',
      aiBadge: true
    },
    {
      id: 'admin-new-notification',
      icon: 'Send',
      title: 'Yeni bildirim oluştur',
      description: 'Çok kanallı yeni bir bildirim planı hazırlayın.',
      aiBadge: true
    },
    {
      id: 'admin-test-email',
      icon: 'Email',
      title: 'Test maili gönder',
      description: 'İçerikleri canlıya almadan önce test alıcılarına gönderin.'
    },
    {
      id: 'admin-change-sms-provider',
      icon: 'Settings',
      title: 'SMS sağlayıcı değiştir',
      description: 'SMS servis sağlayıcı ayarlarını güncelleyin.'
    },
    {
      id: 'admin-prepare-template',
      icon: 'Templates',
      title: 'Template hazırla',
      description: 'Sık kullanılan kampanyalar için yeni şablonlar oluşturun.'
    },
    {
      id: 'admin-social-post',
      icon: 'message-circle',
      title: 'Sosyal ağ gönderisi tasarla',
      description: 'Sosyal medya için eş zamanlı paylaşım metinleri hazırlayın.'
    }
  ];

  const marketingStaff: QuickAction[] = [
    {
      id: 'staff-new-notification',
      icon: 'Send',
      title: 'Yeni bildirim oluştur',
      description: 'Planlanan kampanyalar için yeni bildirimler tasarlayın.',
      aiBadge: true
    },
    {
      id: 'staff-prepare-template',
      icon: 'Templates',
      title: 'Template hazırla',
      description: 'Takımın kullanacağı mail, SMS ve push şablonlarını düzenleyin.'
    },
    {
      id: 'staff-social-post',
      icon: 'message-circle',
      title: 'Sosyal ağ gönderisi tasarla',
      description: 'Kampanyaya uygun sosyal ağ gönderileri oluşturun.',
      aiBadge: true
    },
    {
      id: 'staff-onboarding-pending',
      icon: 'Users',
      title: 'Onboarding bekleyenleri öğren',
      description: 'İlk mesajlarını almamış yeni kullanıcıları listeleyin.',
      aiBadge: true
    },
    {
      id: 'staff-handle-complaints',
      icon: 'Email',
      title: 'Şikayetleri yanıtla',
      description: 'Alınan şikayetlere yönelik geri dönüş içerikleri hazırlayın.',
      aiBadge: true
    }
  ];

  if (!role) return adminAndManager;
  if (role === 'ADMIN' || role === 'PROJECT_OWNER' || role === 'MARKETING_MANAGER' || role === 'MARKETING') {
    return adminAndManager;
  }
  if (role === 'MARKETING_STAFF' || role === 'READ_ONLY' || role === 'USER') {
    return marketingStaff;
  }
  return adminAndManager;
};

// Mock data for chart with dynamic dates (last 7 days)
const chartData = (() => {
  const data = [];
  const today = new Date();
  const mockValues = [
    { email: 4000, sms: 2400, push: 3200 },
    { email: 3000, sms: 1398, push: 2800 },
    { email: 2000, sms: 9800, push: 2100 },
    { email: 2780, sms: 3908, push: 4500 },
    { email: 1890, sms: 4800, push: 3900 },
    { email: 2390, sms: 3800, push: 4100 },
    { email: 3490, sms: 4300, push: 5600 },
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    
    data.push({
      name: `${dayName} ${dateStr}`,
      ...mockValues[6 - i]
    });
  }
  return data;
})();

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch(() => setSummary({
        draftCount: 0,
        scheduledCount: 0,
        sentCount: 0,
        lastNotifications: []
      }))
      .finally(() => setLoading(false));
  }, []);

  const quickActions = React.useMemo(
    () => getQuickActionsForRole(user?.role),
    [user?.role]
  );

  return (
    <Box sx={{ width: 'auto', mx: { xs: -3, sm: -3 }, mt: -3 }}>
      {/* Header Area */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4, 
        px: 3, 
        pt: 3 
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {loading ? <Skeleton width={250} /> : 'Bugün ne üzerinde çalışmak istersiniz?'}
        </Typography>
      </Box>

      <Box
        sx={{
            display: {
              xs: 'flex',
              sm: 'grid'
            },
            flexWrap: {
              xs: 'nowrap',
              sm: 'wrap'
            },
            overflowX: {
              xs: 'auto',
              sm: 'visible'
            },
            scrollSnapType: {
              xs: 'x mandatory',
              sm: 'none'
            },
            pb: {
              xs: 2,
              sm: 0
            },
            mx: {
              xs: -2,
              sm: 0
            },
            px: {
              xs: 2,
              sm: 0
            },
            gap: '1px',
            bgcolor: 'divider',
            border: '1px solid',
            borderColor: 'divider',
            gridTemplateColumns: {
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(6, minmax(0, 1fr))'
            },
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            scrollbarWidth: 'none'
          }}
      >
        {loading
          ? Array.from(new Array(6)).map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: 280, sm: 'auto' },
                  minWidth: { xs: 280, sm: 'auto' },
                  scrollSnapAlign: 'start',
                  height: 140,
                  borderRadius: 0,
                  bgcolor: 'background.paper',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5
                }}
              >
                <Skeleton variant="rounded" width={44} height={44} />
                <Skeleton width="60%" height={24} />
                <Skeleton width="90%" />
              </Box>
            ))
          : quickActions.map(action => (
              action.id === 'admin-ai-assistant' ? (
            <Box
              key={action.id}
              onClick={() => navigate('/ai-assistant')}
              sx={{
                width: { xs: 280, sm: 'auto' },
                minWidth: { xs: 280, sm: 'auto' },
                flex: { xs: '0 0 auto', sm: 'initial' },
                scrollSnapAlign: 'start',
                textAlign: 'left',
                borderRadius: 0,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                px: 2,
                py: 2.25,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                height: '100%',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.1s ease',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <TablerIcon name="Robot" size="md" color="white" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {action.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.4, mb: 2 }}>
                  {action.description}
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    py: 0.75,
                    px: 1.5,
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Asistanı Başlat
                  <TablerIcon name="ArrowRight" size="sm" color="currentColor" />
                </Box>
              </Box>
              <TablerIcon 
                name="Robot" 
                size="xl" 
                color="white" 
                style={{ 
                  position: 'absolute', 
                  bottom: -10,
                  right: -10,
                  opacity: 0.2,
                  width: 80,
                  height: 80
                }} 
              />
            </Box>
          ) : (
            <Box
              key={action.id}
              component="button"
              type="button"
              sx={{
                width: {
                  xs: 280,
                  sm: 'auto'
                },
                minWidth: {
                  xs: 280,
                  sm: 'auto'
                },
                flex: {
                  xs: '0 0 auto',
                  sm: 'initial'
                },
                scrollSnapAlign: 'start',
                textAlign: 'left',
                borderRadius: 0,
                backgroundColor: 'background.paper',
                border: 'none',
                px: 2,
                py: 2.25,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                height: '100%',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(138, 129, 248, 0.06)'
                      : 'rgba(82, 70, 229, 0.04)'
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: theme.palette.primary.main,
                  outlineOffset: 2
                }
              }}
            >
              {action.aiBadge && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    borderRadius: 0,
                    px: 1.25,
                    py: 0.25,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText
                  }}
                >
                  AI
                </Box>
              )}
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(138, 129, 248, 0.18)'
                      : 'rgba(82, 70, 229, 0.08)'
                }}
              >
                <TablerIcon name={action.icon} size="md" />
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {action.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {action.description}
              </Typography>
            </Box>
          )
        ))}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, px: 3 }}>
          {loading ? <Skeleton width={200} height={40} /> : 'Genel Durum'}
        </Typography>
        
        {/* KPI Cards */}
        <Box 
          sx={{ 
            display: { xs: 'flex', sm: 'grid' },
            flexWrap: { xs: 'nowrap', sm: 'wrap' },
            overflowX: { xs: 'auto', sm: 'visible' },
            scrollSnapType: { xs: 'x mandatory', sm: 'none' },
            gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
            gap: '1px',
            bgcolor: 'divider',
            border: '1px solid',
            borderColor: 'divider',
            borderBottom: 0,
            mb: 0,
            pb: 0,
            mx: { xs: -2, sm: 0 },
            px: { xs: 2, sm: 0 },
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none'
          }}
        >
          {loading
            ? Array.from(new Array(4)).map((_, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    minWidth: { xs: 280, sm: 'auto' },
                    scrollSnapAlign: 'start',
                    p: 2.5, 
                    borderRadius: 0, 
                    bgcolor: 'background.paper', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    height: 170
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton variant="rounded" width={40} height={40} />
                    <Skeleton width={60} height={24} />
                  </Box>
                  <Box sx={{ mt: 'auto' }}>
                    <Skeleton width="40%" height={40} sx={{ mb: 0.5 }} />
                    <Skeleton width="60%" sx={{ mb: 2 }} />
                    <Skeleton width={80} height={24} />
                  </Box>
                </Box>
              ))
            : [
            { 
              label: 'Taslak Kampanyalar', 
              value: String(summary?.draftCount ?? 0), 
              icon: 'Templates' as const, 
              change: '', 
              color: 'text.secondary',
              badgeColor: 'text.secondary',
              badgeBg: 'rgba(0,0,0,0.04)',
              link: '/notifications',
              buttonText: 'Görüntüle'
            },
            { 
              label: 'Planlanan Kampanyalar', 
              value: String(summary?.scheduledCount ?? 0), 
              icon: 'Speakerphone' as const, 
              change: '', 
              color: 'info.main',
              badgeColor: 'info.main',
              badgeBg: 'rgba(25, 118, 210, 0.1)',
              link: '/notifications',
              buttonText: 'Görüntüle'
            },
            { 
              label: 'Gönderilen', 
              value: String(summary?.sentCount ?? 0), 
              icon: 'Send' as const, 
              change: '', 
              color: 'success.main',
              badgeColor: 'success.main',
              badgeBg: 'rgba(52, 199, 89, 0.1)',
              link: '/notifications',
              buttonText: 'Görüntüle'
            },
            { 
              label: 'Son Kampanyalar', 
              value: String(summary?.lastNotifications?.length ?? 0), 
              icon: 'ChartBar' as const, 
              change: '', 
              color: 'primary.main',
              badgeColor: 'primary.main',
              badgeBg: 'rgba(82, 70, 229, 0.1)',
              link: '/notifications',
              buttonText: 'Liste'
            }
          ].map((stat, index) => (
            <Box 
              key={index} 
              sx={{ 
                minWidth: { xs: 280, sm: 'auto' },
                scrollSnapAlign: 'start',
                p: 2.5, 
                borderRadius: 0, 
                bgcolor: 'background.paper', 
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: 0, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    color: stat.color 
                  }}
                >
                  <TablerIcon name={stat.icon} size="md" />
                </Box>
                {stat.change ? (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: stat.badgeColor, 
                      fontWeight: 600, 
                      bgcolor: stat.badgeBg, 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 0 
                    }}
                  >
                    {stat.change}
                  </Typography>
                ) : null}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {stat.label}
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => navigate(stat.link)}
                  endIcon={<TablerIcon name="ArrowRight" size="xs" />}
                  sx={{ 
                    mt: 2, 
                    justifyContent: 'flex-start', 
                    px: 0, 
                    color: 'primary.main',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } 
                  }}
                >
                  {stat.buttonText}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>


        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(4, 1fr)' }, 
          gap: '1px',
          bgcolor: 'divider',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ gridColumn: { lg: 'span 3' }, display: { xs: 'contents', lg: 'flex' }, flexDirection: 'column', gap: '1px', bgcolor: 'divider' }}>
            {/* Cost & Quota and Channel Health */}
            <Box 
              sx={{ 
                order: { xs: 1, lg: 'unset' },
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  md: canManage(user?.role) ? '1fr 1fr' : '1fr' 
                }, 
                gap: '1px',
                bgcolor: 'divider',
                mb: 0 
              }}
            >
              {/* Quota Status - Admin & Marketing Manager */}
              {canManage(user?.role) && (
                <Box sx={{ bgcolor: 'background.paper', borderRadius: 0, p: 2.5, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {loading ? <Skeleton width={180} /> : 'Maliyet ve Kota'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {loading
                      ? Array.from(new Array(2)).map((_, index) => (
                          <Box key={index}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Skeleton width={120} height={20} />
                              <Skeleton width={40} height={20} />
                            </Box>
                            <Skeleton variant="rectangular" width="100%" height={6} sx={{ borderRadius: 0 }} />
                            <Skeleton width={180} height={16} sx={{ mt: 0.5 }} />
                          </Box>
                        ))
                      : [
                      { name: 'AWS SES (Email)', percent: 85, value: 85, detail: 'Günlük 42.500 / 50.000 gönderim', color: 'warning' },
                      { name: 'İletiMerkezi (SMS)', percent: 42, value: 42, detail: 'Bakiye: ₺12.450 / ₺30.000', color: 'success' }
                    ].map((quota, i) => (
                      <Box key={i}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{quota.name}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>%{quota.percent}</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={quota.value} 
                          color={quota.color as 'warning' | 'success'} 
                          sx={{ height: 6, borderRadius: 0 }} 
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>{quota.detail}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ bgcolor: 'background.paper', borderRadius: 0, p: 2.5, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {loading ? <Skeleton width={140} /> : 'Kanal Sağlığı'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {loading
                    ? Array.from(new Array(3)).map((_, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Skeleton variant="circular" width={10} height={10} />
                            <Skeleton width={120} height={20} />
                          </Box>
                          <Skeleton width={20} height={20} />
                        </Box>
                      ))
                    : [
                    { name: 'Email (AWS SES)', status: 'Operational', color: 'success' },
                    { name: 'SMS (İletiMerkezi)', status: 'Operational', color: 'success' },
                    { name: 'Push (Firebase)', status: 'Degraded', color: 'warning' }
                  ].map((channel, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box 
                          sx={{ 
                            width: 10, 
                            height: 10, 
                            borderRadius: 0, 
                            bgcolor: `${channel.color}.main`,
                            boxShadow: `0 0 0 4px ${channel.color === 'success' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 179, 0, 0.2)'}`
                          }} 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{channel.name}</Typography>
                      </Box>
                      <TablerIcon name={channel.status === 'Operational' ? 'Check' : 'AlertTriangle'} size="sm" color={channel.color === 'success' ? '#34c759' : '#ffb300'} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Channel Performance Chart - Admin & Marketing Manager Only */}
            {canManage(user?.role) && (
              <Box sx={{ order: { xs: 2, lg: 'unset' }, mb: 0, bgcolor: 'background.paper', borderRadius: 0, p: 3, display: { xs: 'none', sm: 'block' } }}>
                {loading ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Box>
                        <Skeleton width={200} height={32} />
                        <Skeleton width={150} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Skeleton width={60} />
                        <Skeleton width={60} />
                        <Skeleton width={60} />
                      </Box>
                    </Box>
                    <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Kanal Performansı</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Son 7 günlük gönderim hacmi</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Email</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>SMS</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Push</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPush" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme.palette.background.paper, 
                              borderRadius: 0, 
                              border: `1px solid ${theme.palette.divider}`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                            }}
                            itemStyle={{ fontSize: 12, fontWeight: 600 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="email" 
                            stroke={theme.palette.primary.main} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorEmail)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="sms" 
                            stroke={theme.palette.success.main} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorSms)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="push" 
                            stroke={theme.palette.warning.main} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPush)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* Recent Activity */}
            <Box sx={{ order: { xs: 4, lg: 'unset' }, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Upcoming Campaigns moved to right column */}

                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  borderRadius: 0, 
                  overflow: 'hidden',
                  display: (user?.role === 'MARKETING_STAFF' || user?.role === 'READ_ONLY' || user?.role === 'USER') ? { xs: 'none', sm: 'block' } : 'block'
                }}>
                  <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {loading ? <Skeleton width={150} /> : 'Son Aktiviteler'}
                    </Typography>
                    {loading ? <Skeleton width={80} /> : <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}>Tümünü Gör</Typography>}
                  </Box>
                  <Box>
                    {loading
                      ? Array.from(new Array(5)).map((_, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              p: 2, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              borderBottom: index < 4 ? '1px solid' : 'none',
                              borderColor: 'divider'
                            }}
                          >
                            <Skeleton variant="circular" width={8} height={8} />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton width="40%" height={24} />
                              <Skeleton width="80%" height={20} />
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Skeleton width={60} height={20} />
                              <Skeleton width={40} height={16} />
                            </Box>
                          </Box>
                        ))
                      : [
                      { action: 'Kampanya Başlatıldı', desc: 'Büyük Yaz İndirimi kampanyası yayına alındı.', time: '2 saat önce', user: 'Ahmet Y.', type: 'success' },
                      { action: 'Şablon Güncellendi', desc: 'Hoşgeldin emaili şablonunda revize yapıldı.', time: '5 saat önce', user: 'Selin K.', type: 'info' },
                      { action: 'Segment Oluşturuldu', desc: 'VIP Müşteriler segmenti güncellendi.', time: 'Dün', user: 'Mehmet T.', type: 'warning' },
                      { action: 'Sistem Uyarısı', desc: 'SMS sağlayıcı bakiyesi %10 altına düştü.', time: 'Dün', user: 'Sistem', type: 'error' },
                      { action: 'Rapor Hazırlandı', desc: 'Haftalık etkileşim raporu oluşturuldu.', time: '2 gün önce', user: 'AI Bot', type: 'primary' },
                      { action: 'Yeni Üyelik', desc: 'Son 1 saatte 50 yeni üye kaydoldu.', time: '3 gün önce', user: 'Sistem', type: 'success' },
                      { action: 'Stok Uyarısı', desc: 'Popüler ürünlerde stok kritik seviyede.', time: '3 gün önce', user: 'Depo', type: 'warning' },
                      { action: 'E-posta Gönderimi', desc: 'Haftalık bülten başarıyla gönderildi.', time: '4 gün önce', user: 'Selin K.', type: 'info' },
                      { action: 'Sunucu Bakımı', desc: 'Planlı bakım çalışması tamamlandı.', time: '5 gün önce', user: 'DevOps', type: 'secondary' },
                      { action: 'Kullanıcı Geri Bildirimi', desc: 'Mobil uygulama için yeni yorumlar var.', time: '1 hafta önce', user: 'Support', type: 'primary' }
                    ].map((item, i) => (
                      <Box 
                        key={i} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          borderBottom: i < 9 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: 0, 
                            bgcolor: `${item.type === 'primary' ? 'primary' : item.type}.main` 
                          }} 
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.action}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: 'text.primary' }}>{item.user}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.time}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
          </Box>
          
          <Box sx={{ gridColumn: { lg: 'span 1' }, display: { xs: 'contents', lg: 'block' } }}>
            <Box sx={{ height: '100%', display: { xs: 'contents', lg: 'flex' }, flexDirection: 'column', gap: '1px', bgcolor: 'divider' }}>
              
                {/* Upcoming Campaigns - Marketing & Admin */}
                {(canManage(user?.role) || user?.role === 'MARKETING_STAFF' || user?.role === 'READ_ONLY' || user?.role === 'USER') && (
                  <Box sx={{ order: { xs: 3, lg: 'unset' }, bgcolor: 'background.paper', borderRadius: 0, p: 2.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {loading ? <Skeleton width={200} /> : 'Yaklaşan Kampanyalar'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {loading
                        ? Array.from(new Array(3)).map((_, index) => (
                            <Box key={index} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Skeleton width={60} height={24} />
                                <Skeleton variant="circular" width={16} height={16} />
                              </Box>
                              <Skeleton width="90%" height={24} sx={{ mb: 1 }} />
                              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                                <Skeleton width={16} height={16} />
                                <Skeleton width={80} />
                              </Box>
                              <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 2 }} />
                            </Box>
                          ))
                        : [
                        { name: 'Kış İndirimi Final', time: 'Yarın, 09:00', channel: 'Email + Push', status: 'Planlandı', color: 'info' },
                        { name: 'Sepet Hatırlatma', time: '23 Ocak, 14:00', channel: 'SMS', status: 'Onay Bekliyor', color: 'warning' },
                        { name: 'Yeni Üyelik Serisi', time: '25 Ocak, 10:00', channel: 'Email', status: 'Taslak', color: 'text.secondary' }
                      ].map((camp, i) => (
                        <Box key={i} sx={{ p: 2, borderRadius: 0, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: `${camp.color}.main`, bgcolor: camp.color === 'text.secondary' ? 'rgba(0,0,0,0.05)' : `${camp.color === 'info' ? 'rgba(2, 136, 209, 0.1)' : 'rgba(237, 108, 2, 0.1)'}`, px: 1, py: 0.5, borderRadius: 0 }}>
                              {camp.status}
                            </Typography>
                            <TablerIcon name="AlertTriangle" size="xs" color={theme.palette.text.disabled} style={{ opacity: 0.5 }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {camp.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                            <TablerIcon name="Clock" size="xs" color={theme.palette.text.secondary} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{camp.time}</Typography>
                          </Box>
                          <Button variant="outlined" size="small" fullWidth sx={{ textTransform: 'none', fontSize: 12, py: 0.5 }}>
                            Detaylar
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

              {/* Top Products Card */}
              <Box sx={{ order: { xs: 5, lg: 'unset' }, bgcolor: 'background.paper', borderRadius: 0, p: 2.5, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>En İyi Satan 10 Ürün</Typography>
                  <TablerIcon name="ShoppingBag" size="sm" color={theme.palette.text.secondary} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {loading ? (
                    Array.from(new Array(5)).map((_, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                        <Skeleton variant="rectangular" width={44} height={44} sx={{ borderRadius: 0 }} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width="60%" height={20} sx={{ mb: 0.5 }} />
                          <Skeleton width="30%" height={14} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Skeleton width={50} height={20} sx={{ mb: 0.5 }} />
                          <Skeleton width={20} height={14} />
                        </Box>
                      </Box>
                    ))
                  ) : (
                    [
                    { 
                      name: 'Kablosuz Kulaklık Pro', 
                      sales: 1250, 
                      revenue: '₺2.4M', 
                      trend: 'up',
                      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop&q=80' 
                    },
                    { 
                      name: 'Akıllı Saat Series 5', 
                      sales: 980, 
                      revenue: '₺1.8M', 
                      trend: 'up',
                      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop&q=80'
                    },
                    { 
                      name: 'Laptop Standı Alüminyum', 
                      sales: 850, 
                      revenue: '₺425K', 
                      trend: 'stable',
                      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop&q=80'
                    },
                    { name: 'Type-C Hızlı Şarj Kablosu', sales: 720, revenue: '₺108K', trend: 'down' },
                    { name: 'Bluetooth Hoparlör Mini', sales: 650, revenue: '₺325K', trend: 'up' },
                    { name: 'Tablet Kılıfı Deri', sales: 580, revenue: '₺145K', trend: 'stable' },
                    { name: 'Akıllı Ev Kamerası 360', sales: 520, revenue: '₺780K', trend: 'up' },
                    { name: 'Gaming Mouse RGB', sales: 490, revenue: '₺245K', trend: 'down' },
                    { name: 'Mekanik Klavye Red Switch', sales: 450, revenue: '₺675K', trend: 'stable' },
                    { name: '4K Webcam Pro', sales: 410, revenue: '₺820K', trend: 'up' }
                  ].map((product, index) => (
                    <Box 
                      key={index} 
                      onClick={() => navigate('/notifications/new', { state: { productName: product.name, step: 'template' } })}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 0,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      {index < 3 ? (
                        <Box sx={{ position: 'relative' }}>
                          <Box 
                            component="img"
                            src={product.image}
                            alt={product.name}
                            sx={{ 
                              width: 44, 
                              height: 44, 
                              borderRadius: 0,
                              objectFit: 'cover',
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          />
                          <Box sx={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 18,
                            height: 18,
                            borderRadius: 0,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            border: `2px solid ${theme.palette.background.paper}`
                          }}>
                            {index + 1}
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 0, 
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          color: 'text.primary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14
                        }}>
                          {index + 1}
                        </Box>
                      )}
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {product.sales} Adet
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                         <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {product.revenue}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, color: product.trend === 'up' ? 'success.main' : (product.trend === 'down' ? 'error.main' : 'text.secondary') }}>
                          <TablerIcon 
                            name={product.trend === 'up' ? 'TrendingUp' : (product.trend === 'down' ? 'TrendingUp' : 'ArrowRight')} 
                            size="xs" 
                            style={{ transform: product.trend === 'down' ? 'rotate(180deg)' : 'none' }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))
                  )}
                </Box>
              </Box>

            </Box>
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default DashboardPage;
