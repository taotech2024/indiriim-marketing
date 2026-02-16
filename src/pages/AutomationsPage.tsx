import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button, Typography, Chip, IconButton, Tooltip, Alert } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import SkeletonTable from '../components/Common/SkeletonTable';
import TablerIcon from '../components/Common/TablerIcon';
import { fetchAutomations, type AutomationItem, type AutomationStatus } from '../api/automations';

const AutomationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [automations, setAutomations] = useState<AutomationItem[]>([]);

  useEffect(() => {
    setError(null);
    setLoading(true);
    fetchAutomations()
      .then(setAutomations)
      .catch(() => setError('Otomasyon listesi yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<MRT_ColumnDef<AutomationItem>[]>(
    () => [
      {
        header: 'Otomasyon Adı',
        accessorKey: 'name',
        size: 250,
      },
      {
        header: 'Tetikleyici',
        accessorKey: 'trigger',
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TablerIcon name="Bolt" size="sm" color="warning" />
            {cell.getValue<string>()}
          </Box>
        )
      },
      {
        header: 'Durum',
        accessorKey: 'status',
        Cell: ({ cell }) => {
          const status = cell.getValue<AutomationStatus>();
          return (
            <Chip 
              label={status === 'ACTIVE' ? 'Aktif' : status === 'PAUSED' ? 'Durduruldu' : 'Taslak'} 
              color={status === 'ACTIVE' ? 'success' : status === 'PAUSED' ? 'warning' : 'default'} 
              size="small" 
              variant={status === 'ACTIVE' ? 'filled' : 'outlined'}
            />
          );
        }
      },
      {
        header: 'Performans',
        id: 'stats',
        accessorFn: (row) => row.stats ? `${row.stats.triggered} / ${row.stats.completed}` : '—',
        Cell: ({ row }) => {
          const s = row.original.stats;
          if (!s) return '—';
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.triggered} Tetiklenme</Typography>
              <Typography variant="caption" color="text.secondary">{s.completed} Tamamlanma</Typography>
            </Box>
          );
        }
      },
      {
        header: 'Son Çalışma',
        accessorKey: 'lastRun',
        accessorFn: (row) => row.lastRun ?? '—'
      }
    ],
    []
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Otomasyonlar
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sepet, görüntüleme, satın alma ve üyelik tetikleyicilerine bağlı otomatik akışları yönetin.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<TablerIcon name="Plus" />}>
          Yeni Otomasyon
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
      <MaterialReactTable
        columns={columns}
        data={automations}
        enableColumnActions={false}
        enableColumnFilters={true}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Düzenle">
              <IconButton size="small">
                <TablerIcon name="Edit" size="sm" />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.original.status === 'ACTIVE' ? 'Durdur' : 'Başlat'}>
              <IconButton size="small" color={row.original.status === 'ACTIVE' ? 'warning' : 'success'}>
                <TablerIcon name={row.original.status === 'ACTIVE' ? 'PlayerPause' : 'PlayerPlay'} size="sm" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rapor">
              <IconButton size="small" color="info">
                <TablerIcon name="ChartBar" size="sm" />
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
    </Box>
  );
};

export default AutomationsPage;
