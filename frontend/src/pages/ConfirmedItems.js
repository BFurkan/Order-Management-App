import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Box,
  Chip,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  Search as SearchIcon,
  BrokenImage as BrokenImageIcon,
  ViewColumn as ColumnsIcon,
  Refresh as RefreshIcon,
  CheckCircle as ConfirmedIcon
} from '@mui/icons-material';
// Removed DataGrid import to avoid compatibility issues
import { ThemeProvider } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import theme from './theme';

function ConfirmedItems() {
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderComments, setOrderComments] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // Enhanced search features
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Column visibility management
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    productName: true,
    quantity: true,
    orderDate: true,
    confirmedDate: true,
    serialNumber: true,
    itemComment: true
  });

  // Debug column visibility
  console.log('Visible columns:', visibleColumns);

  const columnLabels = {
    image: 'Product Image',
    productName: 'Product Name',
    quantity: 'Quantity',
    orderDate: 'Order Date',

    confirmedDate: 'Confirmed Date',
    serialNumber: 'Serial Number',
    itemComment: 'Item Comments'
  };

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  // Handle image loading errors
  const handleImageError = (itemId) => {
    console.log('Image failed to load for item:', itemId);
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  // Column visibility handlers
  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleColumnsMenuOpen = (event) => {
    setColumnsMenuAnchor(event.currentTarget);
  };

  const handleColumnsMenuClose = () => {
    setColumnsMenuAnchor(null);
  };

  const refreshData = () => {
    setLastRefresh(Date.now());
  };

  const renderComment = (comment) => {
    if (!comment) return 'No comment';
    if (typeof comment === 'object') {
      return Object.values(comment).join(', ');
    }
    if (typeof comment === 'string') {
      try {
        const parsed = JSON.parse(comment);
        if (typeof parsed === 'object') {
          return Object.values(parsed).join(', ');
        }
      } catch (e) {}
      return comment;
    }
    return String(comment);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setEditForm({
      product_name: item.product_name || '',
      quantity: item.quantity || '',
      serial_number: item.serial_number || '',
      item_comment: item.item_comment || '',
      order_date: item.order_date ? new Date(item.order_date).toISOString().split('T')[0] : '',
      confirm_date: item.confirm_date ? new Date(item.confirm_date).toISOString().split('T')[0] : '',

    });
    setModalOpen(true);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://10.167.49.203:3004/confirmed-items/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        // Update the local state
        setConfirmedItems(prev => 
          prev.map(item => 
            item.id === selectedItem.id 
              ? { ...item, ...editForm }
              : item
          )
        );
        setFilteredItems(prev => 
          prev.map(item => 
            item.id === selectedItem.id 
              ? { ...item, ...editForm }
              : item
          )
        );
        setSelectedItem(prev => ({ ...prev, ...editForm }));
        setIsEditing(false);
        alert('Item updated successfully!');
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset edit form to original values
    setEditForm({
      product_name: selectedItem.product_name || '',
      quantity: selectedItem.quantity || '',
      serial_number: selectedItem.serial_number || '',
      item_comment: selectedItem.item_comment || '',
      order_date: selectedItem.order_date ? new Date(selectedItem.order_date).toISOString().split('T')[0] : '',
      confirm_date: selectedItem.confirm_date ? new Date(selectedItem.confirm_date).toISOString().split('T')[0] : '',

    });
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this item?\n\nProduct: ${selectedItem.product_name}\nSerial Number: ${selectedItem.serial_number || 'N/A'}\nOrder ID: ${selectedItem.order_id}`
    );
    
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`http://10.167.49.203:3004/confirmed-items/${selectedItem.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove the item from local state
        setConfirmedItems(prev => prev.filter(item => item.id !== selectedItem.id));
        setFilteredItems(prev => prev.filter(item => item.id !== selectedItem.id));
        
        // Close the modal
        setModalOpen(false);
        setSelectedItem(null);
        setIsEditing(false);
        
        alert('Item deleted successfully!');
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  useEffect(() => {
    // Fetch confirmed items with order ID and comment
    fetch('http://10.167.49.203:3004/confirmed-items')
      .then(response => response.json())
      .then(data => {
        console.log('Confirmed items data:', data); // Debug log
        console.log('Sample item structure:', data[0]); // Debug first item structure
        
        // Debug image and comment data specifically
        data.forEach((item, idx) => {
          console.log(`Item ${idx}:`, {
            id: item.id,
            product_name: item.product_name,
            image: item.image,
            item_comment: item.item_comment,
            comment: item.comment
          });
        });
        
        setConfirmedItems(data);
        setFilteredItems(data);
        
        // Extract comments from confirmed items
        const comments = {};
        data.forEach(item => {
          if (item.comment) {
            comments[item.order_id] = item.comment;
          }
        });
        setOrderComments(comments);
      })
      .catch(error => console.error('Error fetching confirmed items:', error));
  }, [lastRefresh]);

  useEffect(() => {
    let filtered = [...confirmedItems];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.serial_number && item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||

        item.order_id.toString().includes(searchTerm) ||
        (orderComments[item.order_id] && orderComments[item.order_id].toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.item_comment && item.item_comment.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(item => {
        const confirmDate = item.confirm_date;
        return confirmDate && new Date(confirmDate) >= new Date(startDate);
      });
    }

    if (endDate) {
      filtered = filtered.filter(item => {
        const confirmDate = item.confirm_date;
        return confirmDate && new Date(confirmDate) <= new Date(endDate + 'T23:59:59');
      });
    }

    setFilteredItems(filtered);
  }, [searchTerm, startDate, endDate, confirmedItems, orderComments, lastRefresh]);

  const handleExport = (orderId) => {
    const orderItems = filteredItems.filter(item => item.order_id === orderId);
    
    const csvContent = [
      ['Product Name', 'Quantity', 'Serial Number', 'Order Date', 'Confirm Date', 'Order Comment', 'Item Comment'].join(','),
      ...orderItems.map(item => [
        `"${item.product_name}"`,
        item.quantity || '',
        `"${item.serial_number || ''}"`,
        `"${format(new Date(item.order_date + 'T00:00:00'), 'MMM dd, yyyy')}"`,
        `"${format(new Date(item.confirm_date), 'MMM dd, yyyy')}"`,

        `"${orderComments[orderId] || ''}"`,
        `"${item.item_comment || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confirmed-items-${orderId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  // Group items by order_id
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }
    acc[item.order_id].push(item);
    return acc;
  }, {});

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom>
          Confirmed Orders
        </Typography>

        {/* Enhanced Search Interface */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Search & Filter
            </Typography>
            
            {/* Column Selection Button */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={refreshData}
                sx={{ ml: 2 }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ColumnsIcon />}
                onClick={handleColumnsMenuOpen}
                sx={{ ml: 2 }}
              >
                Columns
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Items"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Product, Serial, Order ID, Person, or Comments"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                variant="outlined"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                variant="outlined"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
          
          {/* Search Results Summary */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredItems.length} of {confirmedItems.length} confirmed items
            </Typography>
            
            {(searchTerm || startDate || endDate) && (
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear All Filters
              </Button>
            )}
          </Box>
        </Box>

        {/* Column Visibility Menu */}
        <Menu
          anchorEl={columnsMenuAnchor}
          open={Boolean(columnsMenuAnchor)}
          onClose={handleColumnsMenuClose}
          PaperProps={{
            style: {
              maxHeight: 300,
              width: '250px',
            },
          }}
        >
          {Object.entries(columnLabels).map(([key, label]) => (
            <MenuItem key={key} onClick={() => handleColumnToggle(key)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns[key]}
                    onChange={() => handleColumnToggle(key)}
                  />
                }
                label={label}
                sx={{ width: '100%', m: 0 }}
              />
            </MenuItem>
          ))}
        </Menu>

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

        {Object.keys(groupedItems).map(orderId => {
          const orderItems = groupedItems[orderId];

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
                      Order ID: {orderId}
                    </Typography>
                    
                    {/* Category totals beside Order ID */}
                    {(() => {
                      const orderTotals = { monitors: 0, notebooks: 0, accessories: 0 };
                      orderItems.forEach(item => {
                        const productName = item.product_name.toLowerCase();
                        const quantity = item.quantity || 0;
                        // First check for accessories (to avoid misclassification)
                        if (productName.includes('dock') || productName.includes('docking') ||
                            productName.includes('charger') || productName.includes('adapter') ||
                            productName.includes('cable') || productName.includes('mouse') ||
                            productName.includes('keyboard') || productName.includes('headset') ||
                            productName.includes('webcam') || productName.includes('speaker') ||
                            productName.includes('hub') || productName.includes('stand') ||
                            productName.includes('bag') || productName.includes('case')) {
                          orderTotals.accessories += quantity;
                        } else if (productName.includes('monitor') || productName.includes('display')) {
                          orderTotals.monitors += quantity;
                        } else if (productName.includes('notebook') || productName.includes('laptop') || 
                                   productName.includes('thinkpad') || productName.includes('elitebook') || 
                                   productName.includes('macbook') || productName.includes('surface') ||
                                   productName.includes('k14') || productName.includes('lenovo') ||
                                   productName.includes('ideapad') || productName.includes('yoga') ||
                                   productName.includes('inspiron') || productName.includes('latitude') ||
                                   productName.includes('pavilion') || productName.includes('probook') ||
                                   productName.includes('toughbook') || productName.includes('fz55')) {
                          orderTotals.notebooks += quantity;
                        } else {
                          orderTotals.accessories += quantity;
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
                                            {format(new Date(orderItems[0].order_date + 'T00:00:00'), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {/* Order Comment Display */}
                {orderComments[orderId] && (
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Order Comment:
                    </Typography>
                    <Typography variant="body2">
                      {orderComments[orderId]}
                    </Typography>
                  </Box>
                )}

                {/* Export Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={() => handleExport(orderId)}
                    size="small"
                  >
                    Export this Order
                  </Button>
                </Box>

                {/* Responsive Table Container */}
                <TableContainer 
                  component={Paper} 
                  sx={{
                    boxShadow: theme.shadows[4],
                    borderRadius: 2,
                    maxHeight: '70vh',
                    overflow: 'auto',
                    '& .MuiTable-root': {
                      minWidth: 600,
                    }
                  }}
                >
                  <Table stickyHeader sx={{
                    '& .MuiTableHead-root': {
                      backgroundColor: theme.palette.grey[50],
                    },
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: theme.palette.text.primary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.grey[50],
                      position: 'sticky',
                      top: 0,
                      zIndex: 100,
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
                        {visibleColumns.image && <TableCell sx={{ width: '100px', minWidth: '100px' }}>Image</TableCell>}
                        {visibleColumns.productName && <TableCell sx={{ minWidth: '250px' }}>Product Name</TableCell>}
                        {visibleColumns.quantity && <TableCell sx={{ width: '80px', minWidth: '80px' }}>Qty</TableCell>}
                        {visibleColumns.orderDate && <TableCell sx={{ width: '120px', minWidth: '120px' }}>Order Date</TableCell>}

                        {visibleColumns.confirmedDate && <TableCell sx={{ width: '120px', minWidth: '120px' }}>Confirmed</TableCell>}
                        {visibleColumns.serialNumber && <TableCell sx={{ minWidth: '150px' }}>Serial Number</TableCell>}
                        {visibleColumns.itemComment && <TableCell sx={{ minWidth: '200px' }}>Item Comments</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderItems.map((item, index) => {
                        console.log(`Item ${index} image:`, item.image); // Debug each item's image
                        console.log(`Item ${index} item_comment:`, item.item_comment); // Debug each item's comment
                        return (
                          <TableRow 
                            key={`${orderId}-${index}`} 
                            hover
                            onClick={() => handleViewItem(item)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            }}
                          >
                            {visibleColumns.image && (
                              <TableCell>
                                {imageErrors[`${orderId}-${index}`] || !item.image ? (
                                  <Box sx={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: 1,
                                    border: '1px solid #e0e0e0'
                                  }}>
                                    <BrokenImageIcon sx={{ color: '#bdbdbd' }} />
                                  </Box>
                                ) : (
                                  <img 
                                    src={`http://10.167.49.203:3004${item.image}`} 
                                    alt={item.product_name} 
                                    style={{ 
                                      width: '60px', 
                                      height: '60px', 
                                      objectFit: 'cover', 
                                      borderRadius: 4,
                                      border: '1px solid #e0e0e0'
                                    }} 
                                    onError={() => {
                                      console.log(`Image failed to load for item ${index}, URL: http://10.167.49.203:3004${item.image}`);
                                      handleImageError(`${orderId}-${index}`);
                                    }}
                                    onLoad={() => console.log(`Image loaded successfully for item ${index}, URL: http://10.167.49.203:3004${item.image}`)}
                                  />
                                )}
                              </TableCell>
                            )}
                            {visibleColumns.productName && (
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                                  {item.product_name}
                                </Typography>
                              </TableCell>
                            )}
                            {visibleColumns.quantity && (
                              <TableCell>
                                <Typography variant="body2">
                                  {item.quantity || 'N/A'}
                                </Typography>
                              </TableCell>
                            )}
                            {visibleColumns.orderDate && (
                              <TableCell>
                                <Typography variant="body2">
                                  {format(new Date(item.order_date + 'T00:00:00'), 'MMM dd, yyyy')}
                                </Typography>
                              </TableCell>
                            )}

                            {visibleColumns.confirmedDate && (
                              <TableCell>
                                <Typography variant="body2">
                                  {item.confirm_date ? 
                                    format(new Date(item.confirm_date), 'MMM dd, yyyy') : 'N/A'}
                                </Typography>
                              </TableCell>
                            )}
                            {visibleColumns.serialNumber && (
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                  {item.serial_number || 'N/A'}
                                </Typography>
                              </TableCell>
                            )}
                            {visibleColumns.itemComment && (
                              <TableCell>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                  {item.item_comment ? item.item_comment : 'No comment'}
                                </Typography>
                                {/* Debug info */}
                                {process.env.NODE_ENV === 'development' && (
                                  <Typography variant="caption" sx={{ color: 'gray', fontSize: '0.7rem' }}>
                                    Debug: {JSON.stringify({item_comment: item.item_comment})}
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
          );
        })}

        {/* No Results Message */}
        {Object.keys(groupedItems).length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              No confirmed items found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or date range
            </Typography>
          </Box>
        )}

        {/* Item Details Modal */}
        <Dialog 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Confirmed Item Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  icon={<ConfirmedIcon />} 
                  label="Confirmed" 
                  color="success" 
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditClick}
                  disabled={isEditing}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteItem}
                  disabled={isEditing}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box>
                {/* Item Header */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  {selectedItem.image && !imageErrors[`${selectedItem.order_id}-${selectedItem.id}`] ? (
                    <img 
                      src={`http://10.167.49.203:3004${selectedItem.image}`} 
                      alt={selectedItem.product_name}
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: 8,
                        border: '1px solid #e0e0e0'
                      }}
                      onError={() => setImageErrors(prev => ({ ...prev, [`${selectedItem.order_id}-${selectedItem.id}`]: true }))}
                    />
                  ) : (
                    <Box sx={{ 
                      width: '120px', 
                      height: '120px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0'
                    }}>
                      <BrokenImageIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
                    </Box>
                  )}
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          value={editForm.product_name}
                          onChange={(e) => handleEditFormChange('product_name', e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        selectedItem.product_name
                      )}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" component="span">
                        Serial Number: <strong>
                          {isEditing ? null : (selectedItem.serial_number || 'N/A')}
                        </strong>
                      </Typography>
                      {isEditing && (
                        <TextField
                          value={editForm.serial_number}
                          onChange={(e) => handleEditFormChange('serial_number', e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={{ width: '200px', mt: 1 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Order ID: <strong>{selectedItem.order_id}</strong>
                    </Typography>
                  </Box>
                </Box>

                {/* Edit Form or Display Table */}
                {isEditing ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Edit Item Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Product Name"
                          value={editForm.product_name}
                          onChange={(e) => handleEditFormChange('product_name', e.target.value)}
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) => handleEditFormChange('quantity', e.target.value)}
                          variant="outlined"
                          margin="dense"
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Serial Number"
                          value={editForm.serial_number}
                          onChange={(e) => handleEditFormChange('serial_number', e.target.value)}
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Order Date"
                          type="date"
                          value={editForm.order_date}
                          onChange={(e) => handleEditFormChange('order_date', e.target.value)}
                          variant="outlined"
                          margin="dense"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Confirm Date"
                          type="date"
                          value={editForm.confirm_date}
                          onChange={(e) => handleEditFormChange('confirm_date', e.target.value)}
                          variant="outlined"
                          margin="dense"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Item Comment"
                          multiline
                          rows={3}
                          value={editForm.item_comment}
                          onChange={(e) => handleEditFormChange('item_comment', e.target.value)}
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  /* Detailed Information Table */
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Product Name</TableCell>
                          <TableCell>{selectedItem.product_name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Quantity</TableCell>
                          <TableCell>{selectedItem.quantity || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Serial Number</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{selectedItem.serial_number || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>{selectedItem.order_id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Order Date</TableCell>
                          <TableCell>{format(new Date(selectedItem.order_date + 'T00:00:00'), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Confirmed Date</TableCell>
                          <TableCell>
                            {selectedItem.confirm_date ? 
                              format(new Date(selectedItem.confirm_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                          </TableCell>
                        </TableRow>

                        {selectedItem.item_comment && (
                          <TableRow>
                            <TableCell>Item Comment</TableCell>
                            <TableCell>{renderComment(selectedItem.item_comment)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            {isEditing ? (
              <>
                <Button 
                  onClick={handleCancelEdit}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setModalOpen(false)}
                variant="outlined"
              >
                Close
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default ConfirmedItems;
