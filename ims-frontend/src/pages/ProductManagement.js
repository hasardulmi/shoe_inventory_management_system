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

            // Append subcategories
            Object.entries(formData.subcategories).forEach(([key, value]) => {
                if (value) {
                    payload.append(key.toLowerCase(), value);
                }
            });

            // Handle sizes and quantities
            if (formData.hasSizes) {
                const validSizeQuantities = formData.sizeQuantities.filter(sq => sq.size && sq.quantity);
                validSizeQuantities.forEach(sq => {
                    payload.append('sizes', sq.size);
                    payload.append('quantities', sq.quantity);
                });
            } else {
                payload.append('quantity', formData.quantity || 0);
            }

            console.log('FormData payload:', Object.fromEntries(payload)); // Debug payload
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
        return <Typography variant="body2" color="text.secondary">N/A</Typography>;
    };

    const selectedCategory = categories.find(c => c.id === parseInt(formData.categoryId));
    const allowedSubcats = selectedCategory ? selectedCategory.allowedSubcategories || [] : [];

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
                <Typography variant="h4" sx={{ mb: 4, color: '#1f2937', fontWeight: 'bold', textAlign: 'center' }}>
                    Inventory Management
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
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, color: '#1f2937' }}>Add New Category</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setOpenCategoryDialog(true)}
                                    sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                                >
                                    Add Category
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, color: '#1f2937' }}>Add Subcategories to Existing Category</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setOpenAddSubcategoryDialog(true)}
                                    sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                                >
                                    Add Subcategories
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => {
                                resetFormData();
                                setEditId(null);
                                setOpenDialog(true);
                            }}
                            sx={{ mb: 4, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            Add Product
                        </Button>
                    </Grid>
                </Grid>

                <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetFormData(); setEditId(null); }} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ bgcolor: '#10b981', color: 'white', py: 2 }}>
                        {editId ? 'Edit Product' : 'Add Product'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <MenuItem value="">Select Category</MenuItem>
                                            {categories.map(category => (
                                                <MenuItem key={category.id} value={category.id}>{category.categoryName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Has Sizes?</InputLabel>
                                        <Select
                                            name="hasSizes"
                                            value={formData.hasSizes ? 'yes' : 'no'}
                                            onChange={handleInputChange}
                                            required
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
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <IconButton onClick={() => handleRemoveSizeQuantity(index)} color="error">
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
                                        />
                                    </Grid>
                                )}
                                {formData.hasSizes && (
                                    <Grid item xs={12}>
                                        <Button startIcon={<Add />} onClick={handleAddSizeQuantity} sx={{ mt: 1 }}>
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                        style={{ marginTop: '16px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    {(formData.image || (editId && formData.existingImage)) && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1">Image Preview:</Typography>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    display: 'inline-block',
                                                    maxWidth: '150px',
                                                    maxHeight: '150px',
                                                    overflow: 'hidden'
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
                                                    style={{ width: '100%', height: 'auto', display: 'block' }}
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
                                            sx={{ mt: 2 }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => { setOpenDialog(false); resetFormData(); setEditId(null); }} variant="outlined">Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            {loading ? <CircularProgress size={24} /> : (editId ? 'Update' : 'Add')}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: '#3b82f6', color: 'white', py: 2 }}>Add New Category</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Category Name"
                                        name="categoryName"
                                        value={newCategory.categoryName}
                                        onChange={(e) => setNewCategory(prev => ({ ...prev, categoryName: e.target.value }))}
                                        fullWidth
                                        required
                                        variant="outlined"
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
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton onClick={() => handleRemoveSubcategory(index)} color="error">
                                                <Remove />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Button startIcon={<Add />} onClick={handleAddSubcategory} sx={{ mt: 1 }}>
                                        Add Subcategory
                                    </Button>
                                </Grid>
                            </Grid>
                            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenCategoryDialog(false)} variant="outlined">Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddCategory}
                            disabled={loading}
                            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Add Category'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openAddSubcategoryDialog} onClose={() => setOpenAddSubcategoryDialog(false)} maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: '#3b82f6', color: 'white', py: 2 }}>Add Subcategories to Existing Category</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Existing Category</InputLabel>
                                        <Select
                                            name="categoryId"
                                            value={addSubcategoryData.categoryId}
                                            onChange={(e) => setAddSubcategoryData(prev => ({ ...prev, categoryId: e.target.value }))}
                                            required
                                        >
                                            <MenuItem value="">Select Category</MenuItem>
                                            {categories.map(category => (
                                                <MenuItem key={category.id} value={category.id}>{category.categoryName}</MenuItem>
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
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton onClick={() => handleRemoveNewSubcategory(index)} color="error">
                                                <Remove />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Button startIcon={<Add />} onClick={handleAddNewSubcategory} sx={{ mt: 1 }}>
                                        Add Subcategory
                                    </Button>
                                </Grid>
                            </Grid>
                            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenAddSubcategoryDialog(false)} variant="outlined">Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddSubcategoriesToExisting}
                            disabled={loading}
                            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Add Subcategories'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openImagePreviewDialog} onClose={() => setOpenImagePreviewDialog(false)} maxWidth="md">
                    <DialogTitle>Image Preview</DialogTitle>
                    <DialogContent>
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: 'auto' }}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenImagePreviewDialog(false)} variant="contained">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                <TableContainer component={Paper} sx={{ mt: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#3b82f6' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Brand</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subcategories</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sizes & Quantities</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Purchase Price</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Selling Price</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Purchase Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map(product => {
                                const categoryName = categories.find(c => c.id === product.categoryId)?.categoryName || '';
                                return (
                                    <TableRow key={product.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                        <TableCell>{product.productId || 'N/A'}</TableCell>
                                        <TableCell>
                                            {product.image ? (
                                                <Box
                                                    sx={{
                                                        cursor: 'pointer',
                                                        display: 'inline-block',
                                                        maxWidth: '100px',
                                                        maxHeight: '100px',
                                                        overflow: 'hidden'
                                                    }}
                                                    onClick={() => handleImagePreview(`data:image/jpeg;base64,${product.image}`)}
                                                >
                                                    <img
                                                        src={`data:image/jpeg;base64,${product.image}`}
                                                        alt="Product"
                                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                                    />
                                                </Box>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell>{product.productName || 'N/A'}</TableCell>
                                        <TableCell>{categoryName}</TableCell>
                                        <TableCell>{product.brandName || 'N/A'}</TableCell>
                                        <TableCell>
                                            {product.subcategories && Object.keys(product.subcategories).length > 0 ? (
                                                Object.entries(product.subcategories)
                                                    .filter(([_, value]) => value && value.trim() !== '') // Filter out empty or undefined values
                                                    .map(([key, value]) => (
                                                        <div key={key}>{`${key}: ${value}`}</div>
                                                    ))
                                            ) : (
                                                'N/A'
                                            )}
                                            {product.subcategories && Object.entries(product.subcategories).filter(([_, value]) => value && value.trim() !== '').length === 0 && 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {renderSizesQuantities(product.hasSizes, product.sizeQuantities, product.quantity)}
                                        </TableCell>
                                        <TableCell>{product.purchasePrice || '0.00'}</TableCell>
                                        <TableCell>{product.sellingPrice || '0.00'}</TableCell>
                                        <TableCell>{product.purchaseDate || 'N/A'}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(product)} sx={{ color: '#3b82f6' }}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(product.id)} sx={{ color: '#ef4444' }}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
};

export default ProductManagement;