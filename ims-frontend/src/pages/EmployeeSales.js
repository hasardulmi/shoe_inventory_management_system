import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Typography, Grid, Card, CardContent, Snackbar, Alert
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import axios from 'axios';
import OwnerNavbar from '../components/EmployeeNavbar';

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
            <Box sx={{ p: 4, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
                <Typography variant="h4" sx={{ mb: 4, color: '#1f2937', fontWeight: 'bold', textAlign: 'center' }}>
                    Sales Management
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
                    Record New Sale
                </Button>

                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <FormControl variant="outlined" sx={{ minWidth: '200px' }}>
                        <InputLabel>Product ID</InputLabel>
                        <Select
                            value={selectedProductId}
                            onChange={handleProductIdFilterChange}
                            label="Product ID"
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

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ bgcolor: '#10b981', color: 'white', py: 2 }}>
                        Record New Sale
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
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
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Category"
                                                value={selectedProduct.categoryName || 'N/A'}
                                                fullWidth
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Selling Price"
                                                value={(parseFloat(selectedProduct.sellingPrice) || 0).toFixed(2)}
                                                fullWidth
                                                disabled
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
                                                />
                                            </Grid>
                                        ) : (
                                            formData.sizeQuantities.map((sq, index) => (
                                                <Grid container item xs={12} spacing={2} key={index} sx={{ mt: 1 }}>
                                                    <Grid item xs={5}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Size</InputLabel>
                                                            <Select
                                                                value={sq.size}
                                                                onChange={(e) => handleSizeQuantityChange(index, 'size', e.target.value)}
                                                                required
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
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <IconButton onClick={() => handleRemoveSizeQuantity(index)} color="error">
                                                            <Remove />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            ))
                                        )}
                                        {selectedProduct.hasSizes && (
                                            <Grid item xs={12}>
                                                <Button startIcon={<Add />} onClick={handleAddSizeQuantity} sx={{ mt: 1 }}>
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
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenDialog(false)} variant="outlined">Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Record Sale'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {invoice && (
                    <Dialog open={!!invoice} onClose={handleCancelInvoice} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ bgcolor: '#3b82f6', color: 'white', py: 2 }}>
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
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={handleCancelInvoice} variant="outlined">Cancel</Button>
                            <Button
                                variant="contained"
                                onClick={handlePrintInvoice}
                                sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                            >
                                Print Invoice
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}

                <TableContainer component={Paper} sx={{ mt: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px', maxHeight: '600px', overflowY: 'auto', position: 'relative' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#3b82f6', position: 'sticky', top: 0, zIndex: 1 }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Sales ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Product ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Product Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Image</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Sale Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Category</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Subcategories</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Quantity</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Unit Selling Price</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Discount</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #1565c0' }}>Selling Price</TableCell>
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
                                        <TableRow key={sale.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                            <TableCell>{sale.id || 'N/A'}</TableCell>
                                            <TableCell>{sale.productId || 'N/A'}</TableCell>
                                            <TableCell>{sale.productName || 'N/A'}</TableCell>
                                            <TableCell>
                                                {sale.image ? (
                                                    <img src={`data:image/jpeg;base64,${sale.image}`} alt="Product" style={{ width: '50px' }} />
                                                ) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                }) : 'N/A'}
                                            </TableCell>
                                            <TableCell>{sale.category || 'N/A'}</TableCell>
                                            <TableCell>
                                                {sale.subcategories && Object.keys(sale.subcategories).length > 0
                                                    ? Object.entries(sale.subcategories)
                                                        .filter(([_, v]) => v && v.trim() !== '')
                                                        .map(([k, v]) => `${k}: ${v}`)
                                                        .join(', ')
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>{displayQuantity || 'N/A'}</TableCell>
                                            <TableCell>{(parseFloat(sale.sellingPrice) || 0).toFixed(2)}</TableCell>
                                            <TableCell>{(parseFloat(sale.discount) || 0).toFixed(2)}</TableCell>
                                            <TableCell>{calculateSaleTotalSellingPrice(sale).toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} sx={{ textAlign: 'center', py: 2 }}>
                                        No sales records available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <style>
                    {`
                        .MuiTableHead-root {
                            position: sticky;
                            top: 0;
                            z-index: 1;
                            background-color: #3b82f6;
                        }

                        .MuiTableCell-head {
                            color: white;
                            font-weight: bold;
                            border-bottom: 2px solid #1565c0;
                            background-color: #3b82f6;
                        }

                        .MuiTableContainer-root {
                            position: relative;
                            max-height: 600px;
                            overflow-y: auto;
                        }

                        .MuiTableRow-root:hover {
                            background-color: #f9fafb;
                        }

                        .MuiTableCell-body {
                            padding: 12px 16px;
                            border-bottom: 1px solid #e0e0e0;
                            color: #333;
                        }
                    `}
                </style>
            </Box>
        </>
    );
};

export default SalesManagement;