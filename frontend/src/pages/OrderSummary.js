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
  IconButton
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
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

  const handleExport = (orderId) => {
    const orders = groupedOrders[orderId] || [];
    const filteredOrders = orders.filter(order => order.quantity > 0);
    
    const csvContent = [
      ['Product Name', 'Ordered Quantity', 'Order Date', 'Ordered By', 'Comment'].join(','),
      ...filteredOrders.map(order => [
        `"${order.product_name}"`,
        order.quantity,
        `"${format(new Date(order.order_date), 'MMM dd, yyyy')}"`,
        `"${getDisplayName(order.ordered_by)}"`,
        `"${orderComments[orderId] || 'No comment'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${orderId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const handleEditComment = (orderId) => {
    setEditingCommentOrderId(orderId);
    setCommentText(orderComments[orderId] || '');
  };

  const handleSaveComment = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/update-order-comment', {
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

  const getColumnsForOrder = (orderId) => [
    {
      field: 'image',
      headerName: 'Product Image',
      width: 120,
      minWidth: 80,
      maxWidth: 150,
      resizable: true,
      renderCell: (params) => (
        <img 
          src={`http://10.167.49.200:3007${params.row.image}`} 
          alt={params.row.product_name} 
          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 4 }} 
        />
      ),
      sortable: false,
    },
    {
      field: 'product_name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
      resizable: true,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      minWidth: 80,
      maxWidth: 150,
      resizable: true,
      type: 'number',
    },
    {
      field: 'order_date',
      headerName: 'Order Date',
      width: 150,
      minWidth: 120,
      maxWidth: 200,
      resizable: true,
      renderCell: (params) => format(new Date(params.row.order_date), 'MMM dd, yyyy'),
    },
    {
      field: 'ordered_by',
      headerName: 'Ordered By',
      width: 150,
      minWidth: 120,
      maxWidth: 200,
      resizable: true,
      renderCell: (params) => getDisplayName(params.row.ordered_by),
    },
    {
      field: 'comment',
      headerName: 'Comment',
      width: 200,
      minWidth: 150,
      flex: 0.5,
      resizable: true,
      renderCell: () => orderComments[orderId] || 'No comment',
      sortable: false,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Summary
        </Typography>

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
                sx={{ backgroundColor: '#f5f5f5' }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  {/* First Row - Order ID, Category totals, and Date */}
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {editingOrderId === orderId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            value={newOrderId}
                            onChange={(e) => setNewOrderId(e.target.value)}
                            size="small"
                            variant="outlined"
                          />
                          <Button size="small" onClick={handleSaveOrderId}>Save</Button>
                          <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
                        </Box>
                      ) : (
                        <Typography variant="h6" onClick={() => handleEditOrderId(orderId)} sx={{ cursor: 'pointer' }}>
                          Order ID: {orderId}
                        </Typography>
                      )}
                      
                      {/* Category totals beside Order ID */}
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
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(filteredOrders[0].order_date), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  {/* Second Row - Comment Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 'fit-content' }}>
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
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            flex: 1,
                            fontStyle: orderComments[orderId] ? 'normal' : 'italic',
                            color: orderComments[orderId] ? 'inherit' : 'text.secondary'
                          }}
                        >
                          {orderComments[orderId] || 'No comment'}
                        </Typography>
                        <IconButton size="small" onClick={() => handleEditComment(orderId)}>
                          <EditIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
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

                {/* DataGrid with resizable columns */}
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={filteredOrders.map((order, index) => ({ ...order, id: `${orderId}-${index}` }))}
                    columns={getColumnsForOrder(orderId)}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    rowHeight={80}
                    sx={{
                      '& .MuiDataGrid-cell': {
                        borderColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                      },
                      '& .MuiDataGrid-row': {
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      },
                    }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Container>
    </ThemeProvider>
  );
}

export default OrderSummary; 