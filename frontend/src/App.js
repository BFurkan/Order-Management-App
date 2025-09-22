import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, CircularProgress } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import all pages
import ProductList from './pages/ProductList';
import OrderDetails from './pages/OrderDetails';
import ConfirmedItems from './pages/ConfirmedItems';
import Scan from './pages/Scan';
import DeployedItems from './pages/DeployedItems';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Homepage from './pages/Homepage';
import InventorySummary from './pages/InventorySummary';
import ComprehensiveOrders from './pages/ComprehensiveOrders';

// ProtectedRoute component to guard routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext); // Get loading state

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Navigation component that only renders when a user is logged in
function Navigation() {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return null; // Don't show navbar on login page
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: blueGrey[800] }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Order Management
        </Typography>
        <Button component={Link} to="/" sx={{ color: blueGrey[50] }}>Homepage</Button>
        <Button component={Link} to="/products" sx={{ color: blueGrey[50] }}>Products</Button>
        <Button component={Link} to="/order-details" sx={{ color: blueGrey[50] }}>Order Details</Button>
        <Button component={Link} to="/confirmed-items" sx={{ color: blueGrey[50] }}>Confirmed</Button>
        <Button component={Link} to="/scan" sx={{ color: blueGrey[50] }}>Scan</Button>
        <Button component={Link} to="/deployed-items" sx={{ color: blueGrey[50] }}>Deployed</Button>
        <Button component={Link} to="/inventory-summary" sx={{ color: blueGrey[50] }}>Inventory</Button>
        <Button component={Link} to="/comprehensive-orders" sx={{ color: blueGrey[50] }}>All Orders</Button>
        <Button onClick={logout} sx={{ color: blueGrey[50] }}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Container sx={{ marginTop: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
            <Route path="/order-details" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/confirmed-items" element={<ProtectedRoute><ConfirmedItems /></ProtectedRoute>} />
            <Route path="/deployed-items" element={<ProtectedRoute><DeployedItems /></ProtectedRoute>} />
            <Route path="/inventory-summary" element={<ProtectedRoute><InventorySummary /></ProtectedRoute>} />
            <Route path="/comprehensive-orders" element={<ProtectedRoute><ComprehensiveOrders /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
