import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Typography, Grid, Card, CardContent, Snackbar, Alert
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';

const SalesManagement = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        sizeQuantities: [{ size: '', quantity: '' }],
        discount: '',
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [totalSellingPrice, setTotalSellingPrice] = useState(0);
    const [tempSaleId, setTempSaleId] = useState(null);
    const [tempQuantities, setTempQuantities] = useState({});
    const [selectedProductId, setSelectedProductId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [salesRes, productsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/sales'),
                axios.get('http://localhost:8080/api/products')
            ]);
            console.log("Sales API Response:", JSON.stringify(salesRes.data, null, 2));

            // Ensure salesData is an array
            let salesData = [];
            if (salesRes.data && Array.isArray(salesRes.data.data)) {
                salesData = salesRes.data.data;
            } else if (Array.isArray(salesRes.data)) {
                salesData = salesRes.data;
            } else {
                console.warn("Sales data is not in expected format:", salesRes.data);
                salesData = [];
            }

            if (salesData.length === 0) {
                console.warn("No sales data returned from the API.");
            } else {
                console.log("Fetched Sales:", JSON.stringify(salesData, null, 2));
                const initialTempQuantities = {};
                const enrichedSalesData = salesData.map(sale => {
                    const hasSizes = sale.sizeQuantities && Object.keys(sale.sizeQuantities).length > 0;
                    if (hasSizes) {
                        initialTempQuantities[sale.id] = { ...sale.sizeQuantities };
                    } else {
                        const quantity = parseInt(sale.quantity) || 0;
                        initialTempQuantities[sale.id] = quantity;
                    }
                    return { ...sale, hasSizes };
                });
                setSales(enrichedSalesData);
                setTempQuantities(initialTempQuantities);
                console.log("Processed Sales (with hasSizes flag):", JSON.stringify(enrichedSalesData, null, 2));
                console.log("Total Sales:", enrichedSalesData.length);
                console.log("Sized Sales (hasSizes: true):", enrichedSalesData.filter(sale => sale.hasSizes).length);
                console.log("Non-Sized Sales (hasSizes: false):", enrichedSalesData.filter(sale => !sale.hasSizes).length);
            }

            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        } catch (err) {
            console.error("Error fetching data:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Failed to fetch data: ' + err.message);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProductIdChange = (e) => {
        const productId = e.target.value;
        setFormData(prev => ({ ...prev, productId }));
        if (productId) {
            axios.get(`http://localhost:8080/api/sales/product/${productId}`)
                .then(response => {
                    console.log("Product Details Response:", response.data);
                    const product = response.data;
                    setSelectedProduct(product);
                    setFormData(prev => ({
                        ...prev,
                        productId,
                        sizeQuantities: product.hasSizes ? product.sizeQuantities.map(sq => ({ size: sq.size, quantity: '' })) : [{ size: '', quantity: '' }],
                        quantity: !product.hasSizes ? '' : prev.quantity,
                        discount: prev.discount || '',
                    }));
                    calculateTotalSellingPrice();
                })
                .catch(err => {
                    console.error("Error fetching product details:", err);
                    setError('Failed to fetch product details: ' + err.message);
                });
        } else {
            setSelectedProduct(null);
            setFormData(prev => ({ ...prev, sizeQuantities: [{ size: '', quantity: '' }], quantity: '', discount: '' }));
            setTotalSellingPrice(0);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        calculateTotalSellingPrice();
    };

    const handleSizeQuantityChange = (index, field, value) => {
        setFormData(prev => {
            const updatedSizeQuantities = [...prev.sizeQuantities];
            updatedSizeQuantities[index] = { ...updatedSizeQuantities[index], [field]: value };
            return { ...prev, sizeQuantities: updatedSizeQuantities };
        });
        calculateTotalSellingPrice();
    };

    const calculateTotalSellingPrice = () => {
        if (!selectedProduct || !selectedProduct.sellingPrice) {
            setTotalSellingPrice(0);
            return;
        }

        const sellingPrice = parseFloat(selectedProduct.sellingPrice) || 0;
        const discount = parseFloat(formData.discount) || 0;
        let totalQuantity = 0;

        if (selectedProduct.hasSizes) {
            totalQuantity = formData.sizeQuantities
                .filter(sq => sq.quantity && !isNaN(parseInt(sq.quantity)))
                .reduce((sum, sq) => sum + parseInt(sq.quantity), 0);
        } else {
            totalQuantity = parseInt(formData.quantity) || 0;
        }

        const newTotalSellingPrice = (sellingPrice * totalQuantity) - discount;
        setTotalSellingPrice(newTotalSellingPrice >= 0 ? newTotalSellingPrice : 0);
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
        calculateTotalSellingPrice();
    };

    const calculateSaleTotalSellingPrice = (sale) => {
        const sellingPrice = parseFloat(sale.sellingPrice) || 0;
        const discount = parseFloat(sale.discount) || 0;
        let totalQuantity = 0;

        if (sale.hasSizes && sale.sizeQuantities) {
            const tempSizes = tempQuantities[sale.id] || sale.sizeQuantities;
            totalQuantity = Object.values(tempSizes)
                .reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
        } else {
            const tempQty = tempQuantities[sale.id];
            totalQuantity = typeof tempQty === 'number' ? tempQty : parseInt(sale.quantity) || 0;
        }

        const newTotalSellingPrice = (sellingPrice * totalQuantity) - discount;
        return newTotalSellingPrice >= 0 ? newTotalSellingPrice : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                productId: formData.productId,
                quantity: selectedProduct?.hasSizes ? null : parseInt(formData.quantity) || 0,
                sizeQuantities: selectedProduct?.hasSizes
                    ? formData.sizeQuantities.reduce((acc, sq) => {
                        if (sq.size && sq.quantity) acc[sq.size] = parseInt(sq.quantity);
                        return acc;
                    }, {})
                    : null,
                discount: formData.discount ? parseFloat(formData.discount) : 0,
            };

            const response = await axios.post('http://localhost:8080/api/sales', payload);
            console.log("Sale Creation Response:", JSON.stringify(response.data, null, 2));
            const saleData = response.data.sale || response.data.invoice;

            const maxSaleId = sales.length > 0 ? Math.max(...sales.map(sale => parseInt(sale.id) || 0)) : 0;
            const newTempSaleId = maxSaleId + 1;
            setTempSaleId(newTempSaleId);

            const invoiceWithTempId = { ...saleData, tempSaleId: newTempSaleId };
            setInvoice(invoiceWithTempId);

            setSuccess('Sale recorded successfully!');
            setFormData({ productId: '', quantity: '', sizeQuantities: [{ size: '', quantity: '' }], discount: '' });
            setSelectedProduct(null);
            setTotalSellingPrice(0);
            setOpenDialog(false);
            fetchData();
        } catch (err) {
            console.error("Error creating sale:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Failed to record sale: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintInvoice = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Invoice</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: "Comic Sans MS", cursive, sans-serif; line-height: 1.6; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAJElEQVQYV2NkYGD4z8DAwMgAB//z5gPAAW4kO1YQ0g7MAAAAASUVORK5CYII=") repeat; }');
        printWindow.document.write('.invoice { max-width: 400px; margin: 20px auto; padding: 20px; border: 1px solid #000; position: relative; }');
        printWindow.document.write('.header { text-align: center; margin-bottom: 20px; }');
        printWindow.document.write('.header h2 { font-size: 24px; margin: 0; text-decoration: underline; }');
        printWindow.document.write('.details { margin: 10px 0; }');
        printWindow.document.write('.details span { display: inline-block; width: 100px; font-weight: bold; }');
        printWindow.document.write('.footer { text-align: center; margin-top: 20px; }');
        printWindow.document.write('.contact { position: absolute; bottom: 20px; right: 20px; text-align: right; }');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<div class="invoice">');
        printWindow.document.write('<div class="header"><h2>Sarasi Shoe Corner</h2></div>');
        printWindow.document.write('<div class="details"><span>Sale ID</span> ' + (invoice.tempSaleId || 'N/A') + '</div>');
        printWindow.document.write('<div class="details"><span>Sale Date</span> ' + (new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })) + '</div>');
        printWindow.document.write('<div class="details"><span>Product ID</span> ' + (invoice.productId || 'N/A') + '</div>');
        printWindow.document.write('<div class="details"><span>Product Name</span> ' + (invoice.productName || 'N/A') + '</div>');
        printWindow.document.write('<div class="details"><span>Selling Price</span> ' + (parseFloat(invoice.sellingPrice) || 0).toFixed(2) + '</div>');
        printWindow.document.write('<div class="details"><span>Quantity</span> ' + (invoice.quantity || (invoice.sizeQuantities ? Object.entries(invoice.sizeQuantities).map(([size, qty]) => `Size ${size}: ${qty}`).join(', ') : 'N/A')) + '</div>');
        printWindow.document.write('<div class="details"><span>Discount</span> ' + (parseFloat(invoice.discount) || 0).toFixed(2) + '</div>');
        printWindow.document.write('<div class="details"><span>Total Selling Price</span> ' + (parseFloat(invoice.totalSellingPrice) || 0).toFixed(2) + '</div>');
        printWindow.document.write('<div class="footer">Thank You!</div>');
        printWindow.document.write('<div class="contact">0711234567<br>Sarasi Shoe Corner,<br>Debarawewa,<br>Tissamaharama.</div>');
        printWindow.document.write('</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        setInvoice(null);
        setTempSaleId(null);
    };

    const handleCancelInvoice = () => {
        setInvoice(null);
        setTempSaleId(null);
    };

    const handleProductIdFilterChange = (e) => {
        setSelectedProductId(e.target.value);
    };

    const getFilteredSales = () => {
        if (!selectedProductId) return sales;
        return sales.filter(sale => String(sale.productId) === String(selectedProductId));
    };

    const uniqueProductIds = [...new Set(sales.map(sale => sale.productId).filter(Boolean))];

    return (
        <>
            <OwnerNavbar />
            <Box sx={{
                p: { xs: 2, md: 4 },
                bgcolor: '#fff',
                minHeight: '100vh',
                fontFamily: 'Roboto, sans-serif'
            }}>
                <Typography
                    variant="h4"
                    sx={{
                        mb: 4,
                        color: '#000000',
                        fontWeight: 600,
                        textAlign: 'center',
                        letterSpacing: 0.5
                    }}
                >
                    Sales Management
                </Typography>

                <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                    <Alert onClose={() => setError('')} severity="error" sx={{
                        width: '100%',
                        bgcolor: '#ff5e62',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}>
                        {error}
                    </Alert>
                </Snackbar>
                <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                    <Alert onClose={() => setSuccess('')} severity="success" sx={{
                        width: '100%',
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}>
                        {success}
                    </Alert>
                </Snackbar>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        borderRadius: '8px',
                        px: 3,
                        py: 1.5,
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(83, 209, 182, 0.2)',
                        '&:hover': {
                            bgcolor: '#46b69d',
                            boxShadow: '0 4px 12px rgba(83, 209, 182, 0.3)'
                        }
                    }}
                >
                    Record New Sale
                </Button>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 4,
                    mt: 2,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FormControl variant="outlined" sx={{ minWidth: '200px' }}>
                        <InputLabel sx={{ color: '#000000', '&.Mui-focused': { color: '#6c63ff' } }}>
                            Product ID
                        </InputLabel>
                        <Select
                            value={selectedProductId}
                            onChange={handleProductIdFilterChange}
                            label="Product ID"
                            sx={{
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8ee' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' }
                            }}
                        >
                            <MenuItem value="">All Product IDs</MenuItem>
                            {uniqueProductIds.map((productId, index) => (
                                <MenuItem key={index} value={productId}>
                                    {productId}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    maxWidth="md"
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        py: 2,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                    }}>
                        Record New Sale
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, bgcolor: '#fff' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Product ID"
                                        name="productId"
                                        value={formData.productId}
                                        onChange={handleProductIdChange}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        autoFocus
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                '& fieldset': { borderColor: '#e3e8ee' },
                                                '&:hover fieldset': { borderColor: '#6c63ff' },
                                                '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#000000',
                                                '&.Mui-focused': { color: '#6c63ff' }
                                            }
                                        }}
                                    />
                                </Grid>
                                {selectedProduct && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Product Name"
                                                value={selectedProduct.productName || 'N/A'}
                                                fullWidth
                                                disabled
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#e3e8ee' },
                                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: '#000000',
                                                        '&.Mui-focused': { color: '#6c63ff' }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Category"
                                                value={selectedProduct.categoryName || 'N/A'}
                                                fullWidth
                                                disabled
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#e3e8ee' },
                                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: '#000000',
                                                        '&.Mui-focused': { color: '#6c63ff' }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Selling Price"
                                                value={(parseFloat(selectedProduct.sellingPrice) || 0).toFixed(2)}
                                                fullWidth
                                                disabled
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#e3e8ee' },
                                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: '#000000',
                                                        '&.Mui-focused': { color: '#6c63ff' }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Subcategories"
                                                value={Object.entries(selectedProduct.subcategories || {})
                                                    .filter(([_, v]) => v && v.trim() !== '')
                                                    .map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}
                                                fullWidth
                                                disabled
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#e3e8ee' },
                                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: '#000000',
                                                        '&.Mui-focused': { color: '#6c63ff' }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        {!selectedProduct.hasSizes ? (
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Quantity"
                                                    name="quantity"
                                                    type="number"
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    required
                                                    variant="outlined"
                                                    inputProps={{ min: 0 }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '8px',
                                                            '& fieldset': { borderColor: '#e3e8ee' },
                                                            '&:hover fieldset': { borderColor: '#6c63ff' },
                                                            '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: '#000000',
                                                            '&.Mui-focused': { color: '#6c63ff' }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        ) : (
                                            formData.sizeQuantities.map((sq, index) => (
                                                <Grid container item xs={12} spacing={2} key={index} sx={{ mt: 1 }}>
                                                    <Grid item xs={5}>
                                                        <FormControl fullWidth>
                                                            <InputLabel sx={{ color: '#000000', '&.Mui-focused': { color: '#6c63ff' } }}>
                                                                Size
                                                            </InputLabel>
                                                            <Select
                                                                value={sq.size}
                                                                onChange={(e) => handleSizeQuantityChange(index, 'size', e.target.value)}
                                                                required
                                                                sx={{
                                                                    borderRadius: '8px',
                                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8ee' },
                                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
                                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' }
                                                                }}
                                                            >
                                                                <MenuItem value="">Select Size</MenuItem>
                                                                {selectedProduct.sizeQuantities.map(sqOpt => (
                                                                    <MenuItem key={sqOpt.size} value={sqOpt.size}>
                                                                        {sqOpt.size} (Available: {sqOpt.quantity})
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                        <TextField
                                                            label="Quantity"
                                                            type="number"
                                                            value={sq.quantity}
                                                            onChange={(e) => handleSizeQuantityChange(index, 'quantity', e.target.value)}
                                                            fullWidth
                                                            required
                                                            variant="outlined"
                                                            inputProps={{ min: 0 }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '8px',
                                                                    '& fieldset': { borderColor: '#e3e8ee' },
                                                                    '&:hover fieldset': { borderColor: '#6c63ff' },
                                                                    '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                                                },
                                                                '& .MuiInputLabel-root': {
                                                                    color: '#000000',
                                                                    '&.Mui-focused': { color: '#6c63ff' }
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <IconButton onClick={() => handleRemoveSizeQuantity(index)} sx={{
                                                            color: '#ff5e62',
                                                            '&:hover': { bgcolor: 'rgba(255, 94, 98, 0.1)' }
                                                        }}>
                                                            <Remove />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            ))
                                        )}
                                        {selectedProduct.hasSizes && (
                                            <Grid item xs={12}>
                                                <Button startIcon={<Add />} onClick={handleAddSizeQuantity} sx={{
                                                    mt: 1,
                                                    bgcolor: '#4ecdc4',
                                                    color: '#fff',
                                                    borderRadius: '8px',
                                                    px: 3,
                                                    py: 1,
                                                    fontWeight: 500,
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        bgcolor: '#45b7aa',
                                                        boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)'
                                                    }
                                                }}>
                                                    Add Size/Quantity
                                                </Button>
                                            </Grid>
                                        )}
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Discount"
                                                name="discount"
                                                type="number"
                                                value={formData.discount}
                                                onChange={handleInputChange}
                                                fullWidth
                                                variant="outlined"
                                                inputProps={{ min: 0 }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#e3e8ee' },
                                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: '#000000',
                                                        '&.Mui-focused': { color: '#6c63ff' }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                            {error && <Typography color="#ff5e62" sx={{ mt: 2, fontWeight: 500 }}>{error}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <Button
                            onClick={() => setOpenDialog(false)}
                            variant="outlined"
                            sx={{
                                borderColor: '#e3e8ee',
                                color: '#000000',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#6c63ff',
                                    bgcolor: 'rgba(108, 99, 255, 0.05)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{
                                bgcolor: '#53d1b6',
                                color: '#fff',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#46b69d',
                                    boxShadow: '0 2px 8px rgba(83, 209, 182, 0.3)'
                                },
                                '&:disabled': {
                                    bgcolor: '#e3e8ee',
                                    color: '#6b7280'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Record Sale'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {invoice && (
                    <Dialog open={!!invoice} onClose={handleCancelInvoice} maxWidth="sm" fullWidth sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)'
                        }
                    }}>
                        <DialogTitle sx={{
                            bgcolor: '#3b82f6',
                            color: '#fff',
                            py: 2,
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px'
                        }}>
                            Invoice
                        </DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <Box sx={{ maxWidth: 400, margin: '20px auto', padding: 2, border: '1px solid #000', position: 'relative', fontFamily: '"Comic Sans MS", cursive, sans-serif', lineHeight: 1.6, background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAJElEQVQYV2NkYGD4z8DAwMgAB//z5gPAAW4kO1YQ0g7MAAAAASUVORK5CYII=") repeat' }}>
                                <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
                                    <Typography variant="h2" sx={{ fontSize: 24, margin: 0, textDecoration: 'underline' }}>
                                        Sarasi Shoe Corner
                                    </Typography>
                                </Box>
                                <Box sx={{ margin: '10px 0' }}><span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Sale ID</span> {invoice.tempSaleId || 'N/A'}</Box>
                                <Box sx={{ margin: '10px 0' }}><span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Sale Date</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Box>
                                <Box sx={{ margin: '10px 0' }}><span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Product ID</span> {invoice.productId || 'N/A'}</Box>
                                <Box sx={{ margin: '10px 0' }}><span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Product Name</span> {invoice.productName || 'N/A'}</Box>
                                <Box sx={{ margin: '10px 0' }}><span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Unit Selling Price</span> {(parseFloat(invoice.sellingPrice) || 0).toFixed(2)}</Box>
                                <Box sx={{ margin: '10px 0' }}><span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Quantity</span> {invoice.quantity || (invoice.sizeQuantities ? Object.entries(invoice.sizeQuantities).map(([size, qty]) => `Size ${size}: ${qty}`).join(', ') : 'N/A')}</Box>
                                <Box sx={{ margin: '10px 0' }}><span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Discount</span> {(parseFloat(invoice.discount) || 0).toFixed(2)}</Box>
                                <Box sx={{ margin: '10px 0' }}><span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Selling Price</span> {(parseFloat(invoice.totalSellingPrice) || 0).toFixed(2)}</Box>
                                <Box sx={{ textAlign: 'center', marginTop: 2 }}>Thank You!</Box>
                                <Box sx={{ position: 'absolute', bottom: 20, right: 20, textAlign: 'right' }}>
                                    0711234567<br />Sarasi Shoe Corner,<br />Debarawewa,<br />Tissamaharama.
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, bgcolor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                            <Button onClick={handleCancelInvoice} variant="outlined" sx={{
                                borderColor: '#e3e8ee',
                                color: '#000000',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#6c63ff',
                                    bgcolor: 'rgba(108, 99, 255, 0.05)'
                                }
                            }}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handlePrintInvoice}
                                sx={{
                                    bgcolor: '#3b82f6',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    px: 3,
                                    py: 1,
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: '#2563eb',
                                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                    }
                                }}
                            >
                                Print Invoice
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}

                <TableContainer
                    component={Paper}
                    sx={{
                        mt: 4,
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)',
                        maxHeight: '600px',
                        overflowY: 'auto',
                        bgcolor: '#fff',
                        '& .MuiTableHead-root': {
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            backgroundColor: '#4ecdc4',
                        },
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Sales ID
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Product ID
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Product Name
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Image
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Sale Date
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Category
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Subcategories
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Quantity
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Unit Selling Price
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Discount
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Selling Price
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={11} sx={{ textAlign: 'center', py: 2 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : getFilteredSales().length > 0 ? (
                                [...getFilteredSales()].reverse().map(sale => {
                                    console.log("Rendering sale:", sale);
                                    const tempQty = tempQuantities[sale.id] || {};
                                    let displayQuantity;
                                    if (sale.hasSizes && sale.sizeQuantities) {
                                        displayQuantity = Object.entries(tempQty || sale.sizeQuantities)
                                            .map(([size, qty]) => `Size ${size}: ${qty}`)
                                            .join(', ');
                                    } else {
                                        displayQuantity = typeof tempQty === 'number' ? tempQty : parseInt(sale.quantity) || 0;
                                        displayQuantity = displayQuantity.toString();
                                    }
                                    return (
                                        <TableRow
                                            key={sale.id}
                                            sx={{
                                                bgcolor: '#fff',
                                                '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.05)' }
                                            }}
                                        >
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {sale.id || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {sale.productId || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {sale.productName || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                {sale.image ? (
                                                    <Box
                                                        sx={{
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            maxWidth: '100px',
                                                            maxHeight: '100px',
                                                            overflow: 'hidden',
                                                            borderRadius: '6px',
                                                            boxShadow: '0 2px 8px rgba(39, 68, 114, 0.08)',
                                                            transition: 'transform 0.2s ease-in-out',
                                                            '&:hover': { transform: 'scale(1.05)' }
                                                        }}
                                                        onClick={() => handleImagePreview(`data:image/jpeg;base64,${sale.image}`)}
                                                    >
                                                        <img
                                                            src={`data:image/jpeg;base64,${sale.image}`}
                                                            alt="Product"
                                                            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px' }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="#000000">N/A</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                }) : 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {sale.category || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {sale.subcategories && Object.keys(sale.subcategories).length > 0
                                                    ? Object.entries(sale.subcategories)
                                                        .filter(([_, v]) => v && v.trim() !== '')
                                                        .map(([k, v]) => `${k}: ${v}`)
                                                        .join(', ')
                                                    : <Typography variant="body2" color="#000000">N/A</Typography>}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {displayQuantity || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {(parseFloat(sale.sellingPrice) || 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {(parseFloat(sale.discount) || 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {calculateSaleTotalSellingPrice(sale).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        <Typography variant="body2" color="#000000" sx={{ py: 4 }}>
                                            No sales records available.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <style>
                {`
                    body {
                        font-family: 'Roboto', sans-serif;
                    }

                    @media print {
                        body {
                            margin: 0;
                            padding: 20px;
                        }
                        .filter-section, .MuiTabs-root {
                            display: none;
                        }
                        .table-container {
                            box-shadow: none;
                            max-height: none;
                            overflow-y: visible;
                        }
                        .table {
                            page-break-inside: auto;
                        }
                        .table tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default SalesManagement;