import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import TablerIcon from '../components/Common/TablerIcon';
import { fetchSettings, updateSettings, type FallbackRule } from '../api/settings';

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [emailSettings, setEmailSettings] = useState({
    senderName: 'indiriim.com',
    senderEmail: 'no-reply@indiriim.com',
    serviceProvider: 'AWS SES'
  });

  const [smsSettings, setSmsSettings] = useState({
    provider: 'IletiMerkezi',
    originator: 'INDIRIIM'
  });

  const [pushSettings, setPushSettings] = useState({
    provider: 'Firebase FCM',
    apiKey: '************************'
  });

  const [fallbackRules, setFallbackRules] = useState<FallbackRule[]>([
    { id: 1, trigger: 'Push Başarısız', action: 'SMS Gönder', enabled: true },
    { id: 2, trigger: 'SMS Başarısız', action: 'Email Gönder', enabled: true },
    { id: 3, trigger: 'Email Başarısız', action: 'Raporla', enabled: true }
  ]);

  const [distributionSettings, setDistributionSettings] = useState({
    retryCount: 3,
    retryDelay: 60,
    smartRouting: true
  });

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        if (s.email) {
          setEmailSettings(prev => ({
            senderName: s.email!.senderName ?? prev.senderName,
            senderEmail: s.email!.senderEmail ?? prev.senderEmail,
            serviceProvider: s.email!.serviceProvider ?? prev.serviceProvider
          }));
        }
        if (s.sms) {
          setSmsSettings(prev => ({
            provider: s.sms!.provider ?? prev.provider,
            originator: s.sms!.originator ?? prev.originator
          }));
        }
        if (s.push) {
          setPushSettings(prev => ({
            provider: s.push!.provider ?? prev.provider,
            apiKey: s.push!.apiKey ?? prev.apiKey
          }));
        }
        if (s.fallbackRules?.length) setFallbackRules(s.fallbackRules);
        if (s.distribution) {
          setDistributionSettings(prev => ({
            retryCount: s.distribution!.retryCount ?? prev.retryCount,
            retryDelay: s.distribution!.retryDelay ?? prev.retryDelay,
            smartRouting: s.distribution!.smartRouting ?? prev.smartRouting
          }));
        }
      })
      .catch(() => setError('Ayarlar yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setSaveLoading(true);
    try {
      await updateSettings({
        email: emailSettings,
        sms: smsSettings,
        push: pushSettings,
        fallbackRules,
        distribution: distributionSettings
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Kaydetme başarısız.');
      setError(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Kanal Ayarları
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Kanal dağıtım motoru yapılandırması, sağlayıcı entegrasyonları ve fallback kuralları.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Ayarlar kaydedildi.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Distribution Engine & Fallback Rules - NEW SECTION */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid', borderColor: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.02)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TablerIcon name="GitBranch" size="md" color="#6366f1" />
                <Typography variant="h6" color="primary.main">Dağıtım Motoru ve Fallback Kuralları</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Fallback Zinciri</Typography>
                  <Stack spacing={2}>
                    {fallbackRules.map((rule) => (
                      <Box 
                        key={rule.id} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 2, 
                          bgcolor: 'background.paper', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Chip 
                          label={rule.trigger} 
                          color="error" 
                          variant="outlined" 
                          size="small" 
                          icon={<TablerIcon name="AlertCircle" size="xs" />}
                        />
                        <TablerIcon name="ArrowRight" size="sm" color="text.secondary" />
                        <Chip 
                          label={rule.action} 
                          color="success" 
                          variant="outlined" 
                          size="small" 
                          icon={<TablerIcon name="Send" size="xs" />}
                        />
                        <Box sx={{ flex: 1 }} />
                        <Switch 
                          checked={rule.enabled} 
                          onChange={() => {
                            const newRules = fallbackRules.map(r => 
                              r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                            );
                            setFallbackRules(newRules);
                          }}
                        />
                      </Box>
                    ))}
                    <Button startIcon={<TablerIcon name="Plus" size="sm" />} variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
                      Yeni Kural Ekle
                    </Button>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Motor Yapılandırması</Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Maksimum Yeniden Deneme (Retry)"
                      type="number"
                      size="small"
                      fullWidth
                      value={distributionSettings.retryCount}
                      onChange={(e) => setDistributionSettings({...distributionSettings, retryCount: parseInt(e.target.value)})}
                      helperText="Başarısız gönderimler için tekrar sayısı"
                    />
                    <TextField
                      label="Denemeler Arası Bekleme (Saniye)"
                      type="number"
                      size="small"
                      fullWidth
                      value={distributionSettings.retryDelay}
                      onChange={(e) => setDistributionSettings({...distributionSettings, retryDelay: parseInt(e.target.value)})}
                    />
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={distributionSettings.smartRouting} 
                            onChange={(e) => setDistributionSettings({...distributionSettings, smartRouting: e.target.checked})}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>Akıllı Yönlendirme (Smart Routing)</Typography>
                            <Typography variant="caption" color="text.secondary">
                              En yüksek başarı oranına sahip kanalı otomatik seç
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                    <Alert severity="info" icon={<TablerIcon name="InfoCircle" size="md" />}>
                      Dağıtım motoru, yapılandırılan kurallara göre mesajlarınızı otomatik olarak en uygun kanaldan iletir.
                    </Alert>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Email Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TablerIcon name="mail" size="md" />
                <Typography variant="h6">E-posta Ayarları</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <TextField
                  label="Gönderici Adı (From Name)"
                  fullWidth
                  size="small"
                  value={emailSettings.senderName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                />
                <TextField
                  label="Gönderici Adresi (From Email)"
                  fullWidth
                  size="small"
                  value={emailSettings.senderEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Servis Sağlayıcı</InputLabel>
                  <Select
                    value={emailSettings.serviceProvider}
                    label="Servis Sağlayıcı"
                    onChange={(e) => setEmailSettings({ ...emailSettings, serviceProvider: e.target.value })}
                  >
                    <MenuItem value="AWS SES">AWS SES</MenuItem>
                    <MenuItem value="SendGrid">SendGrid</MenuItem>
                    <MenuItem value="Mailgun">Mailgun</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Global Unsubscribe Linki Ekle"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* SMS Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TablerIcon name="message-circle" size="md" />
                <Typography variant="h6">SMS Ayarları</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>SMS Sağlayıcı</InputLabel>
                  <Select
                    value={smsSettings.provider}
                    label="SMS Sağlayıcı"
                    onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}
                  >
                    <MenuItem value="IletiMerkezi">İletiMerkezi</MenuItem>
                    <MenuItem value="Twilio">Twilio</MenuItem>
                    <MenuItem value="Netgsm">Netgsm</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Gönderici Başlığı (Originator)"
                  fullWidth
                  size="small"
                  value={smsSettings.originator}
                  disabled
                  helperText="Yasal olarak onaylanmış başlık"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Otomatik Türkçe Karakter Düzeltme"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Push Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TablerIcon name="bell" size="md" />
                <Typography variant="h6">Push Bildirim Ayarları</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Servis Sağlayıcı</InputLabel>
                  <Select
                    value={pushSettings.provider}
                    label="Servis Sağlayıcı"
                    onChange={(e) => setPushSettings({ ...pushSettings, provider: e.target.value })}
                  >
                    <MenuItem value="Firebase FCM">Firebase FCM</MenuItem>
                    <MenuItem value="OneSignal">OneSignal</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="API Key"
                  fullWidth
                  size="small"
                  type="password"
                  value={pushSettings.apiKey}
                  disabled
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Sesli Bildirim Varsayılanı"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TablerIcon name="settings" size="md" />
                <Typography variant="h6">Genel Ayarlar</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <TextField
                  label="Maksimum Günlük Gönderim Limiti"
                  fullWidth
                  size="small"
                  defaultValue="100000"
                  type="number"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={saveLoading}
                    onClick={handleSave}
                    startIcon={saveLoading ? <CircularProgress size={20} /> : null}
                  >
                    {saveLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
