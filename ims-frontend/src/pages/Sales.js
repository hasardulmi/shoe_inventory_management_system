// src/pages/SalesManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentSale, setCurrentSale] = useState({
        productId: '',
        soldPrice: '',
        soldDate: '',
        discountPercentage: ''
    });
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        fetchSales();
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
        }
    };

    useEffect(() => {
        let filtered = sales;
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.soldPrice.toString().includes(searchTerm.toLowerCase()) ||
                item.soldDate.includes(searchTerm.toLowerCase()) ||
                item.discountPercentage?.toString().includes(searchTerm.toLowerCase()) ||
                item.discountPrice?.toString().includes(searchTerm.toLowerCase()) ||
                item.finalSoldPrice?.toString().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredSales(filtered);
    }, [sales, searchTerm]);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setCurrentSale({ ...currentSale, [name]: value });
        setErrors({ ...errors, [name]: '' });

        // Auto-fill soldPrice when productId changes (non-editable)
        if (name === 'productId' && value.trim()) {
            try {
                const response = await axios.get(`${BASE_URL}/api/products/by-product-id/${value}`);
                if (response.data && response.data.inStock) {
                    setCurrentSale(prev => ({
                        ...prev,
                        productId: value,
                        soldPrice: response.data.sellingPrice.toString() // Auto-fill with sellingPrice
                    }));
                    setErrors({ ...errors, productId: '' });
                } else {
                    setErrors({ ...errors, productId: 'Product is not found or out of stock' });
                    setCurrentSale(prev => ({ ...prev, productId: value, soldPrice: '' }));
                }
            } catch (error) {
                setErrors({ ...errors, productId: 'Product ID does not exist' });
                setCurrentSale(prev => ({ ...prev, productId: value, soldPrice: '' }));
            }
        }
    };

    const validateForm = async () => {
        const newErrors = {};
        if (!currentSale.productId.trim()) {
            newErrors.productId = 'Product ID is required';
        } else {
            try {
                const response = await axios.get(`${BASE_URL}/api/products/by-product-id/${currentSale.productId}`);
                if (!response.data || !response.data.inStock) {
                    newErrors.productId = 'Product is either not found or out of stock';
                }
            } catch (error) {
                newErrors.productId = 'Product ID does not exist';
            }
        }
        if (!currentSale.soldPrice || isNaN(currentSale.soldPrice) || parseFloat(currentSale.soldPrice) <= 0) {
            newErrors.soldPrice = 'Sold Price must be a positive number';
        }
        if (!currentSale.soldDate) {
            newErrors.soldDate = 'Sold Date is required';
        }
        if (currentSale.discountPercentage && (isNaN(currentSale.discountPercentage) || parseFloat(currentSale.discountPercentage) < 0 || parseFloat(currentSale.discountPercentage) > 100)) {
            newErrors.discountPercentage = 'Discount must be between 0 and 100';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenDialog = () => {
        setCurrentSale({
            productId: '',
            soldPrice: '',
            soldDate: '',
            discountPercentage: ''
        });
        setErrors({});
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setErrors({});
    };

    const handleSaveSale = async () => {
        if (!(await validateForm())) {
            console.log('Validation failed:', errors);
            return;
        }

        try {
            const discount = currentSale.discountPercentage ? parseFloat(currentSale.discountPercentage) : 0;
            const soldPrice = parseFloat(currentSale.soldPrice);
            const discountPrice = soldPrice * (discount / 100);
            const finalSoldPrice = soldPrice - discountPrice;

            const saleToSave = {
                productId: currentSale.productId,
                soldPrice: soldPrice,
                soldDate: currentSale.soldDate,
                discountPercentage: discount,
                discountPrice: discountPrice,
                finalSoldPrice: finalSoldPrice
            };

            console.log('Saving sale payload:', saleToSave);

            await axios.post(`${BASE_URL}/api/sales`, saleToSave, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Sale added successfully');
            fetchSales();
            handleCloseDialog();
        } catch (error) {
            const errorMessage = error.response
                ? `Status ${error.response.status}: ${JSON.stringify(error.response.data) || error.response.statusText}`
                : `Network Error: ${error.message}`;
            console.error('Error saving sale:', errorMessage);
            setErrors({ general: `Failed to save sale: ${errorMessage}` });
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }} className="page-container">
                <Typography variant="h4" component="h1" gutterBottom className="page-title">
                    Sales Management
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
                    <TextField
                        label="Search Sales"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: '300px' }}
                        placeholder="Search by ID, price, date, discount"
                    />
                    <Button variant="contained" color="primary" onClick={handleOpenDialog} className="action-button">
                        Add New Sale
                    </Button>
                </Box>

                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Sold Price</TableCell>
                                <TableCell>Discount (%)</TableCell>
                                <TableCell>Discount Price</TableCell>
                                <TableCell>Final Sold Price</TableCell>
                                <TableCell>Sold Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSales.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.productId}</TableCell>
                                    <TableCell>{item.soldPrice.toFixed(2)}</TableCell>
                                    <TableCell>{item.discountPercentage ? item.discountPercentage.toFixed(2) : '0.00'}</TableCell>
                                    <TableCell>{item.discountPrice ? item.discountPrice.toFixed(2) : '0.00'}</TableCell>
                                    <TableCell>{item.finalSoldPrice.toFixed(2)}</TableCell>
                                    <TableCell>{item.soldDate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog} className="dialog">
                    <DialogTitle>Add New Sale</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Product ID"
                            name="productId"
                            value={currentSale.productId}
                            onChange={handleInputChange}
                            error={!!errors.productId}
                            helperText={errors.productId}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Sold Price"
                            name="soldPrice"
                            value={currentSale.soldPrice}
                            disabled
                            error={!!errors.soldPrice}
                            helperText={errors.soldPrice || 'Auto-filled from product selling price'}
                            required
                            type="number"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Sold Date"
                            name="soldDate"
                            value={currentSale.soldDate}
                            onChange={handleInputChange}
                            error={!!errors.soldDate}
                            helperText={errors.soldDate}
                            required
                            type="date"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Discount Percentage"
                            name="discountPercentage"
                            value={currentSale.discountPercentage}
                            onChange={handleInputChange}
                            error={!!errors.discountPercentage}
                            helperText={errors.discountPercentage || 'Optional (0-100)'}
                            type="number"
                            placeholder="0-100"
                        />
                        {errors.general && <Typography color="error">{errors.general}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} className="dialog-button">Cancel</Button>
                        <Button onClick={handleSaveSale} color="primary" className="dialog-button">Save</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default Sales;