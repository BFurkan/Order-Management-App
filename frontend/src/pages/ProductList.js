import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  InputLabel,
  FormControl,
  Fab,
  Box,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ColumnSelector from '../components/ColumnSelector';

const categories = ['Notebooks', 'Monitors', 'Accessories'];

function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState('Notebooks');
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState({});
  const [open, setOpen] = useState(false);

  const [orderedByOpen, setOrderedByOpen] = useState(false);
  const [orderedBy, setOrderedBy] = useState('');
  const [emailError, setEmailError] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Notebooks', image: null });
  const navigate = useNavigate();

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    name: true,
    quantity: true,
  });

  const columnLabels = {
    image: 'Product Image',
    name: 'Product Name',
    quantity: 'Quantity',
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3007'}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    setOrder(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOrder = () => {
    if (!orderedBy.trim()) {
      setEmailError('Please enter an email address.');
      return;
    }

    if (!validateEmail(orderedBy)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setEmailError(''); // Clear any previous errors

    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3007'}/latest-order-id`)
      .then(res => res.json())
      .then(data => {
        const newOrderId = isNaN(parseInt(data.latest_order_id, 10)) ? '1' : (parseInt(data.latest_order_id, 10) + 1).toString();
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const order_date = today.toISOString().split('T')[0];

        const currentOrder = Object.entries(order).map(([productId, quantity]) => ({
          order_id: newOrderId,
          product_id: parseInt(productId, 10),
          quantity,
          order_date,
          ordered_by: orderedBy,
        }));

        return Promise.all(currentOrder.map(o =>
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3007'}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(o),
          }).then(res => {
            if (!res.ok) throw new Error('Order failed');
            return res.json();
          })
        ));
      })
      .then(() => {
        setOrderedByOpen(false);
        setOrderedBy('');
        navigate('/order-summary');
      })
      .catch(err => console.error('Error placing order:', err));
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    setNewProduct(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleFormSubmit = () => {
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('image', newProduct.image);

          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3007'}/products`, {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add product');
        return res.json();
      })
      .then(data => {
        setProducts(prev => [...prev, data]);
        handleClose();
        setNewProduct({ name: '', category: 'Notebooks', image: null });
        window.location.reload();
      })
      .catch(err => {
        console.error('Error adding product:', err);
        alert('Failed to add product: ' + err.message);
      });
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOrderedByOpen = () => setOrderedByOpen(true);
  const handleOrderedByClose = () => setOrderedByOpen(false);

  const filteredProducts = products.filter(p => p.category === selectedCategory);

  // Check if there are any items in the order
  const hasOrderItems = Object.values(order).some(quantity => quantity > 0);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Product List</Typography>

      {/* Header with Category Buttons and Column Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ColumnSelector
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
            columnLabels={columnLabels}
          />
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Product Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {visibleColumns.image && <TableCell>Image</TableCell>}
              {visibleColumns.name && <TableCell>Name</TableCell>}
              {visibleColumns.quantity && <TableCell>Quantity</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
                {visibleColumns.image && (
                  <TableCell>
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:3007'}${product.image}`}
                      alt={product.name}
                      style={{ width: 80, height: 80, objectFit: 'cover' }}
                    />
                  </TableCell>
                )}
                {visibleColumns.name && <TableCell>{product.name}</TableCell>}
                {visibleColumns.quantity && (
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={order[product.id] || 0}
                      onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                      inputProps={{ min: 0 }}
                      style={{ width: 80 }}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Floating Place Order Button */}
      {hasOrderItems && (
        <Fab
          color="error"
          variant="extended"
          onClick={handleOrderedByOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
        >
          <ShoppingCartIcon sx={{ mr: 1 }} />
          Place Order
        </Fab>
      )}

      {/* Ordered By Dialog */}
      <Dialog open={orderedByOpen} onClose={handleOrderedByClose} maxWidth="sm" fullWidth>
        <DialogTitle>Place Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Please enter your email address to place this order:
          </Typography>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={orderedBy}
            onChange={(e) => {
              setOrderedBy(e.target.value);
              if (emailError) setEmailError(''); // Clear error when user starts typing
            }}
            placeholder="Enter your email address"
            error={!!emailError}
            helperText={emailError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOrderedByClose}>Cancel</Button>
          <Button onClick={handleOrder} variant="contained" color="error">
            Confirm Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            name="name"
            fullWidth
            value={newProduct.name}
            onChange={handleInputChange}
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
              label="Category"
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProductList;
