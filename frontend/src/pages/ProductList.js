import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Container, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { teal } from '@mui/material/colors';

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
    fetch('http://10.167.49.200:3004/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    setOrder(prevOrder => ({
      ...prevOrder,
      [productId]: quantity
    }));
  };

  const handleOrder = () => {
    fetch('http://10.167.49.200:3004/latest-order-id')
      .then(response => response.json())
      .then(data => {
        const newOrderId = isNaN(parseInt(data.latest_order_id, 10)) ? '1' : (parseInt(data.latest_order_id, 10) + 1).toString();
 	const today = new Date();
        today.setDate(today.getDate() + 1);  // Adds 1 day
        const order_date = today.toISOString().split('T')[0];
        const currentOrder = Object.entries(order).map(([productId, quantity]) => ({
          order_id: newOrderId,
          product_id: parseInt(productId, 10),
          quantity,
          order_date: order_date,
        }));

        return Promise.all(currentOrder.map(order => 
          fetch('http://10.167.49.200:3004/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Order placement failed');
            }
            return response.json();
          })
        ));
      })
      .then(() => navigate('/order-summary'))
      .catch(error => console.error('Error placing order:', error));
  };

  const filteredProducts = products.filter(product => product.category === selectedCategory);


  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirmOpen = () => setConfirmOpen(true);
  const handleConfirmClose = () => setConfirmOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.files[0] });
  };

  const handleFormSubmit = () => {
  const formData = new FormData();
  formData.append('name', newProduct.name);
  formData.append('category', newProduct.category);
  formData.append('image', newProduct.image);

  fetch('http://10.167.49.200:3004/products', {
    method: 'POST',
    body: formData,
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to add product');
    }
    return response.json();
  })
  .then(data => {
    setProducts(prevProducts => [...prevProducts, {
      id: data.id, // Ensure you use the ID assigned by the backend
      name: data.name,
      category: data.category,
      image: data.image
    }]);
    handleClose();
    setNewProduct({ name: '', category: 'Notebooks', image: null });  // Reset form
    window.location.reload();

  })
  .catch(error => {
    console.error('Error adding product:', error);
    alert('Failed to add product: ' + error.message);  // Display error to the user
  });
};


  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>Product List</Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "contained" : "outlined"}
              sx={{
                color: selectedCategory === category ? 'white' : teal[700],
                backgroundColor: selectedCategory === category ? teal[700] : 'transparent',
                borderColor: teal[700],
                '&:hover': {
                  backgroundColor: selectedCategory === category ? teal[900] : teal[100],
                  borderColor: teal[900],
                },
                margin: '0 8px 8px 0'
              }}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <Button
          variant="contained"
          sx={{
            color: 'white',
            backgroundColor: teal[700],
            borderColor: teal[700],
            '&:hover': {
              backgroundColor: teal[300],
              borderColor: teal[500],
            },
            margin: '0 8px 8px 0'
          }}
          onClick={handleClickOpen}
        >
          Add New Product
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: '1px solid #000' }}>Image</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>Product</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
                <TableCell sx={{ border: '1px solid #bbb' }}>
                  <img src={`http://10.167.49.200:3004${product.image}`} alt={product.name} style={{ width: '100px' }} />
                </TableCell>
                <TableCell sx={{ border: '1px solid #bbb' }}>{product.name}</TableCell>
                <TableCell sx={{ border: '1px solid #bbb' }}>
                  <TextField
                    type="number"
                    value={order[product.id] || 0}
                    onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Fixed Position for Place Order Button */}
      <div style={{ position: 'fixed', bottom: '16px', right: '16px' }}>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirmOpen}
        >
          Place Order
        </Button>
      </div>

      {/* Confirmation Dialog for placing an order */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirm Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to place this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button onClick={handleOrder}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding a new product */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a new product, please enter the name, select a category, and upload an image.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Product Name"
            fullWidth
            variant="standard"
            value={newProduct.name}
            onChange={handleInputChange}
          />
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFormSubmit}>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProductList;
