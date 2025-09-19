import React, { useState, useEffect, useContext } from 'react'; // Import useContext
import { 
  Container, 
  Typography, 
  Button, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
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
  TableSortLabel,
  IconButton,
  Menu,
  Box,
  Fab,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  ShoppingCart as CartIcon,
  FileDownload as ExportIcon,
  ViewColumn as ColumnsIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { supabase } from '../supabaseClient'; // Import Supabase client
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

function ProductList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext); // Get the logged-in user

  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [open, setOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', image: null });
  const [editProduct, setEditProduct] = useState({ id: '', name: '', category: '', price: '', image: null });
  const [quantities, setQuantities] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Enhanced table features
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productImage: true,
    productName: true,
    category: true,
    price: true,
    quantity: true,
    action: true
  });

  const columnLabels = {
    productImage: 'Product Image',
    productName: 'Product Name',
    category: 'Category',
    price: 'Price',
    quantity: 'Quantity',
    action: 'Action'
  };

  const categories = ['All Categories', 'Notebooks', 'Monitors', 'Accessories'];

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const handleExport = () => {
    const csvContent = [
      ['Product Name', 'Category', 'Price', 'Quantity'].join(','),
      ...filteredAndSortedProducts.map(product => [
        `"${product.name}"`,
        `"${product.category}"`,
        `"$${(parseFloat(product.price) || 0).toFixed(2)}"`,
        quantities[product.id] || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'productName':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'price':
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
          break;
        case 'quantity':
          aValue = quantities[a.id] || 0;
          bValue = quantities[b.id] || 0;
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
    let filtered = data;
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    return filtered;
  };

  const filteredAndSortedProducts = sortData(filterData(products));

  const addToCart = (product) => {
    const quantity = quantities[product.id] || 0;
    if (quantity > 0) {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.product.id === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevCart, { product, quantity }];
        }
      });
      setQuantities(prevQuantities => ({ ...prevQuantities, [product.id]: 0 }));
    }
  };

  const handleQuantityChange = (productId, value) => {
    const intValue = parseInt(value) || 0;
    setQuantities(prevQuantities => ({ ...prevQuantities, [productId]: intValue }));
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const submitOrder = async () => {
    console.log('Order date input:', orderDate);
    
    // Generate a single, unique order ID for all items in this cart
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const orderItems = cart.map(item => ({
      order_id: orderId, // Add the generated order ID to each item
      product_id: item.product.id,
      quantity: item.quantity,
      order_date: orderDate,
      ordered_by: user.email // Add the user's email
    }));

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderItems)
        .select();

      if (error) throw error;
      
      console.log('Bulk order submitted:', data);
      alert(`Order submitted successfully!`);
      setCart([]);
      setOrderDate(new Date().toISOString().split('T')[0]); // Reset to today's date
      setOpen(false);

    } catch (error) {
      console.error('Error submitting order:', error.message);
      alert('Error submitting order. Please try again.');
    }
  };

  const addProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{ name: newProduct.name, category: newProduct.category, price: newProduct.price }])
        .select();

      if (error) throw error;

      console.log('Product added:', data);
      fetchProducts(); // Refresh the products list
      setAddProductOpen(false);
      setNewProduct({ name: '', category: '', price: '', image: null });
    } catch (error) {
      console.error('Error adding product:', error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price || '',
      image: null
    });
    setEditProductOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        console.log('Product deleted successfully');
        fetchProducts(); // Refresh the products list
        setEditProductOpen(false); // Close edit dialog
      } catch (error) {
        console.error('Error deleting product:', error.message);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const updateProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ name: editProduct.name, category: editProduct.category, price: editProduct.price })
        .eq('id', editProduct.id)
        .select();

      if (error) throw error;

      console.log('Product updated:', data);
      fetchProducts(); // Refresh the products list
      setEditProductOpen(false);
      setEditProduct({ id: '', name: '', category: '', price: '', image: null });
    } catch (error) {
      console.error('Error updating product:', error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Product List
        </Typography>

        {/* Category Filter Buttons */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filter by Category:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setCategoryFilter(category === 'All Categories' ? '' : category)}
                color={categoryFilter === (category === 'All Categories' ? '' : category) ? 'primary' : 'default'}
                variant={categoryFilter === (category === 'All Categories' ? '' : category) ? 'filled' : 'outlined'}
                clickable
              />
            ))}
          </Box>
        </Box>

        {/* Enhanced Table Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
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
              onClick={handleExport}
              title="Export to CSV"
            >
              <ExportIcon />
            </IconButton>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {visibleColumns.productImage && <TableCell>Product Image</TableCell>}
                {visibleColumns.productName && (
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'productName'}
                      direction={sortBy === 'productName' ? sortDirection : 'asc'}
                      onClick={() => handleSort('productName')}
                    >
                      Product Name
                    </TableSortLabel>
                  </TableCell>
                )}
                {visibleColumns.category && (
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'category'}
                      direction={sortBy === 'category' ? sortDirection : 'asc'}
                      onClick={() => handleSort('category')}
                    >
                      Category
                    </TableSortLabel>
                  </TableCell>
                )}
                {visibleColumns.price && (
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'price'}
                      direction={sortBy === 'price' ? sortDirection : 'asc'}
                      onClick={() => handleSort('price')}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                )}
                {visibleColumns.quantity && (
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'quantity'}
                      direction={sortBy === 'quantity' ? sortDirection : 'asc'}
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity
                    </TableSortLabel>
                  </TableCell>
                )}
                {visibleColumns.action && <TableCell>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  {visibleColumns.productImage && (
                    <TableCell>
                      <img 
                        src={product.image || '/placeholder.png'} 
                        alt={product.name} 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 4 }} 
                      />
                    </TableCell>
                  )}
                  {visibleColumns.productName && <TableCell>{product.name}</TableCell>}
                  {visibleColumns.category && <TableCell>{product.category}</TableCell>}
                  {visibleColumns.price && (
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'green' }}>
                        ${(parseFloat(product.price) || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                  )}
                  {visibleColumns.quantity && (
                    <TableCell>
                      <TextField
                        type="number"
                        label="Quantity"
                        size="small"
                        value={quantities[product.id] || ''}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        inputProps={{ min: 0 }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.action && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => addToCart(product)}
                          disabled={!quantities[product.id] || quantities[product.id] <= 0}
                        >
                          Add to Cart
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleEditProduct(product)}
                          title="Edit Product"
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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

        {/* Floating Action Buttons */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 100, right: 16 }}
          onClick={() => setAddProductOpen(true)}
        >
          <AddIcon />
        </Fab>

        <Fab
          color="secondary"
          aria-label="cart"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setOpen(true)}
        >
          <CartIcon />
        </Fab>

        {/* Cart Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Cart</DialogTitle>
          <DialogContent>
            {cart.map(item => (
              <Card key={item.product.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                      <Typography variant="h6">{item.product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: {item.product.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body1">Quantity: {item.quantity}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            
            <TextField
              margin="dense"
              label="Order Date"
              type="date"
              fullWidth
              variant="outlined"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }}
              required
            />
            

          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={submitOrder} 
              variant="contained"
              disabled={!orderDate || cart.length === 0}
            >
              Place Order
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Product Dialog */}
        <Dialog open={addProductOpen} onClose={() => setAddProductOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Product Name"
              fullWidth
              variant="outlined"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Category</InputLabel>
              <Select
                value={newProduct.category}
                label="Category"
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              >
                <MenuItem value="Notebooks">Notebooks</MenuItem>
                <MenuItem value="Monitors">Monitors</MenuItem>
                <MenuItem value="Accessories">Accessories</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label="Price ($)"
              type="number"
              fullWidth
              variant="outlined"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
            />
            <label htmlFor="raised-button-file">
              <Button variant="outlined" component="span" fullWidth sx={{ mt: 2 }}>
                Upload Image
              </Button>
            </label>
            {newProduct.image && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {newProduct.image.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddProductOpen(false)}>Cancel</Button>
            <Button 
              onClick={addProduct} 
              variant="contained"
              disabled={!newProduct.name || !newProduct.category || !newProduct.price}
            >
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={editProductOpen} onClose={() => setEditProductOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Product Name"
              fullWidth
              variant="outlined"
              value={editProduct.name}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              required
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Category</InputLabel>
              <Select
                value={editProduct.category}
                label="Category"
                onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                required
              >
                <MenuItem value="Notebooks">Notebooks</MenuItem>
                <MenuItem value="Monitors">Monitors</MenuItem>
                <MenuItem value="Accessories">Accessories</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label="Price ($)"
              type="number"
              fullWidth
              variant="outlined"
              value={editProduct.price}
              onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="edit-raised-button-file"
              type="file"
              onChange={(e) => setEditProduct({ ...editProduct, image: e.target.files[0] })}
            />
            <label htmlFor="edit-raised-button-file">
              <Button variant="outlined" component="span" fullWidth sx={{ mt: 2 }}>
                Upload New Image
              </Button>
            </label>
            {editProduct.image && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {editProduct.image.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditProductOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleDeleteProduct(editProduct.id)}
              color="error"
              variant="outlined"
            >
              Remove Item
            </Button>
            <Button 
              onClick={updateProduct} 
              variant="contained"
              disabled={!editProduct.name || !editProduct.category || !editProduct.price}
            >
              Update Product
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default ProductList;
