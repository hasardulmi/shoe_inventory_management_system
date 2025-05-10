import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert,
    useTheme,
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

const SupplierManagement = () => {
    const theme = useTheme();
    const [suppliers, setSuppliers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [currentSupplier, setCurrentSupplier] = useState({
        id: null,
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setErrorMessage('Failed to fetch suppliers: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentSupplier({ ...currentSupplier, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!currentSupplier.companyName.trim()) newErrors.companyName = 'Company Name is required';
        if (!currentSupplier.firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!currentSupplier.lastName.trim()) newErrors.lastName = 'Last Name is required';
        if (!currentSupplier.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(currentSupplier.email)) newErrors.email = 'Email is invalid';
        if (!currentSupplier.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
        if (!currentSupplier.address.trim()) newErrors.address = 'Address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenDialog = (supplier = null) => {
        if (supplier) {
            setCurrentSupplier(supplier);
            setIsEditMode(true);
        } else {
            setCurrentSupplier({
                id: null,
                companyName: '',
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
            });
            setIsEditMode(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setErrors({});
    };

    const handleSaveSupplier = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (isEditMode) {
                await axios.put(`http://localhost:8080/api/suppliers/${currentSupplier.id}`, currentSupplier);
                setSuccessMessage('Supplier updated successfully!');
            } else {
                await axios.post('http://localhost:8080/api/suppliers', currentSupplier);
                setSuccessMessage('Supplier added successfully!');
            }
            fetchSuppliers();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving supplier:', error);
            setErrorMessage(error.response?.data?.error || 'Failed to save supplier');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSupplier = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:8080/api/suppliers/${id}`);
            setSuccessMessage('Supplier deleted successfully!');
            setDeleteConfirm(null);
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            setErrorMessage('Failed to delete supplier: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Supplier Management
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                    sx={{ mb: 3 }}
                    disabled={loading}
                >
                    Add New Supplier
                </Button>

                {loading && !openDialog && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Company Name</TableCell>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No suppliers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suppliers.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell>{supplier.companyName}</TableCell>
                                        <TableCell>{supplier.firstName}</TableCell>
                                        <TableCell>{supplier.lastName}</TableCell>
                                        <TableCell>{supplier.email}</TableCell>
                                        <TableCell>{supplier.phoneNumber}</TableCell>
                                        <TableCell>{supplier.address}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: theme.palette.info.light,
                                                    color: theme.palette.common.black,
                                                    '&:hover': { backgroundColor: theme.palette.info.main },
                                                    mr: 1,
                                                }}
                                                onClick={() => handleOpenDialog(supplier)}
                                                disabled={loading}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: theme.palette.error.light,
                                                    color: theme.palette.common.black,
                                                    '&:hover': { backgroundColor: theme.palette.error.main },
                                                }}
                                                onClick={() => setDeleteConfirm(supplier.id)}
                                                disabled={loading}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Company Name"
                            name="companyName"
                            value={currentSupplier.companyName}
                            onChange={handleInputChange}
                            error={!!errors.companyName}
                            helperText={errors.companyName}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="First Name"
                            name="firstName"
                            value={currentSupplier.firstName}
                            onChange={handleInputChange}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Last Name"
                            name="lastName"
                            value={currentSupplier.lastName}
                            onChange={handleInputChange}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            name="email"
                            value={currentSupplier.email}
                            onChange={handleInputChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Phone Number"
                            name="phoneNumber"
                            value={currentSupplier.phoneNumber}
                            onChange={handleInputChange}
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Address"
                            name="address"
                            value={currentSupplier.address}
                            onChange={handleInputChange}
                            error={!!errors.address}
                            helperText={errors.address}
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSaveSupplier} color="primary" disabled={loading}>
                            {isEditMode ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this supplier?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirm(null)} disabled={loading}>Cancel</Button>
                        <Button onClick={() => handleDeleteSupplier(deleteConfirm)} color="error" disabled={loading}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage('')}>
                    <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
                        {errorMessage}
                    </Alert>
                </Snackbar>
                <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage('')}>
                    <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
};

export default SupplierManagement;