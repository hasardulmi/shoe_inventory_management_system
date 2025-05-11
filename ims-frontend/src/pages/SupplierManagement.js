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
                    Supplier Management
                </Typography>

                <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage('')}>
                    <Alert onClose={() => setErrorMessage('')} severity="error" sx={{
                        width: '100%',
                        bgcolor: '#ff5e62',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}>
                        {errorMessage}
                    </Alert>
                </Snackbar>
                <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage('')}>
                    <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{
                        width: '100%',
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}>
                        {successMessage}
                    </Alert>
                </Snackbar>

                <Button
                    variant="contained"
                    onClick={() => handleOpenDialog()}
                    disabled={loading}
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
                    Add New Supplier
                </Button>

                {loading && !openDialog && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
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
                                    Company Name
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    First Name
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Last Name
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Email
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Phone Number
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Address
                                </TableCell>
                                <TableCell sx={{
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderBottom: '2px solid #45b7aa',
                                    backgroundColor: '#4ecdc4',
                                    py: 2,
                                    px: 3
                                }}>
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="body2" color="#000000" sx={{ py: 4 }}>
                                            No suppliers found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suppliers.map((supplier) => (
                                    <TableRow
                                        key={supplier.id}
                                        sx={{
                                            bgcolor: '#fff',
                                            '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.05)' }
                                        }}
                                    >
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {supplier.companyName}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {supplier.firstName}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {supplier.lastName}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {supplier.email}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {supplier.phoneNumber}
                                        </TableCell>
                                        <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                            {supplier.address}
                                        </TableCell>
                                        <TableCell sx={{ py: 2, px: 3 }}>
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

                <Dialog open={openDialog} onClose={handleCloseDialog}
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
                        {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, bgcolor: '#fff' }}>
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
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <Button
                            onClick={handleCloseDialog}
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
                            onClick={handleSaveSupplier}
                            color="primary"
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
                            {isEditMode ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
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
                        Confirm Delete
                    </DialogTitle>
                    <DialogContent sx={{ bgcolor: '#fff' }}>
                        <Typography>Are you sure you want to delete this supplier?</Typography>
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: '#fff' }}>
                        <Button
                            onClick={() => setDeleteConfirm(null)}
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
                            onClick={() => handleDeleteSupplier(deleteConfirm)}
                            color="error"
                            disabled={loading}
                            sx={{
                                bgcolor: '#ff5e62',
                                color: '#fff',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#e04e51',
                                    boxShadow: '0 2px 8px rgba(255, 94, 98, 0.3)'
                                },
                                '&:disabled': {
                                    bgcolor: '#e3e8ee',
                                    color: '#6b7280'
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default SupplierManagement;