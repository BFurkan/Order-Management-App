import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Typography, Button, TextField, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import ColumnSelector from '../components/ColumnSelector';

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
    orderedBy: true,
    comment: true
  });

  const columnLabels = {
    productImage: 'Product Image',
    product: 'Product Name',
    orderedQuantity: 'Ordered Quantity',
    orderDate: 'Order Date',
    orderedBy: 'Ordered By',
    comment: 'Comment'
  };

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/orders');
      const data = await response.json();
      
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
      const comments = {};
      data.forEach(order => {
        if (order.comment) {
          comments[order.order_id] = order.comment;
        }
      });
      setOrderComments(comments);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleEditOrderId = (orderId) => {
    setEditingOrderId(orderId);
    setNewOrderId(orderId);
  };

  const handleSaveOrderId = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/update-order-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldOrderId: editingOrderId,
          newOrderId: newOrderId,
        }),
      });

      if (response.ok) {
        // Update the local state
        const updatedGroupedOrders = { ...groupedOrders };
        updatedGroupedOrders[newOrderId] = updatedGroupedOrders[editingOrderId];
        delete updatedGroupedOrders[editingOrderId];
        setGroupedOrders(updatedGroupedOrders);
        
        // Update comments if they exist
        if (orderComments[editingOrderId]) {
          const updatedComments = { ...orderComments };
          updatedComments[newOrderId] = updatedComments[editingOrderId];
          delete updatedComments[editingOrderId];
          setOrderComments(updatedComments);
        }
        
        setEditingOrderId(null);
        setNewOrderId('');
      } else {
        alert('Failed to update order ID');
      }
    } catch (error) {
      console.error('Error updating order ID:', error);
      alert('Error updating order ID');
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setNewOrderId('');
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

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Summary
      </Typography>
      
      {/* Column Selection */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <ColumnSelector
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          columnLabels={columnLabels}
        />
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        value={newOrderId}
                        onChange={(e) => setNewOrderId(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button size="small" onClick={(e) => { e.stopPropagation(); handleSaveOrderId(); }}>
                        Save
                      </Button>
                      <Button size="small" onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}>
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">
                        Order ID: {orderId}
                      </Typography>
                      {/* Category totals beside Order ID */}
                      {(() => {
                        const orderTotals = { monitors: 0, notebooks: 0, accessories: 0 };
                        filteredOrders.forEach(order => {
                          const productName = order.product_name.toLowerCase();
                          // First check for accessories (to avoid misclassification)
                          if (productName.includes('dock') || productName.includes('docking') ||
                              productName.includes('charger') || productName.includes('adapter') ||
                              productName.includes('cable') || productName.includes('mouse') ||
                              productName.includes('keyboard') || productName.includes('headset') ||
                              productName.includes('webcam') || productName.includes('speaker') ||
                              productName.includes('hub') || productName.includes('stand') ||
                              productName.includes('bag') || productName.includes('case')) {
                            orderTotals.accessories += order.quantity;
                          } else if (productName.includes('monitor') || productName.includes('display')) {
                            orderTotals.monitors += order.quantity;
                          } else if (productName.includes('notebook') || productName.includes('laptop') || 
                                     productName.includes('thinkpad') || productName.includes('elitebook') || 
                                     productName.includes('macbook') || productName.includes('surface') ||
                                     productName.includes('k14') || productName.includes('lenovo') ||
                                     productName.includes('ideapad') || productName.includes('yoga') ||
                                     productName.includes('inspiron') || productName.includes('latitude') ||
                                     productName.includes('pavilion') || productName.includes('probook') ||
                                     productName.includes('toughbook') || productName.includes('fz55')) {
                            orderTotals.notebooks += order.quantity;
                          } else {
                            orderTotals.accessories += order.quantity;
                          }
                        });
                        return (
                          <Box sx={{ display: 'flex', gap: 1, fontSize: '0.75rem' }}>
                            {orderTotals.monitors > 0 && (
                              <Typography variant="caption" sx={{ backgroundColor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1 }}>
                                Monitors: {orderTotals.monitors}
                              </Typography>
                            )}
                            {orderTotals.notebooks > 0 && (
                              <Typography variant="caption" sx={{ backgroundColor: '#f3e5f5', px: 1, py: 0.5, borderRadius: 1 }}>
                                Notebooks: {orderTotals.notebooks}
                              </Typography>
                            )}
                            {orderTotals.accessories > 0 && (
                              <Typography variant="caption" sx={{ backgroundColor: '#e8f5e8', px: 1, py: 0.5, borderRadius: 1 }}>
                                Accessories: {orderTotals.accessories}
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                    </Box>
                  )}
                </Box>
                {/* Order date on the right side */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    {filteredOrders.length > 0 && format(new Date(filteredOrders[0].order_date), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Edit Order ID Section */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f0f8ff', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Order ID Management
                  </Typography>
                  {editingOrderId !== orderId ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEditOrderId(orderId)}
                    >
                      Edit Order ID
                    </Button>
                  ) : null}
                </Box>
                {editingOrderId === orderId ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <TextField
                      size="small"
                      value={newOrderId}
                      onChange={(e) => setNewOrderId(e.target.value)}
                      label="New Order ID"
                      variant="outlined"
                    />
                    <Button size="small" variant="contained" onClick={handleSaveOrderId}>
                      Save
                    </Button>
                    <Button size="small" variant="outlined" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ p: 1, backgroundColor: '#f8f9fa', borderRadius: 1, color: '#6c757d', fontStyle: 'italic' }}>
                    Current Order ID: <strong style={{ color: '#495057' }}>{orderId}</strong>
                  </Typography>
                )}
              </Box>

              {/* Order Comment Section */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Order Comment
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenCommentDialog(orderId)}
                  >
                    {orderComments[orderId] ? 'Edit Comment' : 'Add Comment'}
                  </Button>
                </Box>
                {orderComments[orderId] ? (
                  <Typography variant="body2" sx={{ p: 1, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    {orderComments[orderId]}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                    No order comment added yet
                  </Typography>
                )}
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {visibleColumns.productImage && <TableCell>Product Image</TableCell>}
                      {visibleColumns.product && <TableCell>Product</TableCell>}
                      {visibleColumns.orderedQuantity && <TableCell>Ordered Quantity</TableCell>}
                      {visibleColumns.orderDate && <TableCell>Order Date</TableCell>}
                      {visibleColumns.orderedBy && <TableCell>Ordered By</TableCell>}
                      {visibleColumns.comment && <TableCell>Comment</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        {visibleColumns.productImage && (
                          <TableCell>
                            <img src={`http://10.167.49.200:3007${order.image}`} alt={order.product_name} style={{ width: '100px' }} />
                          </TableCell>
                        )}
                        {visibleColumns.product && <TableCell>{order.product_name}</TableCell>}
                        {visibleColumns.orderedQuantity && <TableCell>{order.quantity}</TableCell>}
                        {visibleColumns.orderDate && <TableCell>{format(new Date(order.order_date), 'yyyy-MM-dd')}</TableCell>}
                        {visibleColumns.orderedBy && (
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getDisplayName(order.ordered_by)}
                            </Typography>
                          </TableCell>
                        )}
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

export default OrderSummary;
