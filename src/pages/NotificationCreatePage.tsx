import React, { useState } from 'react';
import { Box, Button, Chip, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TablerIcon from '../components/Common/TablerIcon';

type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

type AudienceType = 'B2B' | 'B2C';

type PlanStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'READY_TO_SEND';

const NotificationCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [channels, setChannels] = useState<NotificationChannel[]>(['EMAIL']);
  const [audienceType, setAudienceType] = useState<AudienceType>('B2C');
  const [segmentName, setSegmentName] = useState('');
  const [name, setName] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [status, setStatus] = useState<PlanStatus>('DRAFT');

  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'PROJECT_OWNER';

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleSendForApproval = () => {
    setStatus('PENDING_APPROVAL');
  };

  const handleReadyToSend = () => {
    setStatus('READY_TO_SEND');
  };

  const handleFinish = () => {
    navigate('/notifications');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto', py: 4 }}>
      <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
        Yeni Kampanya Oluştur
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Kampanya veya transactional bildirim için kanal, hedef kitle ve zamanlama adımlarını tamamlayın.
      </Typography>

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
            <TextField
              label="Segment Seçimi"
              fullWidth
              value={segmentName}
              onChange={e => setSegmentName(e.target.value)}
              placeholder="Örnek: Aktif B2C müşteriler"
              helperText="Backoffice sisteminden gelen segmentler ile eşleştirme yapılır."
            />
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={3}>
            <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TablerIcon name="Template" size="sm" />
                İçerik Yönetimi
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Kanal bazlı içerik ayarları ve şablon seçimi "Şablonlar" ekranından yapılmaktadır.
                Şu an sadece kampanya taslağını oluşturuyorsunuz.
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
                      onClick={handleSendForApproval}
                      startIcon={<TablerIcon name="Send" size="sm" />}
                    >
                      Onaya Gönder
                    </Button>
                    <Button variant="outlined" onClick={handleFinish}>
                      Kapat
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outlined" onClick={handleSendForApproval}>
                      Onaya Gönder
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleReadyToSend}
                      startIcon={<TablerIcon name="Check" size="sm" />}
                    >
                      Gönderime Hazır
                    </Button>
                    <Button onClick={handleFinish}>
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
