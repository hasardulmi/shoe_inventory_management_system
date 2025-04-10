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
    const [suppliers, setSuppliers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        id: null,
        productId: '',
        productName: '',
        purchaseDate: '',
        purchasePrice: '',
        supplierName: '',
        category: '',
        inStock: true,
        categoryDetails: {}
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/supplier');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

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
        if (!currentProduct.supplierName) newErrors.supplierName = 'Supplier Name is required';
        if (!currentProduct.category) newErrors.category = 'Category is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenDialog = (product = null) => {
        if (product) {
            setCurrentProduct({
                ...product,
                categoryDetails: product.categoryDetails ? JSON.parse(product.categoryDetails) : {}
            });
            setIsEditMode(true);
        } else {
            setCurrentProduct({
                id: null,
                productId: '',
                productName: '',
                purchaseDate: '',
                purchasePrice: '',
                supplierName: '',
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
                supplierName: currentProduct.supplierName,
                category: currentProduct.category,
                inStock: currentProduct.inStock,
                categoryDetails: JSON.stringify(currentProduct.categoryDetails || {})
            };

            console.log('Saving product payload:', productToSave);

            if (isEditMode) {
                const response = await axios.put(`http://localhost:8080/api/products/${currentProduct.id}`, productToSave);
                console.log('Update response:', response.data);
            } else {
                const response = await axios.post('http://localhost:8080/api/products', productToSave);
                console.log('Create response:', response.data);
            }
            fetchProducts();
            handleCloseDialog();
        } catch (error) {
            const errorMessage = error.response
                ? `Status ${error.response.status}: ${JSON.stringify(error.response.data) || error.response.statusText || 'Unknown error'}`
                : error.message;
            console.error('Error saving product:', error.response || error);
            setErrors({ general: `Failed to save product: ${errorMessage}` });
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = products.filter(item =>
            item.productId.toLowerCase().includes(term) ||
            item.productName.toLowerCase().includes(term)
        );
        setFilteredProducts(filtered);
    };

    const categoryOptions = [
        'shoes', 'water bottle', 'bags', 'slippers', 'shoe polish', 'socks', 'other accessories'
    ];

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }} className="page-container">
                <Typography variant="h4" component="h1" gutterBottom className="page-title">
                    Product Management
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <TextField
                        label="Search Products"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: '300px' }}
                    />
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
                                <TableCell>Supplier</TableCell>
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
                                    <TableCell>{item.supplierName}</TableCell>
                                    <TableCell>{item.category}</TableCell>
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
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Supplier Name</InputLabel>
                            <Select
                                name="supplierName"
                                value={currentProduct.supplierName}
                                onChange={handleInputChange}
                                error={!!errors.supplierName}
                                required
                            >
                                {suppliers.map((supplier) => (
                                    <MenuItem key={supplier.id} value={supplier.supplierBrandName}>
                                        {supplier.supplierBrandName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.supplierName && <Typography color="error">{errors.supplierName}</Typography>}
                        </FormControl>
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
                                    label="Size"
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
                                    <InputLabel>Color</InputLabel>
                                    <Select
                                        name="color"
                                        value={currentProduct.categoryDetails.color || ''}
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
                            </>
                        )}
                        {currentProduct.category === 'water bottle' && (
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
                                    <InputLabel>Size</InputLabel>
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
                                    label="Color"
                                    name="color"
                                    value={currentProduct.categoryDetails.color || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
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
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={currentProduct.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="school bags">School Bags</MenuItem>
                                        <MenuItem value="hand bags">Hand Bags</MenuItem>
                                        <MenuItem value="side bags">Side Bags</MenuItem>
                                        <MenuItem value="office bags - mens">Office Bags - Mens</MenuItem>
                                        <MenuItem value="purse">Purse</MenuItem>
                                        <MenuItem value="travelling bags">Travelling Bags</MenuItem>
                                        <MenuItem value="lunch bags">Lunch Bags</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
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
                                    label="Color"
                                    name="color"
                                    value={currentProduct.categoryDetails.color || ''}
                                    onChange={handleCategoryDetailsChange}
                                />
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
                                    <InputLabel>Color</InputLabel>
                                    <Select
                                        name="color"
                                        value={currentProduct.categoryDetails.color || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="white">White</MenuItem>
                                        <MenuItem value="black">Black</MenuItem>
                                        <MenuItem value="brown">Brown</MenuItem>
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
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Socks Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={currentProduct.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="baby">Baby</MenuItem>
                                        <MenuItem value="school">School</MenuItem>
                                        <MenuItem value="office">Office</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
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
                            </>
                        )}
                        {currentProduct.category === 'other accessories' && (
                            <>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Product Type"
                                    name="type"
                                    value={currentProduct.categoryDetails.type || ''}
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