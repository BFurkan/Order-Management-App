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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import ColumnSelector from '../components/ColumnSelector';

function OrderDetails() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [products, setProducts] = useState({});
  const [serialNumbers, setSerialNumbers] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderComments, setOrderComments] = useState({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentCommentOrderId, setCurrentCommentOrderId] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productName: true,
    orderDate: true,
    totalQuantity: true,
    orderedBy: true,
    serialNumber: true,
    action: true,
    comment: true
  });

  const columnLabels = {
    productName: 'Product Name',
    orderDate: 'Order Date',
    totalQuantity: 'Total Quantity',
    orderedBy: 'Ordered By',
    serialNumber: 'Serial Number',
    action: 'Action',
    comment: 'Comment'
  };

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

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

  const handleOpenCommentDialog = (orderId) => {
    setCurrentCommentOrderId(orderId);
    setCommentText(orderComments[orderId] || '');
    setCommentDialogOpen(true);
  };

  const handleSaveComment = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/update-order-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: currentCommentOrderId,
          comment: commentText,
        }),
      });

      if (response.ok) {
        // Update local state
        setOrderComments(prev => ({
          ...prev,
          [currentCommentOrderId]: commentText
        }));
        setCommentDialogOpen(false);
        setCurrentCommentOrderId(null);
        setCommentText('');
      } else {
        alert('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating comment');
    }
  };

  const handleConfirm = (order_id, product_id) => {
    const serialNumber = serialNumbers[`${order_id}-${product_id}`];
    if (!serialNumber) {
      alert('Please enter a serial number before confirming.');
      return;
    }

    fetch('http://10.167.49.200:3007/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, product_id, serialNumber }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Confirmation failed');
        }
        return response.json();
      })
      .then(() => {
        // Update the local state to reflect the confirmation
        setGroupedOrders(prevGroupedOrders => {
          const updatedOrders = { ...prevGroupedOrders };
          updatedOrders[order_id] = updatedOrders[order_id].map(order => {
            if (order.product_id === product_id && order.quantity > 0) {
              return { ...order, quantity: order.quantity - 1 };
            }
            return order;
          });
          return updatedOrders;
        });

        // Clear the serial number input
        setSerialNumbers(prev => ({
          ...prev,
          [`${order_id}-${product_id}`]: '',
        }));
      })
      .catch(error => console.error('Error confirming order:', error));
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
        <Typography>Monitors: {calculateTotals(groupedOrders).monitors}</Typography>
        <Typography>Notebooks: {calculateTotals(groupedOrders).notebooks}</Typography>
        <Typography>Accessories: {calculateTotals(groupedOrders).accessories}</Typography>
      </Box>

      {/* Column Selection */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <ColumnSelector
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          columnLabels={columnLabels}
        />
      </Box>

      {Object.keys(groupedOrders)
        .filter(order_id => groupedOrders[order_id].some(order => order.quantity > 0))
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {orderComments[order_id] && (
                    <Chip 
                      label="Has Comment" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCommentDialog(order_id);
                    }}
                  >
                    {orderComments[order_id] ? 'Edit Comment' : 'Add Comment'}
                  </Button>
                </Box>
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
                      {visibleColumns.orderedBy && <TableCell>Ordered By</TableCell>}
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
                          {visibleColumns.orderedBy && (
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {getDisplayName(order.ordered_by)}
                              </Typography>
                            </TableCell>
                          )}
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

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {orderComments[currentCommentOrderId] ? 'Edit Comment' : 'Add Comment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            label="Comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your comment here..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveComment} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OrderDetails;



