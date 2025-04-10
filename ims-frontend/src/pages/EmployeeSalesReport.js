// src/pages/EmployeeSalesReport.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel
} from '@mui/material';
import EmployeeNavbar from '../components/EmployeeNavbar'; // Correct import
import './styles.css';

const EmployeeSalesReport = () => {
    const [sales, setSales] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [saleDetails, setSaleDetails] = useState({
        productId: '',
        soldPrice: '',
        soldDate: '',
        hasDiscount: false,
        discountPercentage: '',
        discountPrice: 0,
        finalSoldPrice: 0
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/sales');
            setSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        }
    };

    const handleSaleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        let updatedSaleDetails = { ...saleDetails, [name]: newValue };

        // Recalculate discountPrice and finalSoldPrice
        if (name === 'soldPrice' || name === 'hasDiscount' || name === 'discountPercentage') {
            const soldPrice = parseFloat(updatedSaleDetails.soldPrice) || 0;
            const hasDiscount = updatedSaleDetails.hasDiscount;
            const discountPercentage = parseFloat(updatedSaleDetails.discountPercentage) || 0;

            const discountPrice = hasDiscount ? (soldPrice * discountPercentage) / 100 : 0;
            const finalSoldPrice = soldPrice - discountPrice;

            updatedSaleDetails = {
                ...updatedSaleDetails,
                discountPrice: discountPrice.toFixed(2),
                finalSoldPrice: finalSoldPrice.toFixed(2)
            };
        }

        setSaleDetails(updatedSaleDetails);
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!saleDetails.productId.trim()) newErrors.productId = 'Product ID is required';
        if (!saleDetails.soldPrice || isNaN(saleDetails.soldPrice) || saleDetails.soldPrice <= 0) newErrors.soldPrice = 'Sold Price must be a positive number';
        if (!saleDetails.soldDate) newErrors.soldDate = 'Sold Date is required';
        if (saleDetails.hasDiscount && (!saleDetails.discountPercentage || isNaN(saleDetails.discountPercentage) || saleDetails.discountPercentage < 0 || saleDetails.discountPercentage > 100)) {
            newErrors.discountPercentage = 'Discount Percentage must be between 0 and 100';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenDialog = () => {
        setSaleDetails({
            productId: '',
            soldPrice: '',
            soldDate: '',
            hasDiscount: false,
            discountPercentage: '',
            discountPrice: 0,
            finalSoldPrice: 0
        });
        setErrors({});
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setErrors({});
    };

    const handleSaveSale = async () => {
        if (!validateForm()) {
            console.log('Validation failed:', errors);
            return;
        }

        try {
            const saleToSave = {
                productId: saleDetails.productId,
                soldPrice: parseFloat(saleDetails.soldPrice),
                soldDate: saleDetails.soldDate,
                hasDiscount: saleDetails.hasDiscount,
                discountPercentage: saleDetails.hasDiscount ? parseFloat(saleDetails.discountPercentage) : 0,
                discountPrice: parseFloat(saleDetails.discountPrice),
                finalSoldPrice: parseFloat(saleDetails.finalSoldPrice)
            };

            console.log('Saving sale payload:', saleToSave);

            // Record the sale
            const saleResponse = await axios.post('http://localhost:8080/api/sales', saleToSave);
            console.log('Sale response:', saleResponse.data);

            // Update product stock status
            const stockResponse = await axios.put(`http://localhost:8080/api/products/update-stock/${saleDetails.productId}`, { inStock: false });
            console.log('Stock update response:', stockResponse.data);

            fetchSales();
            handleCloseDialog();
        } catch (error) {
            const errorMessage = error.response
                ? `Status ${error.response.status}: ${JSON.stringify(error.response.data)}`
                : error.message;
            console.error('Error saving sale:', error.response || error);
            setErrors({ general: `Failed to save sale: ${errorMessage}` });
        }
    };

    return (
        <>
            <EmployeeNavbar /> {/* Correct component usage */}
            <Box sx={{ p: 4 }} className="page-container">
                <Typography variant="h4" gutterBottom>Sales Management</Typography>
                <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                    Record New Sale
                </Button>
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Sold Price</TableCell>
                                <TableCell>Sold Date</TableCell>
                                <TableCell>Discount (%)</TableCell>
                                <TableCell>Discount Price</TableCell>
                                <TableCell>Final Sold Price</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{sale.productId}</TableCell>
                                    <TableCell>{sale.soldPrice}</TableCell>
                                    <TableCell>{sale.soldDate}</TableCell>
                                    <TableCell>{sale.hasDiscount ? sale.discountPercentage : 'N/A'}</TableCell>
                                    <TableCell>{sale.discountPrice}</TableCell>
                                    <TableCell>{sale.finalSoldPrice}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Record Sale</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Product ID"
                            name="productId"
                            value={saleDetails.productId}
                            onChange={handleSaleInputChange}
                            error={!!errors.productId}
                            helperText={errors.productId}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Sold Price"
                            name="soldPrice"
                            value={saleDetails.soldPrice}
                            onChange={handleSaleInputChange}
                            error={!!errors.soldPrice}
                            helperText={errors.soldPrice}
                            type="number"
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Sold Date"
                            name="soldDate"
                            value={saleDetails.soldDate}
                            onChange={handleSaleInputChange}
                            error={!!errors.soldDate}
                            helperText={errors.soldDate}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="hasDiscount"
                                    checked={saleDetails.hasDiscount}
                                    onChange={handleSaleInputChange}
                                />
                            }
                            label="Include Discount"
                        />
                        {saleDetails.hasDiscount && (
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Discount Percentage (%)"
                                name="discountPercentage"
                                value={saleDetails.discountPercentage}
                                onChange={handleSaleInputChange}
                                error={!!errors.discountPercentage}
                                helperText={errors.discountPercentage}
                                type="number"
                            />
                        )}
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Discount Price"
                            name="discountPrice"
                            value={saleDetails.discountPrice}
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Final Sold Price"
                            name="finalSoldPrice"
                            value={saleDetails.finalSoldPrice}
                            InputProps={{ readOnly: true }}
                        />
                        {errors.general && <Typography color="error">{errors.general}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSaveSale} color="primary">Save</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default EmployeeSalesReport;