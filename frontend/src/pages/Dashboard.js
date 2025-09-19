import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { supabase } from '../supabaseClient'; // Import supabase

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    popularProducts: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total number of unique orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true });

        if (ordersError) throw ordersError;

        // Get popular products
        const { data: popularProducts, error: productsError } = await supabase
          .rpc('get_popular_products');
        
        if (productsError) throw productsError;

        setStats({
          totalOrders: orders.count,
          popularProducts: popularProducts || [],
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error.message);
      }
    };

    fetchStats();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">Total Orders</Typography>
              <Typography component="p" variant="h4">
                {stats.totalOrders}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} lg={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography variant="h6">Popular Products</Typography>
              <ul>
                {stats.popularProducts.map((product) => (
                  <li key={product.name}>
                    {product.name} ({product.orderCount} orders)
                  </li>
                ))}
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default Dashboard;
