import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack
} from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import SkeletonTable from '../components/Common/SkeletonTable';
import TablerIcon from '../components/Common/TablerIcon';
import {
  fetchSegments,
  createSegment,
  updateSegment,
  type SegmentItem,
  type SegmentType
} from '../api/segments';

type AudienceType = 'B2B' | 'B2C';

const AudiencesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SegmentItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<SegmentType>('B2C');
  const [formSize, setFormSize] = useState<number | ''>('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setError(null);
    setLoading(true);
    fetchSegments()
      .then(setSegments)
      .catch(() => setError('Segment listesi yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormDescription('');
    setFormType('B2C');
    setFormSize('');
    setDialogOpen(true);
  };

  const openEdit = (row: SegmentItem) => {
    setEditing(row);
    setFormName(row.name);
    setFormDescription(row.description ?? '');
    setFormType((row.type as SegmentType) ?? 'B2C');
    setFormSize(row.size ?? '');
    setDialogOpen(true);
  };

  const handleSaveSegment = async () => {
    if (!formName.trim()) {
      setError('Segment adı gerekli.');
      return;
    }
    setSaveLoading(true);
    setError(null);
    try {
      const body = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        type: formType,
        size: formSize === '' ? undefined : Number(formSize)
      };
      if (editing) {
        const updated = await updateSegment(editing.id, body);
        setSegments(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createSegment(body);
        setSegments(prev => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Kaydetme başarısız.');
      setError(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const columns = useMemo<MRT_ColumnDef<SegmentItem>[]>(
    () => [
      {
        header: 'Segment Adı',
        accessorKey: 'name',
        size: 250,
      },
      {
        header: 'Tür',
        accessorKey: 'type',
        Cell: ({ cell }) => {
          const type = cell.getValue<AudienceType | undefined>();
          if (!type) return '—';
          return (
            <Chip 
              icon={<TablerIcon name={type === 'B2B' ? 'BuildingStore' : 'User'} size="sm" />}
              label={type} 
              color={type === 'B2B' ? 'secondary' : 'primary'} 
              size="small" 
              variant="outlined"
            />
          );
        }
      },
      {
        header: 'Açıklama',
        accessorKey: 'description',
        size: 300,
        accessorFn: (row) => row.description ?? '—'
      },
      {
        header: 'Kişi Sayısı',
        accessorKey: 'size',
        Cell: ({ cell }) => {
          const val = cell.getValue<number | undefined>();
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TablerIcon name="Users" size="sm" color="action" />
              <Typography variant="body2">{val != null ? Number(val).toLocaleString() : '—'}</Typography>
            </Box>
          );
        }
      },
      {
        header: 'Son Güncelleme',
        accessorKey: 'updatedAt',
        accessorFn: (row) => row.updatedAt ?? '—'
      }
    ],
    []
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Segment Yönetimi
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Backoffice ve CRM sistemlerinden aktarılan B2B ve B2C hedef kitle segmentleri.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<TablerIcon name="Plus" />} onClick={openCreate} sx={{ mr: 1 }}>
          Yeni Segment
        </Button>
        <Button
          variant="outlined"
          startIcon={<TablerIcon name="Refresh" />}
          onClick={() => {
            setLoading(true);
            fetchSegments().then(setSegments).catch(() => setError('Yenileme başarısız.')).finally(() => setLoading(false));
          }}
        >
          Senkronize Et
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonTable rows={8} columns={5} />
      ) : (
      <MaterialReactTable
        columns={columns}
        data={segments}
        enableColumnActions={false}
        enableColumnFilters={true}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Düzenle">
              <IconButton size="small" onClick={() => openEdit(row.original)}>
                <TablerIcon name="Edit" size="sm" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Detaylar">
              <IconButton size="small">
                <TablerIcon name="Eye" size="sm" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        initialState={{
          pagination: {
            pageSize: 10,
            pageIndex: 0
          },
          density: 'comfortable'
        }}
        muiTablePaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }
        }}
        muiTableHeadCellProps={{
          sx: {
            backgroundColor: 'background.default',
            fontWeight: 600
          }
        }}
      />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Segment Düzenle' : 'Yeni Segment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Segment Adı"
              fullWidth
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
            />
            <TextField
              label="Açıklama"
              fullWidth
              multiline
              minRows={2}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Tür</InputLabel>
              <Select
                label="Tür"
                value={formType}
                onChange={e => setFormType(e.target.value as SegmentType)}
              >
                <MenuItem value="B2B">B2B</MenuItem>
                <MenuItem value="B2C">B2C</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Kişi Sayısı"
              type="number"
              fullWidth
              value={formSize}
              onChange={e => setFormSize(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              inputProps={{ min: 0 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveSegment} disabled={saveLoading}>
            {saveLoading ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AudiencesPage;
