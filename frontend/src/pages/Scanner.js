import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Scanner.css';
import { Modal, Box, Button, TextField, Typography } from '@mui/material';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return new Date(dateString).toLocaleString('en-CA', options).replace(',', '');
};

const Scanner = () => {
  const [manualSerialNumber, setManualSerialNumber] = useState('');
  const [itemDetails, setItemDetails] = useState(null);
  const [itemSource, setItemSource] = useState(null);
  const [open, setOpen] = useState(false);
  const [disabledFields, setDisabledFields] = useState([]); // New state for disabled fields
  const [formValues, setFormValues] = useState({
    'Serial Number': '',
    'Tier 3': '',
    'Asset tag': '',
    'Arrive Location': '', // Assuming 'Arrive Location' is represented as a specific field in your form
    'Product Name': '',
    'Entry Date': '',
    'Exit Date': '',
    // Add other fields here as well
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prevState => ({ ...prevState, [name]: value !== null ? value : '' }));
  };

  const handleSubmit = () => {
    const now = new Date();
    const formattedDate = now.toISOString();
    const updatedFormValues = {
      ...formValues,
      'Confirm Status': true,
      'Entry Date': formattedDate,
      'Exit Date': ''  // Ensure exit date is empty initially
    };

    fetch('http://10.167.49.197:3001/receive-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFormValues),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add item');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          alert('Item added successfully');
          handleClose();
        } else {
          alert('Failed to add item');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleOpen = () => {
    const defaultValues = {
      'Tier 3': '',
      'Asset tag': '',
      'Arrive Location': '',
      'Product Name': '',
      'Entry Date': '',
      'Exit Date': '',
      // Initialize other form values as needed
    };

    const mergedValues = { ...defaultValues, ...itemDetails };

    setFormValues(mergedValues);

    // Disable all fields except the ones you want to adjust manually
    setDisabledFields([
      'Serial Number','CI ID', 'Tag Number', 'End User Cost Center', 'Allocated Ministry',
      'Allocated Division', 'Allocated Branch', 'Allocated Office',
      'Used_By_Last_Name', 'Tier 2', 'Tier 1', 'Local Admin Flag',
      'Product Subcategory', 'Model Version', 'Manufacturer', 'MAC Address',
      'IP Address', 'Operating System', 'OS Level', 'Memory in MB', 'CPU',
      'Machine Encrypted', 'Status', 'Status Reason', 'Supplier Name',
      'Requisition ID', 'Net New - Refresh', 'Ownership Type', 'RAS VPN User ID',
      'Create Date', 'Disposal Date', 'Return Date', 'Return Fiscal Year',
      'Return Fiscal Quarter', 'Most Frequent User', 'Frequent User UserName',
      'Frequent User Last Login Date', 'Most Frequent User Count', 'Last User',
      'Last Login Date', 'Last User Count', 'Unique/Multiple Logins',
      'Allocated Cluster', 'Region', 'City', 'Postal Code',
      'Confirm Status', 'Entry Date', 'Exit Date', 'id'
    ]);

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDisabledFields([]); // Clear disabled fields on close
  };

  const manualSearch = () => {
    const cleanedSerialNumber = manualSerialNumber.substring(1);
    fetchItemBySerial(cleanedSerialNumber);
  };

  const fetchItemBySerial = (serialNumber) => {
    fetch(`http://10.167.49.197:3001/check-item-by-serial/${serialNumber}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Item not found');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setItemDetails(data.item);
          setItemSource(data.source);
        } else {
          alert('Item not found');
          setItemDetails(null);
          setItemSource(null);
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleReceiveItem = async () => {
    const now = new Date();
    const formattedDate = formatDate(now);

    const updatedItemDetails = { ...itemDetails, 'Entry Date': formattedDate };

    try {
      const response = await fetch('http://10.167.49.197:3001/receive-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItemDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to receive item');
      }

      const data = await response.json();
      if (data.success) {
        alert('Item received successfully');
        setItemDetails(prevState => ({ ...prevState, 'Confirm Status': true }));
        setItemSource('received_items');
      } else {
        alert('Failed to receive item');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRefresh = () => {
    setItemDetails(null);
    setManualSerialNumber('');
    setItemSource(null);
  };

  return (
    <div className="container mt-4">
      <h2 className="mt-4">Scan Barcode</h2>
      <div className="form-group mt-3">
        <label htmlFor="manualSerialNumber">Manual Serial Number Search</label>
        <input type="text" className="form-control" id="manualSerialNumber" value={manualSerialNumber} onChange={(e) => setManualSerialNumber(e.target.value)} placeholder="Enter Serial Number" />
      </div>
      <div>
        <button id="manualSearchButton" className="btn btn-primary mt-3 custom" onClick={manualSearch}>Search</button>
        <button id="refreshButton" className="btn btn-secondary mt-3 custom" onClick={handleRefresh}>Refresh</button>
      </div>
      <div>
        <button id="manualAddButton" className="btn btn-success mt-3 btn-lg" onClick={handleOpen}>Manually Add</button>
      </div>
      <div className="container mt-4">
        <table className="table mt-4" id="itemDetailsTable" style={{ display: itemDetails ? 'table' : 'none' }}>
          <thead>
            <tr>
              <th>CI Name</th>
              <th>Serial Number</th>
              <th>Site</th>
              <th>Product Name</th>
              <th>Create Date</th>
              <th>Return Date</th>
              <th>Confirm Status</th>
              <th>Entry Date</th>
              <th>Exit Date</th>
            </tr>
          </thead>
          <tbody>
            {itemDetails && (
              <tr>
                <td>{itemDetails['CI Name']}</td>
                <td>{itemDetails['Serial Number']}</td>
                <td>{itemDetails['Site']}</td>
                <td>{itemDetails['Product Name']}</td>
                <td>{itemDetails['Create Date']}</td>
                <td>{itemDetails['Return Date']}</td>
                <td>{itemDetails['Confirm Status'] ? 'Confirmed' : 'Not Confirmed'}</td>
                <td>{itemDetails['Entry Date']}</td>
                <td>{itemDetails['Exit Date']}</td>
                <td>
                  {itemSource === 'received_items' ? (
                    <span>Confirmed</span>
                  ) : (
                    <button className="btn btn-primary custom" onClick={handleReceiveItem}>Received</button>
                  )}
                  <button className="btn btn-success custom" onClick={handleOpen}>Adjust</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={handleClose}>
        <Box
          className="modal-box"
          sx={{
            padding: 5,
            backgroundColor: 'white',
            borderRadius: 3,
            maxHeight: '85vh',
            overflowY: 'auto',
            width: '85%',
            margin: 'auto',
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" component="h2">Manually Add Item</Typography>
          <form style={{ flex: '1 1 auto', overflowY: 'auto' }}>
            {Object.keys(formValues)
                .filter(key => !disabledFields.includes(key))
                .map(key => (
              <TextField
                key={key}
                name={key}
                label={key}
                value={formValues[key] || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={disabledFields.includes(key)} // Disable conditionally
              />
            ))}
          </form>
          <div className="floating-submit-button">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Scanner;
