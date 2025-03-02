import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const AddEmployeeDialog = ({ open, onClose, onSave, selectedEmployee }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        hireDate: '',
        jobTitle: '',
        address: ''
    });
    const [errors, setErrors] = useState({});

    // Initialize form data when selectedEmployee changes
    useEffect(() => {
        if (selectedEmployee) {
            setFormData({
                firstName: selectedEmployee.firstName,
                lastName: selectedEmployee.lastName,
                email: selectedEmployee.email,
                phoneNumber: selectedEmployee.phoneNumber,
                hireDate: selectedEmployee.hireDate,
                jobTitle: selectedEmployee.jobTitle,
                address: selectedEmployee.address
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                hireDate: '',
                jobTitle: '',
                address: ''
            });
        }
    }, [selectedEmployee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format (e.g., example@gmail.com)';
        }
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be 10 digits';
        }
        if (!formData.hireDate) newErrors.hireDate = 'Hire date is required';
        if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
        if (!formData.address) newErrors.address = 'Address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSave(formData);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogContent>
                <TextField
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    name="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    name="phoneNumber"
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    name="hireDate"
                    label="Hire Date"
                    type="date"
                    value={formData.hireDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.hireDate}
                    helperText={errors.hireDate}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    name="jobTitle"
                    label="Job Title"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    error={!!errors.jobTitle}
                    helperText={errors.jobTitle}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    name="address"
                    label="Address"
                    value={formData.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    fullWidth
                    margin="normal"
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddEmployeeDialog;