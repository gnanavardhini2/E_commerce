import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, CardContent, CircularProgress, Typography, Box } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import PaidIcon from '@mui/icons-material/Paid';
import API from '../../api';

type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await API.get('/admin/dashboard');
        const data = response.data || {};
        setStats({
          totalProducts: Number(data.totalProducts || 0),
          totalOrders: Number(data.totalOrders || 0),
          totalUsers: Number(data.totalUsers || 0),
          totalRevenue: Number(data.totalRevenue || 0),
        });
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formattedRevenue = useMemo(() => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(stats.totalRevenue || 0);
  }, [stats.totalRevenue]);

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: <Inventory2Icon color="primary" sx={{ fontSize: 40 }} /> },
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCartIcon color="success" sx={{ fontSize: 40 }} /> },
    { label: 'Total Users', value: stats.totalUsers, icon: <PeopleIcon color="info" sx={{ fontSize: 40 }} /> },
    { label: 'Revenue', value: formattedRevenue, icon: <PaidIcon color="warning" sx={{ fontSize: 40 }} /> },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={3} color="primary.main">
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">Loading stats...</Typography>
        </Box>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {cards.map((stat) => (
          <div key={stat.label} style={{ flex: '1 1 200px', minWidth: 200, maxWidth: 300, marginBottom: 24 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                {stat.icon}
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mt={1}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={900} color="primary.main">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default AdminDashboard;
