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
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productName: true,
    quantity: false,
    serialNumber: true,
    orderDate: true,
    confirmDate: true,
    orderedBy: true,
    comment: true
  });

  const columnLabels = {
    productName: 'Product Name',
    quantity: 'Quantity',
    serialNumber: 'Serial Number',
    orderDate: 'Order Date',
    confirmDate: 'Confirm Date',
    orderedBy: 'Ordered By',
    comment: 'Comment'
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
        
        // Extract comments from confirmed items
        const comments = {};
        data.forEach(item => {
          if (item.comment) {
            comments[item.order_id] = item.comment;
          }
        });
        setOrderComments(comments);
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 2 }}>
                {(() => {
                  const orderTotals = { monitors: 0, notebooks: 0, accessories: 0 };
                  groupedItems[orderId].forEach(item => {
                    const productName = item.product_name.toLowerCase();
                    // First check for accessories (to avoid misclassification)
                    if (productName.includes('dock') || productName.includes('docking') ||
                        productName.includes('charger') || productName.includes('adapter') ||
                        productName.includes('cable') || productName.includes('mouse') ||
                        productName.includes('keyboard') || productName.includes('headset') ||
                        productName.includes('webcam') || productName.includes('speaker') ||
                        productName.includes('hub') || productName.includes('stand') ||
                        productName.includes('bag') || productName.includes('case')) {
                      orderTotals.accessories += item.quantity;
                    } else if (productName.includes('monitor') || productName.includes('display')) {
                      orderTotals.monitors += item.quantity;
                    } else if (productName.includes('notebook') || productName.includes('laptop') || 
                               productName.includes('thinkpad') || productName.includes('elitebook') || 
                               productName.includes('macbook') || productName.includes('surface') ||
                               productName.includes('k14') || productName.includes('lenovo') ||
                               productName.includes('ideapad') || productName.includes('yoga') ||
                               productName.includes('inspiron') || productName.includes('latitude') ||
                               productName.includes('pavilion') || productName.includes('probook') ||
                               productName.includes('toughbook') || productName.includes('fz55')) {
                      orderTotals.notebooks += item.quantity;
                    } else {
                      orderTotals.accessories += item.quantity;
                    }
                  });
                  return (
                    <Box sx={{ display: 'flex', gap: 1, fontSize: '0.75rem' }}>
                      {orderTotals.monitors > 0 && (
                        <Typography variant="caption" sx={{ backgroundColor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1 }}>
                          Monitors: {orderTotals.monitors}
                        </Typography>
                      )}
                      {orderTotals.notebooks > 0 && (
                        <Typography variant="caption" sx={{ backgroundColor: '#f3e5f5', px: 1, py: 0.5, borderRadius: 1 }}>
                          Notebooks: {orderTotals.notebooks}
                        </Typography>
                      )}
                      {orderTotals.accessories > 0 && (
                        <Typography variant="caption" sx={{ backgroundColor: '#e8f5e8', px: 1, py: 0.5, borderRadius: 1 }}>
                          Accessories: {orderTotals.accessories}
                        </Typography>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {/* Order Comment Section */}
            {orderComments[orderId] && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
                  Order Comment
                </Typography>
                <Typography variant="body2" sx={{ p: 1, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  {orderComments[orderId]}
                </Typography>
              </Box>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {visibleColumns.productName && <TableCell>Product Name</TableCell>}
                    {visibleColumns.quantity && <TableCell>Quantity</TableCell>}
                    {visibleColumns.serialNumber && <TableCell>Serial Number</TableCell>}
                    {visibleColumns.orderDate && <TableCell>Order Date</TableCell>}
                    {visibleColumns.confirmDate && <TableCell>Confirm Date</TableCell>}
                    {visibleColumns.orderedBy && <TableCell>Ordered By</TableCell>}
                    {visibleColumns.comment && <TableCell>Comment</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedItems[orderId].map((item) => (
                    <TableRow key={item.id}>
                      {visibleColumns.productName && <TableCell>{item.product_name || 'N/A'}</TableCell>}
                      {visibleColumns.quantity && <TableCell>{item.quantity || 0}</TableCell>}
                      {visibleColumns.serialNumber && <TableCell>{item.serial_number || 'N/A'}</TableCell>}
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
                          {orderComments[orderId] ? (
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {orderComments[orderId]}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No comment
                            </Typography>
                          )}
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
    </Container>
  );
}

export default ConfirmedItems;
