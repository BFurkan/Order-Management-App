import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { blueGrey, cyan } from '@mui/material/colors';

// Pages
import ProductList from './pages/ProductList';
import OrderSummary from './pages/OrderSummary';
import OrderDetails from './pages/OrderDetails';
import ConfirmedItems from './pages/ConfirmedItems';

function App() {
  return (
    <Router>
      {/* Navigation Bar */}
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
            Order Summaries
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
          <Button
            component={Link}
            to="/confirmed-items"
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
            Orders Fulfilled
          </Button>
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Container sx={{ marginTop: 4 }}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/order-details" element={<OrderDetails />} />
          <Route path="/confirmed-items" element={<ConfirmedItems />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
