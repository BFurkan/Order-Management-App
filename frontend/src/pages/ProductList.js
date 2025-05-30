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
} from '@mui/material';

const categories = ['Notebooks', 'Monitors', 'Accessories'];

function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState('Notebooks');
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState({});
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Notebooks', image: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://10.167.49.200:3007/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    setOrder(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleOrder = () => {
    fetch('http://10.167.49.200:3007/latest-order-id')
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
        }));

        return Promise.all(currentOrder.map(o =>
          fetch('http://10.167.49.200:3007/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(o),
          }).then(res => {
            if (!res.ok) throw new Error('Order failed');
            return res.json();
          })
        ));
      })
      .then(() => navigate('/order-summary'))
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
    if (newProduct.image) formData.append('image', newProduct.image);

    fetch('http://10.167.49.200:3007/products', {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(() => {
        setOpen(false);
        setNewProduct({ name: '', category: 'Notebooks', image: null });
        return fetch('http://10.167.49.200:3007/products');
      })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error adding product:', err));
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirmOpen = () => setConfirmOpen(true);
  const handleConfirmClose = () => setConfirmOpen(false);

  const filteredProducts = products.filter(p => p.category === selectedCategory);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Product List</Typography>

      {/* Category Buttons */}
      <div style={{display: 'flex',  marginBottom: 16 }}>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'contained' : 'outlined'}
            onClick={() => setSelectedCategory(cat)}
            style={{ marginRight: 8 }}
          >
            {cat}
          </Button>
        ))}
        <Button variant="contained" color="primary"  style={{ marginLeft: 'auto' }}  onClick={handleClickOpen}>
          Add Product
        </Button>
      </div>

      {/* Product Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={`http://10.167.49.200:3007${product.image}`}
                    alt={product.name}
                    style={{ width: 80, height: 80, objectFit: 'cover' }}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm Order */}
      <div style={{ marginTop: 24 }}>
        <Button variant="contained" color="error" onClick={handleConfirmOpen}>
          Place Order
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirm Order</DialogTitle>
        <DialogContent>
          Are you sure you want to place this order?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button onClick={handleOrder} color="error">Confirm</Button>
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
