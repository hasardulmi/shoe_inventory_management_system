import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button,
    Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

// Utility function to format date from YYYY-MM-DD to dd/mm/yyyy
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const [formData, setFormData] = useState({
        productId: '',
        productName: '',
        supplierName: '',
        brandName: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: '',
        sellingPrice: '',
        category: '',
        inStock: true,
        categoryDetails: {}
    });
    const [errors, setErrors] = useState({});
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState(null);
    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/products`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        }
    };

    useEffect(() => {
        let filtered = products;
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.supplierName && item.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.brandName && item.brandName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                item.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredProducts(filtered);
    }, [products, searchTerm]);

    // Generate unique 6-character productId (e.g., S00001 for Shoes)
    const generateProductId = async (category) => {
        if (!category) return '';
        const prefix = category.charAt(0).toUpperCase(); // First letter of category
        const existingIds = products
            .filter(p => p.productId.startsWith(prefix))
            .map(p => parseInt(p.productId.slice(1)) || 0);
        const maxNumber = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const newNumber = maxNumber + 1;
        return `${prefix}${newNumber.toString().padStart(5, '0')}`; // e.g., S00001
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleOpenDialog = async (product = null) => {
        if (product) {
            // Edit mode
            setIsEditMode(true);
            setEditProductId(product.id);
            const categoryDetails = product.categoryDetails ? JSON.parse(product.categoryDetails) : {};
            setFormData({
                productId: product.productId,
                productName: product.productName,
                supplierName: product.supplierName || '',
                brandName: product.brandName || '',
                purchaseDate: product.purchaseDate,
                purchasePrice: product.purchasePrice,
                sellingPrice: product.sellingPrice,
                category: product.category,
                inStock: product.inStock,
                categoryDetails
            });
        } else {
            // Add mode
            setIsEditMode(false);
            setFormData({
                productId: '',
                productName: '',
                supplierName: '',
                brandName: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                purchasePrice: '',
                sellingPrice: '',
                category: '',
                inStock: true,
                categoryDetails: {}
            });
        }
        setErrors({});
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setErrors({});
    };

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        let updatedFormData = { ...formData, [name]: value };
        if (name === 'category' && !isEditMode) {
            const newProductId = await generateProductId(value);
            updatedFormData = { ...updatedFormData, productId: newProductId };
        }
        setFormData(updatedFormData);
        setErrors({ ...errors, [name]: '' });
    };

    const handleCategoryDetailsChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            categoryDetails: { ...formData.categoryDetails, [name]: value }
        });
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.productId.trim()) newErrors.productId = 'Product ID is required';
        if (!formData.productName.trim()) newErrors.productName = 'Product Name is required';
        if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase Date is required';
        if (!formData.purchasePrice || formData.purchasePrice <= 0) newErrors.purchasePrice = 'Valid Purchase Price is required';
        if (!formData.sellingPrice || formData.sellingPrice <= 0) newErrors.sellingPrice = 'Valid Selling Price is required';
        if (!formData.category) newErrors.category = 'Category is required';

        // Validate categoryDetails
        if (formData.category) {
            const categoryDetails = formData.categoryDetails;
            switch (formData.category.toLowerCase()) {
                case 'shoes':
                    if (!categoryDetails.shoeSize) newErrors.shoeSize = 'Shoe Size is required';
                    if (!categoryDetails.color) newErrors.color = 'Color is required';
                    if (!categoryDetails.laces) newErrors.laces = 'Laces is required';
                    if (!categoryDetails.type) newErrors.type = 'Type is required';
                    if (!categoryDetails.gender) newErrors.gender = 'Gender is required';
                    break;
                case 'slippers':
                    if (!categoryDetails.slipperSize) newErrors.slipperSize = 'Slipper Size is required';
                    if (!categoryDetails.color) newErrors.color = 'Color is required';
                    if (!categoryDetails.gender) newErrors.gender = 'Gender is required';
                    break;
                case 'bags':
                    if (!categoryDetails.color) newErrors.color = 'Color is required';
                    if (!categoryDetails.type) newErrors.type = 'Type is required';
                    if (!categoryDetails.gender) newErrors.gender = 'Gender is required';
                    break;
                case 'water bottle':
                    if (!categoryDetails.bottleSize) newErrors.bottleSize = 'Bottle Size is required';
                    if (!categoryDetails.color) newErrors.color = 'Color is required';
                    if (!categoryDetails.type) newErrors.type = 'Type is required';
                    break;
                case 'shoe polish':
                    if (!categoryDetails.color) newErrors.color = 'Color is required';
                    break;
                case 'socks':
                    if (!categoryDetails.socksSize) newErrors.socksSize = 'Socks Size is required';
                    if (!categoryDetails.color) newErrors.color = 'Color is required';
                    if (!categoryDetails.type) newErrors.type = 'Type is required';
                    break;
                case 'other accessories':
                    if (!categoryDetails.type) newErrors.type = 'Type is required';
                    break;
                default:
                    newErrors.category = 'Invalid category';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const payload = {
                productId: formData.productId,
                productName: formData.productName,
                supplierName: formData.supplierName || null,
                brandName: formData.brandName || null,
                purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
                purchasePrice: parseFloat(formData.purchasePrice),
                sellingPrice: parseFloat(formData.sellingPrice),
                category: formData.category,
                inStock: formData.inStock,
                categoryDetails: JSON.stringify(formData.categoryDetails),
                status: formData.status || 'ACTIVE'
            };

            console.log('Submitting payload:', payload);

            if (isEditMode) {
                await axios.put(`${BASE_URL}/api/products/${editProductId}`, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                await axios.post(`${BASE_URL}/api/products`, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            fetchProducts();
            handleCloseDialog();
        } catch (error) {
            console.error('Error submitting product:', error.response || error);
            const errorMessage = error.response?.data || `Failed to ${isEditMode ? 'update' : 'create'} product: ${error.message}`;
            setErrors({ general: errorMessage });
        }
    };

    const handleOpenDeleteConfirm = (id) => {
        setDeleteProductId(id);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setDeleteProductId(null);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${BASE_URL}/api/products/${deleteProductId}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            fetchProducts();
            handleCloseDeleteConfirm();
        } catch (error) {
            const errorMessage = error.response?.data || 'Failed to delete product';
            setErrors({ general: errorMessage });
        }
    };

    // Format categoryDetails for display
    const formatCategoryDetails = (category, details) => {
        try {
            const parsed = typeof details === 'string' ? JSON.parse(details) : details;
            switch (category.toLowerCase()) {
                case 'shoes':
                    return `Shoe Size: ${parsed.shoeSize}, Color: ${parsed.color}, Laces: ${parsed.laces}, Type: ${parsed.type}, Gender: ${parsed.gender}`;
                case 'slippers':
                    return `Slipper Size: ${parsed.slipperSize}, Color: ${parsed.color}, Gender: ${parsed.gender}`;
                case 'bags':
                    return `Color: ${parsed.color}, Type: ${parsed.type}, Gender: ${parsed.gender}`;
                case 'water bottle':
                    return `Bottle Size: ${parsed.bottleSize}, Color: ${parsed.color}, Type: ${parsed.type}`;
                case 'shoe polish':
                    return `Color: ${parsed.color}`;
                case 'socks':
                    return `Socks Size: ${parsed.socksSize}, Color: ${parsed.color}, Type: ${parsed.type}`;
                case 'other accessories':
                    return `Type: ${parsed.type}`;
                default:
                    return JSON.stringify(parsed);
            }
        } catch (e) {
            return 'Invalid Details';
        }
    };

    // Determine status display
    const getStatusDisplay = (product) => {
        if (product.status === 'RETURNED') return 'Returned Product';
        return product.inStock ? 'In Stock' : 'Out of Stock';
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
                        placeholder="Search by Product ID, Name, Supplier, Brand, or Status"
                    />
                    <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
                        Add New Product
                    </Button>
                </Box>

                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product ID</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Supplier Name</TableCell>
                                <TableCell>Brand Name</TableCell>
                                <TableCell>Purchase Date</TableCell>
                                <TableCell>Purchase Price</TableCell>
                                <TableCell>Selling Price</TableCell>
                                <TableCell>Category Details</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.productId}</TableCell>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell>{item.supplierName || '-'}</TableCell>
                                    <TableCell>{item.brandName || '-'}</TableCell>
                                    <TableCell>{formatDate(item.purchaseDate)}</TableCell>
                                    <TableCell>{item.purchasePrice.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {item.status === 'RETURNED' ? 'Returned Product' : item.sellingPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{formatCategoryDetails(item.category, item.categoryDetails)}</TableCell>
                                    <TableCell>{getStatusDisplay(item)}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog(item)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenDeleteConfirm(item.id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogContent>
                        {errors.general && (
                            <Typography color="error" sx={{ mb: 2 }}>
                                {errors.general}
                            </Typography>
                        )}
                        <TextField
                            label="Product Name"
                            name="productName"
                            value={formData.productName}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.productName}
                            helperText={errors.productName}
                        />
                        <TextField
                            label="Supplier Name (Optional)"
                            name="supplierName"
                            value={formData.supplierName}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Brand Name (Optional)"
                            name="brandName"
                            value={formData.brandName}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Purchase Date"
                            name="purchaseDate"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.purchaseDate}
                            helperText={errors.purchaseDate}
                        />
                        <TextField
                            label="Purchase Price"
                            name="purchasePrice"
                            type="number"
                            value={formData.purchasePrice}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.purchasePrice}
                            helperText={errors.purchasePrice}
                        />
                        <TextField
                            label="Selling Price"
                            name="sellingPrice"
                            type="number"
                            value={formData.sellingPrice}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.sellingPrice}
                            helperText={errors.sellingPrice}
                        />
                        <FormControl fullWidth margin="normal" error={!!errors.category}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="">Select Category</MenuItem>
                                <MenuItem value="Shoes">Shoes</MenuItem>
                                <MenuItem value="Water Bottle">Water Bottle</MenuItem>
                                <MenuItem value="Bags">Bags</MenuItem>
                                <MenuItem value="Slippers">Slippers</MenuItem>
                                <MenuItem value="Shoe Polish">Shoe Polish</MenuItem>
                                <MenuItem value="Socks">Socks</MenuItem>
                                <MenuItem value="Other Accessories">Other Accessories</MenuItem>
                            </Select>
                            {errors.category && <Typography color="error">{errors.category}</Typography>}
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>In Stock</InputLabel>
                            <Select
                                name="inStock"
                                value={formData.inStock}
                                onChange={(e) => setFormData({ ...formData, inStock: e.target.value === 'true' })}
                            >
                                <MenuItem value={true}>In Stock</MenuItem>
                                <MenuItem value={false}>Out of Stock</MenuItem>
                            </Select>
                        </FormControl>

                        {formData.category === 'Shoes' && (
                            <>
                                <TextField
                                    label="Shoe Size"
                                    name="shoeSize"
                                    value={formData.categoryDetails.shoeSize || ''}
                                    onChange={handleCategoryDetailsChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.shoeSize}
                                    helperText={errors.shoeSize}
                                />
                                <TextField
                                    label="Color"
                                    name="color"
                                    value={formData.categoryDetails.color || ''}
                                    onChange={handleCategoryDetailsChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.color}
                                    helperText={errors.color}
                                />
                                <FormControl fullWidth margin="normal" error={!!errors.laces}>
                                    <InputLabel>Laces</InputLabel>
                                    <Select
                                        name="laces"
                                        value={formData.categoryDetails.laces || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Laces</MenuItem>
                                        <MenuItem value="With Laces">With Laces</MenuItem>
                                        <MenuItem value="Without Laces">Without Laces</MenuItem>
                                    </Select>
                                    {errors.laces && <Typography color="error">{errors.laces}</Typography>}
                                </FormControl>
                                <FormControl fullWidth margin="normal" error={!!errors.type}>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={formData.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Type</MenuItem>
                                        <MenuItem value="School">School</MenuItem>
                                        <MenuItem value="Deck Shoes">Deck Shoes</MenuItem>
                                        <MenuItem value="Baby">Baby</MenuItem>
                                        <MenuItem value="Office">Office</MenuItem>
                                    </Select>
                                    {errors.type && <Typography color="error">{errors.type}</Typography>}
                                </FormControl>
                                <FormControl fullWidth margin="normal" error={!!errors.gender}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="gender"
                                        value={formData.categoryDetails.gender || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Gender</MenuItem>
                                        <MenuItem value="Men">Men</MenuItem>
                                        <MenuItem value="Women">Women</MenuItem>
                                    </Select>
                                    {errors.gender && <Typography color="error">{errors.gender}</Typography>}
                                </FormControl>
                            </>
                        )}

                        {formData.category === 'Slippers' && (
                            <>
                                <TextField
                                    label="Slipper Size"
                                    name="slipperSize"
                                    value={formData.categoryDetails.slipperSize || ''}
                                    onChange={handleCategoryDetailsChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.slipperSize}
                                    helperText={errors.slipperSize}
                                />
                                <TextField
                                    label="Color"
                                    name="color"
                                    value={formData.categoryDetails.color || ''}
                                    onChange={handleCategoryDetailsChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.color}
                                    helperText={errors.color}
                                />
                                <FormControl fullWidth margin="normal" error={!!errors.gender}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="gender"
                                        value={formData.categoryDetails.gender || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Gender</MenuItem>
                                        <MenuItem value="Men">Men</MenuItem>
                                        <MenuItem value="Women">Women</MenuItem>
                                    </Select>
                                    {errors.gender && <Typography color="error">{errors.gender}</Typography>}
                                </FormControl>
                            </>
                        )}

                        {formData.category === 'Bags' && (
                            <>
                                <TextField
                                    label="Color"
                                    name="color"
                                    value={formData.categoryDetails.color || ''}
                                    onChange={handleCategoryDetailsChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.color}
                                    helperText={errors.color}
                                />
                                <FormControl fullWidth margin="normal" error={!!errors.type}>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={formData.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Type</MenuItem>
                                        <MenuItem value="School">School</MenuItem>
                                        <MenuItem value="Office">Office</MenuItem>
                                        <MenuItem value="Hand Bags">Hand Bags</MenuItem>
                                        <MenuItem value="Side Bags">Side Bags</MenuItem>
                                        <MenuItem value="Purse">Purse</MenuItem>
                                        <MenuItem value="Travelling Bag">Travelling Bag</MenuItem>
                                        <MenuItem value="Lunch Bags">Lunch Bags</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {errors.type && <Typography color="error">{errors.type}</Typography>}
                                </FormControl>
                                <FormControl fullWidth margin="normal" error={!!errors.gender}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="gender"
                                        value={formData.categoryDetails.gender || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Gender</MenuItem>
                                        <MenuItem value="Men">Men</MenuItem>
                                        <MenuItem value="Women">Women</MenuItem>
                                    </Select>
                                    {errors.gender && <Typography color="error">{errors.gender}</Typography>}
                                </FormControl>
                            </>
                        )}

                        {formData.category === 'Water Bottle' && (
                            <>
                                <FormControl fullWidth margin="normal" error={!!errors.bottleSize}>
                                    <InputLabel>Bottle Size</InputLabel>
                                    <Select
                                        name="bottleSize"
                                        value={formData.categoryDetails.bottleSize || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Bottle Size</MenuItem>
                                        <MenuItem value="Small">Small</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="Large">Large</MenuItem>
                                    </Select>
                                    {errors.bottleSize && <Typography color="error">{errors.bottleSize}</Typography>}
                                </FormControl>
                                <TextField
                                    label="Color"
                                    name="color"
                                    value={formData.categoryDetails.color || ''}
                                    onChange={handleCategoryDetailsChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.color}
                                    helperText={errors.color}
                                />
                                <FormControl fullWidth margin="normal" error={!!errors.type}>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={formData.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Type</MenuItem>
                                        <MenuItem value="School">School</MenuItem>
                                        <MenuItem value="Flasks">Flasks</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {errors.type && <Typography color="error">{errors.type}</Typography>}
                                </FormControl>
                            </>
                        )}

                        {formData.category === 'Shoe Polish' && (
                            <>
                                <FormControl fullWidth margin="normal" error={!!errors.color}>
                                    <InputLabel>Color</InputLabel>
                                    <Select
                                        name="color"
                                        value={formData.categoryDetails.color || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Color</MenuItem>
                                        <MenuItem value="Black">Black</MenuItem>
                                        <MenuItem value="White">White</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {errors.color && <Typography color="error">{errors.color}</Typography>}
                                </FormControl>
                            </>
                        )}

                        {formData.category === 'Socks' && (
                            <>
                                <TextField
                                    label="Socks Size"
                                    name="socksSize"
                                    value={formData.categoryDetails.socksSize || ''}
                                    onChange={handleCategoryDetailsChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.socksSize}
                                    helperText={errors.socksSize}
                                />
                                <FormControl fullWidth margin="normal" error={!!errors.color}>
                                    <InputLabel>Color</InputLabel>
                                    <Select
                                        name="color"
                                        value={formData.categoryDetails.color || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Color</MenuItem>
                                        <MenuItem value="White">White</MenuItem>
                                        <MenuItem value="Black">Black</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {errors.color && <Typography color="error">{errors.color}</Typography>}
                                </FormControl>
                                <FormControl fullWidth margin="normal" error={!!errors.type}>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={formData.categoryDetails.type || ''}
                                        onChange={handleCategoryDetailsChange}
                                    >
                                        <MenuItem value="">Select Type</MenuItem>
                                        <MenuItem value="School">School</MenuItem>
                                        <MenuItem value="Office">Office</MenuItem>
                                        <MenuItem value="Baby">Baby</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {errors.type && <Typography color="error">{errors.type}</Typography>}
                                </FormControl>
                            </>
                        )}

                        {formData.category === 'Other Accessories' && (
                            <>
                                <TextField
                                    label="Type"
                                    name="type"
                                    value={formData.categoryDetails.type || ''}
                                    onChange={handleCategoryDetailsChange}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.type}
                                    helperText={errors.type}
                                />
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this product?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
                        <Button onClick={handleDelete} variant="contained" color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default ProductManagement;