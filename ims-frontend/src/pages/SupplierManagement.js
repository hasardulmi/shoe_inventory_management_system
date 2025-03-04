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
    useTheme, // Import useTheme hook
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';

const SupplierManagement = () => {
    const theme = useTheme(); // Access the Material-UI theme
    const [suppliers, setSuppliers] = useState([]); // State to store supplier data
    const [openDialog, setOpenDialog] = useState(false); // State to control dialog visibility
    const [currentSupplier, setCurrentSupplier] = useState({
        id: null,
        supplierFirstName: '',
        supplierLastName: '',
        supplierEmail: '',
        supplierPhoneNum: '',
        supplierAddress: '',
        supplierBrandName: '',
    });
    const [isEditMode, setIsEditMode] = useState(false); // State to track if we're editing or adding
    const [errors, setErrors] = useState({}); // State to store validation errors

    // Fetch supplier data when the component mounts
    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Function to fetch supplier data from the backend
    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/supplier');
            setSuppliers(response.data); // Update state with fetched data
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    // Handle input change for form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentSupplier({ ...currentSupplier, [name]: value });
        setErrors({ ...errors, [name]: '' }); // Clear validation error
    };

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!currentSupplier.supplierFirstName.trim()) {
            newErrors.supplierFirstName = 'Supplier First Name is required';
        }
        if (!currentSupplier.supplierLastName.trim()) {
            newErrors.supplierLastName = 'Supplier Last Name is required';
        }
        if (!currentSupplier.supplierEmail.trim()) {
            newErrors.supplierEmail = 'Supplier Email is required';
        }
        if (!currentSupplier.supplierPhoneNum.trim()) {
            newErrors.supplierPhoneNum = 'Supplier Phone Number is required';
        }
        if (!currentSupplier.supplierAddress.trim()) {
            newErrors.supplierAddress = 'Supplier Address is required';
        }
        if (!currentSupplier.supplierBrandName.trim()) {
            newErrors.supplierBrandName = 'Supplier Brand Name is required';
        }
        setErrors(newErrors); // Update the errors state
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Open dialog for adding or editing supplier
    const handleOpenDialog = (supplierItem = null) => {
        if (supplierItem) {
            // If editing, populate the form with the current supplier item
            setCurrentSupplier(supplierItem);
            setIsEditMode(true);
        } else {
            // If adding, reset the form
            setCurrentSupplier({
                id: null,
                supplierFirstName: '',
                supplierLastName: '',
                supplierEmail: '',
                supplierPhoneNum: '',
                supplierAddress: '',
                supplierBrandName: '',
            });
            setIsEditMode(false);
        }
        setOpenDialog(true); // Open the dialog
    };

    // Close dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Save or update supplier
    const handleSaveSupplier = async () => {
        if (!validateForm()) {
            console.log('Validation failed');
            return; // Validate form before saving
        }

        try {
            let response;
            if (isEditMode) {
                // Update existing supplier item
                response = await axios.put(`http://localhost:8080/api/supplier/${currentSupplier.id}`, currentSupplier);
                console.log('Supplier updated:', response.data);
            } else {
                // Add new supplier item
                response = await axios.post('http://localhost:8080/api/supplier', currentSupplier);
                console.log('Supplier added:', response.data);
            }
            fetchSuppliers(); // Refresh the supplier list
            handleCloseDialog(); // Close the dialog
        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    };

    // Delete supplier
    const handleDeleteSupplier = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/supplier/${id}`);
            fetchSuppliers(); // Refresh the supplier list
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Supplier Management
                </Typography>

                {/* Add Supplier Button */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                    sx={{ mb: 3 }}
                >
                    Add New Supplier
                </Button>

                {/* Supplier Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Brand Name</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>{supplier.supplierFirstName}</TableCell>
                                    <TableCell>{supplier.supplierLastName}</TableCell>
                                    <TableCell>{supplier.supplierEmail}</TableCell>
                                    <TableCell>{supplier.supplierPhoneNum}</TableCell>
                                    <TableCell>{supplier.supplierAddress}</TableCell>
                                    <TableCell>{supplier.supplierBrandName}</TableCell>
                                    <TableCell>
                                        {/* Edit Button */}
                                        <Button
                                            variant="contained"
                                            sx={{
                                                backgroundColor: theme.palette.info.light, // Light blue
                                                color: theme.palette.common.black, // Black text
                                                '&:hover': {
                                                    backgroundColor: theme.palette.info.main, // Slightly darker blue on hover
                                                },
                                                mr: 1, // Margin right
                                            }}
                                            onClick={() => handleOpenDialog(supplier)}
                                        >
                                            Edit
                                        </Button>
                                        {/* Delete Button */}
                                        <Button
                                            variant="contained"
                                            sx={{
                                                backgroundColor: theme.palette.success.light, // Light green
                                                color: theme.palette.common.black, // Black text
                                                '&:hover': {
                                                    backgroundColor: theme.palette.success.main, // Slightly darker green on hover
                                                },
                                            }}
                                            onClick={() => handleDeleteSupplier(supplier.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Add/Edit Supplier Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="First Name"
                            name="supplierFirstName"
                            value={currentSupplier.supplierFirstName}
                            onChange={handleInputChange}
                            error={!!errors.supplierFirstName}
                            helperText={errors.supplierFirstName}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Last Name"
                            name="supplierLastName"
                            value={currentSupplier.supplierLastName}
                            onChange={handleInputChange}
                            error={!!errors.supplierLastName}
                            helperText={errors.supplierLastName}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            name="supplierEmail"
                            value={currentSupplier.supplierEmail}
                            onChange={handleInputChange}
                            error={!!errors.supplierEmail}
                            helperText={errors.supplierEmail}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Phone Number"
                            name="supplierPhoneNum"
                            value={currentSupplier.supplierPhoneNum}
                            onChange={handleInputChange}
                            error={!!errors.supplierPhoneNum}
                            helperText={errors.supplierPhoneNum}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Address"
                            name="supplierAddress"
                            value={currentSupplier.supplierAddress}
                            onChange={handleInputChange}
                            error={!!errors.supplierAddress}
                            helperText={errors.supplierAddress}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Brand Name"
                            name="supplierBrandName"
                            value={currentSupplier.supplierBrandName}
                            onChange={handleInputChange}
                            error={!!errors.supplierBrandName}
                            helperText={errors.supplierBrandName}
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSaveSupplier} color="primary">
                            {isEditMode ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default SupplierManagement;