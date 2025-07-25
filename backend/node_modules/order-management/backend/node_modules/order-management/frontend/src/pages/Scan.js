import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  QrCodeScanner as ScanIcon,
  Refresh as RefreshIcon,
  Send as DeployIcon,
  BrokenImage as BrokenImageIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { format } from 'date-fns';
import theme from './theme';

function Scan() {
  const [serialNumber, setSerialNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageError, setImageError] = useState(false);

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  const handleSearch = async () => {
    if (!serialNumber.trim()) {
      setError('Please enter a serial number');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      // Fetch confirmed items and search for the serial number
      const response = await fetch('http://10.167.49.200:3004/confirmed-items');
      if (!response.ok) {
        throw new Error('Failed to fetch confirmed items');
      }
      
      const confirmedItems = await response.json();
      console.log('Searching for serial number:', serialNumber);
      console.log('In confirmed items:', confirmedItems.length);
      
      // Search for matching serial number
      const matchingItem = confirmedItems.find(item => 
        item.serial_number && item.serial_number.toLowerCase() === serialNumber.toLowerCase().trim()
      );

      if (matchingItem) {
        console.log('Found matching item:', matchingItem);
        setSearchResult(matchingItem);
        setSelectedItem(matchingItem);
        setModalOpen(true);
      } else {
        setError('No confirmed item found with this serial number');
      }
    } catch (err) {
      console.error('Error searching for item:', err);
      setError('Error searching for item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedItem) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://10.167.49.200:3004/deploy-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedItem.id,
          originalId: selectedItem.original_id,
          productId: selectedItem.product_id,
          orderId: selectedItem.order_id,
          serialNumber: selectedItem.serial_number,
          deployDate: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deploy item');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Item deployed successfully!');
        setModalOpen(false);
        setSerialNumber('');
        setSearchResult(null);
        setSelectedItem(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to deploy item');
      }
    } catch (err) {
      console.error('Error deploying item:', err);
      setError('Error deploying item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSerialNumber('');
    setSearchResult(null);
    setSelectedItem(null);
    setModalOpen(false);
    setError('');
    setSuccess('');
    setImageError(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          <ScanIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Scan & Deploy Items
        </Typography>

        {/* Search Interface */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Search Confirmed Items
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Serial Number"
                variant="outlined"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter or scan serial number"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={<SearchIcon />}
                  sx={{ flex: 1 }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
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

        {/* Search Result Summary */}
        {searchResult && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1, border: '1px solid #4caf50' }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              ✓ Found confirmed item: {searchResult.product_name} (Serial: {searchResult.serial_number})
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
              <Chip 
                label="Ready to Deploy" 
                color="primary" 
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
                    {imageError || !selectedItem.image ? (
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
                        src={`http://10.167.49.200:3004${selectedItem.image}`}
                        alt={selectedItem.product_name}
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          border: '1px solid #e0e0e0'
                        }}
                        onError={handleImageError}
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
              Cancel
            </Button>
            <Button 
              onClick={handleDeploy}
              variant="contained"
              color="success"
              disabled={loading}
              startIcon={<DeployIcon />}
            >
              {loading ? 'Deploying...' : 'Deploy Item'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default Scan; 