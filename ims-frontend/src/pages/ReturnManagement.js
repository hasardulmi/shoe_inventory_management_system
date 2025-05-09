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
            <Box sx={{ p: 4, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
                <Typography variant="h4" sx={{ mb: 4, color: '#1f2937', fontWeight: 'bold', textAlign: 'center' }}>
                    Return Management
                </Typography>
                <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                    <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>
                <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                    <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
                        {success}
                    </Alert>
                </Snackbar>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ mb: 4, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                >
                    Add Return
                </Button>

                {/* Product ID and Sale ID Filters */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <FormControl variant="outlined" sx={{ minWidth: '200px' }}>
                        <InputLabel>Product ID</InputLabel>
                        <Select
                            value={selectedProductId}
                            onChange={handleProductIdFilterChange}
                            label="Product ID"
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
                        <InputLabel>Sale ID</InputLabel>
                        <Select
                            value={selectedSaleId}
                            onChange={handleSaleIdFilterChange}
                            label="Sale ID"
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

                <TableContainer component={Paper} sx={{ mt: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px', maxHeight: '600px', overflowY: 'auto', position: 'relative' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#3b82f6', position: 'sticky', top: 0, zIndex: 1 }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Return ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Product ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Product Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Sale ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Return Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Reason</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Sizes & Quantities</TableCell>
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
                                    <TableRow key={returnItem.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                        <TableCell>{returnItem.id || 'N/A'}</TableCell>
                                        <TableCell>{returnItem.productId || 'N/A'}</TableCell>
                                        <TableCell>{returnItem.productName || 'N/A'}</TableCell>
                                        <TableCell>{returnItem.saleId || 'N/A'}</TableCell>
                                        <TableCell>
                                            {returnItem.returnDate ? new Date(returnItem.returnDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                            }) : 'N/A'}
                                        </TableCell>
                                        <TableCell>{returnItem.reason || 'N/A'}</TableCell>
                                        <TableCell>
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
                                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 2 }}>
                                        No return records available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <style>
                    {`
                        .MuiTableHead-root {
                            position: sticky;
                            top: 0;
                            z-index: 1;
                            background-color: #3b82f6;
                        }

                        .MuiTableCell-head {
                            color: white;
                            font-weight: bold;
                            border-bottom: 2px solid #1565c0;
                            background-color: #3b82f6;
                        }

                        .MuiTableContainer-root {
                            position: relative;
                            max-height: 600px;
                            overflow-y: auto;
                        }

                        .MuiTableRow-root:hover {
                            background-color: #f9fafb;
                        }

                        .MuiTableCell-body {
                            padding: 12px 16px;
                            border-bottom: 1px solid #e0e0e0;
                            color: #333;
                        }
                    `}
                </style>
            </Box>
        </>
    );
};

export default ReturnManagement;