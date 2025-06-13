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
  TextField, 
  Button, 
  Box
} from '@mui/material';
import { format } from 'date-fns';
import ColumnSelector from '../components/ColumnSelector';

function ConfirmedItems() {
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredItems, setFilteredItems] = useState([]);
  const [orderComments, setOrderComments] = useState({});
  const [itemComments, setItemComments] = useState({});
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productName: true,
    serialNumber: true,
    quantity: true,
    orderDate: true,
    confirmDate: true,
    orderedBy: true,
    comment: true,
    itemComment: true
  });

  const columnLabels = {
    productName: 'Product Name',
    serialNumber: 'Serial Number',
    quantity: 'Quantity',
    orderDate: 'Order Date',
    confirmDate: 'Confirm Date',
    orderedBy: 'Ordered By',
    comment: 'Order Comment',
    itemComment: 'Item Comment'
  };

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  useEffect(() => {
    // Fetch the confirmed items from the backend
    fetch(`${process.env.REACT_APP_API_URL || 'http://10.167.49.200:3004'}/confirmed-items`)
      .then(response => response.json())
      .then(data => {
        setConfirmedItems(data);
        setFilteredItems(data); // Initialize filtered items with all items
        
        // Extract order-level comments from confirmed items
        const comments = {};
        data.forEach(item => {
          if (item.comment) {
            comments[item.order_id] = item.comment;
          }
        });
        setOrderComments(comments);

        // Extract item-level comments from confirmed items
        const itemComments = {};
        data.forEach(item => {
          if (item.item_comment) {
            try {
              const parsedComments = JSON.parse(item.item_comment);
              Object.keys(parsedComments).forEach(itemIndex => {
                itemComments[`${item.order_id}-${item.product_id}-${itemIndex}`] = parsedComments[itemIndex];
              });
            } catch (e) {
              // Handle old format (single string comment)
              itemComments[`${item.order_id}-${item.product_id}-0`] = item.item_comment;
            }
          }
        });
        setItemComments(itemComments);
      })
      .catch(error => console.error('Error fetching confirmed items:', error));
  }, []);

  // Function to handle search when search button is clicked
  const handleSearch = () => {
    const value = searchTerm.toLowerCase();

    const filtered = confirmedItems.filter(item =>
      (item.product_name && item.product_name.toLowerCase().includes(value)) ||
      (item.order_id && item.order_id.toLowerCase().includes(value)) ||
      (item.quantity && item.quantity.toString().includes(value)) ||
      (item.order_date && item.order_date.toLowerCase().includes(value)) ||
      (item.confirm_date && item.confirm_date.toLowerCase().includes(value)) ||
      (item.ordered_by && item.ordered_by.toLowerCase().includes(value))
    );
    setFilteredItems(filtered);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders Fulfilled
      </Typography>

      {/* Search Input */}
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by product name, order ID, quantity, ordered by, etc."
        sx={{ marginBottom: '20px' }}
      />

      {/* Search Button */}
      <Button variant="contained" color="primary" onClick={handleSearch} sx={{ marginBottom: '20px' }}>
        Search
      </Button>

      {/* Column Selection */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <ColumnSelector
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          columnLabels={columnLabels}
        />
      </Box>

      {/* Display each item individually */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {visibleColumns.productName && <TableCell>Product Name</TableCell>}
              {visibleColumns.serialNumber && <TableCell>Serial Number</TableCell>}
              {visibleColumns.quantity && <TableCell>Quantity</TableCell>}
              {visibleColumns.orderDate && <TableCell>Order Date</TableCell>}
              {visibleColumns.confirmDate && <TableCell>Confirm Date</TableCell>}
              {visibleColumns.orderedBy && <TableCell>Ordered By</TableCell>}
              {visibleColumns.comment && <TableCell>Order Comment</TableCell>}
              {visibleColumns.itemComment && <TableCell>Item Comment</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                {visibleColumns.productName && <TableCell>{item.product_name || 'N/A'}</TableCell>}
                {visibleColumns.serialNumber && (
                  <TableCell>
                    {item.serial_numbers ? (
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {JSON.parse(item.serial_numbers).join(', ')}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No serial numbers
                      </Typography>
                    )}
                  </TableCell>
                )}
                {visibleColumns.quantity && <TableCell>{item.quantity || 0}</TableCell>}
                {visibleColumns.orderDate && <TableCell>{format(new Date(item.order_date), 'yyyy-MM-dd')}</TableCell>}
                {visibleColumns.confirmDate && <TableCell>{format(new Date(item.confirm_date), 'yyyy-MM-dd')}</TableCell>}
                {visibleColumns.orderedBy && (
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getDisplayName(item.ordered_by)}
                    </Typography>
                  </TableCell>
                )}
                {visibleColumns.comment && (
                  <TableCell>
                    {orderComments[item.order_id] ? (
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {orderComments[item.order_id]}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No order comment
                      </Typography>
                    )}
                  </TableCell>
                )}
                {visibleColumns.itemComment && (
                  <TableCell>
                    {itemComments[`${item.order_id}-${item.product_id}-0`] ? (
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {itemComments[`${item.order_id}-${item.product_id}-0`]}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No item comment
                      </Typography>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default ConfirmedItems;
