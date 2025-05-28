import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './pages/ProductList';
import OrderSummary from './pages/OrderSummary';
import OrderDetails from './pages/OrderDetails';
import ConfirmedItems from './pages/ConfirmedItems';

function App() {
  return (
    <Router>
<<<<<<< HEAD
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
            Confirmed Items
          </Button>

        </Toolbar>
      </AppBar>
      <Container>
=======
      {/* Modern Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-white text-xl font-bold">
                Order Management
              </h1>
            </div>
            
            {/* Navigation Links */}
            <div className="flex space-x-4">
              <Link
                to="/"
                className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-white border-opacity-30 hover:border-opacity-50"
              >
                Product List
              </Link>
              <Link
                to="/order-summary"
                className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-white border-opacity-30 hover:border-opacity-50"
              >
                Order Summary
              </Link>
              <Link
                to="/order-details"
                className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-white border-opacity-30 hover:border-opacity-50"
              >
                Order Details
              </Link>
              <Link
                to="/confirmed-items"
                className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 border border-white border-opacity-30 hover:border-opacity-50"
              >
                Confirmed Items
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
>>>>>>> origin/master
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/order-details" element={<OrderDetails />} />
<<<<<<< HEAD
	  <Route path="/confirmed-items" element={<ConfirmedItems />} />
=======
          <Route path="/confirmed-items" element={<ConfirmedItems />} />
>>>>>>> origin/master
        </Routes>
      </div>
    </Router>
  );
}

export default App;
