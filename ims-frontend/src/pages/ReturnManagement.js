import React, { useState, useEffect } from 'react';
import {
    Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Typography, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';
import ReturnDialog from './ReturnDialog';

const ReturnManagement = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedSaleId, setSelectedSaleId] = useState('');

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/returns');
            console.log("Returns API Response (Full):", response.data);
            const returnsData = response.data.data || [];
            if (!Array.isArray(returnsData)) {
                console.warn("Returns data is not an array, forcing empty array:", returnsData);
                setReturns([]);
            } else {
                console.log("Fetched Returns with Details:", returnsData.map(r => ({
                    id: r.id,
                    productId: r.productId,
                    productName: r.productName,
                    saleId: r.saleId,
                    returnDate: r.returnDate,
                    reason: r.reason,
                    sizeQuantities: r.sizeQuantities
                })));
                // Fallback to fetch productName from sale if missing
                const updatedReturns = await Promise.all(returnsData.map(async (returnItem) => {
                    if (!returnItem.productName || returnItem.productName === 'Product Not Found') {
                        if (returnItem.saleId) {
                            try {
                                const saleResponse = await axios.get('http://localhost:8080/api/sales');
                                const sales = Array.isArray(saleResponse.data) ? saleResponse.data : (saleResponse.data.data || []);
                                const sale = sales.find(s => parseInt(s.id) === parseInt(returnItem.saleId));
                                return { ...returnItem, productName: sale ? sale.productName || 'Sale Not Found' : 'Sale Not Found' };
                            } catch (err) {
                                console.error("Error fetching sale for productName:", err);
                                return { ...returnItem, productName: 'Sale Not Found' };
                            }
                        }
                    }
                    return returnItem;
                }));
                setReturns(updatedReturns);
            }
        } catch (err) {
            console.error("Error fetching returns:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Failed to fetch returns: ' + err.message);
            setReturns([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (message) => {
        setSuccess(message);
        fetchReturns();
    };

    // Handle Product ID filter change
    const handleProductIdFilterChange = (e) => {
        setSelectedProductId(e.target.value);
    };

    // Handle Sale ID filter change
    const handleSaleIdFilterChange = (e) => {
        setSelectedSaleId(e.target.value);
    };

    // Get filtered returns based on Product ID and Sale ID
    const getFilteredReturns = () => {
        let filteredReturns = returns;

        if (selectedProductId) {
            filteredReturns = filteredReturns.filter(returnItem => String(returnItem.productId) === String(selectedProductId));
        }

        if (selectedSaleId) {
            filteredReturns = filteredReturns.filter(returnItem => String(returnItem.saleId) === String(selectedSaleId));
        }

        return filteredReturns;
    };

    // Extract unique Product IDs and Sale IDs for dropdowns
    const uniqueProductIds = [...new Set(returns.map(returnItem => returnItem.productId).filter(Boolean))];
    const uniqueSaleIds = [...new Set(returns.map(returnItem => returnItem.saleId).filter(Boolean))];

    return (
        <>
            <OwnerNavbar />
            <Box sx={{
                p: { xs: 2, md: 4 },
                bgcolor: '#fff',
                minHeight: '100vh',
                fontFamily: 'Roboto, sans-serif'
            }}>
                <Typography
                    variant="h4"
                    sx={{
                        mb: 4,
                        color: '#000000',
                        fontWeight: 600,
                        textAlign: 'center',
                        letterSpacing: 0.5
                    }}
                >
                    Return Management
                </Typography>

                <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                    <Alert onClose={() => setError('')} severity="error" sx={{
                        width: '100%',
                        bgcolor: '#ff5e62',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}>
                        {error}
                    </Alert>
                </Snackbar>
                <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                    <Alert onClose={() => setSuccess('')} severity="success" sx={{
                        width: '100%',
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}>
                        {success}
                    </Alert>
                </Snackbar>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        borderRadius: '8px',
                        px: 3,
                        py: 1.5,
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(83, 209, 182, 0.2)',
                        '&:hover': {
                            bgcolor: '#46b69d',
                            boxShadow: '0 4px 12px rgba(83, 209, 182, 0.3)'
                        }
                    }}
                >
                    Add Return
                </Button>

                {/* Product ID and Sale ID Filters */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 4,
                    mt: 2,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FormControl variant="outlined" sx={{ minWidth: '200px' }}>
                        <InputLabel sx={{ color: '#000000', '&.Mui-focused': { color: '#6c63ff' } }}>
                            Product ID
                        </InputLabel>
                        <Select
                            value={selectedProductId}
                            onChange={handleProductIdFilterChange}
                            label="Product ID"
                            sx={{
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8ee' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' }
                            }}
                        >
                            <MenuItem value="">All Product IDs</MenuItem>
                            {uniqueProductIds.map((productId, index) => (
                                <MenuItem key={index} value={productId}>
                                    {productId}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" sx={{ minWidth: '200px' }}>
                        <InputLabel sx={{ color: '#000000', '&.Mui-focused': { color: '#6c63ff' } }}>
                            Sale ID
                        </InputLabel>
                        <Select
                            value={selectedSaleId}
                            onChange={handleSaleIdFilterChange}
                            label="Sale ID"
                            sx={{
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8ee' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' }
                            }}
                        >
                            <MenuItem value="">All Sale IDs</MenuItem>
                            {uniqueSaleIds.map((saleId, index) => (
                                <MenuItem key={index} value={saleId}>
                                    {saleId}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <ReturnDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    onSuccess={handleSuccess}
                />

                <TableContainer
                    component={Paper}
                    sx={{
                        mt: 4,
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)',
                        maxHeight: '600px',
                        overflowY: 'auto',
                        bgcolor: '#fff',
                        '& .MuiTableHead-root': {
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            backgroundColor: '#4ecdc4',
                        },
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Return ID
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Product ID
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Product Name
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Sale ID
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Return Date
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Reason
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Sizes & Quantities
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 2 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : getFilteredReturns().length > 0 ? (
                                [...getFilteredReturns()].reverse().map(returnItem => (
                                    <TableRow
                                        key={returnItem.id}
                                        sx={{
                                            bgcolor: '#fff',
                                            '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.05)' }
                                        }}
                                    >
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {returnItem.id || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {returnItem.productId || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {returnItem.productName || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {returnItem.saleId || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {returnItem.returnDate ? new Date(returnItem.returnDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                            }) : 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {returnItem.reason || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {returnItem.sizeQuantities
                                                ? Object.entries(returnItem.sizeQuantities)
                                                    .map(([size, qty]) => `Size ${size}: ${qty}`)
                                                    .join(', ')
                                                : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="body2" color="#000000" sx={{ py: 4 }}>
                                            No return records available.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <style>
                    {`
                        body {
                            font-family: 'Roboto', sans-serif;
                        }

                        @media print {
                            body {
                                margin: 0;
                                padding: 20px;
                            }
                            .filter-section, .MuiTabs-root {
                                display: none;
                            }
                            .table-container {
                                box-shadow: none;
                                max-height: none;
                                overflow-y: visible;
                            }
                            .table {
                                page-break-inside: auto;
                            }
                            .table tr {
                                page-break-inside: avoid;
                                page-break-after: auto;
                            }
                        }
                    `}
                </style>
            </Box>
        </>
    );
};

export default ReturnManagement;