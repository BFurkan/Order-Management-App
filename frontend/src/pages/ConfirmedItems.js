import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Box,
  Chip,
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
  MenuItem
} from '@mui/material';
import { 
  FileDownload as ExportIcon,
  ViewColumn as ColumnsIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import theme from './theme';
import ColumnSelector from '../components/ColumnSelector';

function ConfirmedItems() {
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredItems, setFilteredItems] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderComments, setOrderComments] = useState({});
  
  // Enhanced table features
  const [sortBy, setSortBy] = useState('confirmDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterText, setFilterText] = useState('');
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  
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

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const handleExport = (orderId) => {
    const items = groupedItems[orderId] || [];
    
    const csvContent = [
      ['Product Name', 'Quantity', 'Serial Number', 'Order Date', 'Confirm Date', 'Ordered By', 'Comment'].join(','),
      ...items.map(item => [
        `"${item.product_name}"`,
        item.quantity,
        `"${item.serial_number || 'N/A'}"`,
        `"${format(new Date(item.order_date), 'MMM dd, yyyy HH:mm')}"`,
        `"${format(new Date(item.confirm_date), 'MMM dd, yyyy HH:mm')}"`,
        `"${getDisplayName(item.ordered_by)}"`,
        `"${orderComments[orderId] || 'No comment'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confirmed-items-${orderId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'productName':
          aValue = a.product_name;
          bValue = b.product_name;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'serialNumber':
          aValue = a.serial_number || '';
          bValue = b.serial_number || '';
          break;
        case 'orderDate':
          aValue = new Date(a.order_date);
          bValue = new Date(b.order_date);
          break;
        case 'confirmDate':
          aValue = new Date(a.confirm_date);
          bValue = new Date(b.confirm_date);
          break;
        case 'orderedBy':
          aValue = getDisplayName(a.ordered_by);
          bValue = getDisplayName(b.ordered_by);
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
    if (!filterText) return data;
    
    return data.filter(item => 
      item.product_name.toLowerCase().includes(filterText.toLowerCase()) ||
      getDisplayName(item.ordered_by).toLowerCase().includes(filterText.toLowerCase()) ||
      item.quantity.toString().includes(filterText) ||
      (item.serial_number || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (orderComments[item.order_id] || '').toLowerCase().includes(filterText.toLowerCase())
    );
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
    <ThemeProvider theme={theme}>
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
        {Object.keys(groupedItems).map(orderId => {
          const processedItems = sortData(filterData(groupedItems[orderId]));
          
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
                    {/* Category totals beside Order ID */}
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
                      {groupedItems[orderId].length > 0 && format(new Date(groupedItems[orderId][0].order_date), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {/* Enhanced Table Toolbar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Filter items..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    InputProps={{
                      startAdornment: <FilterIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
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
                      onClick={() => handleExport(orderId)}
                      title="Export to CSV"
                    >
                      <ExportIcon />
                    </IconButton>
                  </Box>
                </Box>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
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
                        {visibleColumns.serialNumber && (
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'serialNumber'}
                              direction={sortBy === 'serialNumber' ? sortDirection : 'asc'}
                              onClick={() => handleSort('serialNumber')}
                            >
                              Serial Number
                            </TableSortLabel>
                          </TableCell>
                        )}
                        {visibleColumns.orderDate && (
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'orderDate'}
                              direction={sortBy === 'orderDate' ? sortDirection : 'asc'}
                              onClick={() => handleSort('orderDate')}
                            >
                              Order Date
                            </TableSortLabel>
                          </TableCell>
                        )}
                        {visibleColumns.confirmDate && (
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'confirmDate'}
                              direction={sortBy === 'confirmDate' ? sortDirection : 'asc'}
                              onClick={() => handleSort('confirmDate')}
                            >
                              Confirm Date
                            </TableSortLabel>
                          </TableCell>
                        )}
                        {visibleColumns.orderedBy && (
                          <TableCell>
                            <TableSortLabel
                              active={sortBy === 'orderedBy'}
                              direction={sortBy === 'orderedBy' ? sortDirection : 'asc'}
                              onClick={() => handleSort('orderedBy')}
                            >
                              Ordered By
                            </TableSortLabel>
                          </TableCell>
                        )}
                        {visibleColumns.comment && <TableCell>Comment</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {processedItems.map((item) => (
                        <TableRow key={item.id} hover>
                          {visibleColumns.productName && <TableCell>{item.product_name || 'N/A'}</TableCell>}
                          {visibleColumns.quantity && <TableCell>{item.quantity || 0}</TableCell>}
                          {visibleColumns.serialNumber && <TableCell>{item.serial_number || 'N/A'}</TableCell>}
                          {visibleColumns.orderDate && <TableCell>{format(new Date(item.order_date), 'MMM dd, yyyy HH:mm')}</TableCell>}
                          {visibleColumns.confirmDate && <TableCell>{format(new Date(item.confirm_date), 'MMM dd, yyyy HH:mm')}</TableCell>}
                          {visibleColumns.orderedBy && (
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {getDisplayName(item.ordered_by)}
                              </Typography>
                            </TableCell>
                          )}
                          {visibleColumns.comment && (
                            <TableCell>
                              <Typography variant="body2" sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {orderComments[orderId] || 'No comment'}
                              </Typography>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}

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
      </Container>
    </ThemeProvider>
  );
}

export default ConfirmedItems;
