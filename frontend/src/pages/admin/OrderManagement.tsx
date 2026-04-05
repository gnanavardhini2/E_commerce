import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import API from '../../api';

type OrderStatus = 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

type AdminOrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
};

type AdminOrder = {
  id: number;
  totalPrice: number;
  status: string;
  address: string;
  createdAt: string;
  items: AdminOrderItem[];
};

const STATUS_OPTIONS: OrderStatus[] = ['PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const toUiStatus = (rawStatus: string) => {
  const status = String(rawStatus || '').toUpperCase();
  if (status === 'SHIPPED') return 'SHIPPING';
  return status;
};

const statusChipColor = (status: string): 'default' | 'info' | 'warning' | 'success' | 'error' => {
  switch (toUiStatus(status)) {
    case 'PROCESSING':
      return 'info';
    case 'SHIPPING':
      return 'warning';
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draftStatusById, setDraftStatusById] = useState<Record<number, OrderStatus>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmCancelOrderId, setConfirmCancelOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/orders/admin');
      const fetchedOrders: AdminOrder[] = response.data || [];
      setOrders(fetchedOrders);
      setDraftStatusById(() => {
        const next: Record<number, OrderStatus> = {};
        fetchedOrders.forEach((order) => {
          next[order.id] = toUiStatus(order.status) as OrderStatus;
        });
        return next;
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const sortedOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((order) => {
        const normalizedStatus = toUiStatus(order.status);
        const statusOk = statusFilter === 'ALL' ? true : normalizedStatus === statusFilter;
        const searchOk = normalizedSearch.length === 0
          ? true
          : String(order.id).includes(normalizedSearch)
            || String(order.address || '').toLowerCase().includes(normalizedSearch)
            || (order.items || []).some((item) => item.productName.toLowerCase().includes(normalizedSearch));
        return statusOk && searchOk;
      });
  }, [orders, search, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedOrders.slice(start, start + rowsPerPage);
  }, [sortedOrders, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, orders.length]);

  const handleStatusDraftChange = (orderId: number, nextStatus: OrderStatus) => {
    setDraftStatusById((prev) => ({ ...prev, [orderId]: nextStatus }));
  };

  const publishStatusUpdateEvent = () => {
    window.dispatchEvent(new CustomEvent('order-status-updated'));
  };

  const handleStatusUpdate = async (orderId: number) => {
    const selectedStatus = draftStatusById[orderId];
    if (!selectedStatus) return;

    setUpdatingOrderId(orderId);
    setError('');
    setSuccess('');
    try {
      const response = await API.patch(`/orders/${orderId}/status`, null, {
        params: { status: selectedStatus },
      });

      const updatedOrder = response.data as AdminOrder;
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
      setSuccess(`Order #${orderId} updated to ${toUiStatus(updatedOrder.status)}.`);
      publishStatusUpdateEvent();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancel = async (orderId: number) => {
    setUpdatingOrderId(orderId);
    setError('');
    setSuccess('');
    try {
      const response = await API.put(`/orders/${orderId}/cancel`);
      const updatedOrder = response.data as AdminOrder;
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
      setDraftStatusById((prev) => ({ ...prev, [orderId]: 'CANCELLED' }));
      setSuccess(`Order #${orderId} cancelled.`);
      publishStatusUpdateEvent();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to cancel order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const requestCancel = (orderId: number) => {
    setConfirmCancelOrderId(orderId);
  };

  const confirmCancel = async () => {
    if (!confirmCancelOrderId) return;
    await handleCancel(confirmCancelOrderId);
    setConfirmCancelOrderId(null);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Order Management</Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Manage processing, shipped, delivered, and cancelled states.
        </Typography>
        <Button variant="outlined" onClick={loadOrders} disabled={loading || updatingOrderId !== null}>
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Search order, product, address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="PROCESSING">Processing</MenuItem>
            <MenuItem value="SHIPPING">Shipped</MenuItem>
            <MenuItem value="DELIVERED">Delivered</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><b>Order ID</b></TableCell>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Items</b></TableCell>
              <TableCell><b>Total</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Change Status</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => {
              const normalizedStatus = toUiStatus(order.status);
              const isCancelled = normalizedStatus === 'CANCELLED';
              const isDelivered = normalizedStatus === 'DELIVERED';
              const disableUpdates = updatingOrderId === order.id;

              return (
                <TableRow key={order.id} hover>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    {order.items?.slice(0, 2).map((item) => `${item.productName} x${item.quantity}`).join(', ')}
                    {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ''}
                  </TableCell>
                  <TableCell>₹{order.totalPrice}</TableCell>
                  <TableCell>
                    <Chip label={normalizedStatus} color={statusChipColor(normalizedStatus)} size="small" />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel id={`status-label-${order.id}`}>Status</InputLabel>
                      <Select
                        labelId={`status-label-${order.id}`}
                        value={draftStatusById[order.id] || (normalizedStatus as OrderStatus)}
                        label="Status"
                        onChange={(e) => handleStatusDraftChange(order.id, e.target.value as OrderStatus)}
                        disabled={disableUpdates || isCancelled}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleStatusUpdate(order.id)}
                        disabled={disableUpdates || isCancelled}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => requestCancel(order.id)}
                        disabled={disableUpdates || isCancelled || isDelivered}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {sortedOrders.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                    No orders found.
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={sortedOrders.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <Dialog open={confirmCancelOrderId !== null} onClose={() => setConfirmCancelOrderId(null)}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel order #{confirmCancelOrderId}? This action notifies the customer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancelOrderId(null)}>No</Button>
          <Button onClick={confirmCancel} color="error" variant="contained" disabled={updatingOrderId !== null}>
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagement;
