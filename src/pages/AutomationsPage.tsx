import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button, Typography, Chip, IconButton, Tooltip, Switch } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import SkeletonTable from '../components/Common/SkeletonTable';
import TablerIcon from '../components/Common/TablerIcon';

type AutomationStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT';

interface AutomationItem {
  id: number;
  name: string;
  trigger: string;
  status: AutomationStatus;
  stats: {
    triggered: number;
    completed: number;
  };
  lastRun: string;
}

const mockAutomations: AutomationItem[] = [
  {
    id: 1,
    name: 'Sepet Terk Hatırlatması',
    trigger: 'Sepette ürün bırakıldı (30dk)',
    status: 'ACTIVE',
    stats: { triggered: 1250, completed: 850 },
    lastRun: '10 dk önce'
  },
  {
    id: 2,
    name: 'Hoşgeldin Serisi',
    trigger: 'Yeni üye kaydı',
    status: 'ACTIVE',
    stats: { triggered: 3400, completed: 3100 },
    lastRun: '2 dk önce'
  },
  {
    id: 3,
    name: 'Düşen Fiyat Alarmı',
    trigger: 'Favori ürün fiyat düşüşü',
    status: 'PAUSED',
    stats: { triggered: 450, completed: 400 },
    lastRun: '2 gün önce'
  },
  {
    id: 4,
    name: 'VIP Müşteri Kutlaması',
    trigger: 'Toplam harcama > 5000₺',
    status: 'DRAFT',
    stats: { triggered: 0, completed: 0 },
    lastRun: '-'
  }
];

const AutomationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timeout);
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
        accessorFn: (row) => `${row.stats.triggered} / ${row.stats.completed}`,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.stats.triggered} Tetiklenme
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.stats.completed} Tamamlanma
            </Typography>
          </Box>
        )
      },
      {
        header: 'Son Çalışma',
        accessorKey: 'lastRun'
      }
    ],
    []
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Otomasyonlar
          </Typography>
        </Box>
        <SkeletonTable rows={5} columns={5} />
      </Box>
    );
  }

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
        <Button 
          variant="contained" 
          startIcon={<TablerIcon name="Plus" />}
        >
          Yeni Otomasyon
        </Button>
      </Box>

      <MaterialReactTable
        columns={columns}
        data={mockAutomations}
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
    </Box>
  );
};

export default AutomationsPage;
