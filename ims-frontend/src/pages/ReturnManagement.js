// src/pages/ReturnManagement.js (snippet for verification)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

const ReturnManagement = () => {
    const [returns, setReturns] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentReturn, setCurrentReturn] = useState({
        productId: '',
        brandName: '',
        supplierName: '',
        purchasePrice: '',
        reasonForReturn: '',
        returnDate: ''
    });
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const BASE_URL = 'http://localhost:8080';


    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/returns`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setReturns(response.data);
            setFilteredReturns(response.data);
        } catch (error) {
            console.error('Error fetching returns:', error.message);
        }
    };

    useEffect(() => {
        let filtered = returns;
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reasonForReturn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredReturns(filtered);
    }, [returns, searchTerm]);

    const fetchProductDetails = async (productId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/products/by-product-id/${productId}`);
            const product = response.data;
            if (product) {
                let brandName = 'N/A';
                let supplierName = 'Unknown';
                try {
                    const categoryDetails = product.categoryDetails ? JSON.parse(product.categoryDetails) : {};
                    brandName = categoryDetails.brandName || 'N/A';
                    supplierName = categoryDetails.supplierName || 'Unknown';
                } catch (e) {
                    console.warn('Failed to parse categoryDetails:', e);
                }
                setCurrentReturn({
                    ...currentReturn,
                    productId,
                    brandName,
                    supplierName,
                    purchasePrice: product.purchasePrice ? product.purchasePrice.toString() : ''
                });
                setErrors({ ...errors, productId: '' });
            } else {
                throw new Error('Product not found');
            }
        } catch (error) {
            setErrors({ productId: 'Invalid Product ID' });
            setCurrentReturn({ ...currentReturn, productId, brandName: '', supplierName: '', purchasePrice: '' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentReturn({ ...currentReturn, [name]: value });
        setErrors({ ...errors, [name]: '' });

        if (name === 'productId' && value.length >= 6) {
            fetchProductDetails(value);
        } else if (name === 'productId') {
            setCurrentReturn({ ...currentReturn, productId: value, brandName: '', supplierName: '', purchasePrice: '' });
        }
    };

    const validateForm = async () => {
        const newErrors = {};
        if (!currentReturn.productId.trim()) {
            newErrors.productId = 'Product ID is required';
        } else {
            try {
                const response = await axios.get(`${BASE_URL}/api/products/by-product-id/${currentReturn.productId}`);
                if (!response.data) {
                    newErrors.productId = 'Product ID does not exist';
                }
            } catch (error) {
                newErrors.productId = 'Product ID does not exist';
            }
        }
        if (!currentReturn.brandName.trim()) {
            newErrors.brandName = 'Brand Name is required';
        }
        if (!currentReturn.supplierName.trim()) {
            newErrors.supplierName = 'Supplier Name is required';
        }
        if (!currentReturn.purchasePrice || isNaN(currentReturn.purchasePrice) || parseFloat(currentReturn.purchasePrice) <= 0) {
            newErrors.purchasePrice = 'Valid Purchase Price is required';
        }
        if (!currentReturn.reasonForReturn.trim()) {
            newErrors.reasonForReturn = 'Reason for Return is required';
        }
        if (!currentReturn.returnDate) {
            newErrors.returnDate = 'Return Date is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenDialog = () => {
        setCurrentReturn({
            productId: '',
            brandName: '',
            supplierName: '',
            purchasePrice: '',
            reasonForReturn: '',
            returnDate: ''
        });
        setErrors({});
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setErrors({});
    };

    const handleSaveReturn = async () => {
        if (!(await validateForm())) {
            console.log('Validation failed:', errors);
            return;
        }

        try {
            const returnToSave = {
                productId: currentReturn.productId,
                brandName: currentReturn.brandName,
                supplierName: currentReturn.supplierName,
                purchasePrice: parseFloat(currentReturn.purchasePrice),
                reasonForReturn: currentReturn.reasonForReturn,
                returnDate: currentReturn.returnDate,
                status: 'Not Returned Yet',
                returnedToSupplierDate: null
            };

            console.log('Saving return payload:', returnToSave);

            const response = await axios.post(`${BASE_URL}/api/returns`, returnToSave, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Return recorded successfully:', response.data);
            fetchReturns();
            handleCloseDialog();
        } catch (error) {
            const errorMessage = error.response
                ? `Status ${error.response.status}: ${error.response.data.message || error.response.statusText || 'Bad Request'}`
                : `Network Error: ${error.message}`;
            console.error('Error saving return:', errorMessage);
            setErrors({ general: `Failed to save return: ${errorMessage}` });
        }
    };

    const handleMarkReturned = async (id) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await axios.put(`${BASE_URL}/api/returns/${id}`, { returnedToSupplierDate: today, status: 'Returned' }, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Return marked as returned');
            fetchReturns();
        } catch (error) {
            console.error('Error marking return:', error.message);
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
                    Return Management
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
                    <TextField
                        label="Search Returns"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: '300px' }}
                        placeholder="Search by ID, brand, supplier, reason, status"
                    />
                    <Button variant="contained" color="primary" onClick={handleOpenDialog} className="action-button">
                        Record New Return
                    </Button>
                </Box>

                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Brand Name</TableCell>
                                <TableCell>Supplier Name</TableCell>
                                <TableCell>Purchase Price</TableCell>
                                <TableCell>Reason for Return</TableCell>
                                <TableCell>Return Date</TableCell>
                                <TableCell>Returned Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReturns.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.productId}</TableCell>
                                    <TableCell>{item.brandName}</TableCell>
                                    <TableCell>{item.supplierName}</TableCell>
                                    <TableCell>{item.purchasePrice.toFixed(2)}</TableCell>
                                    <TableCell>{item.reasonForReturn}</TableCell>
                                    <TableCell>{item.returnDate}</TableCell>
                                    <TableCell>{item.returnedToSupplierDate || 'N/A'}</TableCell>
                                    <TableCell>{item.status}</TableCell>
                                    <TableCell>
                                        {item.status === 'Not Returned Yet' && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleMarkReturned(item.id)}
                                                className="action-button"
                                            >
                                                Mark Returned
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog} className="dialog">
                    <DialogTitle>Record New Return</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Product ID"
                            name="productId"
                            value={currentReturn.productId}
                            onChange={handleInputChange}
                            error={!!errors.productId}
                            helperText={errors.productId || 'Enter a valid Product ID (e.g., 001SHO)'}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Brand Name"
                            name="brandName"
                            value={currentReturn.brandName}
                            disabled
                            helperText="Auto-filled from product"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Supplier Name"
                            name="supplierName"
                            value={currentReturn.supplierName}
                            disabled
                            helperText="Auto-filled from product"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Purchase Price"
                            name="purchasePrice"
                            value={currentReturn.purchasePrice}
                            disabled
                            type="number"
                            helperText="Auto-filled from product"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Reason for Return"
                            name="reasonForReturn"
                            value={currentReturn.reasonForReturn}
                            onChange={handleInputChange}
                            error={!!errors.reasonForReturn}
                            helperText={errors.reasonForReturn}
                            required
                            multiline
                            rows={3}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Return Date"
                            name="returnDate"
                            value={currentReturn.returnDate}
                            onChange={handleInputChange}
                            error={!!errors.returnDate}
                            helperText={errors.returnDate}
                            required
                            type="date"
                            InputLabelProps={{ shrink: true }}
                        />
                        {errors.general && <Typography color="error">{errors.general}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} className="dialog-button">Cancel</Button>
                        <Button onClick={handleSaveReturn} color="primary" className="dialog-button">Save</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default ReturnManagement;