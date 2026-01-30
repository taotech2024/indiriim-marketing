import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip, Button } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import SkeletonTable from '../components/Common/SkeletonTable';
import TablerIcon from '../components/Common/TablerIcon';

type AudienceType = 'B2B' | 'B2C';

interface AudienceSegment {
  id: number;
  name: string;
  type: AudienceType;
  description: string;
  size: number;
  updatedAt: string;
}

const mockAudiences: AudienceSegment[] = [
  {
    id: 1,
    name: 'Aktif B2B iş ortakları',
    type: 'B2B',
    description: 'Son 90 günde satış yapan kurumsal iş ortakları',
    size: 128,
    updatedAt: '2025-01-15'
  },
  {
    id: 2,
    name: 'Son 30 günde alışveriş yapan B2C müşteriler',
    type: 'B2C',
    description: 'Son 30 günde en az bir sipariş vermiş bireysel müşteriler',
    size: 3456,
    updatedAt: '2025-01-12'
  },
  {
    id: 3,
    name: 'Sepeti terk edenler',
    type: 'B2C',
    description: 'Son 7 günde sepetine ürün ekleyip satın almayan kullanıcılar',
    size: 892,
    updatedAt: '2025-01-10'
  },
  {
    id: 4,
    name: 'Potansiyel VIP Adayları',
    type: 'B2C',
    description: 'Toplam harcaması 4000₺ üzerinde olan kullanıcılar',
    size: 156,
    updatedAt: '2025-01-18'
  }
];

const AudiencesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, []);

  const columns = useMemo<MRT_ColumnDef<AudienceSegment>[]>(
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
          const type = cell.getValue<AudienceType>();
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
      },
      {
        header: 'Kişi Sayısı',
        accessorKey: 'size',
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TablerIcon name="Users" size="sm" color="action" />
            <Typography variant="body2">{cell.getValue<number>().toLocaleString()}</Typography>
          </Box>
        )
      },
      {
        header: 'Son Güncelleme',
        accessorKey: 'updatedAt'
      }
    ],
    []
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Segment Yönetimi
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
            Segment Yönetimi
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Backoffice ve CRM sistemlerinden aktarılan B2B ve B2C hedef kitle segmentleri.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<TablerIcon name="Refresh" />}
        >
          Senkronize Et
        </Button>
      </Box>

      <MaterialReactTable
        columns={columns}
        data={mockAudiences}
        enableColumnActions={false}
        enableColumnFilters={true}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Detaylar">
              <IconButton size="small">
                <TablerIcon name="Eye" size="sm" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Kullanım Raporu">
              <IconButton size="small" color="info">
                <TablerIcon name="ChartPie" size="sm" />
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

export default AudiencesPage;
