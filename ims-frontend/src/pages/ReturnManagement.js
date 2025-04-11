// src/pages/ReturnManagement.js
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
        supplierName: '',
        brandName: '',
        purchasePrice: '',
        reasonForReturn: '',
        returnDate: ''
    });
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/returns');
            setReturns(response.data);
            setFilteredReturns(response.data);
        } catch (error) {
            console.error('Error fetching returns:', error);
        }
    };

    useEffect(() => {
        let filtered = returns;
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reasonForReturn.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredReturns(filtered);
    }, [returns, searchTerm]);

    const fetchProductDetails = async (productId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/products/by-product-id/${productId}`);
            const product = response.data;
            setCurrentReturn({
                ...currentReturn,
                supplierName: product.supplierName || 'N/A',
                brandName: product.categoryDetails?.brandName || 'N/A',
                purchasePrice: product.purchasePrice || '',
                productId
            });
        } catch (error) {
            setErrors({ productId: 'Invalid Product ID' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentReturn({ ...currentReturn, [name]: value });
        setErrors({ ...errors, [name]: '' });
        if (name === 'productId' && value.length === 6) {
            fetchProductDetails(value);
        }
    };

    const validateForm = async () => {
        const newErrors = {};
        if (!currentReturn.productId.trim()) newErrors.productId = 'Product ID is required';
        else {
            try {
                await axios.get(`http://localhost:8081/api/products/by-product-id/${currentReturn.productId}`);
            } catch (error) {
                newErrors.productId = 'Product ID does not exist';
            }
        }
        if (!currentReturn.reasonForReturn.trim()) newErrors.reasonForReturn = 'Reason for Return is required';
        if (!currentReturn.returnDate) newErrors.returnDate = 'Return Date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenDialog = () => {
        setCurrentReturn({
            productId: '',
            supplierName: '',
            brandName: '',
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
                supplierName: currentReturn.supplierName,
                brandName: currentReturn.brandName,
                purchasePrice: parseFloat(currentReturn.purchasePrice),
                reasonForReturn: currentReturn.reasonForReturn,
                returnDate: currentReturn.returnDate,
                returnedToSupplierDate: null, // Initially null
                status: 'Not Returned Yet'
            };

            console.log('Saving return payload:', returnToSave);

            await axios.post('http://localhost:8081/api/returns', returnToSave);
            fetchReturns();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving return:', error);
            setErrors({ general: 'Failed to save return' });
        }
    };

    const handleMarkReturned = async (id) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await axios.put(`http://localhost:8081/api/returns/${id}`, { returnedToSupplierDate: today, status: 'Returned' });
            fetchReturns();
        } catch (error) {
            console.error('Error marking return:', error);
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
                        placeholder="Search by ID, supplier, brand, reason"
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
                                <TableCell>Supplier Name</TableCell>
                                <TableCell>Brand Name</TableCell>
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
                                    <TableCell>{item.supplierName}</TableCell>
                                    <TableCell>{item.brandName}</TableCell>
                                    <TableCell>{item.purchasePrice}</TableCell>
                                    <TableCell>{item.reasonForReturn}</TableCell>
                                    <TableCell>{item.returnDate}</TableCell>
                                    <TableCell>{item.returnedToSupplierDate || 'N/A'}</TableCell>
                                    <TableCell>{item.status}</TableCell>
                                    <TableCell>
                                        {item.status === 'Not Returned Yet' && (
                                            <Button variant="contained" color="primary" onClick={() => handleMarkReturned(item.id)} className="action-button">
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
                        <TextField fullWidth margin="normal" label="Product ID" name="productId" value={currentReturn.productId} onChange={handleInputChange} error={!!errors.productId} helperText={errors.productId} required />
                        <TextField fullWidth margin="normal" label="Supplier Name" name="supplierName" value={currentReturn.supplierName} disabled />
                        <TextField fullWidth margin="normal" label="Brand Name" name="brandName" value={currentReturn.brandName} disabled />
                        <TextField fullWidth margin="normal" label="Purchase Price" name="purchasePrice" value={currentReturn.purchasePrice} disabled type="number" />
                        <TextField fullWidth margin="normal" label="Reason for Return" name="reasonForReturn" value={currentReturn.reasonForReturn} onChange={handleInputChange} error={!!errors.reasonForReturn} helperText={errors.reasonForReturn} required multiline rows={3} />
                        <TextField fullWidth margin="normal" label="Return Date" name="returnDate" value={currentReturn.returnDate} onChange={handleInputChange} error={!!errors.returnDate} helperText={errors.returnDate} required type="date" InputLabelProps={{ shrink: true }} />
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