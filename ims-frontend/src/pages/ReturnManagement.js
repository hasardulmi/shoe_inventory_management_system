import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Grid, Alert
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

const ReturnManagement = () => {
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [newReturn, setNewReturn] = useState({
        productId: '',
        returnDate: new Date().toISOString().split('T')[0], // Set default to current date
        reason: ''
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
                await axios.get(`${BASE_URL}/api/products/by-product-id/${value}`, {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                setError('Product not found');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReturn.productId || !newReturn.returnDate || !newReturn.reason) {
            setError('Please fill all required fields');
            return;
        }
        try {
            const returnData = {
                productId: newReturn.productId,
                returnDate: newReturn.returnDate || new Date().toISOString().split('T')[0],
                reason: newReturn.reason
            };
            await axios.post(`${BASE_URL}/api/returns`, returnData, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Update product status to RETURNED
            await axios.put(`${BASE_URL}/api/products/by-product-id/${newReturn.productId}/return`, {}, {
                headers: { 'Content-Type': 'application/json' }
            });
            setNewReturn({
                productId: '',
                returnDate: new Date().toISOString().split('T')[0],
                reason: ''
            });
            setError('');
            fetchReturns();
            fetchProducts();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create return');
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
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Product ID"
                                    name="productId"
                                    value={newReturn.productId}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Return Date"
                                    name="returnDate"
                                    type="date"
                                    value={newReturn.returnDate}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
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
                                <TableCell>Product ID</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Return Date</TableCell>
                                <TableCell>Reason</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {returns
                                .filter(item => !searchTerm || item.productId.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.productId}</TableCell>
                                        <TableCell>{products[item.productId]?.productName || 'N/A'}</TableCell>
                                        <TableCell>{item.returnDate}</TableCell>
                                        <TableCell>{item.reason}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
};

export default ReturnManagement;