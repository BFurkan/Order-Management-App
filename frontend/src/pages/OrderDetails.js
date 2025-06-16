import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { 
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import theme from './theme';
import ColumnSelector from '../components/ColumnSelector';

function OrderDetails() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [products, setProducts] = useState({});
  const [serialNumbers, setSerialNumbers] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  
  // Order-level comments
  const [orderComments, setOrderComments] = useState({});
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentCommentOrderId, setCurrentCommentOrderId] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  // Product-level comments
  const [productComments, setProductComments] = useState({});
  const [productCommentDialogOpen, setProductCommentDialogOpen] = useState(false);
  const [currentProductComment, setCurrentProductComment] = useState({ orderId: null, productId: null });
  const [productCommentText, setProductCommentText] = useState('');
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    productName: true,
    orderDate: true,
    totalQuantity: true,
    orderedBy: true,
    serialNumber: true,
    action: true,
    orderComment: true,
    productComment: true
  });

  const columnLabels = {
    productName: 'Product Name',
    orderDate: 'Order Date',
    totalQuantity: 'Total Quantity',
    orderedBy: 'Ordered By',
    serialNumber: 'Serial Number',
    action: 'Action',
    orderComment: 'Order Comment',
    productComment: 'Product Comment'
  };

  // Function to extract username from email (part before @)
  const getDisplayName = (email) => {
    if (!email) return 'N/A';
    return email.split('@')[0];
  };

  useEffect(() => {
    fetch('http://10.167.49.200:3007/products')
      .then(response => response.json())
      .then(data => {
        const productMap = data.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});
        setProducts(productMap);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const calculateTotals = useCallback((orders) => {
    const totals = { monitors: 0, notebooks: 0, accessories: 0 };

    Object.values(orders).forEach(orderGroup => {
      orderGroup.forEach(order => {
        const product = products[order.product_id];
        if (product) {
          if (product.category === 'Monitors') {
            totals.monitors += order.quantity;
          } else if (product.category === 'Notebooks') {
            totals.notebooks += order.quantity;
          } else if (product.category === 'Accessories') {
            totals.accessories += order.quantity;
          }
        }
      });
    });

    return totals;
  }, [products]);

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleExport = (orderId) => {
    const orders = groupedOrders[orderId] || [];
    const activeOrders = orders.filter(order => order.quantity > 0);
    
    const csvContent = [
      ['Product Name', 'Order Date', 'Total Quantity', 'Ordered By'].join(','),
      ...activeOrders.map(order => [
        `"${order.product_name}"`,
        `"${format(new Date(order.order_date), 'MMM dd, yyyy')}"`,
        order.quantity,
        `"${getDisplayName(order.ordered_by)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-details-${orderId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetch('http://10.167.49.200:3007/orders')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const grouped = data.reduce((acc, order) => {
          if (!acc[order.order_id]) {
            acc[order.order_id] = [];
          }
          acc[order.order_id].push(order);
          return acc;
        }, {});
       setGroupedOrders(grouped);
       
       // Extract order-level comments from orders
       const comments = {};
       data.forEach(order => {
         if (order.comment) {
           comments[order.order_id] = order.comment;
         }
       });
       setOrderComments(comments);

       // Extract product-level comments from orders
       const productCommentsData = {};
       data.forEach(order => {
         if (order.item_comment) {
           productCommentsData[`${order.order_id}-${order.product_id}`] = order.item_comment;
         }
       });
       setProductComments(productCommentsData);
      })
      .catch(error => console.error('Error fetching orders:', error));
  }, []);

  const handleSerialNumberChange = (order_id, product_id, value) => {
    setSerialNumbers(prev => ({
      ...prev,
      [`${order_id}-${product_id}`]: value,
    }));
  };

  // Order-level comment handlers
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
      } else {
        alert('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating comment');
    }
  };

  // Product-level comment handlers
  const handleOpenProductCommentDialog = (orderId, productId) => {
    setCurrentProductComment({ orderId, productId });
    setProductCommentText(productComments[`${orderId}-${productId}`] || '');
    setProductCommentDialogOpen(true);
  };

  const handleSaveProductComment = async () => {
    try {
      const response = await fetch('http://10.167.49.200:3007/update-product-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: currentProductComment.orderId,
          productId: currentProductComment.productId,
          comment: productCommentText,
        }),
      });

      if (response.ok) {
        // Update local state
        setProductComments(prev => ({
          ...prev,
          [`${currentProductComment.orderId}-${currentProductComment.productId}`]: productCommentText
        }));
        setProductCommentDialogOpen(false);
        setCurrentProductComment({ orderId: null, productId: null });
        setProductCommentText('');
      } else {
        alert('Failed to update product comment');
      }
    } catch (error) {
      console.error('Error updating product comment:', error);
      alert('Error updating product comment');
    }
  };

  const handleConfirm = (order_id, product_id) => {
    const serialNumber = serialNumbers[`${order_id}-${product_id}`];
    if (!serialNumber) {
      alert('Please enter a serial number before confirming.');
      return;
    }

    fetch('http://10.167.49.200:3007/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id,
        product_id,
        serialNumber,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        alert('Order confirmed successfully!');
        // Refresh the page or update state
        window.location.reload();
      })
      .catch(error => {
        console.error('Error confirming order:', error);
        alert('Failed to confirm order');
      });
  };

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };

  const getColumnsForOrder = (orderId) => {
    const baseColumns = [
      {
        field: 'product_name',
        headerName: 'Product Name',
        flex: 1,
        minWidth: 200,
        resizable: true,
        renderCell: (params) => {
          const product = products[params.row.product_id];
          return product?.name || 'Unknown Product';
        },
      },
      {
        field: 'order_date',
        headerName: 'Order Date',
        width: 150,
        minWidth: 120,
        maxWidth: 200,
        resizable: true,
        renderCell: (params) => format(new Date(params.row.order_date), 'MMM dd, yyyy'),
      },
      {
        field: 'quantity',
        headerName: 'Total Quantity',
        width: 150,
        minWidth: 100,
        maxWidth: 200,
        resizable: true,
        type: 'number',
      },
      {
        field: 'ordered_by',
        headerName: 'Ordered By',
        width: 150,
        minWidth: 120,
        maxWidth: 200,
        resizable: true,
        renderCell: (params) => getDisplayName(params.row.ordered_by),
      },
      {
        field: 'serial_number',
        headerName: 'Serial Number',
        width: 200,
        minWidth: 150,
        maxWidth: 300,
        resizable: true,
        renderCell: (params) => (
          <TextField
            type="text"
            label="Serial Number"
            size="small"
            onChange={(e) => handleSerialNumberChange(orderId, params.row.product_id, e.target.value)}
            value={serialNumbers[`${orderId}-${params.row.product_id}`] || ''}
            placeholder="Enter Serial Number"
            sx={{ width: '100%' }}
          />
        ),
        sortable: false,
      },
      {
        field: 'action',
        headerName: 'Action',
        width: 120,
        minWidth: 100,
        maxWidth: 150,
        resizable: true,
        renderCell: (params) => (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleConfirm(orderId, params.row.product_id)}
            disabled={params.row.quantity <= 0}
          >
            Confirm
          </Button>
        ),
        sortable: false,
      },
      {
        field: 'order_comment',
        headerName: 'Order Comment',
        width: 150,
        minWidth: 120,
        maxWidth: 200,
        resizable: true,
        renderCell: () => (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenCommentDialog(orderId)}
          >
            Edit Comment
          </Button>
        ),
        sortable: false,
      },
      {
        field: 'product_comment',
        headerName: 'Product Comment',
        width: 150,
        minWidth: 120,
        maxWidth: 200,
        resizable: true,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenProductCommentDialog(orderId, params.row.product_id)}
          >
            Item Comment
          </Button>
        ),
        sortable: false,
      },
    ];

    // Filter columns based on visibility
    return baseColumns.filter(column => {
      switch (column.field) {
        case 'product_name': return visibleColumns.productName;
        case 'order_date': return visibleColumns.orderDate;
        case 'quantity': return visibleColumns.totalQuantity;
        case 'ordered_by': return visibleColumns.orderedBy;
        case 'serial_number': return visibleColumns.serialNumber;
        case 'action': return visibleColumns.action;
        case 'order_comment': return visibleColumns.orderComment;
        case 'product_comment': return visibleColumns.productComment;
        default: return true;
      }
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Details
        </Typography>

        {/* Column Selection */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <ColumnSelector
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
            columnLabels={columnLabels}
          />
        </Box>

        {Object.keys(groupedOrders).map(orderId => {
          const orders = groupedOrders[orderId];
          // Filter out fully confirmed items (quantity = 0)
          const activeOrders = orders.filter(order => order.quantity > 0);
          
          // If no active orders, don't render the accordion
          if (activeOrders.length === 0) {
            return null;
          }

          return (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">
                      Order ID: {orderId}
                    </Typography>
                    
                    {/* Category totals beside Order ID - only count active orders */}
                    {(() => {
                      const orderTotals = { monitors: 0, notebooks: 0, accessories: 0 };
                      activeOrders.forEach(order => {
                        const productName = order.product_name.toLowerCase();
                        // First check for accessories (to avoid misclassification)
                        if (productName.includes('dock') || productName.includes('docking') ||
                            productName.includes('charger') || productName.includes('adapter') ||
                            productName.includes('cable') || productName.includes('mouse') ||
                            productName.includes('keyboard') || productName.includes('headset') ||
                            productName.includes('webcam') || productName.includes('speaker') ||
                            productName.includes('hub') || productName.includes('stand') ||
                            productName.includes('bag') || productName.includes('case')) {
                          orderTotals.accessories += order.quantity;
                        } else if (productName.includes('monitor') || productName.includes('display')) {
                          orderTotals.monitors += order.quantity;
                        } else if (productName.includes('notebook') || productName.includes('laptop') || 
                                   productName.includes('thinkpad') || productName.includes('elitebook') || 
                                   productName.includes('macbook') || productName.includes('surface') ||
                                   productName.includes('k14') || productName.includes('lenovo') ||
                                   productName.includes('ideapad') || productName.includes('yoga') ||
                                   productName.includes('inspiron') || productName.includes('latitude') ||
                                   productName.includes('pavilion') || productName.includes('probook') ||
                                   productName.includes('toughbook') || productName.includes('fz55')) {
                          orderTotals.notebooks += order.quantity;
                        } else {
                          orderTotals.accessories += order.quantity;
                        }
                      });
                      return (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {orderTotals.monitors > 0 && (
                            <Chip
                              label={`Monitors: ${orderTotals.monitors}`}
                              size="small"
                              sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                            />
                          )}
                          {orderTotals.notebooks > 0 && (
                            <Chip
                              label={`Notebooks: ${orderTotals.notebooks}`}
                              size="small"
                              sx={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}
                            />
                          )}
                          {orderTotals.accessories > 0 && (
                            <Chip
                              label={`Accessories: ${orderTotals.accessories}`}
                              size="small"
                              sx={{ backgroundColor: '#e8f5e8', color: '#388e3c' }}
                            />
                          )}
                        </Box>
                      );
                    })()}
                  </Box>
                  
                  {/* Order date on the right */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {activeOrders.length > 0 && format(new Date(activeOrders[0].order_date), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {/* Export Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={() => handleExport(orderId)}
                    size="small"
                  >
                    Export to CSV
                  </Button>
                </Box>

                {/* DataGrid with resizable columns */}
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={activeOrders.map((order, index) => ({ ...order, id: `${orderId}-${index}` }))}
                    columns={getColumnsForOrder(orderId)}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    rowHeight={60}
                    sx={{
                      '& .MuiDataGrid-cell': {
                        borderColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                      },
                      '& .MuiDataGrid-row': {
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      },
                    }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* Order Comment Dialog */}
        <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Order Comment</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Order Comment"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveComment} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Product Comment Dialog */}
        <Dialog open={productCommentDialogOpen} onClose={() => setProductCommentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Product Comment</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Product Comment"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={productCommentText}
              onChange={(e) => setProductCommentText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductCommentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProductComment} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default OrderDetails;



