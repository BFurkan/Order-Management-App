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
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { safeFormatDateTime } from '../utils/dateUtils';
import theme from './theme';

function DeployedItems() {
  const [deployedItems, setDeployedItems] = useState([]);

  useEffect(() => {
    fetchDeployedItems();
  }, []);

  const fetchDeployedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('deployed_items')
        .select(`
          *,
          confirmed_item:confirmed_items (
            *,
            order:orders (
              *,
              product:products (*)
            )
          )
        `)
        .order('deployed_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map(item => ({
        id: item.id,
        deployed_at: item.deployed_at,
        deployment_location: item.deployment_location,
        deployed_by: item.deployed_by,
        serial_number: item.confirmed_item.serial_number,
        product_name: item.confirmed_item.order.product.name,
        image: item.confirmed_item.order.product.image,
        order_date: item.confirmed_item.order.order_date
      }));

      setDeployedItems(formattedData);
    } catch (error) {
      console.error('Error fetching deployed items:', error);
    }
  };

  const undeployItem = async (itemId) => {
    if (window.confirm('Are you sure you want to undeploy this item? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('deployed_items')
          .delete()
          .eq('id', itemId);

        if (error) throw error;

        alert('Item has been undeployed.');
        fetchDeployedItems(); // Refresh the list
      } catch (error) {
        console.error('Error undeploying item:', error);
        alert('Failed to undeploy item.');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Deployed Items
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Deployment Location</TableCell>
                <TableCell>Deployed By</TableCell>
                <TableCell>Deployment Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deployedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img
                      src={supabase.storage.from('product-images').getPublicUrl(item.image).data.publicUrl}
                      alt={item.product_name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.serial_number}</TableCell>
                  <TableCell>{item.deployment_location}</TableCell>
                  <TableCell>{item.deployed_by}</TableCell>
                  <TableCell>{safeFormatDateTime(item.deployed_at)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => undeployItem(item.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ThemeProvider>
  );
}

export default DeployedItems; 
