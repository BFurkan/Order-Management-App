import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Typography, Button, TextField, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';

function OrderSummary() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newOrderId, setNewOrderId] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentCommentOrderId, setCurrentCommentOrderId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [orderComments, setOrderComments] = useState({});
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productImage: true,
    product: true,
    orderedQuantity: true,
    orderDate: true,
    comment: true
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/orders');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const ordersWithImages = await Promise.all(data.map(async (order) => {
        if (order.product_id) {
          try {
            const productResponse = await fetch(`http://10.167.49.200:3007/products/${order.product_id}`);
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
      
      // Extract comments from orders
      const comments = {};
      ordersWithImages.forEach(order => {
        if (order.comment) {
          comments[order.order_id] = order.comment;
        }
      });
      setOrderComments(comments);
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

      const response = await fetch('http://10.167.49.200:3007/update-order-id', {
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

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  const handleCommentClick = (orderId) => {
    setCurrentCommentOrderId(orderId);
    setCommentText(orderComments[orderId] || '');
    setCommentDialogOpen(true);
  };

  const handleCommentSave = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/update-order-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId: currentCommentOrderId, 
          comment: commentText 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      // Update local state
      setOrderComments(prev => ({
        ...prev,
        [currentCommentOrderId]: commentText
      }));

      setCommentDialogOpen(false);
      setCurrentCommentOrderId(null);
      setCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Summary
      </Typography>
      
      {/* Column Selection */}
      <Box sx={{ marginBottom: 3, padding: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom>
          Select Columns to Display:
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.productImage}
                onChange={() => handleColumnToggle('productImage')}
              />
            }
            label="Product Image"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.product}
                onChange={() => handleColumnToggle('product')}
              />
            }
            label="Product"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleColumns.orderedQuantity}
                onChange={() => handleColumnToggle('orderedQuantity')}
              />
            }
            label="Ordered Quantity"
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
                checked={visibleColumns.comment}
                onChange={() => handleColumnToggle('comment')}
              />
            }
            label="Comment"
          />
        </FormGroup>
      </Box>

      {Object.keys(groupedOrders).map(orderId => {
        const filteredOrders = groupedOrders[orderId].filter(order => order.quantity > 0);

        if (filteredOrders.length === 0) {
          return null; // Don't render anything if all orders have a quantity of 0
        }

        return (
          <Accordion 
            key={orderId} 
            expanded={expandedOrders[orderId] || false}
            onChange={handleAccordionChange(orderId)}
            sx={{ marginBottom: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${orderId}-content`}
              id={`panel-${orderId}-header`}
              sx={{ backgroundColor: '#f5f5f5' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {editingOrderId === orderId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField
                        value={newOrderId}
                        onChange={handleOrderIdChange}
                        autoFocus
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateOrderId(editingOrderId, newOrderId);
                        }}
                        variant="contained"
                        color="primary"
                        size="small"
                      >
                        Confirm
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOrderId(null);
                        }}
                        variant="outlined"
                        color="secondary"
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">
                        Order ID: {orderId}
                      </Typography>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrderId(orderId);
                        }} 
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommentClick(orderId);
                        }} 
                        size="small"
                        variant="outlined"
                      >
                        Comment
                      </Button>
                    </Box>
                  )}
                </Box>
                {orderComments[orderId] && (
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
                      {visibleColumns.productImage && <TableCell>Product Image</TableCell>}
                      {visibleColumns.product && <TableCell>Product</TableCell>}
                      {visibleColumns.orderedQuantity && <TableCell>Ordered Quantity</TableCell>}
                      {visibleColumns.orderDate && <TableCell>Order Date</TableCell>}
                      {visibleColumns.comment && <TableCell>Comment</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map(order => (
                      <TableRow key={order.id}>
                        {visibleColumns.productImage && (
                          <TableCell>
                            {order.product_image ? (
                              <img src={`http://10.167.49.200:3007${order.product_image}`} alt={order.product_name} style={{ width: '100px' }} />
                            ) : (
                              <Typography>No Image</Typography>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.product && <TableCell>{order.product_name}</TableCell>}
                        {visibleColumns.orderedQuantity && <TableCell>{order.quantity}</TableCell>}
                        {visibleColumns.orderDate && <TableCell>{format(new Date(order.order_date), 'yyyy-MM-dd')}</TableCell>}
                        {visibleColumns.comment && (
                          <TableCell>
                            {orderComments[orderId] ? (
                              <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {orderComments[orderId]}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No comment
                              </Typography>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
     })}

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add/Edit Comment for Order ID: {currentCommentOrderId}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your comment here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCommentSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OrderSummary;
