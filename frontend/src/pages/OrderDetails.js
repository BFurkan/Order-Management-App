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
  const [confirmedItems, setConfirmedItems] = useState({}); // Track confirmed items
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderComments, setOrderComments] = useState({});
  const [itemComments, setItemComments] = useState({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [itemCommentDialogOpen, setItemCommentDialogOpen] = useState(false);
  const [currentCommentOrderId, setCurrentCommentOrderId] = useState(null);
  const [currentItemComment, setCurrentItemComment] = useState({ orderId: null, productId: null, itemIndex: null });
  const [commentText, setCommentText] = useState('');
  const [itemCommentText, setItemCommentText] = useState('');
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productName: true,
    orderDate: true,
    itemNumber: true,
    orderedBy: true,
    serialNumber: true,
    action: true,  
    comment: true,
    itemComment: true
  });

  const columnLabels = {
    productName: 'Product Name',
    orderDate: 'Order Date',
    itemNumber: 'Item #',
    orderedBy: 'Ordered By',
    serialNumber: 'Serial Number',
    action: 'Action',
    comment: 'Order Comment',
    itemComment: 'Item Comment'
  };

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://10.167.49.200:3004'}/products`)
      .then(response => response.json())
      .then(data => {
        const productMap = {};
        data.forEach(product => {
          productMap[product.id] = product;
        });
        setProducts(productMap);
      })
      .catch(error => console.error('Error fetching products:', error));

    fetch(`${process.env.REACT_APP_API_URL || 'http://10.167.49.200:3004'}/orders`)
      .then(response => response.json())
      .then(data => {
        // Group orders by order_id
        const grouped = data.reduce((acc, order) => {
          if (!acc[order.order_id]) {
            acc[order.order_id] = [];
          }
          acc[order.order_id].push(order);
          return acc;
        }, {});
        
        setGroupedOrders(grouped);
        
        // Extract comments from orders
        const orderComments = {};
        const productCommentsData = {};
        data.forEach(order => {
          if (order.comment) {
            orderComments[order.order_id] = order.comment;
          }
          if (order.item_comment) {
            productCommentsData[`${order.order_id}-${order.product_id}`] = order.item_comment;
          }
        });
        setOrderComments(orderComments);
        setProductComments(productCommentsData);
        
      })
      .catch(error => console.error('Error fetching orders:', error));
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

  const handleSerialNumberChange = (order_id, product_id, value) => {
    setSerialNumbers(prev => ({
      ...prev,
      [`${order_id}-${product_id}`]: value
    }));
  };

  const handleOpenCommentDialog = (orderId) => {
    setCurrentCommentOrderId(orderId);
    setCommentText(orderComments[orderId] || '');
    setCommentDialogOpen(true);
  };

  const handleSaveComment = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://10.167.49.200:3004'}/update-order-comment`, {
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

  const handleOpenItemCommentDialog = (orderId, productId, itemIndex) => {
    setCurrentItemComment({ orderId, productId, itemIndex });
    setItemCommentText(itemComments[`${orderId}-${productId}-${itemIndex}`] || '');
    setItemCommentDialogOpen(true);
  };

  const handleSaveItemComment = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://10.167.49.200:3004'}/update-item-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: currentItemComment.orderId,
          productId: currentItemComment.productId,
          itemIndex: currentItemComment.itemIndex,
          comment: itemCommentText,
        }),
      });

      if (response.ok) {
        // Update local state
        setItemComments(prev => ({
          ...prev,
          [`${currentItemComment.orderId}-${currentItemComment.productId}-${currentItemComment.itemIndex}`]: itemCommentText
        }));
        setItemCommentDialogOpen(false);
        setCurrentItemComment({ orderId: null, productId: null, itemIndex: null });
        setItemCommentText('');
      } else {
        alert('Failed to update item comment');
      }
    } catch (error) {
      console.error('Error updating item comment:', error);
      alert('Error updating item comment');
    }
  };

  const handleConfirm = (order_id, product_id, itemIndex) => {
    const serialNumber = serialNumbers[`${order_id}-${product_id}-${itemIndex}`];
    if (!serialNumber) {
      alert('Please enter a serial number before confirming.');
      return;
    }

    // Check if this item is already confirmed
    const itemKey = `${order_id}-${product_id}-${itemIndex}`;
    if (confirmedItems[itemKey]) {
      alert('This item has already been confirmed.');
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL || 'http://10.167.49.200:3004'}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, product_id, serialNumber, itemIndex }),
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text || 'Confirmation failed');
          });
        }
        return response.json();
      })
      .then(() => {
        // Mark this specific item as confirmed
        setConfirmedItems(prev => ({
          ...prev,
          [itemKey]: true
        }));

        // Clear the serial number input
        setSerialNumbers(prev => ({
          ...prev,
          [`${order_id}-${product_id}-${itemIndex}`]: '',
        }));
        
        // Show success message
        alert('Item confirmed successfully!');
      })
      .catch(error => {
        console.error('Error confirming order:', error);
        alert(`Error confirming order: ${error.message}`);
      });
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
        .filter(order_id => groupedOrders[order_id].some(order => (order.quantity + (order.confirmed_quantity || 0)) > 0))
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
                      label="Has Order Comment" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                  {groupedOrders[order_id].some(order => {
                    const originalQuantity = order.quantity + (order.confirmed_quantity || 0);
                    return Array.from({length: originalQuantity}, (_, i) => i).some(i => 
                      itemComments[`${order_id}-${order.product_id}-${i}`]
                    );
                  }) && (
                    <Chip 
                      label="Has Item Comments" 
                      size="small" 
                      color="secondary" 
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
                    {orderComments[order_id] ? 'Edit Order Comment' : 'Add Order Comment'}
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
                      {visibleColumns.itemNumber && <TableCell>Item #</TableCell>}
                      {visibleColumns.orderedBy && <TableCell>Ordered By</TableCell>}
                      {visibleColumns.serialNumber && <TableCell>Serial Number</TableCell>}
                      {visibleColumns.action && <TableCell>Action</TableCell>}
                      {visibleColumns.comment && <TableCell>Order Comment</TableCell>}
                      {visibleColumns.itemComment && <TableCell>Item Comment</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedOrders[order_id].map(order => {
                      const product = products[order.product_id];
                      // Create individual rows for each item in the original quantity
                      const originalQuantity = order.quantity + (order.confirmed_quantity || 0);
                      return Array.from({length: originalQuantity}, (_, itemIndex) => (
                        <TableRow key={`${order.product_id}-${order.order_id}-${itemIndex}`}>
                          {visibleColumns.productName && <TableCell>{product?.name || 'Unknown Product'}</TableCell>}
                          {visibleColumns.orderDate && <TableCell>{format(new Date(order.order_date), 'yyyy-MM-dd')}</TableCell>}
                          {visibleColumns.itemNumber && <TableCell>{itemIndex + 1}</TableCell>}
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
                                size="small"
                                onChange={(e) => handleSerialNumberChange(order_id, order.product_id, e.target.value)}
                                value={serialNumbers[`${order_id}-${order.product_id}`] || ''}
                                placeholder="Enter Serial Number"
                              />
                            </TableCell>
                          )}
                          {visibleColumns.action && (
                            <TableCell>
                              {confirmedItems[`${order_id}-${order.product_id}-${itemIndex}`] ? (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  disabled
                                >
                                  Confirmed
                                </Button>
                              ) : (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleConfirm(order_id, order.product_id, itemIndex)}
                                >
                                  Confirm
                                </Button>
                              )}
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
                                  No order comment
                                </Typography>
                              )}
                            </TableCell>
                          )}
                          {visibleColumns.itemComment && (
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {itemComments[`${order_id}-${order.product_id}-${itemIndex}`] ? (
                                  <Typography variant="body2" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {itemComments[`${order_id}-${order.product_id}-${itemIndex}`]}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    No item comment
                                  </Typography>
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                  onClick={() => handleOpenItemCommentDialog(order_id, order.product_id, itemIndex)}
                                  sx={{ minWidth: 'auto', px: 1 }}
                                  disabled={confirmedItems[`${order_id}-${order.product_id}-${itemIndex}`]}
                                >
                                  {itemComments[`${order_id}-${order.product_id}-${itemIndex}`] ? 'Edit Comment' : 'Add Comment'}
                                </Button>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      ));
                    }).flat()}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}

      {/* Order Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {orderComments[currentCommentOrderId] ? 'Edit Order Comment' : 'Add Order Comment'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            This comment applies to the entire order (Order ID: {currentCommentOrderId})
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            label="Order Comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your order comment here..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveComment} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Item Comment Dialog */}
      <Dialog open={itemCommentDialogOpen} onClose={() => setItemCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {itemComments[`${currentItemComment.orderId}-${currentItemComment.productId}-${currentItemComment.itemIndex}`] ? 'Edit Item Comment' : 'Add Item Comment'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            This comment applies to Item #{(currentItemComment.itemIndex || 0) + 1} in Order ID: {currentItemComment.orderId}
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            label="Item Comment"
            value={itemCommentText}
            onChange={(e) => setItemCommentText(e.target.value)}
            placeholder="Enter your item comment here..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveItemComment} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OrderDetails;



