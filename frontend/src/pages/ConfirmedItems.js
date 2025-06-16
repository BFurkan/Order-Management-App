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
  Grid
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import theme from './theme';

function ConfirmedItems() {
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderComments, setOrderComments] = useState({});
  
  // Enhanced search features
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
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
        item.order_id.toString().includes(searchTerm)
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
  }, [searchTerm, startDate, endDate, confirmedItems]);

  const handleExport = (orderId) => {
    const orderItems = filteredItems.filter(item => item.order_id === orderId);
    
    const csvContent = [
      ['Product Name', 'Quantity', 'Serial Number', 'Order Date', 'Confirm Date', 'Ordered By', 'Comment'].join(','),
      ...orderItems.map(item => [
        `"${item.product_name}"`,
        item.quantity || 1,
        `"${item.serial_number}"`,
        `"${format(new Date(item.order_date), 'MMM dd, yyyy')}"`,
        `"${format(new Date(item.confirm_date), 'MMM dd, yyyy')}"`,
        `"${getDisplayName(item.ordered_by)}"`,
        `"${orderComments[orderId] || 'No comment'}"`
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

  const getColumnsForOrder = () => [
    {
      field: 'product_name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
      resizable: true,
    },
    {
      field: 'serial_number',
      headerName: 'Serial Number',
      width: 180,
      minWidth: 150,
      maxWidth: 250,
      resizable: true,
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
      field: 'confirm_date',
      headerName: 'Confirm Date',
      width: 150,
      minWidth: 120,
      maxWidth: 200,
      resizable: true,
      renderCell: (params) => format(new Date(params.row.confirm_date), 'MMM dd, yyyy'),
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
      renderCell: (params) => orderComments[params.row.order_id] || 'No comment',
      sortable: false,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container>
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
                placeholder="Product, Serial Number, Order ID, or Person"
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
                        // First check for accessories (to avoid misclassification)
                        if (productName.includes('dock') || productName.includes('docking') ||
                            productName.includes('charger') || productName.includes('adapter') ||
                            productName.includes('cable') || productName.includes('mouse') ||
                            productName.includes('keyboard') || productName.includes('headset') ||
                            productName.includes('webcam') || productName.includes('speaker') ||
                            productName.includes('hub') || productName.includes('stand') ||
                            productName.includes('bag') || productName.includes('case')) {
                          orderTotals.accessories += (item.quantity || 1);
                        } else if (productName.includes('monitor') || productName.includes('display')) {
                          orderTotals.monitors += (item.quantity || 1);
                        } else if (productName.includes('notebook') || productName.includes('laptop') || 
                                   productName.includes('thinkpad') || productName.includes('elitebook') || 
                                   productName.includes('macbook') || productName.includes('surface') ||
                                   productName.includes('k14') || productName.includes('lenovo') ||
                                   productName.includes('ideapad') || productName.includes('yoga') ||
                                   productName.includes('inspiron') || productName.includes('latitude') ||
                                   productName.includes('pavilion') || productName.includes('probook') ||
                                   productName.includes('toughbook') || productName.includes('fz55')) {
                          orderTotals.notebooks += (item.quantity || 1);
                        } else {
                          orderTotals.accessories += (item.quantity || 1);
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

                {/* DataGrid with resizable columns */}
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={orderItems.map((item, index) => ({ ...item, id: `${orderId}-${index}` }))}
                    columns={getColumnsForOrder()}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection={false}
                    disableSelectionOnClick
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
