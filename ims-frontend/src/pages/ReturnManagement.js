import React, { useState, useEffect } from 'react';
import {
    Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Typography, Snackbar, Alert
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

                <ReturnDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    onSuccess={handleSuccess}
                />

                <TableContainer component={Paper} sx={{ mt: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#3b82f6' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Return ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sale ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Return Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reason</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sizes & Quantities</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 2 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : returns.length > 0 ? (
                                [...returns].reverse().map(returnItem => (
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
            </Box>
        </>
    );
};

export default ReturnManagement;