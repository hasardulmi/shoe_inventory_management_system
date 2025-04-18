import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Grid, Alert
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
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

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [products, setProducts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [newSale, setNewSale] = useState({
        productId: '',
        saleDate: getCurrentDateISO(), // Current date in yyyy-mm-dd
        discount: '',
        sellingPrice: null
    });
    const [finalSalePrice, setFinalSalePrice] = useState(null);
    const [error, setError] = useState('');
    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        fetchSales();
        fetchProducts();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/sales`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setSales(response.data);
            setFilteredSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error.message);
            setError('Failed to fetch sales');
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

    useEffect(() => {
        let filtered = sales;
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (products[item.productId]?.status || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredSales(filtered);
    }, [sales, products, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setNewSale(prev => ({ ...prev, [name]: value }));
        setError('');

        if (name === 'productId' && value) {
            try {
                const response = await axios.get(`${BASE_URL}/api/products/by-product-id/${value}`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                const product = response.data;
                if (product.status === 'RETURNED') {
                    setError('Product is returned and cannot be sold');
                    setNewSale(prev => ({ ...prev, sellingPrice: null }));
                    setFinalSalePrice(null);
                } else if (!product.inStock) {
                    setError('Product is not in stock');
                    setNewSale(prev => ({ ...prev, sellingPrice: null }));
                    setFinalSalePrice(null);
                } else {
                    setNewSale(prev => ({ ...prev, sellingPrice: product.sellingPrice }));
                    calculateFinalPrice(product.sellingPrice, newSale.discount);
                }
            } catch (error) {
                setError('Product not found');
                setNewSale(prev => ({ ...prev, sellingPrice: null }));
                setFinalSalePrice(null);
            }
        }

        if (name === 'discount') {
            calculateFinalPrice(newSale.sellingPrice, value);
        }
    };

    const calculateFinalPrice = (sellingPrice, discount) => {
        if (!sellingPrice) {
            setFinalSalePrice(null);
            return;
        }
        if (!discount || discount === '') {
            setFinalSalePrice(Number(sellingPrice).toFixed(2));
            return;
        }
        const discountValue = Number(discount);
        if (discountValue < 0 || discountValue > 100) {
            setError('Discount must be between 0 and 100%');
            setFinalSalePrice(null);
            return;
        }
        const finalPrice = sellingPrice * (1 - discountValue / 100);
        setFinalSalePrice(finalPrice.toFixed(2));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newSale.productId || !newSale.sellingPrice || !newSale.saleDate) {
            setError('Please enter a valid Product ID');
            return;
        }
        if (newSale.discount && (newSale.discount < 0 || newSale.discount > 100)) {
            setError('Discount must be between 0 and 100%');
            return;
        }
        try {
            const saleData = {
                productId: newSale.productId,
                salePrice: finalSalePrice ? Number(finalSalePrice) : Number(newSale.sellingPrice),
                saleDate: newSale.saleDate,
                discount: newSale.discount ? Number(newSale.discount) / 100 : null
            };
            console.log('Submitting sale:', saleData);
            await axios.post(`${BASE_URL}/api/sales`, saleData, {
                headers: { 'Content-Type': 'application/json' }
            });
            setNewSale({
                productId: '',
                saleDate: getCurrentDateISO(), // Reset to current date
                discount: '',
                sellingPrice: null
            });
            setFinalSalePrice(null);
            setError('');
            fetchSales();
        } catch (error) {
            console.error('Error creating sale:', error.response || error);
            setError(error.response?.data || 'Failed to create sale');
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }} className="page-container">
                <Typography variant="h4" component="h1" gutterBottom className="page-title">
                    Sale Management
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Create New Sale
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Product ID"
                                    name="productId"
                                    value={newSale.productId}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    placeholder="e.g., S00001"
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Selling Price"
                                    value={newSale.sellingPrice ? newSale.sellingPrice.toFixed(2) : ''}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    label="Discount (%)"
                                    name="discount"
                                    type="number"
                                    value={newSale.discount}
                                    onChange={handleInputChange}
                                    fullWidth
                                    inputProps={{ min: 0, max: 100 }}
                                    placeholder="Optional (0-100)"
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    label="Final Sale Price"
                                    value={finalSalePrice || ''}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    label="Sale Date"
                                    value={formatDate(newSale.saleDate)}
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary">
                                    Create Sale
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
                    <TextField
                        label="Search Sales"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: '300px' }}
                        placeholder="Search by Product ID or status"
                    />
                </Box>

                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Sale Price</TableCell>
                                <TableCell>Discount (%)</TableCell>
                                <TableCell>Selling Price</TableCell>
                                <TableCell>Sale Date</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSales.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.productId}</TableCell>
                                    <TableCell>{item.salePrice.toFixed(2)}</TableCell>
                                    <TableCell>{item.discount ? (item.discount * 100).toFixed(0) : '0'}</TableCell>
                                    <TableCell>
                                        {products[item.productId]?.status === 'RETURNED' ? 'Returned Product' : products[item.productId]?.sellingPrice?.toFixed(2) || 'N/A'}
                                    </TableCell>
                                    <TableCell>{formatDate(item.saleDate)}</TableCell>
                                    <TableCell>
                                        {products[item.productId]?.status === 'RETURNED' ? 'Returned Product' : 'Sold'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
};

export default Sales;