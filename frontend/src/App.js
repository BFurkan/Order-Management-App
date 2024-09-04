import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Container } from '@mui/material';
import { cyan, blueGrey } from '@mui/material/colors';
import ProductList from './pages/ProductList';
import OrderSummary from './pages/OrderSummary';
import OrderDetails from './pages/OrderDetails';

function App() {
  return (
    <Router>
      <AppBar position="static" sx={{ backgroundColor: cyan[900] }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Order Management
          </Typography>
          <Button
            component={Link}
            to="/"
            sx={{
              color: blueGrey[50],
              border: `1px solid ${blueGrey[50]}`,
              borderRadius: '4px',
              padding: '8px 16px',
              margin: '0 8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            Product List
          </Button>
          <Button
            component={Link}
            to="/order-summary"
            sx={{
              color: blueGrey[50],
              border: `1px solid ${blueGrey[50]}`,
              borderRadius: '4px',
              padding: '8px 16px',
              margin: '0 8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            Order Summary
          </Button>
          <Button
            component={Link}
            to="/order-details"
            sx={{
              color: blueGrey[50],
              border: `1px solid ${blueGrey[50]}`,
              borderRadius: '4px',
              padding: '8px 16px',
              margin: '0 8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            Order Details
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/order-details" element={<OrderDetails />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
