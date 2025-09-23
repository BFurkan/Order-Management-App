import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  CircularProgress,
  Button
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  PlaylistAddCheck as ProcessIcon,
  CheckCircle as ConfirmedIcon,
  AssignmentTurnedIn as DeployedIcon,
  Inventory as InventoryIcon,
  TrendingUp as StatsIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import theme from './theme';
import { supabase } from '../supabaseClient';

function Homepage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalConfirmed: 0,
    totalDeployed: 0,
    totalUsers: 1 // Assuming at least one user (admin)
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch counts for orders, confirmed, and deployed
        const { count: orderCount, error: orderError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        const { count: confirmedCount, error: confirmedError } = await supabase
          .from('confirmed_items')
          .select('*', { count: 'exact', head: true });

        const { count: deployedCount, error: deployedError } = await supabase
          .from('deployed_items')
          .select('*', { count: 'exact', head: true });

        // Fetch popular products using the RPC
        const { data: popularProducts, error: popularError } = await supabase
          .rpc('get_popular_products');

        if (orderError || confirmedError || deployedError || popularError) {
          throw orderError || confirmedError || deployedError || popularError;
        }

        setStats(prev => ({
          ...prev,
          totalOrders: orderCount,
          totalConfirmed: confirmedCount,
          totalDeployed: deployedCount,
        }));

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const navigationItems = [
    {
      title: 'Place Orders',
      description: 'Browse products and create new orders',
      icon: <OrderIcon sx={{ fontSize: 40 }} />,
      path: '/products',
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Order Status',
      description: 'Track and manage active orders',
      icon: <ProcessIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      bgColor: '#fff3e0',
      isDropdown: true,
      menuItems: [
        { title: 'Orders in Process', path: '/order-summary' },
        { title: 'Delivery Confirmation', path: '/order-details' }
      ]
    },
    {
      title: 'Confirmed Items',
      description: 'View confirmed inventory ready for deployment',
      icon: <ConfirmedIcon sx={{ fontSize: 40 }} />,
      path: '/confirmed-items',
      color: '#388e3c',
      bgColor: '#e8f5e8'
    },
    {
      title: 'Deployment',
      description: 'Deploy and track assets',
      icon: <DeployedIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
      isDropdown: true,
      menuItems: [
        { title: 'Scan & Deploy', path: '/scan' },
        { title: 'Deployed Items', path: '/deployed-items' }
      ]
    },
    {
      title: 'Inventory Summary',
      description: 'Overview of stock levels and deployment status',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      path: '/inventory-summary',
      color: '#5d4037',
      bgColor: '#efebe9'
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
            Order Management System
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Streamline your IT asset ordering, confirmation, and deployment process
          </Typography>
          
          {/* Quick Stats */}
          <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <StatsIcon /> Dashboard Overview
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {stats.totalOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#f57c00' }}>
                      {stats.totalConfirmed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confirmed Items
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#388e3c' }}>
                      {stats.totalDeployed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Deployed Items
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#0288d1' }}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Box>

        {/* Navigation Cards */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Quick Navigation
        </Typography>
        
        <Grid container spacing={3}>
          {navigationItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: item.isDropdown ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': item.isDropdown ? {} : {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => !item.isDropdown && handleNavigate(item.path)}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      backgroundColor: item.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto'
                    }}
                  >
                    <Box sx={{ color: item.color }}>
                      {item.icon}
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.title}
                  </Typography>
                  
                  {item.isDropdown ? (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {item.menuItems.map((menuItem, menuIndex) => (
                        <Button 
                          key={menuIndex} 
                          variant="outlined" 
                          onClick={() => navigate(menuItem.path)}
                          sx={{ 
                            color: item.color, 
                            borderColor: item.color, 
                            '&:hover': { 
                              borderColor: item.color, 
                              backgroundColor: item.bgColor 
                            } 
                          }}
                        >
                          {menuItem.title}
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Workflow Information */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            System Workflow
          </Typography>
          
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Follow the complete order-to-deployment workflow:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Chip label="1. Place Orders" size="small" color="primary" />
                  <Typography variant="body2">→</Typography>
                  <Chip label="2. Process Orders" size="small" color="warning" />
                  <Typography variant="body2">→</Typography>
                  <Chip label="3. Confirm Delivery" size="small" color="secondary" />
                  <Typography variant="body2">→</Typography>
                  <Chip label="4. Scan & Deploy" size="small" color="error" />
                  <Typography variant="body2">→</Typography>
                  <Chip label="5. Track Assets" size="small" color="info" />
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Complete traceability from order to deployment
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>

      </Container>
    </ThemeProvider>
  );
}

export default Homepage;
