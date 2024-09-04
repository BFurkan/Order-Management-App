import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Typography, TextField, Button, Box } from '@mui/material';

function OrderDetails() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [products, setProducts] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [totals, setTotals] = useState({ monitors: 0, notebooks: 0, accessories: 0 });

  useEffect(() => {
    fetch('http://localhost:3001/products')
      .then(response => response.json())
      .then(data => {
        const productMap = data.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});
        setProducts(productMap);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const calculateTotals = useCallback((orders) => {
    let monitors = 0;
    let notebooks = 0;
    let accessories = 0;
  
    Object.values(orders).forEach(orderGroup => {
      orderGroup.forEach(order => {
        const product = products[order.product_id];
        if (product) {
          const productNameLower = product.name.toLowerCase();
  
          // Check if the product name includes certain keywords
          if (productNameLower.includes('monitor')) {
            monitors += order.quantity;
          } else if (productNameLower.includes('notebook') || productNameLower.includes('thinkpad')) {
            notebooks += order.quantity;
          } else if (productNameLower.includes('accessory')) {
            accessories += order.quantity;
          }
        }
      });
    });
  
    console.log('Totals:', { monitors, notebooks, accessories });  // Debugging line
  
    setTotals({ monitors, notebooks, accessories });
  }, [products]);
  
  useEffect(() => {
    fetch('http://localhost:3001/orders')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const grouped = data.reduce((acc, order) => {
          if (!acc[order.order_id]) {
            acc[order.order_id] = [];
          }
          acc[order.order_id].push(order);
          return acc;
        }, {});

        setGroupedOrders(grouped);
        calculateTotals(grouped); // Call calculateTotals here after setting groupedOrders
      })
      .catch(error => console.error('Error fetching orders:', error));
  }, [calculateTotals]);

  const handleInputChange = (order_id, product_id, value) => {
    setInputValues(prev => ({
      ...prev,
      [`${order_id}-${product_id}`]: value,
    }));
  };

  const handleConfirm = (order_id, product_id) => {
    const order = groupedOrders[order_id]?.find(o => o.product_id === product_id);
    const confirmQuantity = Number(inputValues[`${order_id}-${product_id}`] || 0);

    if (!order || confirmQuantity > order.quantity) {
      alert('Confirmed quantity cannot be greater than the total quantity');
      return;
    }

    // Send the confirmation request to the backend
    fetch('http://localhost:3001/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id,
        product_id,
        confirmQuantity,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to confirm item');
        }
        return response.json();
      })
      .then(() => {
        // Update the frontend state to reflect the new quantities
        const updatedOrders = Object.keys(groupedOrders).reduce((acc, current_order_id) => {
          acc[current_order_id] = groupedOrders[current_order_id].map(order =>
            order.product_id === product_id && order.order_id === order_id
              ? {
                  ...order,
                  confirmed_quantity: order.confirmed_quantity + confirmQuantity,
                  quantity: order.quantity - confirmQuantity,
                }
              : order
          );
          return acc;
        }, {});

        setGroupedOrders(updatedOrders);
        calculateTotals(updatedOrders); // Recalculate totals after confirmation
        setInputValues(prev => ({
          ...prev,
          [`${order_id}-${product_id}`]: '', // Clear input after confirmation
        }));
      })
      .catch(error => console.error('Error confirming item:', error));
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Details
      </Typography>

      {/* Display totals for monitors, notebooks, and accessories */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6">Totals</Typography>
        <Typography>Monitors: {totals.monitors}</Typography>
        <Typography>Notebooks: {totals.notebooks}</Typography>
        <Typography>Accessories: {totals.accessories}</Typography>
      </Box>

      {Object.keys(groupedOrders).map(order_id => (
        <Box key={order_id} sx={{ marginBottom: 4, padding: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Order ID: {order_id}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Total Quantity</TableCell>
                  <TableCell>Confirmed Quantity</TableCell>
                  <TableCell>Confirm Quantity</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedOrders[order_id].map(order => {
                  const product = products[order.product_id];
                  const inputValue = inputValues[`${order_id}-${order.product_id}`] || '';

                  return (
                    <TableRow key={`${order.product_id}-${order.order_id}`}>
                      <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.confirmed_quantity || 0}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          label="Confirm Quantity"
                          onChange={(e) => handleInputChange(order_id, order.product_id, e.target.value)}
                          value={inputValue}
                          inputProps={{ min: 0, max: order.quantity }}
                          disabled={order.quantity <= 0} // Disable input if quantity is 0 or less
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleConfirm(order_id, order.product_id)}
                          disabled={order.quantity <= 0 || inputValue <= 0} // Disable button if quantity is 0 or input is empty
                        >
                          Confirm
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Container>
  );
}

export default OrderDetails;
