import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container, 
  Typography, 
  Button, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Chip,
  TableSortLabel,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  ViewColumn as ColumnsIcon,
  FilterList as FilterIcon
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
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentCommentOrderId, setCurrentCommentOrderId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [orderComments, setOrderComments] = useState({});
  
  // Enhanced table features
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterText, setFilterText] = useState('');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  
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

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleExport = (orderId) => {
    const orders = groupedOrders[orderId] || [];
    const filteredOrders = orders.filter(order => order.quantity > 0);
    
    const csvContent = [
      ['Product Name', 'Ordered Quantity', 'Order Date', 'Ordered By', 'Comment'].join(','),
      ...filteredOrders.map(order => [
        `"${order.product_name}"`,
        order.quantity,
        `"${format(new Date(order.order_date), 'MMM dd, yyyy HH:mm')}"`,
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

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'product':
          aValue = a.product_name;
          bValue = b.product_name;
          break;
        case 'orderedQuantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'orderDate':
          aValue = new Date(a.order_date);
          bValue = new Date(b.order_date);
          break;
        case 'orderedBy':
          aValue = getDisplayName(a.ordered_by);
          bValue = getDisplayName(b.ordered_by);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterData = (data) => {
    if (!filterText) return data;
    
    return data.filter(order => 
      order.product_name.toLowerCase().includes(filterText.toLowerCase()) ||
      getDisplayName(order.ordered_by).toLowerCase().includes(filterText.toLowerCase()) ||
      order.quantity.toString().includes(filterText) ||
      (orderComments[order.order_id] || '').toLowerCase().includes(filterText.toLowerCase())
    );
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
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Summary
        </Typography>

        {Object.keys(groupedOrders).map(orderId => {
          const filteredOrders = groupedOrders[orderId].filter(order => order.quantity > 0);

          if (filteredOrders.length === 0) {
            return null; // Don't render anything if all orders have a quantity of 0
          }

          const processedOrders = sortData(filterData(filteredOrders));

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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(filteredOrders[0].order_date), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                    <Button size="small" onClick={() => handleOpenCommentDialog(orderId)}>
                      Edit Comment
                    </Button>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {/* Enhanced Table Toolbar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Filter items..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    InputProps={{
                      startAdornment: <FilterIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => setColumnsMenuAnchor(e.currentTarget)}
                      title="Column Visibility"
                    >
                      <ColumnsIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleExport(orderId)}
                      title="Export to CSV"
                    >
                      <ExportIcon />
                    </IconButton>
                  </Box>
                </Box>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {visibleColumns.productImage && <TableCell>Product Image</TableCell>}
                        {visibleColumns.product && (
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'product'}
                              direction={sortBy === 'product' ? sortDirection : 'asc'}
                              onClick={() => handleSort('product')}
                            >
                              Product Name
                            </TableSortLabel>
                          </TableCell>
                        )}
                        {visibleColumns.orderedQuantity && (
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'orderedQuantity'}
                              direction={sortBy === 'orderedQuantity' ? sortDirection : 'asc'}
                              onClick={() => handleSort('orderedQuantity')}
                            >
                              Quantity
                            </TableSortLabel>
                          </TableCell>
                        )}
                        {visibleColumns.orderDate && (
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'orderDate'}
                              direction={sortBy === 'orderDate' ? sortDirection : 'asc'}
                              onClick={() => handleSort('orderDate')}
                            >
                              Order Date
                            </TableSortLabel>
                          </TableCell>
                        )}
                        {visibleColumns.orderedBy && (
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'orderedBy'}
                              direction={sortBy === 'orderedBy' ? sortDirection : 'asc'}
                              onClick={() => handleSort('orderedBy')}
                            >
                              Ordered By
                            </TableSortLabel>
                          </TableCell>
                        )}
                        {visibleColumns.comment && <TableCell>Comment</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {processedOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          {visibleColumns.productImage && (
                            <TableCell>
                              <img 
                                src={`http://10.167.49.200:3007${order.image}`} 
                                alt={order.product_name} 
                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 4 }} 
                              />
                            </TableCell>
                          )}
                          {visibleColumns.product && <TableCell>{order.product_name}</TableCell>}
                          {visibleColumns.orderedQuantity && <TableCell>{order.quantity}</TableCell>}
                          {visibleColumns.orderDate && (
                            <TableCell>{format(new Date(order.order_date), 'MMM dd, yyyy HH:mm')}</TableCell>
                          )}
                          {visibleColumns.orderedBy && (
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {getDisplayName(order.ordered_by)}
                              </Typography>
                            </TableCell>
                          )}
                          {visibleColumns.comment && (
                            <TableCell>
                              <Typography variant="body2" sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {orderComments[orderId] || 'No comment'}
                              </Typography>
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

        {/* Column Visibility Menu */}
        <Menu
          anchorEl={columnsMenuAnchor}
          open={Boolean(columnsMenuAnchor)}
          onClose={() => setColumnsMenuAnchor(null)}
        >
          {Object.entries(columnLabels).map(([key, label]) => (
            <MenuItem key={key} onClick={() => handleColumnToggle(key)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input 
                  type="checkbox" 
                  checked={visibleColumns[key]} 
                  onChange={() => handleColumnToggle(key)}
                />
                {label}
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* Comment Dialog */}
        <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Order Comment</DialogTitle>
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveComment} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default OrderSummary;
