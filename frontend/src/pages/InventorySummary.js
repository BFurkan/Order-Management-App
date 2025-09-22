import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as DeployIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { supabase } from '../supabaseClient'; // Import supabase

function InventorySummary() {
  const [summary, setSummary] = useState([]);
  const [filteredSummary, setFilteredSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Deploy accessory modal state
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployItem, setDeployItem] = useState(null);
  const [deployQuantity, setDeployQuantity] = useState(1);
  const [deploySite, setDeploySite] = useState('');
  const [deployManagedBy, setDeployManagedBy] = useState('');
  const [deployError, setDeployError] = useState('');

  const categories = ['All', 'Notebook', 'Monitor', 'Accessory'];

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.rpc('get_inventory_summary');
        if (error) throw error;

        const enrichedData = data.map(item => ({
          ...item,
          image: item.image ? supabase.storage.from('product-images').getPublicUrl(item.image).data.publicUrl : null
        }));
        
        setSummary(enrichedData);
        setFilteredSummary(enrichedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory summary:', error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = summary.filter(item => {
      if (categoryFilter && categoryFilter !== 'All') {
        const singular = categoryFilter;
        let plural = categoryFilter.endsWith('y') 
          ? categoryFilter.slice(0, -1) + 'ies' 
          : categoryFilter + 's';
        if (item.category !== singular && item.category !== plural) {
          return false;
        }
      }
      return item.name.toLowerCase().includes(lowercasedFilter);
    });
    setFilteredSummary(filteredData);
  }, [searchTerm, summary, categoryFilter]);

  // Deploy accessory functions
  const handleDeployAccessory = async () => {
    if (!deployItem || deployQuantity <= 0) {
      setDeployError('Please enter a valid quantity.');
      return;
    }
    if (deployQuantity > deployItem.in_stock) {
      setDeployError(`Cannot deploy more than the available quantity of ${deployItem.in_stock}.`);
      return;
    }

    try {
      // Find a confirmed accessory item for this product with available quantity
      const { data: confirmedItems, error: confirmedError } = await supabase
        .from('confirmed_items')
        .select('*, order:orders(*)')
        .eq('order.product_id', deployItem.id)
        .gt('quantity', 0) // Assuming quantity represents available confirmed items
        .limit(1);

      if (confirmedError) throw confirmedError;
      
      if (!confirmedItems || confirmedItems.length === 0) {
        setDeployError('No confirmed accessories available for this product.');
        return;
      }

      const availableItem = confirmedItems[0];

      // Deploy the item
      const { error: deployError } = await supabase
        .from('deployed_items')
        .insert({
          confirmed_item_id: availableItem.id,
          deployment_location: deploySite,
          deployed_by: deployManagedBy
        });

      if (deployError) throw deployError;

      setDeployModalOpen(false);
      // Refresh the data to show the updated quantity
      const { data, error } = await supabase.rpc('get_inventory_summary');
      if (error) throw error;
      const enrichedData = data.map(item => ({
        ...item,
        image: item.image ? supabase.storage.from('product-images').getPublicUrl(item.image).data.publicUrl : null
      }));
      setSummary(enrichedData);

    } catch (error) {
      console.error('Error deploying accessory:', error.message);
      setDeployError('An unexpected error occurred.');
    }
  };

  const handleOpenDeployModal = (item) => {
    setDeployItem(item);
    setDeployQuantity(1);
    setDeploySite('');
    setDeployManagedBy('');
    setDeployError('');
    setDeployModalOpen(true);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          Inventory Summary
        </Typography>

        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Location</InputLabel>
                <Select
                  value={location}
                  label="Filter by Location"
                  onChange={handleLocationChange}
                >
                  <MenuItem value=""><em>All Locations</em></MenuItem>
                  <MenuItem value="180 Dundas">180 Dundas</MenuItem>
                  <MenuItem value="1 Queen">1 Queen</MenuItem>
                  <MenuItem value="Osgoode Hall">Osgoode Hall</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    clickable
                    color={categoryFilter === category || (category === 'All' && !categoryFilter) ? 'primary' : 'default'}
                    onClick={() => setCategoryFilter(category === 'All' ? '' : category)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Total Ordered</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Shipment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>In Stock</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Total Deployed</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSummary.map((item, index) => (
                  <TableRow 
                    key={item.id} 
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={item.image} sx={{ mr: 2 }} />
                        <Typography variant="body1">{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{item.total_ordered}</TableCell>
                    <TableCell align="center">{item.remaining || 0}</TableCell>
                    <TableCell align="center">{item.in_stock}</TableCell>
                    <TableCell align="center">{item.total_deployed}</TableCell>
                    <TableCell align="center">
                      {/* Show deploy button only for accessories with in_stock > 0 */}
                      {item.category && item.category.toLowerCase() === 'accessories' && item.in_stock > 0 ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DeployIcon />}
                          onClick={() => handleOpenDeployModal(item)}
                        >
                          Deploy
                        </Button>
                      ) : item.category && item.category.toLowerCase() === 'accessories' ? (
                        <Button
                          variant="outlined"
                          size="small"
                          disabled
                        >
                          No Stock
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Deploy Accessory Modal */}
        <Dialog open={deployModalOpen} onClose={() => setDeployModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Deploy Accessory</DialogTitle>
          <DialogContent>
            {deployItem && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">{deployItem.name}</Typography>
                <Typography color="text.secondary" gutterBottom>
                  Available to deploy: {deployItem.in_stock}
                </Typography>
                
                {deployError && <Alert severity="error" sx={{ mt: 2 }}>{deployError}</Alert>}

                <TextField
                  autoFocus
                  margin="dense"
                  label="Quantity to Deploy"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={deployQuantity}
                  onChange={(e) => setDeployQuantity(parseInt(e.target.value, 10))}
                  inputProps={{ min: 1, max: deployItem.in_stock }}
                />
                <TextField
                  margin="dense"
                  label="Site / Address"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={deploySite}
                  onChange={(e) => setDeploySite(e.target.value)}
                />
                <TextField
                  margin="dense"
                  label="Recipient / Managed By"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={deployManagedBy}
                  onChange={(e) => setDeployManagedBy(e.target.value)}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeployModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDeployAccessory} variant="contained">Deploy</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default InventorySummary;
