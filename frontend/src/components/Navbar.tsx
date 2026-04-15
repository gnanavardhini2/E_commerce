import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.24)',
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: 0.1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalCafeIcon sx={{ color: '#38bdf8', fontSize: 22 }} />
          <span>Vardhininanicart</span>
        </Typography>
        {isAuthenticated && (
          <>
            <Button color="inherit" sx={{ borderRadius: 999, px: 1.8, textTransform: 'none', fontWeight: 700 }} onClick={() => navigate("/")}>Home</Button>
            <Button color="inherit" sx={{ borderRadius: 999, px: 1.8, textTransform: 'none', fontWeight: 700 }} onClick={() => navigate("/cart")}>Cart</Button>
            <Button color="inherit" sx={{ borderRadius: 999, px: 1.8, textTransform: 'none', fontWeight: 700 }} onClick={() => navigate("/wishlist")}>Wishlist</Button>
            <Button color="inherit" sx={{ borderRadius: 999, px: 1.8, textTransform: 'none', fontWeight: 700 }} onClick={() => navigate("/orders")}>Orders</Button>
            <Button
              onClick={handleLogout}
              sx={{
                ml: 0.5,
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                '&:hover': { background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)' },
              }}
            >
              Logout
            </Button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Button color="inherit" sx={{ borderRadius: 999, px: 1.8, textTransform: 'none', fontWeight: 700 }} onClick={() => navigate("/login")}>Login</Button>
            <Button color="inherit" sx={{ borderRadius: 999, px: 1.8, textTransform: 'none', fontWeight: 700 }} onClick={() => navigate("/register")}>Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
