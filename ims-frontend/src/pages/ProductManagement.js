// src/pages/ProductManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        id: null,
        productName: '',
        purchaseDate: '',
        purchasePrice: '',
        sellingPrice: '',
        category: '',
        inStock: true,
        categoryDetails: {}
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const BASE_URL = 'http://localhost:8080';

    // Retrieve token from localStorage (or your auth mechanism)
    const getAuthToken = () => {
        return localStorage.getItem('token'); // Adjust based on your auth storage
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = getAuthToken();
            const headers = token ? {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            } : { 'Content-Type': 'application/json' };

            const response = await axios.get(`${BASE_URL}/api/products`, { headers });
            const parsedProducts = response.data.map(product => ({
                ...product,
                categoryDetails: product.categoryDetails ? JSON.parse(product.categoryDetails) : {}
            }));
            setProducts(parsedProducts);
            setFilteredProducts(parsedProducts);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        }
    };

    useEffect(() => {
        let filtered = products;
        if (filterCategory) {
            filtered = filtered.filter(item => item.category.toLowerCase() === filterCategory.toLowerCase());
        }
        if (searchTerm) {
            filtered = filtered.filter(item => {
                const categoryWithDetails = formatCategoryDetails(item.category, item.categoryDetails).toLowerCase();
                const stockStatus = item.inStock ? 'in stock' : 'out of stock';
                return (
                    item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    categoryWithDetails.includes(searchTerm.toLowerCase()) ||
                    item.purchasePrice.toString().includes(searchTerm.toLowerCase()) ||
                    item.sellingPrice.toString().includes(searchTerm.toLowerCase()) ||
                    stockStatus.includes(searchTerm.toLowerCase())
                );
            });
        }
        setFilteredProducts(filtered);
    }, [products, searchTerm, filterCategory]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct({ ...currentProduct, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleCategoryDetailsChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct({
            ...currentProduct,
            categoryDetails: { ...currentProduct.categoryDetails, [name]: value }
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!currentProduct.productName.trim()) newErrors.productName = 'Product Name is required';
        if (!currentProduct.purchaseDate) newErrors.purchaseDate = 'Purchase Date is required';
        if (!currentProduct.purchasePrice || isNaN(currentProduct.purchasePrice) || currentProduct.purchasePrice <= 0) newErrors.purchasePrice = 'Purchase Price must be a positive number';
        if (!currentProduct.sellingPrice || isNaN(currentProduct.sellingPrice) || currentProduct.sellingPrice <= 0) newErrors.sellingPrice = 'Selling Price must be a positive number';
        if (!currentProduct.category) newErrors.category = 'Category is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenDialog = (product = null) => {
        if (product) {
            setCurrentProduct({
                id: product.id,
                productName: product.productName,
                purchaseDate: product.purchaseDate,
                purchasePrice: product.purchasePrice,
                sellingPrice: product.sellingPrice,
                category: product.category,
                inStock: product.inStock,
                categoryDetails: product.categoryDetails || {}
            });
            setIsEditMode(true);
        } else {
            setCurrentProduct({
                id: null,
                productName: '',
                purchaseDate: '',
                purchasePrice: '',
                sellingPrice: '',
                category: '',
                inStock: true,
                categoryDetails: {}
            });
            setIsEditMode(false);
        }
        setErrors({});
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setErrors({});
    };

    const handleSaveProduct = async () => {
        if (!validateForm()) {
            console.log('Validation failed:', errors);
            return;
        }

        try {
            const productToSave = {
                productName: currentProduct.productName,
                purchaseDate: currentProduct.purchaseDate,
                purchasePrice: parseFloat(currentProduct.purchasePrice),
                sellingPrice: parseFloat(currentProduct.sellingPrice),
                category: currentProduct.category,
                inStock: currentProduct.inStock,
                categoryDetails: JSON.stringify(currentProduct.categoryDetails || {})
            };

            const token = getAuthToken();
            const headers = token ? {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            } : { 'Content-Type': 'application/json' };

            console.log('Saving product payload:', productToSave);

            if (isEditMode) {
                await axios.put(`${BASE_URL}/api/products/${currentProduct.id}`, productToSave, { headers });
                console.log('Product updated successfully');
            } else {
                await axios.post(`${BASE_URL}/api/products`, productToSave, { headers });
                console.log('Product added successfully');
            }
            fetchProducts();
            handleCloseDialog();
        } catch (error) {
            const errorMessage = error.response
                ? `Status ${error.response.status}: ${JSON.stringify(error.response.data) || error.response.statusText || 'Unauthorized or server error'}`
                : `Network Error: ${error.message}`;
            console.error('Error saving product:', errorMessage);
            setErrors({ general: `Failed to save product: ${errorMessage}` });
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            const token = getAuthToken();
            const headers = token ? {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            } : { 'Content-Type': 'application/json' };

            await axios.delete(`${BASE_URL}/api/products/${id}`, { headers });
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error.message);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryFilterChange = (e) => {
        setFilterCategory(e.target.value);
    };

    const categoryOptions = [
        'shoes', 'water bottle', 'bags', 'slippers', 'shoe polish', 'socks', 'other accessories'
    ];

    const formatCategoryDetails = (category, details) => {
        if (!details || Object.keys(details).length === 0) return category;
        const detailStrings = Object.entries(details)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
        return `${category} (${detailStrings.join(', ')})`;
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }} className="page-container">
                <Typography variant="h4" component="h1" gutterBottom className="page-title">
                    Product Management
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
                    <TextField
                        label="Search Products"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: '300px' }}
                        placeholder="Search by ID, name, category, price, or stock"
                    />
                    <FormControl sx={{ width: '200px' }}>
                        <InputLabel>Filter Category</InputLabel>
                        <Select
                            value={filterCategory}
                            onChange={handleCategoryFilterChange}
                            label="Filter Category"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categoryOptions.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog()}
                        className="action-button"
                    >
                        Add New Product
                    </Button>
                </Box>

                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Purchase Date</TableCell>
                                <TableCell>Purchase Price</TableCell>
                                <TableCell>Selling Price</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Stock Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.productId}</TableCell>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell>{item.purchaseDate}</TableCell>
                                    <TableCell>{item.purchasePrice}</TableCell>
                                    <TableCell>{item.sellingPrice}</TableCell>
                                    <TableCell>{formatCategoryDetails(item.category, item.categoryDetails)}</TableCell>
                                    <TableCell>{item.inStock ? 'In Stock' : 'Out of Stock'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleOpenDialog(item)}
                                            sx={{ mr: 1 }}
                                            className="action-button"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDeleteProduct(item.id)}
                                            className="action-button"
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog} className="dialog">
                    <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Product Name"
                            name="productName"
                            value={currentProduct.productName}
                            onChange={handleInputChange}
                            error={!!errors.productName}
                            helperText={errors.productName}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Purchase Date"
                            name="purchaseDate"
                            value={currentProduct.purchaseDate}
                            onChange={handleInputChange}
                            error={!!errors.purchaseDate}
                            helperText={errors.purchaseDate}
                            required
                            type="date"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Purchase Price"
                            name="purchasePrice"
                            value={currentProduct.purchasePrice}
                            onChange={handleInputChange}
                            error={!!errors.purchasePrice}
                            helperText={errors.purchasePrice}
                            required
                            type="number"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Selling Price"
                            name="sellingPrice"
                            value={currentProduct.sellingPrice}
                            onChange={handleInputChange}
                            error={!!errors.sellingPrice}
                            helperText={errors.sellingPrice}
                            required
                            type="number"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={currentProduct.category}
                                onChange={handleInputChange}
                                error={!!errors.category}
                                required
                            >
                                {categoryOptions.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                            {errors.category && <Typography color="error">{errors.category}</Typography>}
                        </FormControl>

                        {currentProduct.category === 'shoes' && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Shoe Size"
                                    name="size"
                                    value={currentProduct.categoryDetails.size || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Brand Name"
                                    name="brandName"
                                    value={currentProduct.categoryDetails.brandName || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Colour</InputLabel>
                                    <Select
                                        name="colour"
                                        value={currentProduct.categoryDetails.colour || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="white">White</MenuItem>
                                        <MenuItem value="black">Black</MenuItem>
                                        <MenuItem value="brown">Brown</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Laces</InputLabel>
                                    <Select
                                        name="laces"
                                        value={currentProduct.categoryDetails.laces || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="with">With Laces</MenuItem>
                                        <MenuItem value="without">Without Laces</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={currentProduct.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="school">School</MenuItem>
                                        <MenuItem value="deck shoes">Deck Shoes</MenuItem>
                                        <MenuItem value="baby">Baby</MenuItem>
                                        <MenuItem value="office">Office</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="gender"
                                        value={currentProduct.categoryDetails.gender || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="Men">Men</MenuItem>
                                        <MenuItem value="Women">Women</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        {currentProduct.category === 'water bottle' && (
                            <>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Bottle Size</InputLabel>
                                    <Select
                                        name="size"
                                        value={currentProduct.categoryDetails.size || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="small">Small</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="large">Large</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Brand Name"
                                    name="brandName"
                                    value={currentProduct.categoryDetails.brandName || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Colour"
                                    name="colour"
                                    value={currentProduct.categoryDetails.colour || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={currentProduct.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="school">School</MenuItem>
                                        <MenuItem value="flasks">Flasks</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        {currentProduct.category === 'bags' && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Brand Name"
                                    name="brandName"
                                    value={currentProduct.categoryDetails.brandName || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Colour"
                                    name="colour"
                                    value={currentProduct.categoryDetails.colour || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={currentProduct.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="school">School</MenuItem>
                                        <MenuItem value="office">Office</MenuItem>
                                        <MenuItem value="hand bags">Hand Bags</MenuItem>
                                        <MenuItem value="side bags">Side Bags</MenuItem>
                                        <MenuItem value="purse">Purse</MenuItem>
                                        <MenuItem value="travelling bag">Travelling Bag</MenuItem>
                                        <MenuItem value="lunch bags">Lunch Bags</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="gender"
                                        value={currentProduct.categoryDetails.gender || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="Men">Men</MenuItem>
                                        <MenuItem value="Women">Women</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        {currentProduct.category === 'slippers' && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Slipper Size"
                                    name="size"
                                    value={currentProduct.categoryDetails.size || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Brand Name"
                                    name="brandName"
                                    value={currentProduct.categoryDetails.brandName || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Colour"
                                    name="colour"
                                    value={currentProduct.categoryDetails.colour || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="gender"
                                        value={currentProduct.categoryDetails.gender || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="Men">Men</MenuItem>
                                        <MenuItem value="Women">Women</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        {currentProduct.category === 'shoe polish' && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Brand Name"
                                    name="brandName"
                                    value={currentProduct.categoryDetails.brandName || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Colour</InputLabel>
                                    <Select
                                        name="colour"
                                        value={currentProduct.categoryDetails.colour || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="black">Black</MenuItem>
                                        <MenuItem value="white">White</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        {currentProduct.category === 'socks' && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Sock Size"
                                    name="size"
                                    value={currentProduct.categoryDetails.size || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Brand Name"
                                    name="brandName"
                                    value={currentProduct.categoryDetails.brandName || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Colour</InputLabel>
                                    <Select
                                        name="colour"
                                        value={currentProduct.categoryDetails.colour || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="white">White</MenuItem>
                                        <MenuItem value="black">Black</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={currentProduct.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="school">School</MenuItem>
                                        <MenuItem value="office">Office</MenuItem>
                                        <MenuItem value="baby">Baby</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        {currentProduct.category === 'other accessories' && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Brand Name"
                                    name="brandName"
                                    value={currentProduct.categoryDetails.brandName || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Type"
                                    name="type"
                                    value={currentProduct.categoryDetails.type || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
                            </>
                        )}

                        {errors.general && <Typography color="error">{errors.general}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} className="dialog-button">Cancel</Button>
                        <Button onClick={handleSaveProduct} color="primary" className="dialog-button">
                            {isEditMode ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default ProductManagement;