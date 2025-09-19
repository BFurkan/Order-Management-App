import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { blueGrey, cyan } from '@mui/material/colors';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import ProductList from './pages/ProductList';
import OrderSummary from './pages/OrderSummary';
import OrderDetails from './pages/OrderDetails';
import ConfirmedItems from './pages/ConfirmedItems';
import Scan from './pages/Scan';
import DeployedItems from './pages/DeployedItems';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function Navigation() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: cyan[900] }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Order Management
        </Typography>
        <Button component={Link} to="/" sx={{ color: blueGrey[50] }}>
          Dashboard
        </Button>
        <Button component={Link} to="/products" sx={{ color: blueGrey[50] }}>
          Product List
        </Button>
        <Button component={Link} to="/order-summary" sx={{ color: blueGrey[50] }}>
          Open Orders
        </Button>
        <Button component={Link} to="/order-details" sx={{ color: blueGrey[50] }}>
          Order Details
        </Button>
        <Button component={Link} to="/confirmed-items" sx={{ color: blueGrey[50] }}>
          Confirmed Orders
        </Button>
        <Button component={Link} to="/scan" sx={{ color: blueGrey[50] }}>
          Scan & Deploy
        </Button>
        <Button component={Link} to="/deployed-items" sx={{ color: blueGrey[50] }}>
          Deployed Items
        </Button>
        <Button onClick={logout} sx={{ color: blueGrey[50] }}>
          Logout
        </Button>
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
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
            <Route path="/order-summary" element={<ProtectedRoute><OrderSummary /></ProtectedRoute>} />
            <Route path="/order-details" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/confirmed-items" element={<ProtectedRoute><ConfirmedItems /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
            <Route path="/deployed-items" element={<ProtectedRoute><DeployedItems /></ProtectedRoute>} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
