import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';

function OrderDetails() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [products, setProducts] = useState({});
  const [serialNumbers, setSerialNumbers] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderComments, setOrderComments] = useState({});
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productName: true,
    orderDate: true,
    totalQuantity: true,
    serialNumber: true,
    action: true,
    comment: true
  });

  useEffect(() => {
    fetch('http://10.167.49.200:3007/products')
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
    const totals = { monitors: 0, notebooks: 0, accessories: 0 };

    Object.values(orders).forEach(orderGroup => {
      orderGroup.forEach(order => {
        const product = products[order.product_id];
        if (product) {
          if (product.category === 'Monitors') {
            totals.monitors += order.quantity;
          } else if (product.category === 'Notebooks') {
            totals.notebooks += order.quantity;
          } else if (product.category === 'Accessories') {
            totals.accessories += order.quantity;
          }
        }
      });
    });

    return totals;
  }, [products]);

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  useEffect(() => {
    fetch('http://10.167.49.200:3007/orders')
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
       
       // Extract comments from orders
       const comments = {};
       data.forEach(order => {
         if (order.comment) {
           comments[order.order_id] = order.comment;
         }
       });
       setOrderComments(comments);
      })
      .catch(error => console.error('Error fetching orders:', error));
  }, []);

  const handleSerialNumberChange = (order_id, product_id, value) => {
    setSerialNumbers(prev => ({
      ...prev,
      [`${order_id}-${product_id}`]: value,
    }));
  };

  const handleConfirm = (order_id, product_id) => {
    const serialNumber = serialNumbers[`${order_id}-${product_id}`];
    if (!serialNumber) {
      alert('Please enter the serial number.');
      return;
    }

    // Send the confirmation request to the backend
    fetch('http://10.167.49.200:3007/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id,
        product_id,
        serialNumber,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to confirm item');
        }
        return response.json();
      })
      .then(() => {
        alert(`Serial number ${serialNumber} confirmed successfully.`);

        // Clear the serial number input and update the grouped orders to reflect the new quantity
        setSerialNumbers(prev => ({
          ...prev,
          [`${order_id}-${product_id}`]: '',
        }));

        // Update the grouped orders by decreasing the quantity
        setGroupedOrders(prev => {
          const updatedOrders = { ...prev };

          // Find the order and decrease the quantity by 1
          updatedOrders[order_id] = updatedOrders[order_id].map(order => {
            if (order.product_id === product_id && order.quantity > 0) {
              return {
                ...order,
                quantity: order.quantity - 1,
              };
            }
            return order;
          });

          // Filter out orders where the quantity is now 0
          updatedOrders[order_id] = updatedOrders[order_id].filter(order => order.quantity > 0);

          // If no more items in the order, remove the order_id
          if (updatedOrders[order_id].length === 0) {
            delete updatedOrders[order_id];
          }

          return updatedOrders;
        });
      })
      .catch(error => console.error('Error confirming serial number:', error));
  };

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Details
      </Typography>

      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6">Totals</Typography>
        {/* Display totals */}
        <Typography>Monitors: {calculateTotals(groupedOrders).monitors}</Typography>
        <Typography>Notebooks: {calculateTotals(groupedOrders).notebooks}</Typography>
        <Typography>Accessories: {calculateTotals(groupedOrders).accessories}</Typography>
      </Box>

      {/* Column Selection */}
      <Box sx={{ marginBottom: 3, padding: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom>
          Select Columns to Display:
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.productName}
                onChange={() => handleColumnToggle('productName')}
              />
            }
            label="Product Name"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.orderDate}
                onChange={() => handleColumnToggle('orderDate')}
              />
            }
            label="Order Date"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.totalQuantity}
                onChange={() => handleColumnToggle('totalQuantity')}
              />
            }
            label="Total Quantity"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.serialNumber}
                onChange={() => handleColumnToggle('serialNumber')}
              />
            }
            label="Serial Number"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.action}
                onChange={() => handleColumnToggle('action')}
              />
            }
            label="Action"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.comment}
                onChange={() => handleColumnToggle('comment')}
              />
            }
            label="Comment"
          />
        </FormGroup>
      </Box>

      {Object.keys(groupedOrders)
        .filter(order_id => groupedOrders[order_id].some(order => order.quantity > 0)) // Filter out orders with quantity 0
        .map(order_id => (
          <Accordion 
            key={order_id} 
            expanded={expandedOrders[order_id] || false}
            onChange={handleAccordionChange(order_id)}
            sx={{ marginBottom: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${order_id}-content`}
              id={`panel-${order_id}-header`}
              sx={{ backgroundColor: '#f5f5f5' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Order ID: {order_id}
                </Typography>
                {orderComments[order_id] && (
                  <Chip 
                    label="Has Comment" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {visibleColumns.productName && <TableCell>Product Name</TableCell>}
                      {visibleColumns.orderDate && <TableCell>Order Date</TableCell>}
                      {visibleColumns.totalQuantity && <TableCell>Total Quantity</TableCell>}
                      {visibleColumns.serialNumber && <TableCell>Serial Number</TableCell>}
                      {visibleColumns.action && <TableCell>Action</TableCell>}
                      {visibleColumns.comment && <TableCell>Comment</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedOrders[order_id].map(order => {
                      const product = products[order.product_id];
                      return (
                        <TableRow key={`${order.product_id}-${order.order_id}`}>
                          {visibleColumns.productName && <TableCell>{product?.name || 'Unknown Product'}</TableCell>}
                          {visibleColumns.orderDate && <TableCell>{format(new Date(order.order_date), 'yyyy-MM-dd')}</TableCell>}
                          {visibleColumns.totalQuantity && <TableCell>{order.quantity}</TableCell>}
                          {visibleColumns.serialNumber && (
                            <TableCell>
                              <TextField
                                type="text"
                                label="Serial Number"
                                onChange={(e) => handleSerialNumberChange(order_id, order.product_id, e.target.value)}
                                value={serialNumbers[`${order_id}-${order.product_id}`] || ''}
                                placeholder="Enter Serial Number"
                              />
                            </TableCell>
                          )}
                          {visibleColumns.action && (
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleConfirm(order_id, order.product_id)}
                                disabled={order.quantity <= 0}
                              >
                                Confirm
                              </Button>
                            </TableCell>
                          )}
                          {visibleColumns.comment && (
                            <TableCell>
                              {orderComments[order_id] ? (
                                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {orderComments[order_id]}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  No comment
                                </Typography>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
    </Container>
  );
}

export default OrderDetails;



