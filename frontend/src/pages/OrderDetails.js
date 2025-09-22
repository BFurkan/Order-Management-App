import React, { useState, useEffect } from 'react';
import { 
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
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Grid
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  Edit as EditIcon // Import Edit Icon
} from '@mui/icons-material';
// Removed DataGrid import to avoid compatibility issues
import { ThemeProvider } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { safeFormatDate, safeToISODate } from '../utils/dateUtils';
import theme from './theme';
import ColumnSelector from '../components/ColumnSelector';
import { supabase } from '../supabaseClient'; // Import Supabase

function OrderDetails() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [serialNumbers, setSerialNumbers] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrderGroup, setEditingOrderGroup] = useState(null);
  
  // Order-level comments
  const [orderComments, setOrderComments] = useState({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentCommentOrderId, setCurrentCommentOrderId] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  // Product-level comments
  const [productComments, setProductComments] = useState({});
  const [productCommentDialogOpen, setProductCommentDialogOpen] = useState(false);
  const [currentProductComment, setCurrentProductComment] = useState({ orderId: null, productId: null });
  const [productCommentText, setProductCommentText] = useState('');
  

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productName: true,
    orderDate: true,
    totalQuantity: true,
    serialNumber: true,
    action: true,
    orderComment: true,
    productComment: true
  });

  const columnLabels = {
    productName: 'Product Name',
    orderDate: 'Order Date',
    totalQuantity: 'Total Quantity',
    serialNumber: 'Serial Number',
    action: 'Action',
    orderComment: 'Order Comment',
    productComment: 'Product Comment'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // 1. Get the IDs of all orders that have already been confirmed.
      const { data: confirmedOrders, error: confirmedError } = await supabase
        .from('confirmed_items')
        .select('order_id');
      if (confirmedError) throw confirmedError;
      const confirmedIdSet = new Set((confirmedOrders || []).map(c => c.order_id));

      // 2. Fetch all orders.
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select(`*, product:products(name, image)`);
      if (allOrdersError) throw allOrdersError;

      // 3. Filter on the client-side to get only the "open" orders.
      const openOrders = allOrders.filter(order => !confirmedIdSet.has(order.id));
      
      const sortedData = openOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

      const grouped = sortedData.reduce((acc, order) => {
        const enrichedOrder = {
          ...order,
          product_name: order.product?.name || 'N/A',
          image: order.product?.image ? supabase.storage.from('product-images').getPublicUrl(order.product.image).data.publicUrl : '/placeholder.png'
        };

        if (!acc[enrichedOrder.order_id]) {
          acc[enrichedOrder.order_id] = [];
        }
        acc[enrichedOrder.order_id].push(enrichedOrder);
        return acc;
      }, {});

      setGroupedOrders(grouped);

      const comments = {};
      openOrders.forEach(order => {
        if (order.comment) comments[order.order_id] = order.comment;
      });
      setOrderComments(comments);

      const productCommentsData = {};
      openOrders.forEach(order => {
        if (order.item_comment) productCommentsData[`${order.order_id}-${order.product_id}`] = order.item_comment;
      });
      setProductComments(productCommentsData);

    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleExport = (orderId) => {
    const orders = groupedOrders[orderId] || [];
    const activeOrders = orders.filter(order => order.quantity > 0);
    
    const csvContent = [
      ['Product Name', 'Order Date', 'Total Quantity'].join(','),
      ...activeOrders.map(order => [
        `"${order.product_name}"`,
        `"${safeFormatDate(order.order_date)}"`,
        order.quantity,

      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-details-${orderId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // No need to fetch products for this page - removed unused variable
  }, []);

  const handleSerialNumberChange = (order_id, product_id, value) => {
    setSerialNumbers(prev => ({
      ...prev,
      [`${order_id}-${product_id}`]: value,
    }));
  };

  // Order-level comment handlers
  const handleOpenCommentDialog = (orderId) => {
    setCurrentCommentOrderId(orderId);
    setCommentText(orderComments[orderId] || '');
    setCommentDialogOpen(true);
  };

  const handleSaveComment = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ comment: commentText })
        .eq('order_id', currentCommentOrderId);

      if (error) throw error;

      setOrderComments(prev => ({
        ...prev,
        [currentCommentOrderId]: commentText
      }));
      setCommentDialogOpen(false);
      setCurrentCommentOrderId(null);
      setCommentText('');

    } catch (error) {
      console.error('Error updating comment:', error.message);
      alert('Error updating comment');
    }
  };

  // Product-level comment handlers
  const handleOpenProductCommentDialog = (orderId, productId) => {
    setCurrentProductComment({ orderId, productId });
    setProductCommentText(productComments[`${orderId}-${productId}`] || '');
    setProductCommentDialogOpen(true);
  };

  const handleSaveProductComment = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ item_comment: productCommentText })
        .match({ order_id: currentProductComment.orderId, product_id: currentProductComment.productId });

      if (error) throw error;

      setProductComments(prev => ({
        ...prev,
        [`${currentProductComment.orderId}-${currentProductComment.productId}`]: productCommentText
      }));
      setProductCommentDialogOpen(false);
      setCurrentProductComment({ orderId: null, productId: null });
      setProductCommentText('');

    } catch (error) {
      console.error('Error updating product comment:', error.message);
      alert('Error updating product comment');
    }
  };

  const handleConfirm = async (order, serialNumber) => {
    if (!serialNumber) {
      alert('Please enter a serial number before confirming.');
      return;
    }

    try {
      // 1. Create a new row in the confirmed_items table.
      const { data: confirmedItem, error: insertError } = await supabase
        .from('confirmed_items')
        .insert({
          order_id: order.id,
          serial_number: serialNumber,
          item_comment: order.item_comment
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Decrement the quantity of the original order.
      if (order.quantity > 0) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ quantity: order.quantity - 1 })
          .eq('id', order.id);
        
        if (updateError) throw updateError;
      }

      alert('Item confirmed successfully!');
      fetchOrders(); // Re-fetch the list of open orders.
      
    } catch (error) {
      console.error('Error confirming order:', error.message);
      alert('Failed to confirm order');
    }
  };

  const handleOpenEditModal = (orderGroupId) => {
    const itemsInGroup = groupedOrders[orderGroupId];
    setEditingOrderGroup({
      order_group_id: orderGroupId,
      order_date: itemsInGroup[0].order_date,
      comment: itemsInGroup[0].comment || '',
      items: itemsInGroup.map(item => ({ id: item.id, product_name: item.product_name, quantity: item.quantity }))
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOrderGroup(null);
  };

  const handleSaveChanges = async () => {
    if (!editingOrderGroup) return;

    try {
      // 1. Update common fields for all items in the group
      const { error: groupError } = await supabase
        .from('orders')
        .update({
          order_group_id: editingOrderGroup.order_group_id, // Allow editing the group id
          order_date: editingOrderGroup.order_date,
          comment: editingOrderGroup.comment
        })
        .eq('order_group_id', editingOrderGroup.order_group_id);

      if (groupError) throw groupError;

      // 2. Update quantities for each individual item
      for (const item of editingOrderGroup.items) {
        const { error: itemError } = await supabase
          .from('orders')
          .update({ quantity: item.quantity })
          .eq('id', item.id);
        
        if (itemError) throw itemError;
      }
      
      alert('Order updated successfully!');
      handleCloseEditModal();
      fetchOrders(); // Refresh data

    } catch (error) {
      console.error('Error updating order:', error.message);
      alert('Failed to update order.');
    }
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
          Order Details
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
          const orders = groupedOrders[orderId];
          // Filter out fully confirmed items (quantity = 0)
          const activeOrders = orders.filter(order => order.quantity > 0);
          
          // If no active orders, don't render the accordion
          if (activeOrders.length === 0) {
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
                sx={{ backgroundColor: '#f5f5f5' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">
                      Order Group ID: {orderId}
                    </Typography>
                    
                    {/* Category totals beside Order ID - only count active orders */}
                    {(() => {
                      const orderTotals = { monitors: 0, notebooks: 0, accessories: 0 };
                      activeOrders.forEach(order => {
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
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
                        </Box>
                      );
                    })()}
                  </Box>
                  
                  {/* Order date on the right */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {activeOrders.length > 0 ? safeFormatDate(activeOrders[0].order_date) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {/* Export and Edit Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEditModal(orderId)}
                    size="small"
                  >
                    Edit Order
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={() => handleExport(orderId)}
                    size="small"
                  >
                    Export to CSV
                  </Button>
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

                        <TableCell sx={{ width: '200px' }}>Serial Number</TableCell>
                        <TableCell sx={{ width: '150px' }}>Order Comment</TableCell>
                        <TableCell sx={{ width: '200px' }}>Item Comment</TableCell>
                        <TableCell sx={{ width: '120px' }}>Confirm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeOrders.map((order, index) => (
                        <TableRow key={`${orderId}-${index}`} hover>
                          <TableCell>
                            <img
                              src={order.image}
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
                              {safeFormatDate(order.order_date)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Enter serial number"
                                value={serialNumbers[`${order.order_id}-${order.product_id}`] || ''}
                                onChange={(e) => handleSerialNumberChange(order.order_id, order.product_id, e.target.value)}
                                variant="outlined"
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleConfirm(order, serialNumbers[`${order.order_id}-${order.product_id}`])}
                                sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                              >
                                Confirm
                              </Button>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleOpenCommentDialog(orderId)}
                                sx={{ fontSize: '0.75rem', mb: 1 }}
                              >
                                Edit Order Comment
                              </Button>
                              {orderComments[orderId] && (
                                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                  {orderComments[orderId].length > 50 
                                    ? `${orderComments[orderId].substring(0, 50)}...` 
                                    : orderComments[orderId]
                                  }
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleOpenProductCommentDialog(order.order_id, order.product_id)}
                                sx={{ fontSize: '0.75rem', mb: 1 }}
                              >
                                Edit Item Comment
                              </Button>
                              {productComments[`${order.order_id}-${order.product_id}`] && (
                                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                  {productComments[`${order.order_id}-${order.product_id}`].length > 50 
                                    ? `${productComments[`${order.order_id}-${order.product_id}`].substring(0, 50)}...` 
                                    : productComments[`${order.order_id}-${order.product_id}`]
                                  }
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleConfirm(order, serialNumbers[`${order.order_id}-${order.product_id}`])}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Confirm
                            </Button>
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

        {/* Order Comment Dialog */}
        <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Order Comment</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Order Comment"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveComment} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Product Comment Dialog */}
        <Dialog open={productCommentDialogOpen} onClose={() => setProductCommentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Product Comment</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Product Comment"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={productCommentText}
              onChange={(e) => setProductCommentText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductCommentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProductComment} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Order Modal */}
        <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogContent>
            {editingOrderGroup && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Order Group ID"
                    fullWidth
                    value={editingOrderGroup.order_group_id}
                    onChange={(e) => setEditingOrderGroup(prev => ({ ...prev, order_group_id: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Order Date"
                    type="date"
                    fullWidth
                    value={safeToISODate(editingOrderGroup.order_date)}
                    onChange={(e) => setEditingOrderGroup(prev => ({ ...prev, order_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Order Comment"
                    fullWidth
                    multiline
                    rows={2}
                    value={editingOrderGroup.comment}
                    onChange={(e) => setEditingOrderGroup(prev => ({ ...prev, comment: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Items</Typography>
                  {editingOrderGroup.items.map((item, index) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Typography sx={{ flexGrow: 1 }}>{item.product_name}</Typography>
                      <TextField
                        label="Quantity"
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...editingOrderGroup.items];
                          newItems[index].quantity = parseInt(e.target.value, 10) || 0;
                          setEditingOrderGroup(prev => ({ ...prev, items: newItems }));
                        }}
                        inputProps={{ min: 0 }}
                      />
                    </Box>
                  ))}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Cancel</Button>
            <Button onClick={handleSaveChanges} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default OrderDetails;



