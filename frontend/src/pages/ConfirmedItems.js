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
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import ColumnSelector from '../components/ColumnSelector';

function ConfirmedItems() {
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredItems, setFilteredItems] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderComments, setOrderComments] = useState({});
  const [itemComments, setItemComments] = useState({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [itemCommentDialogOpen, setItemCommentDialogOpen] = useState(false);
  const [currentCommentOrderId, setCurrentCommentOrderId] = useState(null);
  const [currentItemComment, setCurrentItemComment] = useState({ orderId: null, productId: null, itemIndex: null });
  const [commentText, setCommentText] = useState('');
  const [itemCommentText, setItemCommentText] = useState('');
  
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
    fetch('http://10.167.49.200:3007/confirmed-items')
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

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleOpenCommentDialog = (orderId) => {
    setCurrentCommentOrderId(orderId);
    setCommentText(orderComments[orderId] || '');
    setCommentDialogOpen(true);
  };

  const handleSaveComment = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/update-order-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: currentCommentOrderId,
          comment: commentText,
        }),
      });

      if (response.ok) {
        // Update local state
        setOrderComments(prev => ({
          ...prev,
          [currentCommentOrderId]: commentText
        }));
        setCommentDialogOpen(false);
        setCurrentCommentOrderId(null);
        setCommentText('');
        alert('Order comment updated successfully!');
      } else {
        alert('Failed to update order comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating order comment');
    }
  };

  const handleOpenItemCommentDialog = (orderId, productId, itemIndex) => {
    setCurrentItemComment({ orderId, productId, itemIndex });
    setItemCommentText(itemComments[`${orderId}-${productId}-${itemIndex}`] || '');
    setItemCommentDialogOpen(true);
  };

  const handleSaveItemComment = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/update-item-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: currentItemComment.orderId,
          productId: currentItemComment.productId,
          itemIndex: currentItemComment.itemIndex,
          comment: itemCommentText,
        }),
      });

      if (response.ok) {
        // Update local state
        setItemComments(prev => ({
          ...prev,
          [`${currentItemComment.orderId}-${currentItemComment.productId}-${currentItemComment.itemIndex}`]: itemCommentText
        }));
        setItemCommentDialogOpen(false);
        setCurrentItemComment({ orderId: null, productId: null, itemIndex: null });
        setItemCommentText('');
        alert('Item comment updated successfully!');
      } else {
        alert('Failed to update item comment');
      }
    } catch (error) {
      console.error('Error updating item comment:', error);
      alert('Error updating item comment');
    }
  };

  // Grouping confirmed items by order_id
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }
    acc[item.order_id].push(item);
    return acc;
  }, {});

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

      {/* Display items grouped by order_id */}
      {Object.keys(groupedItems).map(orderId => (
        <Accordion 
          key={orderId} 
          expanded={expandedOrders[orderId] || false}
          onChange={handleAccordionChange(orderId)}
          sx={{ marginBottom: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${orderId}-content`}
            id={`panel-${orderId}-header`}
            sx={{ backgroundColor: '#f5f5f5' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Order ID: {orderId}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {orderComments[orderId] && (
                  <Chip 
                    label="Has Order Comment" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
                {groupedItems[orderId].some(item => 
                  Object.keys(itemComments).some(key => key.startsWith(`${orderId}-${item.product_id}-`))
                ) && (
                  <Chip 
                    label="Has Item Comments" 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                )}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCommentDialog(orderId);
                  }}
                >
                  {orderComments[orderId] ? 'Edit Order Comment' : 'Add Order Comment'}
                </Button>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
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
                  {groupedItems[orderId].map((item) => (
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {orderComments[orderId] ? (
                              <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {orderComments[orderId]}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No order comment
                              </Typography>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleOpenCommentDialog(orderId)}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              {orderComments[orderId] ? 'Edit' : 'Add'}
                            </Button>
                          </Box>
                        </TableCell>
                      )}
                      {visibleColumns.itemComment && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {(() => {
                              // Get all item comments for this item
                              const itemCommentsForThisItem = Object.keys(itemComments)
                                .filter(key => key.startsWith(`${orderId}-${item.product_id}-`))
                                .map(key => {
                                  const itemIndex = key.split('-')[2];
                                  return { itemIndex: parseInt(itemIndex), comment: itemComments[key] };
                                });
                              
                              return itemCommentsForThisItem.length > 0 ? (
                                <Typography variant="body2" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {itemCommentsForThisItem.map(ic => `Item ${ic.itemIndex + 1}: ${ic.comment}`).join('; ')}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  No item comments
                                </Typography>
                              );
                            })()}
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={() => handleOpenItemCommentDialog(orderId, item.product_id, 0)}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              Edit Items
                            </Button>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Order Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {orderComments[currentCommentOrderId] ? 'Edit Order Comment' : 'Add Order Comment'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            This comment applies to the entire order (Order ID: {currentCommentOrderId})
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            label="Order Comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your order comment here..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveComment} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Item Comment Dialog */}
      <Dialog open={itemCommentDialogOpen} onClose={() => setItemCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {itemComments[`${currentItemComment.orderId}-${currentItemComment.productId}-${currentItemComment.itemIndex}`] ? 'Edit Item Comment' : 'Add Item Comment'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            This comment applies to Item #{(currentItemComment.itemIndex || 0) + 1} in Order ID: {currentItemComment.orderId}
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            label="Item Comment"
            value={itemCommentText}
            onChange={(e) => setItemCommentText(e.target.value)}
            placeholder="Enter your item comment here..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveItemComment} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ConfirmedItems;
