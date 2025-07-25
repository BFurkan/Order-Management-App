import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  Search as SearchIcon,
  BrokenImage as BrokenImageIcon,
  Inventory as DeployedIcon,
  Visibility as ViewIcon,
  Undo as UndeployIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  ViewColumn as ColumnsIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { format } from 'date-fns';
import theme from './theme';

function DeployedItems() {
  const [deployedItems, setDeployedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Accordion states
  const [expandedOrders, setExpandedOrders] = useState({});
  const [groupedItems, setGroupedItems] = useState({});

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    productName: true,
    orderDate: true,
    confirmDate: true,
    deployDate: true,
    serialNumber: true,
    orderedBy: true
  });

  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);

  const columnLabels = {
    image: 'Product Image',
    productName: 'Product Name',
    orderDate: 'Order Date',
    confirmDate: 'Confirmed Date',
    deployDate: 'Deploy Date',
    serialNumber: 'Serial Number',
    orderedBy: 'Ordered By'
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

  const refreshData = () => {
    setLastRefresh(Date.now());
  };

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

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  useEffect(() => {
    fetch('http://10.167.49.200:3004/deployed-items')
      .then(response => response.json())
      .then(data => {
        setDeployedItems(data);
        setLoading(false);
        
        // Group items by order_id
        const grouped = data.reduce((acc, item) => {
          const orderId = item.order_id;
          if (!acc[orderId]) {
            acc[orderId] = [];
          }
          acc[orderId].push(item);
          return acc;
        }, {});
        
        setGroupedItems(grouped);
      })
      .catch(error => {
        console.error('Error fetching deployed items:', error);
        setError('Failed to fetch deployed items');
      setLoading(false);
      });
  }, [lastRefresh]);

  useEffect(() => {
    let filtered = deployedItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDisplayName(item.ordered_by).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.order_id.toString().includes(searchTerm) ||
        (item.item_comment && String(renderComment(item.item_comment)).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (startDate || endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.deploy_date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate + 'T23:59:59') : new Date('2100-12-31');
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredItems(filtered);
    
    // Re-group filtered items
    const grouped = filtered.reduce((acc, item) => {
      const orderId = item.order_id;
      if (!acc[orderId]) {
        acc[orderId] = [];
      }
      acc[orderId].push(item);
      return acc;
    }, {});
    
    setGroupedItems(grouped);
  }, [searchTerm, startDate, endDate, deployedItems, lastRefresh]);

  const handleExport = (orderId) => {
    const orderItems = groupedItems[orderId] || [];
    const csvContent = [
      ['Product Name', 'Serial Number', 'Order Date', 'Confirm Date', 'Deploy Date', 'Ordered By'].join(','),
      ...orderItems.map(item => [
        `"${item.product_name}"`,
        `"${item.serial_number}"`,
        `"${format(new Date(item.order_date), 'MMM dd, yyyy')}"`,
        `"${item.confirm_date ? format(new Date(item.confirm_date), 'MMM dd, yyyy') : 'N/A'}"`,
        `"${item.deploy_date ? format(new Date(item.deploy_date), 'MMM dd, yyyy HH:mm') : 'N/A'}"`,
        `"${getDisplayName(item.ordered_by)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployed-items-${orderId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  const undeployItem = async (itemId) => {
    if (window.confirm('Are you sure you want to undeploy this item?')) {
      try {
        const response = await fetch('http://10.167.49.200:3004/undeploy-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            itemId: itemId,
            serialNumber: selectedItem?.serial_number
        }),
      });

        if (response.ok) {
        setSuccess('Item undeployed successfully!');
          refreshData();
          setModalOpen(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
          setError('Failed to undeploy item');
        }
      } catch (error) {
        console.error('Error undeploying item:', error);
        setError('Error undeploying item. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Typography>Loading deployed items...</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom>
          Deployed Items
        </Typography>

        {/* Search Interface */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Search & Filter
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={refreshData}
              >
                Refresh
              </Button>
            <Button
              variant="outlined"
              size="small"
                startIcon={<ColumnsIcon />}
                onClick={handleColumnsMenuOpen}
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
                placeholder="Product, Serial, Order ID, or Person"
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
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredItems.length} of {deployedItems.length} deployed items
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Deploy Date</Typography>
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
                        if (productName.includes('dock') || productName.includes('docking') ||
                            productName.includes('charger') || productName.includes('adapter') ||
                            productName.includes('cable') || productName.includes('mouse') ||
                            productName.includes('keyboard') || productName.includes('headset') ||
                            productName.includes('webcam') || productName.includes('speaker')) {
                          orderTotals.accessories += 1;
                        } else if (productName.includes('monitor') || productName.includes('display') ||
                                   productName.includes('screen')) {
                          orderTotals.monitors += 1;
                        } else {
                          orderTotals.notebooks += 1;
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
                  
                  {/* Deploy date on the right */}
                  <Typography variant="body2" color="text.secondary">
                    {orderItems.length > 0 && format(new Date(orderItems[0].deploy_date), 'MMM dd, yyyy')}
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
                        {visibleColumns.orderDate && <TableCell sx={{ width: '120px', minWidth: '120px' }}>Order Date</TableCell>}
                        {visibleColumns.confirmDate && <TableCell sx={{ width: '120px', minWidth: '120px' }}>Confirmed</TableCell>}
                        {visibleColumns.deployDate && <TableCell sx={{ width: '140px', minWidth: '140px' }}>Deployed</TableCell>}
                        {visibleColumns.orderedBy && <TableCell sx={{ width: '120px', minWidth: '120px' }}>Ordered By</TableCell>}
                        {visibleColumns.serialNumber && <TableCell sx={{ minWidth: '150px' }}>Serial Number</TableCell>}
                        <TableCell sx={{ width: '150px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                       {orderItems.map((item, index) => (
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
                      {imageErrors[item.id] || !item.image ? (
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
                                   src={`http://10.167.49.200:3004${item.image}`} 
                          alt={item.product_name}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover', 
                            borderRadius: 4,
                            border: '1px solid #e0e0e0'
                          }}
                          onError={() => handleImageError(item.id)}
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
                           {visibleColumns.orderDate && (
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(item.order_date), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                           )}
                           {visibleColumns.confirmDate && (
                    <TableCell>
                      <Typography variant="body2">
                        {item.confirm_date ? 
                          format(new Date(item.confirm_date), 'MMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </TableCell>
                           )}
                           {visibleColumns.deployDate && (
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                        {item.deploy_date ? 
                          format(new Date(item.deploy_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </Typography>
                    </TableCell>
                           )}
                           {visibleColumns.orderedBy && (
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getDisplayName(item.ordered_by)}
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
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          startIcon={<UndeployIcon />}
                                 onClick={(e) => {
                                   e.stopPropagation(); // Prevent row click
                                   undeployItem(item.id);
                                 }}
                        >
                          Undeploy
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

        {/* No Results Message */}
        {Object.keys(groupedItems).length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              No deployed items found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {deployedItems.length === 0 
                ? "No items have been deployed yet"
                : "Try adjusting your search criteria or date range"
              }
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
                Deployed Item Details
              </Typography>
              <Chip 
                icon={<DeployedIcon />} 
                label="Deployed" 
                color="success" 
                variant="outlined"
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box>
                {/* Item Header */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  {selectedItem.image && !imageErrors[selectedItem.id] ? (
                    <img 
                      src={`http://10.167.49.200:3004${selectedItem.image}`} 
                        alt={selectedItem.product_name}
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          border: '1px solid #e0e0e0'
                        }}
                        onError={() => handleImageError(selectedItem.id)}
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
                      {selectedItem.product_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Serial Number: <strong>{selectedItem.serial_number}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Order ID: <strong>{selectedItem.order_id}</strong>
                    </Typography>
                  </Box>
                </Box>

                {/* Detailed Information Table */}
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
                        <TableCell>Serial Number</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{selectedItem.serial_number}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>{selectedItem.order_id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Order Date</TableCell>
                        <TableCell>{format(new Date(selectedItem.order_date), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Confirmed Date</TableCell>
                        <TableCell>
                          {selectedItem.confirm_date ? 
                            format(new Date(selectedItem.confirm_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Deploy Date</TableCell>
                        <TableCell>
                          {selectedItem.deploy_date ? 
                            format(new Date(selectedItem.deploy_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Ordered By</TableCell>
                        <TableCell>{getDisplayName(selectedItem.ordered_by)}</TableCell>
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
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setModalOpen(false)}
              variant="outlined"
            >
              Close
            </Button>
            <Button 
              onClick={() => undeployItem(selectedItem?.id)}
              variant="contained"
              color="warning"
              startIcon={<UndeployIcon />}
            >
              Undeploy Item
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default DeployedItems; 