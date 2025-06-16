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
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  Search as SearchIcon,
  BrokenImage as BrokenImageIcon
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
  
  // Enhanced search features
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  // Handle image loading errors
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  useEffect(() => {
    fetch('http://10.167.49.200:3007/confirmed-items')
      .then(response => response.json())
      .then(data => {
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
  }, []);

  useEffect(() => {
    let filtered = [...confirmedItems];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDisplayName(item.ordered_by).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.order_id.toString().includes(searchTerm) ||
        (orderComments[item.order_id] && orderComments[item.order_id].toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(item =>
        new Date(item.confirm_date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(item =>
        new Date(item.confirm_date) <= new Date(endDate + 'T23:59:59')
      );
    }

    setFilteredItems(filtered);
  }, [searchTerm, startDate, endDate, confirmedItems, orderComments]);

  const handleExport = (orderId) => {
    const orderItems = filteredItems.filter(item => item.order_id === orderId);
    
    const csvContent = [
      ['Product Name', 'Quantity', 'Serial Number', 'Order Date', 'Confirm Date', 'Ordered By', 'Comment'].join(','),
      ...orderItems.map(item => [
        `"${item.product_name}"`,
        item.quantity || '',
        `"${item.serial_number || ''}"`,
        `"${format(new Date(item.order_date), 'MMM dd, yyyy')}"`,
        `"${format(new Date(item.confirm_date), 'MMM dd, yyyy')}"`,
        `"${getDisplayName(item.ordered_by)}"`,
        `"${orderComments[orderId] || ''}"`
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
          Confirmed Items
        </Typography>

        {/* Enhanced Search Interface */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Search & Filter
          </Typography>
          
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
                    {format(new Date(orderItems[0].order_date), 'MMM dd, yyyy')}
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
                      minWidth: 800,
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
                        <TableCell sx={{ width: '100px', minWidth: '100px' }}>Image</TableCell>
                        <TableCell sx={{ minWidth: '250px' }}>Product Name</TableCell>
                        <TableCell sx={{ width: '80px', minWidth: '80px' }}>Qty</TableCell>
                        <TableCell sx={{ width: '120px', minWidth: '120px' }}>Order Date</TableCell>
                        <TableCell sx={{ width: '120px', minWidth: '120px' }}>Ordered By</TableCell>
                        <TableCell sx={{ width: '120px', minWidth: '120px' }}>Confirmed</TableCell>
                        <TableCell sx={{ minWidth: '150px' }}>Serial Number</TableCell>
                        <TableCell sx={{ minWidth: '200px' }}>Comments</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={`${orderId}-${index}`} hover>
                          <TableCell>
                            {imageErrors[`${orderId}-${index}`] ? (
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
                                src={`http://10.167.49.200:3007${item.image}`}
                                alt={item.product_name}
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover', 
                                  borderRadius: 4,
                                  border: '1px solid #e0e0e0'
                                }}
                                onError={() => handleImageError(`${orderId}-${index}`)}
                                onLoad={() => {
                                  // Remove from error state if image loads successfully
                                  setImageErrors(prev => {
                                    const newState = { ...prev };
                                    delete newState[`${orderId}-${index}`];
                                    return newState;
                                  });
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                              {item.product_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {item.quantity || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(item.order_date), 'MMM dd, yyyy')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getDisplayName(item.ordered_by)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {item.confirmed_date ? format(new Date(item.confirmed_date), 'MMM dd, yyyy') : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {item.serial_number || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {item.comment || 'No comment'}
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
      </Container>
    </ThemeProvider>
  );
}

export default ConfirmedItems;
