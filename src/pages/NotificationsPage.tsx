import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Typography, Chip, IconButton, Tooltip, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import SkeletonTable from '../components/Common/SkeletonTable';
import TablerIcon from '../components/Common/TablerIcon';
import {
  fetchNotifications,
  type NotificationItem,
  type NotificationStatus
} from '../api/notifications';

const getStatusColor = (status: NotificationStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'DRAFT': return 'default';
    case 'PENDING_APPROVAL': return 'warning';
    case 'SCHEDULED': return 'info';
    case 'PROCESSING': return 'primary';
    case 'SENT': return 'success';
    case 'FAILED': return 'error';
    default: return 'default';
  }
};

const getStatusLabel = (status: NotificationStatus) => {
  switch (status) {
    case 'DRAFT': return 'Taslak';
    case 'PENDING_APPROVAL': return 'Onay Bekliyor';
    case 'SCHEDULED': return 'Planlandı';
    case 'PROCESSING': return 'İşleniyor';
    case 'SENT': return 'Gönderildi';
    case 'FAILED': return 'Başarısız';
    default: return status;
  }
};

const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);
    fetchNotifications()
      .then((list) => {
        if (!cancelled) setNotifications(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message ?? err.message ?? 'Liste yüklenemedi.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
        id: 'segment',
        accessorFn: (row) => row.segmentName ?? row.segment ?? '—'
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
        accessorKey: 'scheduledAt',
        accessorFn: (row) => row.scheduledAt ?? '—'
      }
    ],
    []
  );

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
        data={notifications}
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
      )}
    </Box>
  );
};

export default NotificationsPage;
