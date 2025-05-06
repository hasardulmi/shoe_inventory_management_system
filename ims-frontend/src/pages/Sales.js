import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Button, Grid,
    TextField, Snackbar, Alert
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

axios.defaults.withCredentials = true;

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [saleForm, setSaleForm] = useState({ productId: '', quantitySold: '' });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarErrorOpen, setSnackbarErrorOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarErrorMessage, setSnackbarErrorMessage] = useState('');
    const navigate = useNavigate();
    const BASE_URL = 'http://localhost:8081';

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (!userRole || userRole !== 'OWNER') {
            setSnackbarErrorMessage('Please log in as OWNER to access this page');
            setSnackbarErrorOpen(true);
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [navigate]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/products`);
                setProducts(response.data);
            } catch (error) {
                setSnackbarErrorMessage(error.response?.data?.error || 'Failed to fetch products');
                setSnackbarErrorOpen(true);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    setTimeout(() => navigate('/login'), 3000);
                }
            }
        };
        fetchProducts();
    }, [navigate]);

    const handleSaleChange = (e) => {
        const { name, value } = e.target;
        setSaleForm({ ...saleForm, [name]: value });
    };

    const validateSaleForm = () => {
        if (!saleForm.productId || !saleForm.quantitySold) {
            setSnackbarErrorMessage('Please fill in all fields');
            setSnackbarErrorOpen(true);
            return false;
        }
        const quantity = parseInt(saleForm.quantitySold);
        if (isNaN(quantity) || quantity <= 0) {
            setSnackbarErrorMessage('Quantity must be a positive number');
            setSnackbarErrorOpen(true);
            return false;
        }
        const product = products.find(p => p.productId === saleForm.productId);
        if (!product) {
            setSnackbarErrorMessage('Product not found');
            setSnackbarErrorOpen(true);
            return false;
        }
        if (product.quantity < quantity) {
            setSnackbarErrorMessage('Insufficient stock');
            setSnackbarErrorOpen(true);
            return false;
        }
        return true;
    };

    const handleConfirmSale = async () => {
        if (!validateSaleForm()) return;

        try {
            await axios.post(`${BASE_URL}/api/sales`, {
                productId: saleForm.productId,
                quantitySold: parseInt(saleForm.quantitySold)
            });
            setSnackbarMessage('Sale recorded successfully');
            setSnackbarOpen(true);
            setSaleForm({ productId: '', quantitySold: '' });
            const response = await axios.get(`${BASE_URL}/api/products`);
            setProducts(response.data);
        } catch (error) {
            setSnackbarErrorMessage(error.response?.data?.error || 'Failed to record sale');
            setSnackbarErrorOpen(true);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setTimeout(() => navigate('/login'), 3000);
            }
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ padding: 4, paddingTop: 7 }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#0478C0', fontWeight: 'bold' }}>
                    Sales Management
                </Typography>
                <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Product ID"
                            name="productId"
                            value={saleForm.productId}
                            onChange={handleSaleChange}
                            variant="outlined"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Quantity Sold"
                            name="quantitySold"
                            type="number"
                            value={saleForm.quantitySold}
                            onChange={handleSaleChange}
                            variant="outlined"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                        <Button
                            variant="contained"
                            onClick={handleConfirmSale}
                            sx={{ bgcolor: '#00ffff', textTransform: 'none', color: 'black' }}
                            startIcon={<AddCircleIcon />}
                        >
                            Record Sale
                        </Button>
                    </Grid>
                </Grid>
                <Typography variant="h5" gutterBottom sx={{ color: '#0478C0', marginTop: 3 }}>
                    Current Inventory
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Subcategories</TableCell>
                                <TableCell>Purchase Price</TableCell>
                                <TableCell>Selling Price</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Brand</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.productId}</TableCell>
                                    <TableCell>
                                        {product.imageUrl && (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    objectFit: 'cover',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    padding: '2px',
                                                    backgroundColor: '#f9f9f9'
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>{product.productName}</TableCell>
                                    <TableCell>{product.categoryId}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>
                                        {product.subcategories && Object.entries(product.subcategories).map(([key, value]) => (
                                            <div key={key}>{`${key}: ${value}`}</div>
                                        ))}
                                    </TableCell>
                                    <TableCell>{product.purchasePrice.toFixed(2)}</TableCell>
                                    <TableCell>{product.sellingPrice.toFixed(2)}</TableCell>
                                    <TableCell>{product.supplierId || '-'}</TableCell>
                                    <TableCell>{product.brandName || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
                <Snackbar open={snackbarErrorOpen} autoHideDuration={3000} onClose={() => setSnackbarErrorOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert onClose={() => setSnackbarErrorOpen(false)} severity="error" sx={{ width: '100%' }}>
                        {snackbarErrorMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
};

export default Sales;