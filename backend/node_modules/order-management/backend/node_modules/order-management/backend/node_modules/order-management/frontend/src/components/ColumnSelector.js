import React, { useState } from 'react';
import {
  Button,
  Popover,
  FormGroup,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Divider
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

const ColumnSelector = ({ visibleColumns, onColumnToggle, columnLabels }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'column-selector-popover' : undefined;

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ViewColumnIcon />}
        onClick={handleClick}
        sx={{
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          borderColor: '#e0e0e0',
          color: '#666',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        Columns
      </Button>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #e0e0e0',
            minWidth: '250px',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
            Select Columns
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormGroup>
            {Object.entries(columnLabels).map(([key, label]) => (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    checked={visibleColumns[key]}
                    onChange={() => onColumnToggle(key)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#1976d2',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#1976d2',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>
                    {label}
                  </Typography>
                }
                sx={{ mb: 1 }}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>
    </>
  );
};

export default ColumnSelector; 