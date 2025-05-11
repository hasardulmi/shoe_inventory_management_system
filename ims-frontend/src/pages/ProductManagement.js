import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Typography, Grid, Card, CardContent, Snackbar, Alert
} from '@mui/material';
import { Delete, Edit, Add, Remove } from '@mui/icons-material';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterProductId, setFilterProductId] = useState('');
    const [formData, setFormData] = useState({
        productName: '',
        categoryId: '',
        purchasePrice: '',
        sellingPrice: '',
        brandName: '',
        purchaseDate: '',
        image: null,
        subcategories: {},
        hasSizes: false,
        sizeQuantities: [{ size: '', quantity: '' }],
        quantity: '',
    });
    const [editId, setEditId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [openAddSubcategoryDialog, setOpenAddSubcategoryDialog] = useState(false);
    const [openImagePreviewDialog, setOpenImagePreviewDialog] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [newCategory, setNewCategory] = useState({
        categoryName: '',
        subcategories: [{ name: '' }],
    });
    const [addSubcategoryData, setAddSubcategoryData] = useState({
        categoryId: '',
        subcategories: [{ name: '' }],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get('http://localhost:8080/api/products'),
                axios.get('http://localhost:8080/api/categories')
            ]);
            setProducts(productsRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (name === 'hasSizes') {
            setFormData(prev => ({ ...prev, [name]: value === 'yes', sizeQuantities: [{ size: '', quantity: '' }], quantity: '' }));
        } else if (name && allowedSubcats.includes(name)) {
            setFormData(prev => ({
                ...prev,
                subcategories: { ...prev.subcategories, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (name === 'categoryId') {
            const selectedCategory = categories.find(c => c.id === parseInt(value));
            const subcats = selectedCategory?.allowedSubcategories || [];
            const initialSubcategories = subcats.reduce((acc, subcat) => ({ ...acc, [subcat]: '' }), {});
            setFormData(prev => ({
                ...prev,
                [name]: value,
                subcategories: initialSubcategories,
                hasSizes: false,
                sizeQuantities: [{ size: '', quantity: '' }],
                quantity: ''
            }));
        }
    };

    const handleSizeQuantityChange = (index, field, value) => {
        setFormData(prev => {
            const updatedSizeQuantities = [...prev.sizeQuantities];
            updatedSizeQuantities[index] = { ...updatedSizeQuantities[index], [field]: value };
            return { ...prev, sizeQuantities: updatedSizeQuantities };
        });
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

    const handleNewCategoryChange = (index, field, value) => {
        setNewCategory(prev => {
            const updatedSubcategories = [...prev.subcategories];
            updatedSubcategories[index] = { ...updatedSubcategories[index], [field]: value };
            return { ...prev, subcategories: updatedSubcategories };
        });
    };

    const handleAddSubcategory = () => {
        setNewCategory(prev => ({
            ...prev,
            subcategories: [...prev.subcategories, { name: '' }]
        }));
    };

    const handleRemoveSubcategory = (index) => {
        setNewCategory(prev => ({
            ...prev,
            subcategories: prev.subcategories.filter((_, i) => i !== index)
        }));
    };

    const handleAddSubcategoryChange = (index, field, value) => {
        setAddSubcategoryData(prev => {
            const updatedSubcategories = [...prev.subcategories];
            updatedSubcategories[index] = { ...updatedSubcategories[index], [field]: value };
            return { ...prev, subcategories: updatedSubcategories };
        });
    };

    const handleAddNewSubcategory = () => {
        setAddSubcategoryData(prev => ({
            ...prev,
            subcategories: [...prev.subcategories, { name: '' }]
        }));
    };

    const handleRemoveNewSubcategory = (index) => {
        setAddSubcategoryData(prev => ({
            ...prev,
            subcategories: prev.subcategories.filter((_, i) => i !== index)
        }));
    };

    const resetFormData = () => {
        setFormData({
            productName: '',
            categoryId: '',
            purchasePrice: '',
            sellingPrice: '',
            brandName: '',
            purchaseDate: '',
            image: null,
            subcategories: {},
            hasSizes: false,
            sizeQuantities: [{ size: '', quantity: '' }],
            quantity: '',
            existingImage: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = new FormData();
            payload.append('productName', formData.productName);
            payload.append('categoryId', formData.categoryId);
            payload.append('purchasePrice', formData.purchasePrice);
            payload.append('sellingPrice', formData.sellingPrice);
            payload.append('brandName', formData.brandName || '');
            payload.append('purchaseDate', formData.purchaseDate);
            payload.append('hasSizes', formData.hasSizes);
            if (formData.image) payload.append('image', formData.image);

            Object.entries(formData.subcategories).forEach(([key, value]) => {
                if (value) {
                    payload.append(key.toLowerCase(), value);
                }
            });

            if (formData.hasSizes) {
                const validSizeQuantities = formData.sizeQuantities.filter(sq => sq.size && sq.quantity);
                validSizeQuantities.forEach(sq => {
                    payload.append('sizes', sq.size);
                    payload.append('quantities', sq.quantity);
                });
            } else {
                payload.append('quantity', formData.quantity || 0);
            }

            console.log('FormData payload:', Object.fromEntries(payload));
            const url = editId ? `http://localhost:8080/api/products/${editId}` : 'http://localhost:8080/api/products';
            const method = editId ? 'put' : 'post';

            const response = await axios[method](url, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(`Product ${editId ? 'updated' : 'added'} successfully!`);
            resetFormData();
            setEditId(null);
            setOpenDialog(false);
            fetchData();
        } catch (err) {
            console.error('Error submitting product:', err);
            setError(err.response?.data?.error || 'Failed to save product: Network Error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditId(product.id);
        const selectedCategory = categories.find(c => c.id === product.categoryId);
        const subcats = selectedCategory?.allowedSubcategories || [];
        const initialSubcategories = subcats.reduce((acc, subcat) => ({
            ...acc,
            [subcat]: product.subcategories[subcat] || ''
        }), {});
        setFormData({
            productName: product.productName || '',
            categoryId: product.categoryId.toString() || '',
            purchasePrice: product.purchasePrice?.toString() || '',
            sellingPrice: product.sellingPrice?.toString() || '',
            brandName: product.brandName || '',
            purchaseDate: product.purchaseDate || '',
            image: null,
            subcategories: initialSubcategories,
            hasSizes: product.hasSizes || false,
            sizeQuantities: product.hasSizes && product.sizeQuantities
                ? product.sizeQuantities.map(sq => ({ size: sq.size, quantity: sq.quantity.toString() }))
                : [{ size: '', quantity: '' }],
            quantity: !product.hasSizes ? product.quantity?.toString() || '' : '',
            existingImage: product.image || null,
        });
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:8080/api/products/${id}`);
            setSuccess('Product deleted successfully!');
            fetchData();
        } catch (err) {
            setError('Failed to delete product: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.categoryName.trim()) {
            setError('Category name is required');
            return;
        }
        const subcategories = newCategory.subcategories.map(sc => sc.name).filter(name => name.trim());
        if (subcategories.length === 0) {
            setError('At least one subcategory is required');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await axios.post('http://localhost:8080/api/categories', {
                categoryName: newCategory.categoryName,
                allowedSubcategories: subcategories,
            });
            setSuccess('Category added successfully!');
            setNewCategory({ categoryName: '', subcategories: [{ name: '' }] });
            setOpenCategoryDialog(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add category: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubcategoriesToExisting = async () => {
        if (!addSubcategoryData.categoryId) {
            setError('Please select a category');
            return;
        }
        const newSubcategories = addSubcategoryData.subcategories.map(sc => sc.name).filter(name => name.trim());
        if (newSubcategories.length === 0) {
            setError('At least one subcategory is required');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const category = categories.find(c => c.id === parseInt(addSubcategoryData.categoryId));
            const currentSubcategories = category.allowedSubcategories || [];
            const updatedSubcategories = [...new Set([...currentSubcategories, ...newSubcategories])];
            await axios.put(`http://localhost:8080/api/categories/${addSubcategoryData.categoryId}`, {
                categoryName: category.categoryName,
                allowedSubcategories: updatedSubcategories,
            });
            setSuccess('Subcategories added successfully!');
            setAddSubcategoryData({ categoryId: '', subcategories: [{ name: '' }] });
            setOpenAddSubcategoryDialog(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add subcategories: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImagePreview = (imageSrc) => {
        setPreviewImage(imageSrc);
        setOpenImagePreviewDialog(true);
    };

    const renderSizesQuantities = (hasSizes, sizeQuantities, quantity) => {
        if (hasSizes && sizeQuantities && sizeQuantities.length > 0) {
            return sizeQuantities.map(sq => (
                <div key={sq.size}>• Size: {sq.size} – Quantity: {sq.quantity}</div>
            ));
        } else if (!hasSizes && quantity !== null && quantity !== undefined) {
            return <div>• Quantity: {quantity}</div>;
        }
        return <Typography variant="body2" color="#000000">N/A</Typography>;
    };

    const selectedCategory = categories.find(c => c.id === parseInt(formData.categoryId));
    const allowedSubcats = selectedCategory ? selectedCategory.allowedSubcategories || [] : [];

    const filteredProducts = filterProductId
        ? products.filter(product =>
            product.productId?.toString().includes(filterProductId)
        )
        : products;

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
                    Inventory Management
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

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <Card sx={{
                            bgcolor: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 2,
                                        color: '#000000',
                                        fontWeight: 500
                                    }}
                                >
                                    Add New Category
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setOpenCategoryDialog(true)}
                                    sx={{
                                        bgcolor: '#4ecdc4',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        px: 3,
                                        py: 1.5,
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: '#45b7aa',
                                            boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)'
                                        }
                                    }}
                                >
                                    Add Category
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Card sx={{
                            bgcolor: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 2,
                                        color: '#000000',
                                        fontWeight: 500
                                    }}
                                >
                                    Add Subcategories
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setOpenAddSubcategoryDialog(true)}
                                    sx={{
                                        bgcolor: '#4ecdc4',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        px: 3,
                                        py: 1.5,
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: '#45b7aa',
                                            boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)'
                                        }
                                    }}
                                >
                                    Add Subcategories
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 4,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                            resetFormData();
                            setEditId(null);
                            setOpenDialog(true);
                        }}
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
                        Add Product
                    </Button>
                    <TextField
                        label="Filter by Product ID"
                        value={filterProductId}
                        onChange={(e) => setFilterProductId(e.target.value)}
                        sx={{
                            width: { xs: '100%', sm: '250px' },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: '#fff',
                                '& fieldset': { borderColor: '#e3e8ee' },
                                '&:hover fieldset': { borderColor: '#6c63ff' },
                                '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                            },
                            '& .MuiInputLabel-root': {
                                color: '#000000',
                                '&.Mui-focused': { color: '#6c63ff' }
                            }
                        }}
                        variant="outlined"
                        size="small"
                    />
                </Box>

                <Dialog
                    open={openDialog}
                    onClose={() => {
                        setOpenDialog(false);
                        resetFormData();
                        setEditId(null);
                    }}
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
                        {editId ? 'Edit Product' : 'Add Product'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, bgcolor: '#fff' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Product Name"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleInputChange}
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
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#000000', '&.Mui-focused': { color: '#6c63ff' } }}>
                                            Category
                                        </InputLabel>
                                        <Select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            required
                                            sx={{
                                                borderRadius: '8px',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8ee' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' }
                                            }}
                                        >
                                            <MenuItem value="">Select Category</MenuItem>
                                            {categories.map(category => (
                                                <MenuItem key={category.id} value={category.id}>
                                                    {category.categoryName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#000000', '&.Mui-focused': { color: '#6c63ff' } }}>
                                            Has Sizes?
                                        </InputLabel>
                                        <Select
                                            name="hasSizes"
                                            value={formData.hasSizes ? 'yes' : 'no'}
                                            onChange={handleInputChange}
                                            required
                                            sx={{
                                                borderRadius: '8px',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8ee' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' }
                                            }}
                                        >
                                            <MenuItem value="yes">Yes</MenuItem>
                                            <MenuItem value="no">No</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {formData.hasSizes ? (
                                    formData.sizeQuantities.map((sq, index) => (
                                        <Grid container item xs={12} spacing={2} key={index} sx={{ mt: 1 }}>
                                            <Grid item xs={5}>
                                                <TextField
                                                    label="Size"
                                                    value={sq.size}
                                                    onChange={(e) => handleSizeQuantityChange(index, 'size', e.target.value)}
                                                    fullWidth
                                                    required
                                                    variant="outlined"
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
                                            <Grid item xs={5}>
                                                <TextField
                                                    label="Quantity"
                                                    type="number"
                                                    value={sq.quantity}
                                                    onChange={(e) => handleSizeQuantityChange(index, 'quantity', e.target.value)}
                                                    fullWidth
                                                    required
                                                    variant="outlined"
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
                                                <IconButton
                                                    onClick={() => handleRemoveSizeQuantity(index)}
                                                    sx={{
                                                        color: '#ff5e62',
                                                        '&:hover': { bgcolor: 'rgba(255, 94, 98, 0.1)' }
                                                    }}
                                                >
                                                    <Remove />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    ))
                                ) : (
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
                                )}
                                {formData.hasSizes && (
                                    <Grid item xs={12}>
                                        <Button
                                            startIcon={<Add />}
                                            onClick={handleAddSizeQuantity}
                                            sx={{
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
                                            }}
                                        >
                                            Add Size/Quantity
                                        </Button>
                                    </Grid>
                                )}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Purchase Price"
                                        name="purchasePrice"
                                        type="number"
                                        value={formData.purchasePrice}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        variant="outlined"
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
                                        name="sellingPrice"
                                        type="number"
                                        value={formData.sellingPrice}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        variant="outlined"
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
                                        label="Brand Name"
                                        name="brandName"
                                        value={formData.brandName}
                                        onChange={handleInputChange}
                                        fullWidth
                                        variant="outlined"
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
                                        label="Purchase Date"
                                        name="purchaseDate"
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
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
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{
                                            mt: 2,
                                            borderColor: '#e3e8ee',
                                            color: '#000000',
                                            borderRadius: '8px',
                                            width: '100%',
                                            py: 1,
                                            textTransform: 'none',
                                            bgcolor: '#a3bffa',
                                            '&:hover': {
                                                borderColor: '#6c63ff',
                                                bgcolor: 'rgba(163, 191, 250, 0.8)'
                                            }
                                        }}
                                    >
                                        Upload Image
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleInputChange}
                                            hidden
                                        />
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    {(formData.image || (editId && formData.existingImage)) && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1" sx={{ color: '#000000', mb: 1 }}>
                                                Image Preview:
                                            </Typography>
                                            <Box
                                                sx={{
                                                    border: '1px solid #e3e8ee',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    display: 'inline-block',
                                                    maxWidth: '150px',
                                                    maxHeight: '150px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 8px rgba(39, 68, 114, 0.08)',
                                                    transition: 'transform 0.2s ease-in-out',
                                                    '&:hover': { transform: 'scale(1.05)' }
                                                }}
                                                onClick={() => {
                                                    const imageSrc = formData.image
                                                        ? URL.createObjectURL(formData.image)
                                                        : `data:image/jpeg;base64,${formData.existingImage}`;
                                                    handleImagePreview(imageSrc);
                                                }}
                                            >
                                                <img
                                                    src={
                                                        formData.image
                                                            ? URL.createObjectURL(formData.image)
                                                            : `data:image/jpeg;base64,${formData.existingImage}`
                                                    }
                                                    alt="Preview"
                                                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px' }}
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </Grid>
                                {formData.categoryId && allowedSubcats.length > 0 && allowedSubcats.map(subcat => (
                                    <Grid item xs={12} sm={6} key={subcat}>
                                        <TextField
                                            label={subcat}
                                            name={subcat}
                                            value={formData.subcategories[subcat] || ''}
                                            onChange={handleInputChange}
                                            fullWidth
                                            variant="outlined"
                                            sx={{
                                                mt: 2,
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
                                ))}
                            </Grid>
                            {error && <Typography color="#ff5e62" sx={{ mt: 2, fontWeight: 500 }}>{error}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <Button
                            onClick={() => {
                                setOpenDialog(false);
                                resetFormData();
                                setEditId(null);
                            }}
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
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : (editId ? 'Update' : 'Add')}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openCategoryDialog}
                    onClose={() => setOpenCategoryDialog(false)}
                    maxWidth="sm"
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        bgcolor: '#6c63ff',
                        color: '#fff',
                        py: 2,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                    }}>
                        Add New Category
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, bgcolor: '#fff' }}>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Category Name"
                                        name="categoryName"
                                        value={newCategory.categoryName}
                                        onChange={(e) => setNewCategory(prev => ({
                                            ...prev,
                                            categoryName: e.target.value
                                        }))}
                                        fullWidth
                                        required
                                        variant="outlined"
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
                                {newCategory.subcategories.map((subcat, index) => (
                                    <Grid container item xs={12} spacing={2} key={index} sx={{ mt: 1 }}>
                                        <Grid item xs={10}>
                                            <TextField
                                                label={`Subcategory ${index + 1}`}
                                                value={subcat.name}
                                                onChange={(e) => handleNewCategoryChange(index, 'name', e.target.value)}
                                                fullWidth
                                                variant="outlined"
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
                                            <IconButton
                                                onClick={() => handleRemoveSubcategory(index)}
                                                sx={{
                                                    color: '#ff5e62',
                                                    '&:hover': { bgcolor: 'rgba(255, 94, 98, 0.1)' }
                                                }}
                                            >
                                                <Remove />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Button
                                        startIcon={<Add />}
                                        onClick={handleAddSubcategory}
                                        sx={{
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
                                        }}
                                    >
                                        Add Subcategory
                                    </Button>
                                </Grid>
                            </Grid>
                            {error && <Typography color="#ff5e62" sx={{ mt: 2, fontWeight: 500 }}>{error}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <Button
                            onClick={() => setOpenCategoryDialog(false)}
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
                            variant="contained"
                            onClick={handleAddCategory}
                            disabled={loading}
                            sx={{
                                bgcolor: '#6c63ff',
                                color: '#fff',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#5a52d5',
                                    boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)'
                                },
                                '&:disabled': {
                                    bgcolor: '#e3e8ee',
                                    color: '#6b7280'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Add Category'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openAddSubcategoryDialog}
                    onClose={() => setOpenAddSubcategoryDialog(false)}
                    maxWidth="sm"
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        bgcolor: '#6c63ff',
                        color: '#fff',
                        py: 2,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                    }}>
                        Add Subcategories to Existing Category
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, bgcolor: '#fff' }}>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#000000', '&.Mui-focused': { color: '#6c63ff' } }}>
                                            Existing Category
                                        </InputLabel>
                                        <Select
                                            name="categoryId"
                                            value={addSubcategoryData.categoryId}
                                            onChange={(e) => setAddSubcategoryData(prev => ({
                                                ...prev,
                                                categoryId: e.target.value
                                            }))}
                                            required
                                            sx={{
                                                borderRadius: '8px',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3e8ee' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6c63ff' }
                                            }}
                                        >
                                            <MenuItem value="">Select Category</MenuItem>
                                            {categories.map(category => (
                                                <MenuItem key={category.id} value={category.id}>
                                                    {category.categoryName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {addSubcategoryData.subcategories.map((subcat, index) => (
                                    <Grid container item xs={12} spacing={2} key={index} sx={{ mt: 1 }}>
                                        <Grid item xs={10}>
                                            <TextField
                                                label={`New Subcategory ${index + 1}`}
                                                value={subcat.name}
                                                onChange={(e) => handleAddSubcategoryChange(index, 'name', e.target.value)}
                                                fullWidth
                                                variant="outlined"
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
                                            <IconButton
                                                onClick={() => handleRemoveNewSubcategory(index)}
                                                sx={{
                                                    color: '#ff5e62',
                                                    '&:hover': { bgcolor: 'rgba(255, 94, 98, 0.1)' }
                                                }}
                                            >
                                                <Remove />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Button
                                        startIcon={<Add />}
                                        onClick={handleAddNewSubcategory}
                                        sx={{
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
                                        }}
                                    >
                                        Add Subcategory
                                    </Button>
                                </Grid>
                            </Grid>
                            {error && <Typography color="#ff5e62" sx={{ mt: 2, fontWeight: 500 }}>{error}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <Button
                            onClick={() => setOpenAddSubcategoryDialog(false)}
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
                            variant="contained"
                            onClick={handleAddSubcategoriesToExisting}
                            disabled={loading}
                            sx={{
                                bgcolor: '#6c63ff',
                                color: '#fff',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#5a52d5',
                                    boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)'
                                },
                                '&:disabled': {
                                    bgcolor: '#e3e8ee',
                                    color: '#6b7280'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Add Subcategories'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openImagePreviewDialog}
                    onClose={() => setOpenImagePreviewDialog(false)}
                    maxWidth="md"
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        color: '#000000',
                        fontWeight: 600,
                        borderBottom: '1px solid #e3e8ee'
                    }}>
                        Image Preview
                    </DialogTitle>
                    <DialogContent sx={{ bgcolor: '#fff' }}>
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    display: 'block',
                                    margin: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(39, 68, 114, 0.08)'
                                }}
                            />
                        )}
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: '#fff' }}>
                        <Button
                            onClick={() => setOpenImagePreviewDialog(false)}
                            variant="contained"
                            sx={{
                                bgcolor: '#6c63ff',
                                color: '#fff',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#5a52d5',
                                    boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)'
                                }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

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
                                    Name
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
                                    Brand
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
                                    Sizes & Quantities
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Unit Purchase Price
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
                                    Purchase Date
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.slice(0, 25).map((product, idx) => {
                                const categoryName = categories.find(c => c.id === product.categoryId)?.categoryName || '';
                                return (
                                    <TableRow
                                        key={product.id}
                                        sx={{
                                            bgcolor: idx % 2 === 0 ? '#fff' : '#f4f8fb',
                                            '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.05)' }
                                        }}
                                    >
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {product.productId || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ py: 2, px: 3 }}>
                                            {product.image ? (
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
                                                    onClick={() => handleImagePreview(`data:image/jpeg;base64,${product.image}`)}
                                                >
                                                    <img
                                                        src={`data:image/jpeg;base64,${product.image}`}
                                                        alt="Product"
                                                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px' }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="#000000">N/A</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {product.productName || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {categoryName}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {product.brandName || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {product.subcategories && Object.keys(product.subcategories).length > 0 ? (
                                                Object.entries(product.subcategories)
                                                    .filter(([_, value]) => value && value.trim() !== '')
                                                    .map(([key, value]) => (
                                                        <div key={key}>{`${key}: ${value}`}</div>
                                                    ))
                                            ) : (
                                                <Typography variant="body2" color="#000000">N/A</Typography>
                                            )}
                                            {product.subcategories && Object.entries(product.subcategories).filter(([_, value]) => value && value.trim() !== '').length === 0 && (
                                                <Typography variant="body2" color="#000000">N/A</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {renderSizesQuantities(product.hasSizes, product.sizeQuantities, product.quantity)}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {product.purchasePrice || '0.00'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {product.sellingPrice || '0.00'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {product.purchaseDate || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ py: 2, px: 3 }}>
                                            <IconButton
                                                onClick={() => handleEdit(product)}
                                                sx={{
                                                    color: '#4ecdc4',
                                                    '&:hover': { bgcolor: 'rgba(78, 205, 196, 0.1)' }
                                                }}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(product.id)}
                                                sx={{
                                                    color: '#ff5e62',
                                                    '&:hover': { bgcolor: 'rgba(255, 94, 98, 0.1)' }
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredProducts.length > 25 && (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        <Typography variant="caption" color="#000000">
                                            Scroll to view more products...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        <Typography variant="body2" color="#000000" sx={{ py: 4 }}>
                                            No products available for the selected filter.
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

export default ProductManagement;