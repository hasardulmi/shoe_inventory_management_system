import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Grid, Alert
} from '@mui/material';
import OwnerNavbar from '../components/EmployeeNavbar';
import './styles.css';

// Utility function to format date to dd/mm/yyyy
const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// Utility function to get current date in yyyy-mm-dd
const getCurrentDateISO = () => {
    return new Date().toISOString().split('T')[0];
};

const EmployeeReturn = () => {
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [newReturn, setNewReturn] = useState({
        productId: '',
        returnDate: getCurrentDateISO(),
        returnedDate: null,
        reason: '',
        purchasePrice: null,
        supplierName: '',
        brandName: ''
    });
    const [error, setError] = useState('');
    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        fetchReturns();
        fetchProducts();
    }, []);

    const fetchReturns = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/returns`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setReturns(response.data);
        } catch (error) {
            console.error('Error fetching returns:', error.message);
            setError('Failed to fetch returns');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/products`, {
                headers: { 'Content-Type': 'application/json' }
            });
            const productMap = {};
            response.data.forEach(product => {
                productMap[product.productId] = product;
            });
            setProducts(productMap);
        } catch (error) {
            console.error('Error fetching products:', error.message);
            setError('Failed to fetch products');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setNewReturn(prev => ({ ...prev, [name]: value }));
        setError('');

        if (name === 'productId' && value) {
            try {
                const response = await axios.get(`${BASE_URL}/api/products/by-product-id/${value}`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                const product = response.data;
                if (product.status === 'RETURNED') {
                    setError('Product is already returned');
                    setNewReturn(prev => ({
                        ...prev,
                        purchasePrice: null,
                        supplierName: '',
                        brandName: ''
                    }));
                } else {
                    setNewReturn(prev => ({
                        ...prev,
                        purchasePrice: product.purchasePrice,
                        supplierName: product.supplierName || '',
                        brandName: product.brandName || '',
                        returnDate: getCurrentDateISO()
                    }));
                }
            } catch (error) {
                setError('Product not found');
                setNewReturn(prev => ({
                    ...prev,
                    purchasePrice: null,
                    supplierName: '',
                    brandName: ''
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReturn.productId || !newReturn.returnDate || !newReturn.reason || !newReturn.purchasePrice) {
            setError('Please fill all required fields');
            return;
        }
        try {
            const returnData = {
                productId: newReturn.productId,
                returnDate: newReturn.returnDate,
                returnedDate: null,
                reason: newReturn.reason
            };
            await axios.post(`${BASE_URL}/api/returns`, returnData, {
                headers: { 'Content-Type': 'application/json' }
            });
            setNewReturn({
                productId: '',
                returnDate: getCurrentDateISO(),
                returnedDate: null,
                reason: '',
                purchasePrice: null,
                supplierName: '',
                brandName: ''
            });
            setError('');
            fetchReturns();
            fetchProducts();
        } catch (error) {
            setError(error.response?.data || 'Failed to create return');
        }
    };

    const handleMarkAsReturned = async (returnId, productId) => {
        try {
            await axios.put(`${BASE_URL}/api/returns/${returnId}/mark-returned`, {
                returnedDate: getCurrentDateISO()
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Update product status to RETURNED
            await axios.put(`${BASE_URL}/api/products/by-product-id/${productId}/return`, {}, {
                headers: { 'Content-Type': 'application/json' }
            });
            setError('');
            fetchReturns();
            fetchProducts();
        } catch (error) {
            setError(error.response?.data || 'Failed to mark as returned');
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }} className="page-container">
                <Typography variant="h4" component="h1" gutterBottom className="page-title">
                    Return Management
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Create New Return
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Product ID"
                                    name="productId"
                                    value={newReturn.productId}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    placeholder="e.g., S00001"
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Purchase Price"
                                    value={newReturn.purchasePrice ? newReturn.purchasePrice.toFixed(2) : ''}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Supplier Name"
                                    value={newReturn.supplierName}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Brand Name"
                                    value={newReturn.brandName}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Return Date"
                                    value={formatDate(newReturn.returnDate)}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Reason"
                                    name="reason"
                                    value={newReturn.reason}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary">
                                    Create Return
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
                    <TextField
                        label="Search Returns"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: '300px' }}
                        placeholder="Search by Product ID"
                    />
                </Box>

                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Return Date</TableCell>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Purchase Price</TableCell>
                                <TableCell>Supplier Name</TableCell>
                                <TableCell>Brand Name</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Returned Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {returns
                                .filter(item => !searchTerm || item.productId.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{formatDate(item.returnDate)}</TableCell>
                                        <TableCell>{item.productId}</TableCell>
                                        <TableCell>{products[item.productId]?.productName || '-'}</TableCell>
                                        <TableCell>{products[item.productId]?.purchasePrice?.toFixed(2) || '-'}</TableCell>
                                        <TableCell>{products[item.productId]?.supplierName || '-'}</TableCell>
                                        <TableCell>{products[item.productId]?.brandName || '-'}</TableCell>
                                        <TableCell>{item.reason}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleMarkAsReturned(item.id, item.productId)}
                                                disabled={item.returnedDate !== null}
                                            >
                                                Mark as Returned
                                            </Button>
                                        </TableCell>
                                        <TableCell>{item.returnedDate ? formatDate(item.returnedDate) : 'Not Return Yet'}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
};

export default EmployeeReturn;