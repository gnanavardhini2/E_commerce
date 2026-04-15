import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Box, useTheme, useMediaQuery, Button, Divider } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'Products', path: '/admin/products', icon: <Inventory2Icon /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon /> },
  { label: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
];

const drawerWidth = 220;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // Get admin email from localStorage
  let adminEmail = '';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      adminEmail = user.email || 'Admin';
    }
  } catch {
    adminEmail = 'Admin';
  }

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const drawer = (
    <div>
      <Box sx={{ p: 2, fontWeight: 900, fontSize: 22, color: 'primary.main', letterSpacing: 1 }}>
        Vardhininanicart Admin
      </Box>
      <Divider />
      <List>
        {navItems.map(item => (
          <ListItem disablePadding key={item.path}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
              sx={{
                borderRadius: '8px',
                mx: 1,
                mb: 0.5,
                bgcolor: location.pathname === item.path ? '#dbeafe' : 'inherit',
                color: location.pathname === item.path ? '#0f172a' : '#0f172a',
                borderLeft: location.pathname === item.path ? '4px solid #2563eb' : '4px solid transparent',
                '&:hover': {
                  bgcolor: location.pathname === item.path ? '#bfdbfe' : '#eff6ff',
                  color: '#1e3a8a',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#2563eb' : '#1d4ed8' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 800 : 600,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: '8px', mt: 1 }}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        {/* Top AppBar */}
        <AppBar position="fixed" color="inherit" elevation={0} sx={{ zIndex: theme.zIndex.drawer + 1, borderBottom: '1.5px solid #e0e7ef' }}>
          <Toolbar>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
              Vardhininanicart Admin
            </Typography>
            <Typography sx={{ mr: 2, fontWeight: 700, color: 'text.secondary' }}>
              {adminEmail}
            </Typography>
            <Button color="error" variant="outlined" size="small" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        {/* Content below AppBar */}
        <Toolbar />
        <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
