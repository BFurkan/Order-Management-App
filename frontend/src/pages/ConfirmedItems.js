import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button } from '@mui/material';
import { format } from 'date-fns';

function ConfirmedItems() {
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    // Fetch the confirmed items from the backend
    fetch('http://10.167.49.200:3004/confirmed-items')
      .then(response => response.json())
      .then(data => {
        setConfirmedItems(data);
        setFilteredItems(data); // Initialize filtered items with all items
      })
      .catch(error => console.error('Error fetching confirmed items:', error));
  }, []);

  // Function to handle search when search button is clicked
  const handleSearch = () => {
    const value = searchTerm.toLowerCase();

    const filtered = confirmedItems.filter(item =>
      (item.product_name && item.product_name.toLowerCase().includes(value)) ||
      (item.order_id && item.order_id.toLowerCase().includes(value)) ||
      (item.quantity && item.quantity.toString().includes(value)) ||
      (item.order_date && item.order_date.toLowerCase().includes(value)) ||
      (item.confirm_date && item.confirm_date.toLowerCase().includes(value))
    );
    setFilteredItems(filtered);
  };

  // Grouping confirmed items by order_id
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }
    acc[item.order_id].push(item);
    return acc;
  }, {});

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Confirmed Items
      </Typography>

      {/* Search Input */}
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by product name, order ID, quantity, etc."
        sx={{ marginBottom: '20px' }}
      />

      {/* Search Button */}
      <Button variant="contained" color="primary" onClick={handleSearch} sx={{ marginBottom: '20px' }}>
        Search
      </Button>

      {/* Display items grouped by order_id */}
      {Object.keys(groupedItems).map(orderId => (
        <div key={orderId}>
          <Typography variant="h6" gutterBottom>
            Order ID: {orderId}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Confirm Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedItems[orderId].map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name || 'N/A'}</TableCell>
                    <TableCell>{item.quantity || 0}</TableCell>
                    <TableCell>{format(new Date(item.order_date), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{format(new Date(item.confirm_date), 'yyyy-MM-dd')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}
    </Container>
  );
}

export default ConfirmedItems;
