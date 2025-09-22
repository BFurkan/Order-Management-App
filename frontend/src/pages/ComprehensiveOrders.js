import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Box,
  Chip,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  MenuItem,
  Avatar,
  InputAdornment,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Search as SearchIcon,
  BrokenImage as BrokenImageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { safeFormatDate } from '../utils/dateUtils';
import theme from './theme';
import ColumnSelector from '../components/ColumnSelector';
import { supabase } from '../supabaseClient'; // Import supabase

function ComprehensiveOrders() {
  const [comprehensiveData, setComprehensiveData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  
  // States for true item counts
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Enhanced search features
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('all');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    orderId: true,
    productName: true,
    status: true,
    serialNumber: true,
    orderDate: true,
    confirmDate: true,
    deployDate: true,
  });

  const recordTypes = ['all', 'remaining', 'confirmed', 'deployed'];

  useEffect(() => {
    fetchComprehensiveData();
  }, []);

  const fetchComprehensiveData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_comprehensive_orders');
      if (error) throw error;
      
      const enrichedData = data.map(item => ({
        ...item,
        image: item.image ? supabase.storage.from('product-images').getPublicUrl(item.image).data.publicUrl : null
      }));
      setComprehensiveData(enrichedData);

    } catch (error) {
      console.error('Error fetching comprehensive orders:', error.message);
    }
  };

  // Group data by order_id for accordion display - use filtered data
  const groupedData = React.useMemo(() => {
    return filteredData.reduce((acc, item) => {
      // Group both order and deployed records by order_id
      const orderId = String(item.order_id).trim();
      if (!acc[orderId]) {
        acc[orderId] = [];
      }
      acc[orderId].push(item);
      return acc;
    }, {});
  }, [filteredData]);


  // Filter and search logic
  useEffect(() => {
    let filtered = [...comprehensiveData];

    // Search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        return (
          (item.order_id && item.order_id.toString().trim().toLowerCase().includes(lowerSearchTerm)) ||
          (item.product_name && item.product_name.toLowerCase().includes(lowerSearchTerm)) ||
          (item.category && item.category.toLowerCase().includes(lowerSearchTerm)) ||
          (item.ordered_by && item.ordered_by.toLowerCase().includes(lowerSearchTerm)) ||
          (item.location && item.location.toLowerCase().includes(lowerSearchTerm)) ||
          (item.serial_number && item.serial_number.toLowerCase().includes(lowerSearchTerm)) ||
          (item.site && item.site.toLowerCase().includes(lowerSearchTerm)) ||
          (item.managed_by && item.managed_by.toLowerCase().includes(lowerSearchTerm)) ||
          (item.comment && item.comment.toLowerCase().includes(lowerSearchTerm)) ||
          (item.item_comment && item.item_comment.toLowerCase().includes(lowerSearchTerm))
        );
      });
    }

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.order_date || item.deploy_date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate + 'T23:59:59') : new Date('2100-12-31');
        return itemDate >= start && itemDate <= end;
      });
    }

    // Record type filter - filter by status instead of record_type
    if (recordTypeFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (recordTypeFilter === 'remaining') {
          return item.record_type === 'order' && (item.quantity || 0) > 0;
        } else if (recordTypeFilter === 'confirmed') {
          const confirmedRemaining = Math.max(0, (item.confirmed_quantity || 0) - parseInt(item.deployed_quantity || 0, 10));
          return item.record_type === 'order' && confirmedRemaining > 0;
        } else if (recordTypeFilter === 'deployed') {
          return item.record_type === 'deployed';
        }
        return true;
      });
    }

    setFilteredData(filtered);
    setFilteredCount(filtered.length);
  }, [searchTerm, startDate, endDate, recordTypeFilter, comprehensiveData]);

  // Calculate total count
  useEffect(() => {
    setTotalCount(comprehensiveData.length);
  }, [comprehensiveData]);

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanded
    }));
  };


  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          Comprehensive Orders
        </Typography>

        {/* Search and Filter Controls */}
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search all fields..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                variant="outlined"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                variant="outlined"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={recordTypeFilter}
                  label="Status Filter"
                  onChange={(e) => setRecordTypeFilter(e.target.value)}
                >
                  {recordTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === 'all' ? 'All Status' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Summary Stats */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`Total Records: ${totalCount}`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={`Filtered: ${filteredCount}`} 
              color="secondary" 
              variant="outlined"
            />
            <Chip 
              label={`Remaining: ${comprehensiveData.filter(item => item.record_type === 'order' && (item.quantity || 0) > 0).length}`} 
              color="warning" 
              variant="outlined"
            />
            <Chip 
              label={`Confirmed: ${comprehensiveData.filter(item => {
                const confirmedRemaining = Math.max(0, (item.confirmed_quantity || 0) - parseInt(item.deployed_quantity || 0, 10));
                return item.record_type === 'order' && confirmedRemaining > 0;
              }).length}`} 
              color="success" 
              variant="outlined"
            />
            <Chip 
              label={`Deployed: ${comprehensiveData.filter(item => item.record_type === 'deployed').length}`} 
              color="info" 
              variant="outlined"
            />
          </Box>
        </Paper>

        {/* Column Selection */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <ColumnSelector
            visibleColumns={visibleColumns}
            onColumnToggle={setVisibleColumns}
            columnLabels={{
              orderId: 'Order ID',
              productName: 'Product Name',
              status: 'Status',
              serialNumber: 'Serial Number',
              orderDate: 'Order Date',
              confirmDate: 'Confirm Date',
              deployDate: 'Deploy Date',
            }}
          />
        </Box>

        {/* Table Headers */}
        {Object.values(visibleColumns).some(visible => visible) && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '120px 2fr 180px 120px',
            gap: 2, 
            p: 2, 
            mb: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            fontWeight: 600
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Order ID</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Item Summary</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Product Name</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Order Date</Typography>
          </Box>
        )}

        {/* Orders Accordion */}
        {Object.keys(groupedData).map((orderId) => {
          const orderItems = groupedData[orderId] || [];
          const isExpanded = expandedOrders[orderId] || false;
          
          // Skip empty orders
          if (orderItems.length === 0) {
            return null;
          }
          
          // Calculate summary statistics for this order - use same logic as OrderSummary
          const orderRecords = orderItems.filter(item => item.record_type === 'order');
          const deployedRecords = orderItems.filter(item => item.record_type === 'deployed');
          
          // Calculate totals using the same logic as OrderSummary
          const totalRemaining = orderRecords.reduce((sum, item) => sum + (item.quantity || 0), 0);
          const totalConfirmed = orderRecords.reduce((sum, item) => sum + Math.max(0, (item.confirmed_quantity || 0) - parseInt(item.deployed_quantity || 0, 10)), 0);
          const totalDeployed = deployedRecords.reduce((sum, item) => sum + (item.quantity || 1), 0);
          
          return (
            <Accordion 
              key={orderId} 
              expanded={isExpanded} 
              onChange={handleAccordionChange(orderId)}
              sx={{ marginBottom: 2 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${orderId}-content`}
                id={`panel-${orderId}-header`}
                sx={{ backgroundColor: '#f9f9f9' }}
              >
                {/* Table-like Row Layout: Order ID | Items Summary | Product Name | Date */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '120px 2fr 180px 120px',
                  gap: 2, 
                  width: '100%',
                  alignItems: 'center'
                }}>
                  {/* Order ID Column */}
                  <Box>
                    <Typography variant="subtitle1">
                      {orderId}
                    </Typography>
                  </Box>

                  {/* Items Summary Column */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-start', pl: 1 }}>
                    <Chip
                      label={`Remaining: ${totalRemaining}`}
                      size="small"
                      color={totalRemaining > 0 ? 'warning' : 'default'}
                      variant={totalRemaining > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                      label={`Confirmed: ${totalConfirmed}`}
                      size="small"
                      color={totalConfirmed > 0 ? 'success' : 'default'}
                      variant={totalConfirmed > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                      label={`Deployed: ${totalDeployed}`}
                      size="small"
                      color={totalDeployed > 0 ? 'info' : 'default'}
                      variant={totalDeployed > 0 ? 'filled' : 'outlined'}
                    />
                  </Box>

                  {/* Product Name Column */}
                  <Box>
                    {(() => {
                      // Get unique product names (one per product type)
                      const uniqueProducts = [...new Set(orderItems.map(item => item.product_name))];
                      return uniqueProducts.slice(0, 2).map((productName, index) => (
                        <Typography key={`product-${index}`} variant="body2">
                          {productName}
                        </Typography>
                      ));
                    })()}
                    {(() => {
                      const uniqueProducts = [...new Set(orderItems.map(item => item.product_name))];
                      return uniqueProducts.length > 2 && (
                        <Typography variant="body2" color="text.secondary">
                          +{uniqueProducts.length - 2} more...
                        </Typography>
                      );
                    })()}
                  </Box>

                  {/* Date Column */}
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {orderItems.length > 0 ? safeFormatDate(orderItems[0].order_date || orderItems[0].deploy_date) : ''}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {visibleColumns.productName && <TableCell>Product</TableCell>}
                        {visibleColumns.status && <TableCell>Status</TableCell>}
                        {visibleColumns.serialNumber && <TableCell>Serial Number</TableCell>}
                        {visibleColumns.orderDate && <TableCell>Order Date</TableCell>}
                        {visibleColumns.confirmDate && <TableCell>Confirm Date</TableCell>}
                        {visibleColumns.deployDate && <TableCell>Deploy Date</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        // --- DATA PREPARATION ---

                        // 1. REMAINING ITEMS
                        const remainingItems = orderItems.filter(item => item.record_type === 'order' && (item.quantity || 0) > 0);
                        const remainingAccessoryItems = remainingItems.filter(item => item.category && item.category.toLowerCase().includes('accessor'));
                        const remainingNonAccessoryItems = remainingItems.filter(item => !item.category || !item.category.toLowerCase().includes('accessor'));

                        // 2. CONFIRMED ITEMS
                        const orderRecords = orderItems.filter(item => item.record_type === 'order');
                        const deployedRecords = orderItems.filter(item => item.record_type === 'deployed');
                        
                        const parseSerialNumbers = (serialNumbersText) => {
                          if (!serialNumbersText) return [];
                          try {
                            if (serialNumbersText.startsWith('[') || serialNumbersText.startsWith('{')) {
                              const parsed = JSON.parse(serialNumbersText);
                              if (Array.isArray(parsed)) {
                                return parsed.map(s => String(s).trim()).filter(s => s);
                              }
                            }
                          } catch (e) {
                            // Not JSON, continue
                          }
                          return serialNumbersText
                            .split(',')
                            .map(s => s.trim().replace(/["[\]]/g, '')) // Remove quotes and brackets
                            .filter(s => s);
                        };

                        const confirmedNonAccessoryItems = [];
                        const confirmedAccessoryItemsGrouped = {};

                        orderRecords.forEach(order => {
                          const confirmedQty = order.confirmed_quantity || 0;
                          if (confirmedQty > 0) {
                            const isAccessory = order.category && order.category.toLowerCase().includes('accessor');
                            if (isAccessory) {
                              // For accessories, the backend already provides an accurate deployed_quantity
                              const deployedQty = order.deployed_quantity || 0;
                              const confirmedRemaining = confirmedQty - deployedQty;
                              
                              if (confirmedRemaining > 0) {
                                const productId = order.product_id;
                                if (!confirmedAccessoryItemsGrouped[productId]) {
                                  confirmedAccessoryItemsGrouped[productId] = { ...order, total_quantity: 0 };
                                }
                                confirmedAccessoryItemsGrouped[productId].total_quantity += confirmedRemaining;
                              }
                            } else {
                              const deployedForThisOrder = deployedRecords.filter(d => d.original_order_id === order.id);
                              const serialNumbers = parseSerialNumbers(order.serial_numbers);
                              const deployedSerials = new Set(deployedForThisOrder.map(d => d.serial_number));
                              serialNumbers.forEach((serialNumber, index) => {
                                if (!deployedSerials.has(serialNumber)) {
                                  confirmedNonAccessoryItems.push({
                                    ...order,
                                    serial_number: serialNumber,
                                    uniqueId: `confirmed-${order.id}-${index}`
                                  });
                                }
                              });
                            }
                          }
                        });
                        const confirmedAccessoryItems = Object.values(confirmedAccessoryItemsGrouped);

                        // 3. DEPLOYED ITEMS
                        const deployedItems = orderItems.filter(item => item.record_type === 'deployed');
                        const deployedAccessoryItemsRaw = deployedItems.filter(item => item.category && item.category.toLowerCase().includes('accessor'));
                        const deployedNonAccessoryItems = deployedItems.filter(item => !item.category || !item.category.toLowerCase().includes('accessor'));
                        
                        const deployedAccessoryItemsGrouped = {};
                        deployedAccessoryItemsRaw.forEach(item => {
                          const productId = item.product_id;
                          if (!deployedAccessoryItemsGrouped[productId]) {
                            deployedAccessoryItemsGrouped[productId] = { ...item, total_quantity: 0 };
                          }
                          deployedAccessoryItemsGrouped[productId].total_quantity += (item.quantity || 1);
                        });
                        const deployedAccessoryItems = Object.values(deployedAccessoryItemsGrouped);

                        // --- RENDER ---
                        return (
                          <>
                            {/* ====== NON-ACCESSORIES ====== */}

                            {/* Remaining Non-Accessories */}
                            {remainingNonAccessoryItems.map((item, index) => (
                              <TableRow key={`order-${item.id}-${index}`}>
                                {visibleColumns.productName && (
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      {item.image && !imageErrors[item.id] ? (
                                        <Avatar 
                                          src={item.image} 
                                          sx={{ mr: 2, width: 32, height: 32 }}
                                          onError={() => handleImageError(item.id)}
                                        />
                                      ) : (
                                        <BrokenImageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                      )}
                                      <Typography variant="body2">{item.product_name}</Typography>
                                    </Box>
                                  </TableCell>
                                )}
                                {visibleColumns.status && (
                                  <TableCell>
                                    <Chip 
                                      label="Remaining" 
                                      size="small" 
                                      color="warning" 
                                      variant="filled"
                                    />
                                  </TableCell>
                                )}
                                {visibleColumns.serialNumber && (
                                  <TableCell>
                                    {/* Remaining items don't have serial numbers yet */}
                                  </TableCell>
                                )}
                                {visibleColumns.orderDate && (
                                  <TableCell>{safeFormatDate(item.order_date)}</TableCell>
                                )}
                                {visibleColumns.confirmDate && (
                                  <TableCell>{safeFormatDate(item.confirm_date)}</TableCell>
                                )}
                                {visibleColumns.deployDate && (
                                  <TableCell>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      -
                                    </Typography>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                      
                            {/* Confirmed Non-Accessories */}
                            {confirmedNonAccessoryItems.map((item) => (
                              <TableRow key={item.uniqueId}>
                                {visibleColumns.productName && <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {item.image && !imageErrors[item.id] ? (
                                      <Avatar src={item.image} sx={{ mr: 2, width: 32, height: 32 }} onError={() => handleImageError(item.id)} />
                                    ) : (
                                      <BrokenImageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                    )}
                                    <Typography variant="body2">{item.product_name}</Typography>
                                  </Box>
                                </TableCell>}
                                {visibleColumns.status && <TableCell><Chip label="Confirmed" size="small" color="success" variant="filled" /></TableCell>}
                                {visibleColumns.serialNumber && <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{item.serial_number || ''}</Typography></TableCell>}
                                {visibleColumns.orderDate && <TableCell>{safeFormatDate(item.order_date)}</TableCell>}
                                {visibleColumns.confirmDate && <TableCell>{safeFormatDate(item.confirm_date)}</TableCell>}
                                {visibleColumns.deployDate && <TableCell>-</TableCell>}
                              </TableRow>
                            ))}

                            {/* Deployed Non-Accessories */}
                            {deployedNonAccessoryItems.map((item, index) => (
                              <TableRow key={`deployed-item-${item.id}-${index}`}>
                                {visibleColumns.productName && <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {item.image && !imageErrors[item.id] ? (
                                      <Avatar src={item.image} sx={{ mr: 2, width: 32, height: 32 }} onError={() => handleImageError(item.id)} />
                                    ) : (
                                      <BrokenImageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                    )}
                                    <Typography variant="body2">{item.product_name}</Typography>
                                  </Box>
                                </TableCell>}
                                {visibleColumns.status && <TableCell><Chip label="Deployed" size="small" color="info" variant="filled" /></TableCell>}
                                {visibleColumns.serialNumber && <TableCell><Typography variant="body2">{item.serial_number}</Typography></TableCell>}
                                {visibleColumns.orderDate && <TableCell>{safeFormatDate(item.order_date)}</TableCell>}
                                {visibleColumns.confirmDate && <TableCell>{safeFormatDate(item.confirm_date)}</TableCell>}
                                {visibleColumns.deployDate && <TableCell>{safeFormatDate(item.deploy_date)}</TableCell>}
                              </TableRow>
                            ))}

                            {/* ====== ACCESSORIES ====== */}

                            {/* Remaining Accessories */}
                            {remainingAccessoryItems.map((item, index) => (
                              <TableRow key={`order-acc-${item.id}-${index}`}>
                                {visibleColumns.productName && (
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      {item.image && !imageErrors[item.id] ? (
                                        <Avatar 
                                          src={item.image} 
                                          sx={{ mr: 2, width: 32, height: 32 }}
                                          onError={() => handleImageError(item.id)}
                                        />
                                      ) : (
                                        <BrokenImageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                      )}
                                      <Typography variant="body2">{item.product_name}</Typography>
                                    </Box>
                                  </TableCell>
                                )}
                                {visibleColumns.status && (
                                  <TableCell>
                                    <Chip 
                                      label="Remaining" 
                                      size="small" 
                                      color="warning" 
                                      variant="filled"
                                    />
                                  </TableCell>
                                )}
                                {visibleColumns.serialNumber && (
                                  <TableCell>
                                    <Typography variant="body2">Quantity: <strong>{item.quantity}</strong></Typography>
                                  </TableCell>
                                )}
                                {visibleColumns.orderDate && (
                                  <TableCell>{safeFormatDate(item.order_date)}</TableCell>
                                )}
                                {visibleColumns.confirmDate && (
                                  <TableCell>{safeFormatDate(item.confirm_date)}</TableCell>
                                )}
                                {visibleColumns.deployDate && (
                                  <TableCell>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      -
                                    </Typography>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                            
                            {/* Confirmed Accessories */}
                            {confirmedAccessoryItems.map((group, index) => (
                              <TableRow key={`confirmed-acc-${group.product_id}-${index}`}>
                                {visibleColumns.productName && <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {group.image && !imageErrors[group.id] ? (
                                      <Avatar src={group.image} sx={{ mr: 2, width: 32, height: 32 }} onError={() => handleImageError(group.id)} />
                                    ) : (
                                      <BrokenImageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                    )}
                                    <Typography variant="body2">{group.product_name}</Typography>
                                  </Box>
                                </TableCell>}
                                {visibleColumns.status && <TableCell><Chip label="Confirmed" size="small" color="success" variant="filled" /></TableCell>}
                                {visibleColumns.serialNumber && <TableCell><Typography variant="body2">Quantity: <strong>{group.total_quantity}</strong></Typography></TableCell>}
                                {visibleColumns.orderDate && <TableCell>{safeFormatDate(group.order_date)}</TableCell>}
                                {visibleColumns.confirmDate && <TableCell>{safeFormatDate(group.confirm_date)}</TableCell>}
                                {visibleColumns.deployDate && <TableCell>-</TableCell>}
                              </TableRow>
                            ))}

                            {/* Deployed Accessories */}
                            {Object.values(deployedAccessoryItems).map((group, index) => (
                              <TableRow key={`deployed-acc-${group.product_id}-${index}`}>
                                {visibleColumns.productName && <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {group.image && !imageErrors[group.id] ? (
                                      <Avatar src={group.image} sx={{ mr: 2, width: 32, height: 32 }} onError={() => handleImageError(group.id)} />
                                    ) : (
                                      <BrokenImageIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                    )}
                                    <Typography variant="body2">{group.product_name}</Typography>
                                  </Box>
                                </TableCell>}
                                {visibleColumns.status && <TableCell><Chip label="Deployed" size="small" color="info" variant="filled" /></TableCell>}
                                {visibleColumns.serialNumber && <TableCell><Typography variant="body2">Quantity: <strong>{group.total_quantity}</strong></Typography></TableCell>}
                                {visibleColumns.orderDate && <TableCell>{safeFormatDate(group.order_date)}</TableCell>}
                                {visibleColumns.confirmDate && <TableCell>{safeFormatDate(group.confirm_date)}</TableCell>}
                                {visibleColumns.deployDate && <TableCell>{safeFormatDate(group.deploy_date)}</TableCell>}
                              </TableRow>
                            ))}
                          </>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* No Results Message */}
        {Object.keys(groupedData).length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              No records found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or filters
            </Typography>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default ComprehensiveOrders;