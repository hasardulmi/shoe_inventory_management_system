import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, IconButton, Typography, CircularProgress
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import axios from 'axios';

const ReturnDialog = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        returnDate: new Date().toISOString().split('T')[0],
        productId: '',
        saleId: '',
        reason: '',
        sizeQuantities: [{ size: '', quantity: '' }],
        condition: '', // New field for return condition
    });
    const [availableSizes, setAvailableSizes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');
        setAvailableSizes([]);

        // Only fetch sizes if conditions are met and IDs are valid
        const isValidProductId = formData.productId && formData.productId.trim().length > 0; // Allow non-numeric IDs
        const isValidSaleId = formData.saleId && !isNaN(parseInt(formData.saleId)) && parseInt(formData.saleId) > 0;

        console.log('useEffect triggered - productId:', formData.productId, 'saleId:', formData.saleId, 'condition:', formData.condition);

        if (formData.condition === 'ADD_PRODUCT_QUANTITY' && isValidSaleId && isValidProductId) {
            fetchSaleSizes();
        } else if (formData.condition === 'DEDUCT_SALE_QUANTITY' && isValidSaleId) {
            fetchSaleSizes();
        } else if (formData.condition === 'DEDUCT_PRODUCT_QUANTITY' && isValidProductId) {
            fetchProductSizes();
        } else if (isValidSaleId && isValidProductId) {
            fetchSaleSizes();
        } else if (isValidSaleId) {
            fetchSaleSizes();
        } else if (isValidProductId) {
            fetchProductSizes();
        }
    }, [formData.condition, formData.saleId, formData.productId]);

    const fetchSaleSizes = async () => {
        if (!formData.saleId) {
            console.warn("fetchSaleSizes called with empty saleId");
            setError("Sale ID is required to fetch sale sizes");
            return;
        }
        setLoading(true);
        try {
            console.log(`Fetching sale sizes for saleId: ${formData.saleId}`);
            const response = await axios.get(`http://localhost:8080/api/returns/sale-sizes/${formData.saleId}`);
            console.log("fetchSaleSizes response:", response.data);
            setAvailableSizes(Object.entries(response.data).map(([size, quantity]) => ({ size, available: quantity })));
        } catch (err) {
            console.error("Error in fetchSaleSizes:", err);
            setError(`Error fetching sale sizes: ${err.response?.data?.error || err.message}`);
            setAvailableSizes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductSizes = async () => {
        if (!formData.productId || formData.productId.trim() === '') {
            console.warn("fetchProductSizes called with empty or invalid productId");
            setError("Product ID is required to fetch product sizes");
            return;
        }
        setLoading(true);
        try {
            console.log(`Fetching product sizes for productId: ${formData.productId}`);
            const response = await axios.get(`http://localhost:8080/api/returns/product-sizes/${formData.productId}`);
            console.log("fetchProductSizes response:", response.data);
            if (response.data && typeof response.data === 'object') {
                setAvailableSizes(Object.entries(response.data).map(([size, quantity]) => ({ size, available: quantity })));
            } else {
                console.warn("Unexpected response format:", response.data);
                setAvailableSizes([]);
            }
        } catch (err) {
            console.error("Error in fetchProductSizes:", err);
            setError(`Error fetching product sizes: ${err.response?.data?.error || err.message}`);
            setAvailableSizes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input change - ${name}: ${value}`); // Debug log
        setFormData(prev => {
            const updatedFormData = { ...prev, [name]: value };
            console.log(`Updated formData - ${name}: ${updatedFormData[name]}`); // Debug updated state
            return updatedFormData;
        });
    };

    const handleSizeQuantityChange = (index, field, value) => {
        setFormData(prev => {
            const updatedSizeQuantities = [...prev.sizeQuantities];
            updatedSizeQuantities[index] = { ...updatedSizeQuantities[index], [field]: value };
            return { ...prev, sizeQuantities: updatedSizeQuantities };
        });
    };

    const handleConditionChange = (e) => {
        setFormData(prev => ({ ...prev, condition: e.target.value }));
    };

    const handleAddSizeQuantity = () => {
        setFormData(prev => ({
            ...prev,
            sizeQuantities: [...prev.sizeQuantities, { size: '', quantity: '' }]
        }));
    };

    const handleRemoveSizeQuantity = (index) => {
        setFormData(prev => ({
            ...prev,
            sizeQuantities: prev.sizeQuantities.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                productId: formData.productId || null,
                saleId: formData.saleId ? parseInt(formData.saleId) : null,
                returnDate: formData.returnDate,
                reason: formData.reason,
                sizeQuantities: formData.sizeQuantities.reduce((acc, sq) => {
                    if (sq.size && sq.quantity) {
                        const available = availableSizes.find(s => s.size === sq.size)?.available || 0;
                        const quantity = parseInt(sq.quantity);
                        if (quantity <= 0 || isNaN(quantity)) {
                            throw new Error(`Invalid quantity for size ${sq.size}. Must be a positive number.`);
                        }
                        if (quantity > available) {
                            throw new Error(`Return quantity (${quantity}) exceeds available quantity (${available}) for size ${sq.size}`);
                        }
                        acc[sq.size] = quantity;
                    }
                    return acc;
                }, {}),
                condition: formData.condition, // Include the condition in the payload
            };

            if (!payload.reason || Object.keys(payload.sizeQuantities).length === 0) {
                throw new Error('Reason and at least one size with quantity are required');
            }

            if (!payload.condition) {
                throw new Error('Please select a return condition');
            }

            console.log("Submitting return payload:", payload);
            const response = await axios.post('http://localhost:8080/api/returns', payload);
            console.log("Submit response:", response.data);
            onSuccess('Return recorded successfully!');
            setFormData({
                returnDate: new Date().toISOString().split('T')[0],
                productId: '',
                saleId: '',
                reason: '',
                sizeQuantities: [{ size: '', quantity: '' }],
                condition: '',
            });
            setAvailableSizes([]);
            onClose();
        } catch (err) {
            console.error("Error in handleSubmit:", err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const isButtonDisabled = loading || !formData.reason || !formData.condition ||
        formData.sizeQuantities.some(sq => !sq.size || !sq.quantity || parseInt(sq.quantity) <= 0 || isNaN(parseInt(sq.quantity)));

    // Determine which conditions are available based on input fields
    const hasProductId = !!formData.productId;
    const hasSaleId = !!formData.saleId;
    const bothIdsPresent = hasProductId && hasSaleId;
    const conditionOptions = [
        { value: 'ADD_PRODUCT_QUANTITY', label: 'Add Product Quantity', disabled: !bothIdsPresent },
        { value: 'DEDUCT_SALE_QUANTITY', label: 'Deduct Sale Quantity', disabled: !hasSaleId || bothIdsPresent },
        { value: 'DEDUCT_PRODUCT_QUANTITY', label: 'Deduct Product Quantity', disabled: !hasProductId || bothIdsPresent },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#10b981', color: 'white', py: 2 }}>Add Return</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Return Date"
                                name="returnDate"
                                type="date"
                                value={formData.returnDate}
                                onChange={handleInputChange}
                                fullWidth
                                disabled
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Product ID"
                                name="productId"
                                value={formData.productId}
                                onChange={handleInputChange}
                                fullWidth
                                variant="outlined"
                                type="text"
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Sale ID"
                                name="saleId"
                                value={formData.saleId}
                                onChange={handleInputChange}
                                fullWidth
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Return Condition</InputLabel>
                                <Select
                                    value={formData.condition}
                                    onChange={handleConditionChange}
                                    disabled={!(hasProductId || hasSaleId)}
                                >
                                    <MenuItem value="">Select Condition</MenuItem>
                                    {conditionOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                            disabled={option.disabled}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {formData.sizeQuantities.map((sq, index) => (
                            <Grid container item xs={12} spacing={2} key={index} sx={{ mt: 1 }}>
                                <Grid item xs={5}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Size</InputLabel>
                                        <Select
                                            value={sq.size}
                                            onChange={(e) => handleSizeQuantityChange(index, 'size', e.target.value)}
                                            disabled={!availableSizes.length}
                                        >
                                            <MenuItem value="">Select Size</MenuItem>
                                            {availableSizes.map((s, idx) => (
                                                <MenuItem key={idx} value={s.size}>
                                                    {s.size} {formData.condition === 'DEDUCT_PRODUCT_QUANTITY'
                                                    ? `(Available Products: ${s.available})`
                                                    : `(Sold Products: ${s.available})`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        label="Return Quantity"
                                        type="number"
                                        value={sq.quantity}
                                        onChange={(e) => handleSizeQuantityChange(index, 'quantity', e.target.value)}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        inputProps={{ min: 1 }}
                                        disabled={!sq.size}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <IconButton onClick={() => handleRemoveSizeQuantity(index)} color="error" disabled={formData.sizeQuantities.length <= 1}>
                                        <Remove />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Button startIcon={<Add />} onClick={handleAddSizeQuantity} sx={{ mt: 1 }}>
                                Add Size/Quantity
                            </Button>
                        </Grid>
                    </Grid>
                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button
                    type="submit"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Add Return'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReturnDialog;