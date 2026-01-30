import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Typography, Chip, IconButton, Tooltip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import SkeletonTable from '../components/Common/SkeletonTable';
import TablerIcon from '../components/Common/TablerIcon';

type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

type NotificationStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SCHEDULED' | 'SENT';

interface NotificationItem {
  id: number;
  name: string;
  channel: NotificationChannel;
  segment: string;
  status: NotificationStatus;
  scheduledAt: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    name: 'Haftalık indirim maili',
    channel: 'EMAIL',
    segment: 'Aktif B2C müşteriler',
    status: 'SCHEDULED',
    scheduledAt: '2025-01-18 10:00'
  },
  {
    id: 2,
    name: 'Sepeti terk edenlere SMS',
    channel: 'SMS',
    segment: 'Sepeti terk edenler',
    status: 'PENDING_APPROVAL',
    scheduledAt: '2025-01-18 11:30'
  },
  {
    id: 3,
    name: 'Uygulama kampanya bildirimi',
    channel: 'PUSH',
    segment: 'Aktif B2B iş ortakları',
    status: 'DRAFT',
    scheduledAt: 'Planlanmadı'
  },
  {
    id: 4,
    name: 'Yeni üyelik hoşgeldin serisi',
    channel: 'EMAIL',
    segment: 'Yeni Üyeler',
    status: 'SENT',
    scheduledAt: '2025-01-15 09:00'
  }
];

const getStatusColor = (status: NotificationStatus): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case 'DRAFT': return 'default';
    case 'PENDING_APPROVAL': return 'warning';
    case 'SCHEDULED': return 'info';
    case 'SENT': return 'success';
    default: return 'default';
  }
};

const getStatusLabel = (status: NotificationStatus) => {
  switch (status) {
    case 'DRAFT': return 'Taslak';
    case 'PENDING_APPROVAL': return 'Onay Bekliyor';
    case 'SCHEDULED': return 'Planlandı';
    case 'SENT': return 'Gönderildi';
    default: return status;
  }
};

const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  const columns = useMemo<MRT_ColumnDef<NotificationItem>[]>(
    () => [
      {
        header: 'Kampanya Adı',
        accessorKey: 'name',
        size: 250,
      },
      {
        header: 'Kanal',
        accessorKey: 'channel',
        size: 100,
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TablerIcon 
              name={
                cell.getValue<string>() === 'EMAIL' ? 'Mail' : 
                cell.getValue<string>() === 'SMS' ? 'Message' : 'DeviceMobile'
              } 
              size="sm" 
            />
            {cell.getValue<string>()}
          </Box>
        )
      },
      {
        header: 'Segment',
        accessorKey: 'segment'
      },
      {
        header: 'Durum',
        accessorKey: 'status',
        Cell: ({ cell }) => {
          const status = cell.getValue<NotificationStatus>();
          return (
            <Chip 
              label={getStatusLabel(status)} 
              color={getStatusColor(status)} 
              size="small" 
              variant="outlined"
            />
          );
        }
      },
      {
        header: 'Planlanan Gönderim',
        accessorKey: 'scheduledAt'
      }
    ],
    []
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Kampanya Yönetimi
          </Typography>
        </Box>
        <SkeletonTable rows={8} columns={5} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Kampanya Yönetimi
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Kampanya ve transactional bildirim planlarını buradan yönetebilirsiniz.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<TablerIcon name="Plus" />}
          onClick={() => navigate('/notifications/new')}
        >
          Yeni Kampanya
        </Button>
      </Box>
      
      <MaterialReactTable
        columns={columns}
        data={mockNotifications}
        enableColumnActions={false}
        enableColumnFilters={true}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Düzenle">
              <IconButton size="small" onClick={() => console.log('Edit', row.original)}>
                <TablerIcon name="Edit" size="sm" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Kopyala">
              <IconButton size="small" onClick={() => console.log('Duplicate', row.original)}>
                <TablerIcon name="Copy" size="sm" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sil">
              <IconButton size="small" color="error" onClick={() => console.log('Delete', row.original)}>
                <TablerIcon name="Trash" size="sm" />
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

export default NotificationsPage;
