import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Skeleton, Box } from '@mui/material';

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  dense?: boolean;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 8, columns = 6, dense = false }) => {
  const colArray = Array.from({ length: Math.max(1, columns) });
  const rowArray = Array.from({ length: Math.max(1, rows) });

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={260} height={20} />
      </Box>
      <Table stickyHeader size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {colArray.map((_, i) => (
              <TableCell key={`sk-head-${i}`}>
                <Skeleton variant="text" height={24} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowArray.map((_, r) => (
            <TableRow key={`sk-row-${r}`}>
              {colArray.map((_, c) => (
                <TableCell key={`sk-cell-${r}-${c}`}>
                  <Skeleton variant="rectangular" height={dense ? 20 : 28} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SkeletonTable;

