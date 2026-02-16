import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TablerIcon from '../components/Common/TablerIcon';
import { fetchTemplates, type TemplateItem } from '../api/templates';
import { fetchSegments, type SegmentItem } from '../api/segments';
import { createNotification, type NotificationChannel } from '../api/notifications';

type AudienceType = 'B2B' | 'B2C';

type PlanStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'READY_TO_SEND';

const NotificationCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [channels, setChannels] = useState<NotificationChannel[]>(['EMAIL']);
  const [audienceType, setAudienceType] = useState<AudienceType>('B2C');
  const [segmentId, setSegmentId] = useState<number | ''>('');
  const [templateId, setTemplateId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [status, setStatus] = useState<PlanStatus>('DRAFT');

  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchTemplates(), fetchSegments()])
      .then(([t, s]) => {
        setTemplates(t);
        setSegments(s);
        if (t.length > 0 && !templateId) setTemplateId(t[0].id);
        if (s.length > 0 && !segmentId) setSegmentId(s[0].id);
      })
      .catch(() => setError('Şablon ve segment listesi yüklenemedi.'))
      .finally(() => setLoadingLists(false));
  }, []);

  const channel: NotificationChannel = channels[0] ?? 'EMAIL';

  const isAdminOrOwner =
    user?.role === 'ADMIN' ||
    user?.role === 'PROJECT_OWNER' ||
    user?.role === 'MARKETING_MANAGER' ||
    user?.role === 'MARKETING';

  const toggleChannel = (ch: NotificationChannel) => {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleSubmit = async (newStatus: PlanStatus) => {
    if (!name.trim() || segmentId === '' || templateId === '') {
      setError('Lütfen kampanya adı, segment ve şablon seçin.');
      return;
    }
    setError(null);
    setSubmitLoading(true);
    try {
      await createNotification({
        name: name.trim(),
        templateId: templateId as number,
        segmentId: segmentId as number,
        channel,
        scheduledAt: scheduleAt.trim() || undefined
      });
      navigate('/notifications');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Kampanya oluşturulamadı.');
      setError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto', py: 4 }}>
      <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
        Yeni Kampanya Oluştur
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Kampanya veya transactional bildirim için kanal, hedef kitle ve zamanlama adımlarını tamamlayın.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 6 }}>
        <Step>
          <StepLabel>Kanal Seçimi</StepLabel>
        </Step>
        <Step>
          <StepLabel>Hedef Kitle</StepLabel>
        </Step>
        <Step>
          <StepLabel>İsim ve İçerik</StepLabel>
        </Step>
        <Step>
          <StepLabel>Zamanlama ve Onay</StepLabel>
        </Step>
      </Stepper>

      <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        {step === 0 && (
          <Stack spacing={4}>
            <TextField
              label="Kampanya Adı"
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Örnek: Hafta sonu kampanya bildirimi"
              helperText="Kampanyanız için açıklayıcı bir isim belirleyin."
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TablerIcon name="Broadcast" size="sm" />
                İletişim Kanalları
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<TablerIcon name="Mail" size="sm" />}
                  label="E-Posta"
                  color={channels.includes('EMAIL') ? 'primary' : 'default'}
                  variant={channels.includes('EMAIL') ? 'filled' : 'outlined'}
                  onClick={() => toggleChannel('EMAIL')}
                  sx={{ px: 1 }}
                />
                <Chip
                  icon={<TablerIcon name="Message" size="sm" />}
                  label="SMS"
                  color={channels.includes('SMS') ? 'primary' : 'default'}
                  variant={channels.includes('SMS') ? 'filled' : 'outlined'}
                  onClick={() => toggleChannel('SMS')}
                  sx={{ px: 1 }}
                />
                <Chip
                  icon={<TablerIcon name="DeviceMobile" size="sm" />}
                  label="Mobil Bildirim (Push)"
                  color={channels.includes('PUSH') ? 'primary' : 'default'}
                  variant={channels.includes('PUSH') ? 'filled' : 'outlined'}
                  onClick={() => toggleChannel('PUSH')}
                  sx={{ px: 1 }}
                />
              </Stack>
            </Box>
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TablerIcon name="Users" size="sm" />
                Hedef Kitle Türü
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<TablerIcon name="BuildingStore" size="sm" />}
                  label="B2B (İş Ortakları)"
                  color={audienceType === 'B2B' ? 'primary' : 'default'}
                  variant={audienceType === 'B2B' ? 'filled' : 'outlined'}
                  onClick={() => setAudienceType('B2B')}
                  sx={{ px: 1 }}
                />
                <Chip
                  icon={<TablerIcon name="User" size="sm" />}
                  label="B2C (Son Kullanıcılar)"
                  color={audienceType === 'B2C' ? 'primary' : 'default'}
                  variant={audienceType === 'B2C' ? 'filled' : 'outlined'}
                  onClick={() => setAudienceType('B2C')}
                  sx={{ px: 1 }}
                />
              </Stack>
            </Box>
            <FormControl fullWidth size="small" disabled={loadingLists}>
              <InputLabel id="segment-label">Segment</InputLabel>
              <Select
                labelId="segment-label"
                label="Segment"
                value={segmentId}
                onChange={e => setSegmentId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                {segments.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={3}>
            <FormControl fullWidth size="small" disabled={loadingLists}>
              <InputLabel id="template-label">Şablon</InputLabel>
              <Select
                labelId="template-label"
                label="Şablon"
                value={templateId}
                onChange={e => setTemplateId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                İçerik detayları seçilen şablondan kullanılır.
              </Typography>
            </Box>
          </Stack>
        )}

        {step === 3 && (
          <Stack spacing={4}>
            <TextField
              label="Planlanan Gönderim Zamanı"
              type="datetime-local"
              fullWidth
              value={scheduleAt}
              onChange={e => setScheduleAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Tarih seçilmezse kampanya manuel olarak tetiklenecektir."
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Kampanya Durumu
              </Typography>
              <Chip 
                label={
                  status === 'DRAFT' ? 'Taslak' :
                  status === 'PENDING_APPROVAL' ? 'Onay Bekliyor' : 'Gönderime Hazır'
                }
                color={
                  status === 'DRAFT' ? 'default' :
                  status === 'PENDING_APPROVAL' ? 'warning' : 'success'
                }
                variant="outlined"
              />
            </Box>
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 6, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            disabled={step === 0} 
            onClick={handleBack}
            startIcon={<TablerIcon name="ChevronLeft" size="sm" />}
          >
            Geri
          </Button>
          <Stack direction="row" spacing={2}>
            {step < 3 ? (
              <Button 
                variant="contained" 
                onClick={handleNext}
                endIcon={<TablerIcon name="ChevronRight" size="sm" />}
              >
                İleri
              </Button>
            ) : (
              <>
                {!isAdminOrOwner ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={submitLoading}
                      onClick={() => handleSubmit('PENDING_APPROVAL')}
                      startIcon={submitLoading ? <CircularProgress size={16} /> : <TablerIcon name="Send" size="sm" />}
                    >
                      Onaya Gönder
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/notifications')} disabled={submitLoading}>
                      Kapat
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      disabled={submitLoading}
                      onClick={() => handleSubmit('PENDING_APPROVAL')}
                    >
                      Onaya Gönder
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={submitLoading}
                      onClick={() => handleSubmit('READY_TO_SEND')}
                      startIcon={submitLoading ? <CircularProgress size={16} /> : <TablerIcon name="Check" size="sm" />}
                    >
                      Gönderime Hazır
                    </Button>
                    <Button onClick={() => navigate('/notifications')} disabled={submitLoading}>
                      Kapat
                    </Button>
                  </>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default NotificationCreatePage;
