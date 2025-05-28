import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '../components';

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
<<<<<<< HEAD
 	const today = new Date();
        today.setDate(today.getDate() + 1);  // Adds 1 day
=======
        const today = new Date();
        today.setDate(today.getDate() + 1);
>>>>>>> origin/master
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
<<<<<<< HEAD

=======
>>>>>>> origin/master

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

<<<<<<< HEAD
=======
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
        id: data.id,
        name: data.name,
        category: data.category,
        image: data.image
      }]);
      handleClose();
      setNewProduct({ name: '', category: 'Notebooks', image: null });
      window.location.reload();
    })
    .catch(error => {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + error.message);
    });
  };
>>>>>>> origin/master

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Product List</h1>
        <Button onClick={handleClickOpen} variant="primary">
          Add New Product
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "primary" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="mb-2"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell isHeader>Image</TableCell>
              <TableCell isHeader>Product</TableCell>
              <TableCell isHeader>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
<<<<<<< HEAD
                <TableCell sx={{ border: '1px solid #bbb' }}>
                  <img src={`http://10.167.49.200:3004${product.image}`} alt={product.name} style={{ width: '100px' }} />
=======
                <TableCell>
                  <img 
                    src={`http://10.167.49.200:3004${product.image}`} 
                    alt={product.name} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
>>>>>>> origin/master
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={order[product.id] || 0}
                    onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                    className="w-20"
                    min="0"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Fixed Place Order Button */}
      <div className="fixed bottom-4 right-4">
        <Button
          variant="danger"
          onClick={handleConfirmOpen}
          size="lg"
          className="shadow-lg"
        >
          Place Order
        </Button>
      </div>

      {/* Add Product Modal */}
      {open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h3>
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  required
                />
                <Select
                  label="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  options={categories}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleFormSubmit}>
                  Add Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Order</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to place this order?
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={handleConfirmClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleOrder}>
                  Confirm Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
