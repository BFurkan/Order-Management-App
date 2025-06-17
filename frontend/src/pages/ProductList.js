import React, { useState, useEffect } from 'react';
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

function ProductList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderedBy, setOrderedBy] = useState('');
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

  useEffect(() => {
    fetch('http://10.167.49.200:3007/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
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
        `"$${(product.price || 0).toFixed(2)}"`,
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

  const submitOrder = () => {
    const currentDateTime = new Date().toISOString();
    
    // Use bulk order endpoint to keep all items together with same order ID
    const orderItems = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));

    fetch('http://10.167.49.200:3007/bulk-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: orderItems,
        order_date: currentDateTime,
        ordered_by: orderedBy,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Bulk order submitted:', data);
      alert(`Order submitted successfully! Order ID: ${data.order_id}`);
      setCart([]);
      setOrderedBy('');
      setOpen(false);
    })
    .catch(error => {
      console.error('Error submitting order:', error);
      alert('Error submitting order. Please try again.');
    });
  };

  const addProduct = () => {
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('price', newProduct.price);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    fetch('http://10.167.49.200:3007/products', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log('Product added:', data);
      // Refresh the products list
      fetch('http://10.167.49.200:3007/products')
        .then(response => response.json())
        .then(data => setProducts(data))
        .catch(error => console.error('Error fetching products:', error));
      
      setAddProductOpen(false);
      setNewProduct({ name: '', category: '', price: '', image: null });
    })
    .catch(error => console.error('Error adding product:', error));
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

  const updateProduct = () => {
    const formData = new FormData();
    formData.append('name', editProduct.name);
    formData.append('category', editProduct.category);
    formData.append('price', editProduct.price);
    if (editProduct.image) {
      formData.append('image', editProduct.image);
    }

    fetch(`http://10.167.49.200:3007/products/${editProduct.id}`, {
      method: 'PUT',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log('Product updated:', data);
      // Refresh the products list
      fetch('http://10.167.49.200:3007/products')
        .then(response => response.json())
        .then(data => setProducts(data))
        .catch(error => console.error('Error fetching products:', error));
      
      setEditProductOpen(false);
      setEditProduct({ id: '', name: '', category: '', price: '', image: null });
    })
    .catch(error => console.error('Error updating product:', error));
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
                        src={product.image ? `http://10.167.49.200:3007${product.image}` : '/placeholder.png'} 
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
                        ${(product.price || 0).toFixed(2)}
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
          aria-label="cart"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setOpen(true)}
          disabled={cart.length === 0}
        >
          <CartIcon />
        </Fab>

        <Fab
          color="secondary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 80, right: 16 }}
          onClick={() => setAddProductOpen(true)}
        >
          <AddIcon />
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
              autoFocus
              margin="dense"
              label="Ordered By (Email)"
              type="email"
              fullWidth
              variant="outlined"
              value={orderedBy}
              onChange={(e) => setOrderedBy(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={submitOrder} 
              variant="contained"
              disabled={!orderedBy || cart.length === 0}
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
              id="edit-product-file"
              type="file"
              onChange={(e) => setEditProduct({ ...editProduct, image: e.target.files[0] })}
            />
            <label htmlFor="edit-product-file">
              <Button variant="outlined" component="span" fullWidth sx={{ mt: 2 }}>
                Change Image
              </Button>
            </label>
            {editProduct.image && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                New image selected: {editProduct.image.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditProductOpen(false)}>Cancel</Button>
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
