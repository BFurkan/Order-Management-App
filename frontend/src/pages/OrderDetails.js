import React, { useState, useEffect, useMemo } from 'react';
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
  FileDownload as ExportIcon
} from '@mui/icons-material';
// Removed DataGrid import to avoid compatibility issues
import { ThemeProvider } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { safeFormatDate } from '../utils/dateUtils';
import theme from './theme';
import ColumnSelector from '../components/ColumnSelector';
import { supabase } from '../supabaseClient';

function OrderDetails() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [serialNumbers, setSerialNumbers] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  
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
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrderId, setEditedOrderId] = useState('');
  const [editedComment, setEditedComment] = useState('');
  const [editedQuantity, setEditedQuantity] = useState('');
  const [editedOrderDate, setEditedOrderDate] = useState('');
  const [editingOrderGroup, setEditingOrderGroup] = useState(null);


  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    orderId: true,
    itemsSummary: true,
    productName: true,
    location: false, // Set location to be hidden by default
    comment: true,
    date: true,
    customerOrderId: true,
    image: true
  });

  const columnLabels = {
    orderId: 'Order ID',
    itemsSummary: 'Item Summary',
    productName: 'Product Name',
    location: 'Location', // Add location label
    comment: 'Comments',
    date: 'Order Date',
    customerOrderId: 'Customer Order ID'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, product:products(*)')
        .gt('quantity', 0); // Only fetch orders with items to be confirmed

      if (error) throw error;

      if (!Array.isArray(data) || data.length === 0) {
        setGroupedOrders({});
        return;
      }

      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.order_date);
        const dateB = new Date(b.order_date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
        return (a.customer_order_id || '').localeCompare(b.customer_order_id || '');
      });
      
      const grouped = sortedData.reduce((acc, order) => {
        const cleanOrderId = order.order_id ? order.order_id.trim() : order.order_id;
        if (!acc[cleanOrderId]) {
          acc[cleanOrderId] = [];
        }
        acc[cleanOrderId].push(order);
        return acc;
      }, {});
      setGroupedOrders(grouped);

      const comments = {};
      data.forEach(order => {
        if (order.comment) {
          const cleanOrderId = order.order_id ? order.order_id.trim() : order.order_id;
          comments[cleanOrderId] = order.comment;
        }
      });
      setOrderComments(comments);

      const productCommentsData = {};
      data.forEach(order => {
        if (order.item_comment) {
          const cleanOrderId = order.order_id ? order.order_id.trim() : order.order_id;
          productCommentsData[`${cleanOrderId}-${order.product_id}`] = order.item_comment;
        }
      });
      setProductComments(productCommentsData);

    } catch (error) {
      console.error('Error fetching orders:', error);
      // Handle the error appropriately in the UI
    }
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleExport = (orderId) => {
    const norm = (v) => (v == null ? v : String(v).trim());
    const orders = groupedOrders[orderId] || groupedOrders[norm(orderId)] || [];
    // Prefer remaining (unconfirmed) items; if none, export the group anyway
    const rows = orders.filter(order => (order.quantity || 0) > 0);
    const exportRows = rows.length > 0 ? rows : orders;

    const csvContent = [
      ['Product Name', 'Order Date', 'Total Quantity'].join(','),
      ...exportRows.map(order => [
        `"${order.product_name}"`,
        `"${safeFormatDate(order.order_date)}"`,
        (order.quantity || 0),
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

  // Remove redundant second fetch block to avoid stale grouping by old order IDs

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
    if (!currentCommentOrderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ comment: commentText })
        .eq('order_id', currentCommentOrderId);

      if (error) throw error;

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
    if (!currentProductComment.orderId || !currentProductComment.productId) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ item_comment: productCommentText })
        .eq('order_id', currentProductComment.orderId)
        .eq('product_id', currentProductComment.productId);

      if (error) throw error;

      // Update local state
      setProductComments(prev => ({
        ...prev,
        [`${currentProductComment.orderId}-${currentProductComment.productId}`]: productCommentText
      }));
      setProductCommentDialogOpen(false);
      setCurrentProductComment({ orderId: null, productId: null });
      setProductCommentText('');
    } catch (error) {
      console.error('Error updating product comment:', error);
      alert('Error updating product comment');
    }
  };

  const handleConfirm = async (order, serialNumber, clearInput) => {
    if (!serialNumber) {
      alert('Please enter a serial number before confirming.');
      return;
    }

    try {
      // 1. Check current quantity to prevent race conditions
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('quantity')
        .eq('id', order.id)
        .single();

      if (fetchError || !currentOrder) {
        throw new Error('Could not fetch current order quantity. Please refresh and try again.');
      }

      if (currentOrder.quantity <= 0) {
        alert('This item is already fully confirmed.');
        clearInput(); // Clear the input field
        // Re-fetch the orders to update the quantity in the table
        const { data: updatedOrders, error: reFetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('order_group_id', order.order_group_id);
        if (reFetchError) {
          console.error('Error re-fetching orders:', reFetchError);
          alert('Failed to update order quantity after confirmation.');
        } else {
          setGroupedOrders(prev => ({
            ...prev,
            [order.order_id]: updatedOrders
          }));
        }
        return;
      }

      // 2. Create a new row in the confirmed_items table.
      const { error: insertError } = await supabase
        .from('confirmed_items')
        .insert({
          order_id: order.id, // Link to the original order row
          serial_number: serialNumber,
          item_comment: order.item_comment
        });

      if (insertError) throw insertError;

      // 3. Decrement the quantity of the original order.
      const { error: updateError } = await supabase
        .from('orders')
        .update({ quantity: currentOrder.quantity - 1 })
        .eq('id', order.id);

      if (updateError) throw updateError;

      alert('Item confirmed successfully!');
      clearInput(); // Clear the input field on success
      // Re-fetch the orders to update the quantity in the table
      const { data: updatedOrders, error: reFetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_group_id', order.order_group_id);
      if (reFetchError) {
        console.error('Error re-fetching orders:', reFetchError);
        alert('Failed to update order quantity after confirmation.');
      } else {
        setGroupedOrders(prev => ({
          ...prev,
          [order.order_id]: updatedOrders
        }));
      }

    } catch (error) {
      console.error('Error confirming order:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      alert('Failed to confirm order');
    }
  };

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  // Edit modal handlers
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setEditedOrderId(order.order_id);
    setEditedComment(orderComments[order.order_id] || '');
    setEditedQuantity(order.quantity?.toString() || '');
    setEditedOrderDate(order.order_date ? String(order.order_date).slice(0, 10) : '');
    setEditModalOpen(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedOrderId(selectedOrder?.order_id || '');
    setEditedComment(orderComments[selectedOrder?.order_id] || '');
    setEditedQuantity(selectedOrder?.quantity?.toString() || '');
    setEditedOrderDate(selectedOrder?.order_date ? String(selectedOrder.order_date).slice(0, 10) : '');
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;

    try {
      const updates = {};
      if (editedComment !== (orderComments[selectedOrder.order_id] || '')) {
        updates.comment = editedComment;
      }
      if (editedQuantity !== '' && parseInt(editedQuantity) !== selectedOrder.quantity) {
        updates.quantity = parseInt(editedQuantity);
      }
      if (editedOrderDate && editedOrderDate !== selectedOrder.order_date) {
        updates.order_date = editedOrderDate;
      }
      if (editedOrderId && editedOrderId !== selectedOrder.order_id) {
        updates.order_id = editedOrderId;
      }

      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', selectedOrder.id);

        if (error) throw error;
      }

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm('Delete this product from the order?')) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', selectedOrder.id);

      if (error) throw error;
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const handleOpenEditModal = (orderGroup) => {
    // Ensure all properties have a default value to prevent uncontrolled input warnings
    setEditingOrderGroup({
      ...orderGroup,
      customer_order_id: orderGroup.customer_order_id || '',
      comment: orderGroup.comment || '',
      items: orderGroup.items.map(item => ({
        ...item,
        quantity: item.quantity || 0
      }))
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingOrderGroup(null);
    setEditModalOpen(false);
  };

  const handleSaveChanges = async () => {
    try {
      // 1. Update the main order details (date, comment, customer_order_id) for the entire group.
      const { error: groupUpdateError } = await supabase
        .from('orders')
        .update({
          order_date: editingOrderGroup.order_date,
          comment: editingOrderGroup.comment,
          customer_order_id: editingOrderGroup.customer_order_id,
        })
        .eq('order_group_id', editingOrderGroup.order_group_id);

      if (groupUpdateError) throw groupUpdateError;

      // 2. Update individual order details (quantity) for each item in the group.
      for (const item of editingOrderGroup.items) {
        const { error: itemUpdateError } = await supabase
          .from('orders')
          .update({ quantity: item.quantity })
          .eq('id', item.id);

        if (itemUpdateError) {
          throw itemUpdateError;
        }
      }

      alert('Order details updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating order details:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      alert('Failed to update order details');
    }
  };

  const getHeaderCellStyle = (isVisible) => ({
    display: isVisible ? 'table-cell' : 'none',
    width: isVisible ? 'auto' : 0,
  });

  const getCellStyle = (isVisible) => ({
    display: isVisible ? 'table-cell' : 'none',
    width: isVisible ? 'auto' : 0,
  });

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Receive Order
        </Typography>

        {/* Column Selection */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <ColumnSelector
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
            columnLabels={columnLabels}
          />
        </Box>

        {/* Table Headers */}
        {Object.values(visibleColumns).some(visible => visible) && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: (() => {
              const cols = [];
              if (visibleColumns.orderId) cols.push('120px');
              if (visibleColumns.itemsSummary) cols.push('2fr');
              if (visibleColumns.productName) cols.push('180px');
              if (visibleColumns.location) cols.push('150px');
              if (visibleColumns.comment) cols.push('1fr');
              if (visibleColumns.date) cols.push('120px');
              if (visibleColumns.customerOrderId) cols.push('150px');
              return cols.join(' ');
            })(),
            gap: 2, 
            p: 2, 
            mb: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            fontWeight: 600
          }}>
            {visibleColumns.orderId && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Order ID</Typography>
            )}
            {visibleColumns.itemsSummary && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Item Summary</Typography>
            )}
            {visibleColumns.productName && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Product Name</Typography>
            )}
            {visibleColumns.location && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Location</Typography>
            )}
            {visibleColumns.comment && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Comments</Typography>
            )}
            {visibleColumns.date && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Order Date</Typography>
            )}
            {visibleColumns.customerOrderId && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Customer Order ID</Typography>
            )}
          </Box>
        )}

        {Object.keys(groupedOrders).map(orderId => {
          const orders = groupedOrders[orderId];
          // Only show orders with remaining unconfirmed quantity
          const activeOrders = orders.filter(order => (order.quantity || 0) > 0);
          if (activeOrders.length === 0) {
            return null;
          }

          // Compute totals for header chips
          const totalRemaining = activeOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
          const totalConfirmed = activeOrders.reduce((sum, o) => sum + Math.max(0, (o.confirmed_quantity || 0) - parseInt(o.deployed_quantity || 0, 10)), 0);
          const totalDeployed = activeOrders.reduce((sum, o) => sum + parseInt(o.deployed_quantity || 0, 10), 0);

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
                {/* Table-like Row Layout: Order ID | Items Summary | Comment | Date */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: (() => {
                    const columns = [];
                    if (visibleColumns.orderId) columns.push('120px');
                    if (visibleColumns.itemsSummary) columns.push('2fr');
                    if (visibleColumns.productName) columns.push('180px');
                    if (visibleColumns.location) columns.push('150px');
                    if (visibleColumns.comment) columns.push('1fr');
                    if (visibleColumns.date) columns.push('120px');
                    if (visibleColumns.customerOrderId) columns.push('150px');
                    return columns.join(' ');
                  })(),
                  gap: 2, 
                  width: '100%',
                  alignItems: 'center'
                }}>
                  {/* Order ID Column */}
                  {visibleColumns.orderId && (
                    <Box>
                      <Typography variant="subtitle1">
                        {orderId}
                      </Typography>
                    </Box>
                  )}

                  {/* Items Summary Column */}
                  {visibleColumns.itemsSummary && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-start', pl: 1 }}>
                      <Chip
                        label={`Remaining: ${totalRemaining}`}
                        size="small"
                        color={totalRemaining > 0 ? 'warning' : 'default'}
                        variant={totalRemaining > 0 ? 'filled' : 'outlined'}
                      />
                      <Chip
                        label={`Confirmed: ${totalConfirmed}`}
                        size="small"
                        color={totalConfirmed > 0 ? 'success' : 'default'}
                        variant={totalConfirmed > 0 ? 'filled' : 'outlined'}
                      />
                      <Chip
                        label={`Deployed: ${totalDeployed}`}
                        size="small"
                        color={totalDeployed > 0 ? 'info' : 'default'}
                        variant={totalDeployed > 0 ? 'filled' : 'outlined'}
                      />
                    </Box>
                  )}

                  {/* Product Name Column */}
                  {visibleColumns.productName && (
                    <Box>
                      {activeOrders.map(order => (
                        <Typography key={order.id} variant="body2">
                          {order.product_name}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* Location Column */}
                  {visibleColumns.location && (
                    <Box>
                      <Typography variant="body1">
                        {activeOrders[0]?.location || ''}
                      </Typography>
                    </Box>
                  )}

                  {/* Comment Column */}
                  {visibleColumns.comment && (
                    <Box>
                      {orderComments[orderId] ? (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            fontStyle: 'italic',
                            wordBreak: 'break-word',
                            lineHeight: 1.2
                          }}
                        >
                          💬 {orderComments[orderId]}
                        </Typography>
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.disabled',
                            fontSize: '0.875rem',
                            fontStyle: 'italic'
                          }}
                        >
                          
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Date Column */}
                  {visibleColumns.date && (
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {activeOrders.length > 0 ? safeFormatDate(activeOrders[0].order_date) : ''}
                      </Typography>
                    </Box>
                  )}

                  {/* Customer Order ID Column */}
                  {visibleColumns.customerOrderId && (
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {activeOrders[0]?.customer_order_id || ''}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {/* Order ID Section - Clickable to open modal */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 'fit-content' }}>
                    Order ID:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {orderId}
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => {
                      // Get the first order from this group to get real data
                      const firstOrder = activeOrders[0];
                      if (firstOrder) {
                        handleRowClick(firstOrder);
                      }
                    }}
                  >
                    Edit
                  </Button>
                </Box>

                {/* Order Comment Display */}
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Order Comment:
                      </Typography>
                      <Typography variant="body2">
                        {orderComments[orderId] || 'No comment added'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Export Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                        <TableCell style={getHeaderCellStyle(visibleColumns.orderId)}>Order Group ID</TableCell>
                        <TableCell style={getHeaderCellStyle(visibleColumns.orderDate)}>Order Date</TableCell>
                        <TableCell style={getHeaderCellStyle(visibleColumns.customerOrderId)}>Customer Order ID</TableCell>
                        <TableCell style={getHeaderCellStyle(visibleColumns.productName)}>Product Name</TableCell>
                        <TableCell style={getHeaderCellStyle(visibleColumns.image)}>Image</TableCell>
                        <TableCell sx={{ width: '120px' }}>Quantity</TableCell>
                        <TableCell sx={{ width: '150px' }}>Order Date</TableCell>

                        <TableCell sx={{ width: '200px' }}>Enter Details</TableCell>
                        <TableCell sx={{ width: '150px' }}>Order Comment</TableCell>
                        <TableCell sx={{ width: '200px' }}>Item Comment</TableCell>
                        <TableCell sx={{ width: '120px' }}>Confirm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeOrders.map((order, index) => (
                        <TableRow key={`${orderId}-${index}`} hover>
                          <TableCell style={getCellStyle(visibleColumns.orderId)}>{order.order_group_id}</TableCell>
                          <TableCell style={getCellStyle(visibleColumns.orderDate)}>{safeFormatDate(order.order_date)}</TableCell>
                          <TableCell style={getCellStyle(visibleColumns.customerOrderId)}>{order.customer_order_id}</TableCell>
                          <TableCell style={getCellStyle(visibleColumns.productName)}>{order.product_name}</TableCell>
                          <TableCell style={getCellStyle(visibleColumns.image)}>
                            <img
                              src={`${process.env.REACT_APP_API_URL}${order.image}`}
                              alt={order.product_name}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 4 }}
                            />
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
                            {order.category && order.category.toLowerCase() === 'accessories' ? (
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                placeholder={`Enter quantity (max ${order.quantity})`}
                                value={serialNumbers[`${orderId}-${order.product_id}`] || ''}
                                onChange={(e) => handleSerialNumberChange(orderId, order.product_id, e.target.value)}
                                variant="outlined"
                                inputProps={{ min: 1, max: order.quantity }}
                              />
                            ) : (
                              <TextField
                                fullWidth
                                size="small"
                                multiline
                                rows={3}
                                placeholder="Enter serial numbers, one per line"
                                value={serialNumbers[`${orderId}-${order.product_id}`] || ''}
                                onChange={(e) => handleSerialNumberChange(orderId, order.product_id, e.target.value)}
                                variant="outlined"
                              />
                            )}
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
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleOpenProductCommentDialog(orderId, order.product_id)}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                type="text"
                                placeholder="Enter serial number"
                                value={serialNumbers[`${orderId}-${order.product_id}`] || ''}
                                onChange={(e) => handleSerialNumberChange(orderId, order.product_id, e.target.value)}
                                variant="outlined"
                                inputProps={{ min: 1, max: order.quantity }}
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => {
                                  const serial = serialNumbers[`${orderId}-${order.product_id}`];
                                  handleConfirm(order, serial, () => setSerialNumbers(prev => ({ ...prev, [`${orderId}-${order.product_id}`]: '' })));
                                }}
                                disabled={!serialNumbers[`${orderId}-${order.product_id}`]}
                                sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                              >
                                Confirm
                              </Button>
                            </Box>
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
        <Dialog 
          open={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Edit Order Details
              </Typography>
              <Box>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="contained" color="primary" sx={{ mr: 1 }}>
                    Edit
                  </Button>
                )}
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box>
                {/* Order Header */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <img
                    src={`${process.env.REACT_APP_API_URL}${selectedOrder.image}`}
                    alt={selectedOrder.product_name}
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      objectFit: 'cover', 
                      borderRadius: 8,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedOrder.product_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Order ID: <strong>{selectedOrder.order_id}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: <strong>{selectedOrder.quantity}</strong>
                    </Typography>
                  </Box>
                </Box>

                {/* Edit Form */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Order ID"
                    value={editedOrderId}
                    onChange={(e) => setEditedOrderId(e.target.value)}
                    fullWidth
                    disabled={!isEditing}
                    variant="outlined"
                  />
                  
                  <TextField
                    label="Comment"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={!isEditing}
                    variant="outlined"
                    placeholder="Enter order comment..."
                  />
                  
                  <TextField
                    label="Quantity"
                    type="number"
                    value={editedQuantity}
                    onChange={(e) => setEditedQuantity(e.target.value)}
                    fullWidth
                    disabled={!isEditing}
                    variant="outlined"
                  />
                  
                  <TextField
                    label="Order Date"
                    type="date"
                    value={editedOrderDate}
                    onChange={(e) => setEditedOrderDate(e.target.value)}
                    fullWidth
                    disabled={!isEditing}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setEditModalOpen(false)}
              variant="outlined"
            >
              Close
            </Button>
            {isEditing ? (
              <>
                <Button onClick={handleCancelEdit} variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} variant="contained" color="primary">
                  Save
                </Button>
              </>
            ) : (
              <Button
                onClick={handleDeleteOrder}
                variant="contained"
                color="error"
              >
                Delete Order
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default OrderDetails;