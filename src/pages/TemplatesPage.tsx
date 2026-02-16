import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import RichTextEditor from '../components/Common/RichTextEditor';
import TablerIcon from '../components/Common/TablerIcon';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type TemplateItem,
  type TemplateType
} from '../api/templates';

type TemplateChannel = 'EMAIL' | 'SMS' | 'PUSH';

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TemplateItem | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<TemplateChannel>('EMAIL');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [smsContent, setSmsContent] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushDeepLink, setPushDeepLink] = useState('');
  const [pushIcon, setPushIcon] = useState('');
  const [pushImage, setPushImage] = useState('');
  const [pushActions, setPushActions] = useState<{ label: string; actionId: string }[]>([
    { label: 'Onayla', actionId: 'approve' },
    { label: 'İptal', actionId: 'cancel' }
  ]);

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch(() => setError('Şablon listesi yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) {
      setName(selected.name);
      setActiveTab(selected.type as TemplateChannel);
      setSubject(selected.subject ?? '');
      setMailContent(selected.type === 'EMAIL' ? (selected.content ?? '') : '');
      setSmsContent(selected.type === 'SMS' ? (selected.content ?? '') : '');
      setPushBody(selected.type === 'PUSH' ? (selected.content ?? '') : '');
      setPushTitle('');
    } else {
      setName('');
      setSubject('');
      setMailContent('');
      setSmsContent('');
      setPushBody('');
      setPushTitle('');
    }
  }, [selected]);

  const smsLength = smsContent.length;
  const smsParts = useMemo(() => {
    if (smsLength === 0) return 0;
    return Math.ceil(smsLength / 160);
  }, [smsLength]);

  const addPushAction = () => {
    setPushActions(prev => [...prev, { label: `Aksiyon ${prev.length + 1}`, actionId: `action_${prev.length + 1}` }]);
  };

  const getContentForType = (): string => {
    if (activeTab === 'EMAIL') return mailContent;
    if (activeTab === 'SMS') return smsContent;
    return pushTitle ? `${pushTitle}\n${pushBody}` : pushBody;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Template adı gerekli.');
      return;
    }
    setError(null);
    setSaveLoading(true);
    try {
      const body = {
        name: name.trim(),
        type: activeTab as TemplateType,
        subject: activeTab === 'EMAIL' ? subject : undefined,
        content: getContentForType() || undefined,
        isActive: true
      };
      if (selected) {
        const updated = await updateTemplate(selected.id, body);
        setTemplates(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        setSelected(updated);
      } else {
        const created = await createTemplate(body);
        setTemplates(prev => [...prev, created]);
        setSelected(created);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Kaydetme başarısız.');
      setError(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(p => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      setError('Silme başarısız.');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
        Template Yönetimi
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Mail, SMS ve push bildirimleri için tekrar kullanılabilir template&apos;leri yönet.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Şablonlar</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<TablerIcon name="Plus" size="sm" />}
          onClick={() => setSelected(null)}
        >
          Yeni Şablon
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table size="small" sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Ad</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tür</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Konu</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((t) => (
              <TableRow
                key={t.id}
                hover
                selected={selected?.id === t.id}
                onClick={() => setSelected(t)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell>{t.subject ?? '—'}</TableCell>
                <TableCell>
                  <Chip label={t.isActive ? 'Aktif' : 'Pasif'} size="small" color={t.isActive ? 'success' : 'default'} variant="outlined" />
                </TableCell>
                <TableCell align="right" onClick={e => e.stopPropagation()}>
                  <Tooltip title="Sil">
                    <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}>
                      <TablerIcon name="Trash" size="sm" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3 }}
      >
        <Tab label="Mail" value="EMAIL" />
        <Tab label="SMS" value="SMS" />
        <Tab label="Push" value="PUSH" />
      </Tabs>

      {activeTab === 'EMAIL' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Box>
            <Stack spacing={2}>
              <TextField label="Template adı" fullWidth size="small" value={name} onChange={e => setName(e.target.value)} />
              <TextField label="Konu" fullWidth size="small" placeholder="Global ayarlardan gelebilir" value={subject} onChange={e => setSubject(e.target.value)} />
              <RichTextEditor
                value={mailContent}
                onChange={setMailContent}
                placeholder="Mail içeriğini yazın. Örnek: Merhaba {{firstName}}, yeni kampanyamız başladı."
              />
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Değişkenler
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
              <Chip label="{{firstName}}" size="small" />
              <Chip label="{{lastName}}" size="small" />
              <Chip label="{{email}}" size="small" />
              <Chip label="{{unsubscribeLink}}" size="small" />
            </Stack>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Aksiyonlar
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small">Preview</Button>
              <Button variant="contained" size="small">Test Mail Gönder</Button>
              <Button variant="contained" size="small" disabled={saveLoading} onClick={handleSave}>
                {saveLoading ? <CircularProgress size={20} /> : 'Kaydet'}
              </Button>
            </Stack>
          </Box>
        </Box>
      )}

      {activeTab === 'SMS' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Box>
            <Stack spacing={2}>
              <TextField label="Template adı" fullWidth size="small" value={name} onChange={e => setName(e.target.value)} />
              <TextField
                label="SMS içeriği"
                fullWidth
                multiline
                minRows={4}
                size="small"
                value={smsContent}
                onChange={e => setSmsContent(e.target.value)}
                placeholder="Merhaba {{firstName}}, sepetinizde bekleyen ürünler için özel indirim sizi bekliyor."
                helperText={
                  smsParts > 1
                    ? `${smsLength} karakter, yaklaşık ${smsParts} SMS. İçeriği kısaltmayı düşünün.`
                    : smsLength > 0
                    ? `${smsLength} karakter, 1 SMS`
                    : 'Henüz içerik girilmedi.'
                }
              />
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Telefon Önizleme
            </Typography>
            <Box
              sx={{
                width: 260,
                borderRadius: 4,
                border: theme => `1px solid ${theme.palette.divider}`,
                p: 1.5,
                bgcolor: 'background.paper'
              }}
            >
              <Box
                sx={{
                  height: 24,
                  borderRadius: 999,
                  bgcolor: 'grey.900',
                  mb: 1
                }}
              />
              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  p: 1
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                  indiriim.com
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12 }}>
                  {smsContent || 'Örnek SMS içeriği burada görünecek.'}
                </Typography>
              </Box>
            </Box>
            <Button variant="contained" size="small" disabled={saveLoading} onClick={handleSave} sx={{ mt: 2 }}>
              {saveLoading ? <CircularProgress size={20} /> : 'Kaydet'}
            </Button>
          </Box>
        </Box>
      )}

      {activeTab === 'PUSH' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Box>
            <Stack spacing={2}>
              <TextField
                label="Başlık"
                fullWidth
                size="small"
                value={pushTitle}
                onChange={e => setPushTitle(e.target.value)}
              />
              <TextField
                label="Mesaj"
                fullWidth
                multiline
                minRows={3}
                size="small"
                value={pushBody}
                onChange={e => setPushBody(e.target.value)}
              />
              <TextField
                label="Deep link"
                fullWidth
                size="small"
                value={pushDeepLink}
                onChange={e => setPushDeepLink(e.target.value)}
                placeholder="https:// veya app:// formatında bağlantı"
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Icon URL"
                  fullWidth
                  size="small"
                  value={pushIcon}
                  onChange={e => setPushIcon(e.target.value)}
                />
                <TextField
                  label="Image URL"
                  fullWidth
                  size="small"
                  value={pushImage}
                  onChange={e => setPushImage(e.target.value)}
                />
              </Stack>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Aksiyonlar
                </Typography>
                <Stack spacing={1}>
                  {pushActions.map((action, index) => (
                    <Stack
                      key={action.actionId + index}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <TextField
                        label="Buton metni"
                        size="small"
                        value={action.label}
                        onChange={e =>
                          setPushActions(prev =>
                            prev.map((p, i) =>
                              i === index ? { ...p, label: e.target.value } : p
                            )
                          )
                        }
                      />
                      <TextField
                        label="Action ID"
                        size="small"
                        value={action.actionId}
                        onChange={e =>
                          setPushActions(prev =>
                            prev.map((p, i) =>
                              i === index ? { ...p, actionId: e.target.value } : p
                            )
                          )
                        }
                      />
                    </Stack>
                  ))}
                  <Button variant="outlined" size="small" onClick={addPushAction}>
                    Yeni aksiyon ekle
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Push Önizleme
            </Typography>
            <Box
              sx={{
                width: 280,
                borderRadius: 4,
                border: theme => `1px solid ${theme.palette.divider}`,
                p: 1.5,
                bgcolor: 'background.paper'
              }}
            >
              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: 'grey.900',
                  color: 'grey.50',
                  p: 1,
                  mb: 1
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  indiriim.com
                </Typography>
              </Box>
              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  p: 1.5
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {pushTitle || 'Örnek push başlığı'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12, mb: 1 }}>
                  {pushBody || 'Push mesajı burada önizlenecek.'}
                </Typography>
                {pushActions.length > 0 && (
                  <Stack direction="row" spacing={1}>
                    {pushActions.slice(0, 2).map(action => (
                      <Button
                        key={action.actionId}
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'none', fontSize: 11 }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Stack>
                )}
              </Box>
            </Box>
            <Button variant="contained" size="small" disabled={saveLoading} onClick={handleSave} sx={{ mt: 2 }}>
              {saveLoading ? <CircularProgress size={20} /> : 'Kaydet'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TemplatesPage;
