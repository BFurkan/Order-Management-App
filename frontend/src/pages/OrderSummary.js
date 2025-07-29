import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import theme from './theme';

function OrderSummary() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newOrderId, setNewOrderId] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [editingCommentOrderId, setEditingCommentOrderId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [orderComments, setOrderComments] = useState({});

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
      const response = await fetch('http://10.167.49.203:3004/orders');
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

  const handleEditOrderId = (orderId) => {
    setEditingOrderId(orderId);
    setNewOrderId(orderId);
  };

  const handleSaveOrderId = async () => {
    try {
      const response = await fetch('http://10.167.49.203:3004/update-order-id', {
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

  const handleEditComment = (orderId) => {
    setEditingCommentOrderId(orderId);
    setCommentText(orderComments[orderId] || '');
  };

  const handleSaveComment = async () => {
    try {
      const response = await fetch('http://10.167.49.203:3004/update-order-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: editingCommentOrderId,
          comment: commentText,
        }),
      });

      if (response.ok) {
        // Update local state
        setOrderComments(prev => ({
          ...prev,
          [editingCommentOrderId]: commentText
        }));
        setEditingCommentOrderId(null);
        setCommentText('');
      } else {
        alert('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating comment');
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentOrderId(null);
    setCommentText('');
  };

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Open Orders
        </Typography>

        {/* Table Headers */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '150px 1fr 150px', 
          gap: 2, 
          p: 2, 
          mb: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          fontWeight: 600
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Order ID</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Items Summary</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Date</Typography>
        </Box>

        {Object.keys(groupedOrders).map(orderId => {
          const filteredOrders = groupedOrders[orderId].filter(order => order.quantity > 0);

          if (filteredOrders.length === 0) {
            return null;
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
                sx={{ backgroundColor: '#f9f9f9' }}
              >
                {/* Table-like Row Layout */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '150px 1fr 150px', 
                  gap: 2, 
                  width: '100%',
                  alignItems: 'center'
                }}>
                  {/* Order ID Column */}
                  <Box>
                    {editingOrderId === orderId ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                          value={newOrderId}
                          onChange={(e) => setNewOrderId(e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={handleSaveOrderId}>Save</Button>
                          <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography 
                        variant="h6" 
                        onClick={() => handleEditOrderId(orderId)} 
                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                      >
                        {orderId}
                      </Typography>
                    )}
                  </Box>

                  {/* Items Summary Column */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(() => {
                      const orderTotals = { monitors: 0, notebooks: 0, accessories: 0 };
                      filteredOrders.forEach(order => {
                        const productName = order.product_name.toLowerCase();
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
                        <>
                          {orderTotals.monitors > 0 && (
                            <Chip
                              label={`Monitors: ${orderTotals.monitors}`}
                              size="small"
                              sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                            />
                          )}
                          {orderTotals.notebooks > 0 && (
                            <Chip
                              label={`Notebooks: ${orderTotals.notebooks}`}
                              size="small"
                              sx={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}
                            />
                          )}
                          {orderTotals.accessories > 0 && (
                            <Chip
                              label={`Accessories: ${orderTotals.accessories}`}
                              size="small"
                              sx={{ backgroundColor: '#e8f5e8', color: '#388e3c' }}
                            />
                          )}
                        </>
                      );
                    })()}
                  </Box>

                  {/* Date Column */}
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {format(new Date(filteredOrders[0].order_date), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {/* Order ID Edit Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 'fit-content' }}>
                    Order ID:
                  </Typography>
                  {editingOrderId === orderId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        value={newOrderId}
                        onChange={(e) => setNewOrderId(e.target.value)}
                        size="small"
                        variant="outlined"
                      />
                      <Button size="small" onClick={handleSaveOrderId} variant="contained">Save</Button>
                      <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {orderId}
                      </Typography>
                      <Button size="small" onClick={() => handleEditOrderId(orderId)} variant="outlined">
                        Edit ID
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* Comment Section - Only show when accordion is expanded */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 'fit-content' }}>
                    Comment:
                  </Typography>
                  {editingCommentOrderId === orderId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <TextField
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        size="small"
                        variant="outlined"
                        fullWidth
                        multiline
                        maxRows={2}
                        placeholder="Enter comment..."
                      />
                      <IconButton size="small" onClick={handleSaveComment} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton size="small" onClick={handleCancelCommentEdit}>
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      {orderComments[orderId] && (
                        <Typography 
                          variant="body1" 
                          sx={{ flex: 1 }}
                        >
                          {orderComments[orderId]}
                        </Typography>
                      )}
                      <Button 
                        size="small" 
                        onClick={() => handleEditComment(orderId)}
                        variant="text"
                        sx={{ minWidth: 'auto' }}
                      >
                        Add comment
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* Table with enhanced styling */}
                <TableContainer 
                  component={Paper} 
                  sx={{
                    boxShadow: theme.shadows[4],
                    borderRadius: 2,
                    '& .MuiTable-root': {
                      minWidth: 650,
                    }
                  }}
                >
                  <Table sx={{
                    '& .MuiTableHead-root': {
                      backgroundColor: theme.palette.grey[50],
                    },
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: theme.palette.text.primary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                    },
                    '& .MuiTableCell-body': {
                      fontSize: '0.875rem',
                      padding: '12px 16px',
                    },
                    '& .MuiTableRow-root:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '120px' }}>Product Image</TableCell>
                        <TableCell sx={{ minWidth: '200px' }}>Product Name</TableCell>
                        <TableCell sx={{ width: '120px' }}>Quantity</TableCell>
                        <TableCell sx={{ width: '150px' }}>Order Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <img
                              src={`http://10.167.49.203:3004${order.image}`}
                              alt={order.product_name}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 4 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {order.product_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {order.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(order.order_date), 'MMM dd, yyyy')}
                            </Typography>
                          </TableCell>

                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Container>
    </ThemeProvider>
  );
}

export default OrderSummary; 
