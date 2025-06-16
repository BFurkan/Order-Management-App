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
  Alert
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  Search as SearchIcon,
  BrokenImage as BrokenImageIcon,
  Inventory as DeployedIcon,
  Visibility as ViewIcon,
  Undo as UndeployIcon
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

  // Fetch deployed items
  const fetchDeployedItems = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://10.167.49.200:3007/deployed-items');
      if (!response.ok) {
        throw new Error('Failed to fetch deployed items');
      }
      
      const data = await response.json();
      console.log('Deployed items data:', data);
      setDeployedItems(data);
      setFilteredItems(data);
    } catch (err) {
      console.error('Error fetching deployed items:', err);
      setError('Error fetching deployed items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployedItems();
  }, []);

  // Filter items based on search criteria
  useEffect(() => {
    let filtered = [...deployedItems];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.serial_number && item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        getDisplayName(item.ordered_by).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.order_id.toString().includes(searchTerm) ||
        (item.item_comment && item.item_comment.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by date range (deploy date)
    if (startDate) {
      filtered = filtered.filter(item => {
        const deployDate = item.deploy_date;
        return deployDate && new Date(deployDate) >= new Date(startDate);
      });
    }

    if (endDate) {
      filtered = filtered.filter(item => {
        const deployDate = item.deploy_date;
        return deployDate && new Date(deployDate) <= new Date(endDate + 'T23:59:59');
      });
    }

    setFilteredItems(filtered);
  }, [searchTerm, startDate, endDate, deployedItems]);

  // Handle export functionality
  const handleExport = () => {
    const csvContent = [
      ['Product Name', 'Serial Number', 'Order ID', 'Order Date', 'Confirmed Date', 'Deploy Date', 'Ordered By', 'Item Comment'].join(','),
      ...filteredItems.map(item => [
        `"${item.product_name}"`,
        `"${item.serial_number || ''}"`,
        item.order_id,
        `"${format(new Date(item.order_date), 'MMM dd, yyyy')}"`,
        `"${item.confirm_date ? format(new Date(item.confirm_date), 'MMM dd, yyyy') : 'N/A'}"`,
        `"${item.deploy_date ? format(new Date(item.deploy_date), 'MMM dd, yyyy HH:mm') : 'N/A'}"`,
        `"${getDisplayName(item.ordered_by)}"`,
        `"${item.item_comment || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployed-items-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle view item details
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Handle undeploy item
  const handleUndeploy = async (item) => {
    if (!window.confirm(`Are you sure you want to undeploy "${item.product_name}" (Serial: ${item.serial_number})?`)) {
      return;
    }

    setError('');
    
    try {
      const response = await fetch('http://10.167.49.200:3007/undeploy-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          originalId: item.original_id,
          serialNumber: item.serial_number
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to undeploy item');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Item undeployed successfully!');
        fetchDeployedItems(); // Refresh the list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to undeploy item');
      }
    } catch (err) {
      console.error('Error undeploying item:', err);
      setError('Error undeploying item. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom>
          <DeployedIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Deployed Items
        </Typography>

        {/* Search and Filter Interface */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Search & Filter
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon />}
              onClick={handleExport}
              disabled={filteredItems.length === 0}
            >
              Export CSV
            </Button>
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

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Loading deployed items...
            </Typography>
          </Box>
        )}

        {/* Deployed Items Table */}
        {!loading && (
          <TableContainer 
            component={Paper} 
            sx={{
              boxShadow: theme.shadows[4],
              borderRadius: 2,
              maxHeight: '70vh',
              overflow: 'auto'
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
                  <TableCell sx={{ minWidth: '150px' }}>Serial Number</TableCell>
                  <TableCell sx={{ width: '100px' }}>Order ID</TableCell>
                  <TableCell sx={{ width: '120px' }}>Order Date</TableCell>
                  <TableCell sx={{ width: '120px' }}>Confirmed</TableCell>
                  <TableCell sx={{ width: '140px' }}>Deploy Date</TableCell>
                  <TableCell sx={{ width: '120px' }}>Ordered By</TableCell>
                  <TableCell sx={{ minWidth: '200px' }}>Item Comment</TableCell>
                  <TableCell sx={{ width: '200px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item, index) => (
                  <TableRow key={`${item.id}-${index}`} hover>
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
                          src={`http://10.167.49.200:3007${item.image}`}
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
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                        {item.product_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {item.serial_number || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.order_id} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(item.order_date), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.confirm_date ? 
                          format(new Date(item.confirm_date), 'MMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                        {item.deploy_date ? 
                          format(new Date(item.deploy_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getDisplayName(item.ordered_by)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {item.item_comment || 'No comment'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewItem(item)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          startIcon={<UndeployIcon />}
                          onClick={() => handleUndeploy(item)}
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
        )}

        {/* No Results Message */}
        {!loading && filteredItems.length === 0 && (
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
                label="Deployed" 
                color="success" 
                size="small"
              />
            </Box>
          </DialogTitle>
          
          <DialogContent>
            {selectedItem && (
              <Box>
                {/* Product Image and Basic Info */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                  <Box sx={{ flexShrink: 0 }}>
                    {imageErrors[selectedItem.id] || !selectedItem.image ? (
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
                        <BrokenImageIcon sx={{ color: '#bdbdbd' }} />
                      </Box>
                    ) : (
                      <img
                        src={`http://10.167.49.200:3007${selectedItem.image}`}
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
                    )}
                  </Box>
                  
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
                        <TableCell sx={{ color: 'success.main', fontWeight: 500 }}>
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
                          <TableCell>{selectedItem.item_comment}</TableCell>
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
              onClick={() => handleUndeploy(selectedItem)}
              variant="contained"
              color="warning"
              startIcon={<UndeployIcon />}
            >
              Undeploy Item
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default DeployedItems; 