import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Typography, Button, TextField } from '@mui/material';
import { format } from 'date-fns';

function OrderSummary() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newOrderId, setNewOrderId] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3004/orders');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const ordersWithImages = await Promise.all(data.map(async (order) => {
        if (order.product_id) {
          try {
            const productResponse = await fetch(`http://10.167.49.200:3004/products/${order.product_id}`);
            if (!productResponse.ok) {
              throw new Error('Product fetch failed');
            }
            const product = await productResponse.json();
            return {
              ...order,
              product_name: product.name,
              product_image: product.image,
            };
          } catch (error) {
            console.error(`Error fetching product with ID ${order.product_id}:`, error);
            return { ...order, product_name: 'Unknown Product', product_image: null };
          }
        } else {
          console.warn('Order is missing product_id:', order);
          return { ...order, product_name: 'Unknown Product', product_image: null };
        }
      }));
      const grouped = ordersWithImages.reduce((acc, order) => {
        const { order_id } = order;
        if (!acc[order_id]) {
          acc[order_id] = [];
        }
        acc[order_id].push(order);
        return acc;
      }, {});
      setGroupedOrders(grouped);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleEditOrderId = (orderId) => {
    console.log('Editing Order ID:', orderId);
    setEditingOrderId(orderId);
   setNewOrderId(orderId);
  };

  const handleOrderIdChange = (event) => {
    setNewOrderId(event.target.value);
  };

  const handleUpdateOrderId = async (oldOrderId, newOrderId) => {
    try {
      if (!oldOrderId || !newOrderId) {
        throw new Error('Both oldOrderId and newOrderId are required.');
      }

      const response = await fetch('http://10.167.49.200:3004/update-order-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldOrderId, newOrderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update Order ID');
      }

      // Update the frontend state after successful backend update
      setGroupedOrders((prevGroupedOrders) => {
        const updatedGroupedOrders = { ...prevGroupedOrders };
        updatedGroupedOrders[newOrderId] = updatedGroupedOrders[oldOrderId];
        delete updatedGroupedOrders[oldOrderId];
        return updatedGroupedOrders;
      });

      setEditingOrderId(null); // Reset editing state
    } catch (error) {
      console.error('Error updating order ID:', error.message);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Summary
      </Typography>
      {Object.keys(groupedOrders).map(orderId => {
        const filteredOrders = groupedOrders[orderId].filter(order => order.quantity > 0);

        if (filteredOrders.length === 0) {
          return null; // Don't render anything if all orders have a quantity of 0
        }

        return (
          <Box key={orderId} sx={{ marginBottom: 4, padding: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {editingOrderId === orderId ? (
                <>
                  <TextField
                    value={newOrderId}
                    onChange={handleOrderIdChange}
                    autoFocus
                  />
                  <Button
                    onClick={() => handleUpdateOrderId(editingOrderId, newOrderId)}
                    sx={{ marginLeft: 2 }}
                    variant="contained"
                    color="primary"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => setEditingOrderId(null)}
                    sx={{ marginLeft: 2 }}
                    variant="outlined"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  Order ID: {orderId}
                  <Button onClick={() => handleEditOrderId(orderId)} sx={{ marginLeft: 2 }}>
                    Edit
                  </Button>
                </>
              )}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Image</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Ordered Quantity</TableCell>
                    <TableCell>Order Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {order.product_image ? (
                          <img src={`http://10.167.49.200:3004${order.product_image}`} alt={order.product_name} style={{ width: '100px' }} />
                        ) : (
                          <Typography>No Image</Typography>
                        )}
                      </TableCell>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{format(new Date(order.order_date), 'yyyy-MM-dd')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
     })}
    </Container>
  );
}

export default OrderSummary;
