
import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, Chip, TablePagination
} from '@mui/material';
import { userService } from '../../admin/services/userService';
import { useAdmin } from '../../admin/context/AdminContext';
import { toast } from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const statusColors: Record<'active' | 'disabled', 'success' | 'error'> = {
  active: 'success',
  disabled: 'error',
};
const roleColors: Record<'admin' | 'user', 'primary' | 'default'> = {
  admin: 'primary',
  user: 'default',
};

const UserManagement: React.FC = () => {
  const { users, setUsers } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [roleEditId, setRoleEditId] = useState<number | null>(null);
  const [roleEditValue, setRoleEditValue] = useState<'admin' | 'user'>('user');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    let filtered = [...users].sort((a, b) => b.id - a.id);
    if (filter === 'active') filtered = filtered.filter(u => u.status === 'active');
    if (filter === 'disabled') filtered = filtered.filter(u => u.status === 'disabled');
    if (filter === 'admin') filtered = filtered.filter(u => u.role === 'admin');
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    return filtered;
  }, [users, search, filter]);

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [search, filter, users.length]);

  // Actions
  const handleToggle = async (id: number) => {
    setLoading(true);
    try {
      await userService.toggle(id);
      toast.success('User status updated');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      await userService.delete(userToDelete);
      toast.success('User deleted');
      setConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleEdit = async (id: number, newRole: 'admin' | 'user') => {
    setLoading(true);
    try {
      await userService.changeRole(id, newRole);
      toast.success('Role updated');
      setRoleEditId(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={900} gutterBottom>User Management</Typography>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} label="Filter" onChange={e => setFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="disabled">Disabled</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map(user => (
                  <TableRow key={user.id} hover sx={{ transition: 'background 0.2s' }}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {roleEditId === user.id ? (
                        <FormControl size="small">
                          <Select
                            value={roleEditValue}
                            onChange={e => setRoleEditValue(e.target.value as 'admin' | 'user')}
                            onBlur={() => setRoleEditId(null)}
                          >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          color={roleColors[user.role]}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: 14, bgcolor: user.role === 'admin' ? '#2563eb' : '#e0e7ef', color: user.role === 'admin' ? '#fff' : '#222' }}
                          onClick={() => {
                            setRoleEditId(user.id);
                            setRoleEditValue(user.role);
                          }}
                          icon={<EditIcon fontSize="small" />}
                          clickable
                        />
                      )}
                      {roleEditId === user.id && (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ ml: 1, minWidth: 0, px: 1, py: 0.5 }}
                          onClick={() => handleRoleEdit(user.id, roleEditValue)}
                        >
                          Save
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 'active' ? 'Active' : 'Disabled'}
                        color={statusColors[user.status]}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: 14, bgcolor: user.status === 'active' ? '#22c55e' : '#ef4444', color: '#fff' }}
                        icon={user.status === 'active' ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={user.status === 'active' ? 'Disable user' : 'Enable user'}>
                        <IconButton
                          color={user.status === 'active' ? 'error' : 'success'}
                          onClick={() => handleToggle(user.id)}
                          disabled={loading}
                        >
                          {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete user">
                        <IconButton
                          color="error"
                          onClick={() => { setUserToDelete(user.id); setConfirmOpen(true); }}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
