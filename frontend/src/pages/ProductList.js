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
  IconButton,
  Menu,
  Box,
  Fab,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon,
  ShoppingCart as CartIcon,
  FileDownload as ExportIcon,
  ViewColumn as ColumnsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderedBy, setOrderedBy] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [open, setOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', image: null });
  const [editProduct, setEditProduct] = useState({ id: '', name: '', category: '', price: '', image: null });
  const [quantities, setQuantities] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // DataGrid state
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    productImage: true,
    name: true,
    category: true,
    price: true,
    quantity: true,
    actions: true,
  });

  const categories = ['All Categories', 'Notebooks', 'Monitors', 'Accessories'];

  // Define DataGrid columns with resizable functionality
  const columns = [
    {
      field: 'productImage',
      headerName: 'Product Image',
      width: 120,
      resizable: true,
      sortable: false,
      renderCell: (params) => (
        <img 
          src={params.row.image ? `http://10.167.49.200:3007${params.row.image}` : '/placeholder.png'} 
          alt={params.row.name} 
          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 4 }} 
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Product Name',
      width: 200,
      resizable: true,
      flex: 1,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      resizable: true,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      resizable: true,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'green' }}>
          ${(parseFloat(params.value) || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      resizable: true,
      sortable: false,
      renderCell: (params) => (
        <TextField
          type="number"
          size="small"
          value={quantities[params.row.id] || ''}
          onChange={(e) => handleQuantityChange(params.row.id, e.target.value)}
          inputProps={{ min: 0 }}
          sx={{ width: 100 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      resizable: true,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => addToCart(params.row)}
            disabled={!quantities[params.row.id] || quantities[params.row.id] <= 0}
          >
            Add to Cart
          </Button>
          <IconButton
            size="small"
            onClick={() => handleEditProduct(params.row)}
            title="Edit Product"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteProduct(params.row.id)}
            title="Delete Product"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetch('http://10.167.49.200:3007/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const handleExport = () => {
    const csvContent = [
      ['Product Name', 'Category', 'Price', 'Quantity'].join(','),
      ...filteredProducts.map(product => [
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

  const filterData = (data) => {
    let filtered = data;
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    return filtered;
  };

  const filteredProducts = filterData(products);

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
    // Use the selected order date and combine with current time
    const selectedDateTime = new Date(orderDate + 'T' + new Date().toTimeString().split(' ')[0]).toISOString();
    
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
        order_date: selectedDateTime,
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
      setOrderDate(new Date().toISOString().split('T')[0]); // Reset to today's date
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

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      fetch(`http://10.167.49.200:3007/products/${productId}`, {
        method: 'DELETE',
      })
      .then(response => {
        if (response.ok) {
          console.log('Product deleted successfully');
          // Refresh the products list
          fetch('http://10.167.49.200:3007/products')
            .then(response => response.json())
            .then(data => setProducts(data))
            .catch(error => console.error('Error fetching products:', error));
        } else {
          throw new Error('Failed to delete product');
        }
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      });
    }
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

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredProducts}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            sx={{
              '& .MuiDataGrid-cell': {
                borderColor: '#e0e0e0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          />
        </Box>

        {/* Column Visibility Menu */}
        <Menu
          anchorEl={columnsMenuAnchor}
          open={Boolean(columnsMenuAnchor)}
          onClose={() => setColumnsMenuAnchor(null)}
        >
          {columns.map((column) => (
            <MenuItem key={column.field}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={columnVisibilityModel[column.field] !== false}
                  onChange={() =>
                    setColumnVisibilityModel((prev) => ({
                      ...prev,
                      [column.field]: prev[column.field] === false ? true : false,
                    }))
                  }
                />
                {column.headerName}
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
              disabled={!orderedBy || !orderDate || cart.length === 0}
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
              onClick={() => {
                handleDeleteProduct(editProduct.id);
                setEditProductOpen(false);
              }} 
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
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
