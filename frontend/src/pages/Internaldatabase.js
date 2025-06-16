import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton } from '@mui/x-data-grid';
import { Button, TextField, Modal, Box, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
      <GridToolbarColumnsButton />
    </GridToolbarContainer>
  );
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return new Date(dateString).toLocaleString('en-CA', options).replace(',', '');
};

const InternalDatabase = () => {
  const [data, setData] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [monitorCount, setMonitorCount] = useState(0);
  const [confirmedMonitorCount, setConfirmedMonitorCount] = useState(0);
  const [confirmedNotebookCount, setConfirmedNotebookCount] = useState(0);
  const [notebookCount, setNotebookCount] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = useCallback(() => {
    fetch('http://10.167.49.200:3001/received-items')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const formattedData = data.map(row => ({
          ...row,
          'Entry Date': formatDate(row['Entry Date']),
          'Exit Date': row['Exit Date'] ? formatDate(row['Exit Date']) : ''
        }));
        setData(formattedData);
        setFilteredData(formattedData);
        calculateCounts(formattedData); // Calculate counts when data is fetched

        const confirmedItems = formattedData.filter(row => row['Exit Date']);
        setConfirmedMonitorCount(confirmedItems.filter(row => row['Tier 3'] && row['Tier 3'].toLowerCase() === 'monitor').length);
        setConfirmedNotebookCount(confirmedItems.filter(row => row['Tier 3'] && row['Tier 3'].toLowerCase() === 'notebook').length);
      })
      .catch(error => console.error('Error loading JSON data:', error));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateCounts = (data) => {
    const unconfirmedData = data.filter(row => !row['Exit Date']);
    const monitorCount = unconfirmedData.filter(row => row['Tier 3'] && row['Tier 3'].toLowerCase() === 'monitor').length;
    const notebookCount = unconfirmedData.filter(row => row['Tier 3'] && row['Tier 3'].toLowerCase() === 'notebook').length;
    setMonitorCount(monitorCount);
    setNotebookCount(notebookCount);
  };

  const handleSearch = () => {
    const keywords = searchInput.toLowerCase().split(' ').filter(Boolean);

    const filtered = data.filter(row => {
      const entryDate = new Date(row['Entry Date']);
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date();

      return (
        entryDate >= start &&
        entryDate <= end &&
        keywords.every(keyword =>
          Object.values(row).some(value =>
            value && value.toString().toLowerCase().includes(keyword)
          )
        )
      );
    });

    setFilteredData(filtered);
    calculateCounts(filtered); // Recalculate counts for filtered data

    const confirmedItems = filtered.filter(row => row['Exit Date']);
    setConfirmedMonitorCount(confirmedItems.filter(row => row['Tier 3'] && row['Tier 3'].toLowerCase() === 'monitor').length);
    setConfirmedNotebookCount(confirmedItems.filter(row => row['Tier 3'] && row['Tier 3'].toLowerCase() === 'notebook').length);
  };

  const handleRowClick = (params, event) => {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'svg' || event.target.tagName === 'path') {
      return; // Prevent opening modal when clicking the button
    }
    setSelectedRow(params.row);
    setNotesText(params.row.Notes || ''); // Set initial notes text
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleUpdate = async (row) => {
    const now = new Date();
    const formattedDate = now.toISOString(); // Format date without milliseconds and 'T'

    try {
      const response = await fetch(`http://10.167.49.200:3001/received-items/${row.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exitDate: formattedDate }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        alert('Item successfully confirmed');
        fetchData(); // Refresh the data after update
      } else {
        alert('Item already in database');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (selectedRow) {
      try {

        console.log('Selected Row:', selectedRow);
        console.log('Notes Text:', notesText);
        const response = await fetch(`http://10.167.49.200:3001/update-notes/${selectedRow.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: notesText }),  // Send updated notes to the backend
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
          alert('Note successfully added!');  // Display success message
          fetchData();  // Refresh the data after updating notes
          setNotesModalOpen(false);  // Close the modal
        } else {
          alert('Error adding note.');
        }
      } catch (error) {
        console.error('Error updating notes:', error);
        alert('Failed to add note. Please try again.');  // Display error message
      }
    }
  };


  const columns = [
    { field: 'CI ID', headerName: 'CI ID', width: 150 },
    { field: 'CI Name', headerName: 'CI Name', width: 200 },
    { field: 'Site', headerName: 'Site', width: 200 },
    { field: 'Product Name', headerName: 'Product Name', width: 160 },
    { field: 'Serial Number', headerName: 'Serial Number', width: 125 },
    { field: 'Create Date', headerName: 'Create Date', width: 170 },
    { field: 'Return Date', headerName: 'Return Date', width: 100 },
    { field: 'Confirm Status', headerName: 'Confirm Status', width: 100 },
    { field: 'Note', headerName: 'Note', width: 200 }, // Add Notes column
    {
      field: 'Entry Date',
      headerName: 'Entry Date',
      width: 130,
    },
    {
      field: 'Exit Date',
      headerName: 'Exit Date',
      width: 130,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,  // Increased width to accommodate both buttons
      renderCell: (params) => (
        <>
          {params.row['Exit Date'] ? (
            <Button variant="contained" disabled>
              Confirmed
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleUpdate(params.row)}
            >
              Mark as Exited
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: '10px' }}  // Spacing between buttons
            onClick={() => {
              setSelectedRow(params.row);
              setNotesText(params.row.Notes || '');
              setNotesModalOpen(true);  // Open notes modal
            }}
          >
            Add Notes
          </Button>
        </>
      ),
    },
  ];

  const unconfirmedData = filteredData.filter(row => !row['Exit Date']);
  const confirmedData = filteredData.filter(row => row['Exit Date']);

  return (
    <ThemeProvider theme={theme}>
      <div className="container-fluid">
        <div className="mb-3">
          <TextField
            id="search-input"
            label="Search"
            variant="outlined"
            fullWidth
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <TextField
              id="start-date"
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <TextField
              id="end-date"
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button variant="contained" color="primary" className="mt-2" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div style={{ height: '600px', width: '100%' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Active Data Table
          </Typography>
          <DataGrid
            rows={unconfirmedData}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
            onRowClick={handleRowClick}
            disableSelectionOnClick
            sortingOrder={['desc', 'asc', null]}
            slots={{
              toolbar: CustomToolbar,
            }}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  'Create Date': false, // Hide the Create Date column by default
                  'Return Date': false, // Hide the Return Date column by default
                  'CI Name': false,
                  'Confirm Status':false,
                  'CI ID':false,
                },
              },
              sorting:{
                sortModel: [{ field: 'Entry Date', sort: 'desc' }]
              }
            }}
          />
        </div>
        <div style={{ marginTop: '50px' }}>
          <Box
            sx={{
              padding: 2,
              backgroundColor: 'white',
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6">Counts</Typography>
            <Typography variant="body1">Monitor Count: {monitorCount}</Typography>
            <Typography variant="body1">Notebook Count: {notebookCount}</Typography>
          </Box>
        </div>
        <div style={{ height: '600px', width: '100%', marginTop: '20px' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
            Confirmed Items
          </Typography>
          <DataGrid
            rows={confirmedData}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
            onRowClick={handleRowClick}
            disableSelectionOnClick
            sortingOrder={['asc', 'desc', null]}
            slots={{
              toolbar: CustomToolbar,
            }}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  'Create Date': false, // Hide the Create Date column by default
                  'Return Date': false, // Hide the Return Date column by default
                  'CI Name': false,
                  'Confirm Status':false,
                  'CI ID':false,
                },
              },
              sorting:{
                sortModel: [{ field: 'Exit Date', sort: 'desc' }]
              }
            }}
          />

          <div style={{ marginBottom: '20px' }}>
            <Box
              sx={{
                padding: 2,
                backgroundColor: 'white',
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6">Confirmed Counts</Typography>
              <Typography variant="body1">Confirmed Monitor Count: {confirmedMonitorCount}</Typography>
              <Typography variant="body1">Confirmed Notebook Count: {confirmedNotebookCount}</Typography>
            </Box>
          </div>
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
            }}
          >
            <Typography variant="h6" component="h2">
              Details
            </Typography>
            {selectedRow && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedRow).map(([key, value]) => (
                    <tr key={key}>
                      <td className="font-weight-bold">{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        </Modal>

        {/* Modal for Adjusting Notes */}
        <Modal open={notesModalOpen} onClose={() => setNotesModalOpen(false)}>
          <Box
            className="modal-box"
            sx={{
              padding: 5,
              backgroundColor: 'white',
              borderRadius: 3,
              maxHeight: '85vh',
              overflowY: 'auto',
              width: { xs: '90%', md: '50%' },
              margin: 'auto',
              mt: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              Adjust Notes
            </Typography>
            <TextField
              label="Notes"
              variant="outlined"
              fullWidth
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}  // Update notes on change
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveNotes}
              style={{ marginTop: '10px' }}
            >
              Save Notes
            </Button>
          </Box>
        </Modal>
      </div>
    </ThemeProvider>
  );
};

export default InternalDatabase;
