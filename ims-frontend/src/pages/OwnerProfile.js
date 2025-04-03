// src/pages/OwnerProfile.js
import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Avatar, IconButton } from '@mui/material';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function OwnerProfile() {
    const [owner, setOwner] = useState({
        firstName: '',
        lastName: '',
        address: '',
        phoneNumber: '',
        email: '',
        password: '',
        image: ''
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const ownerId = 1; // Hardcoded for demo; replace with dynamic ID (e.g., from login state)

    useEffect(() => {
        fetchOwnerProfile();
    }, []);

    const fetchOwnerProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/owners/${ownerId}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setOwner(response.data);
            setImagePreview(response.data.image || null);
            setErrors({});
        } catch (error) {
            console.error('Fetch owner failed:', error);
            setErrors({ fetch: 'Failed to load owner profile. Check console.' });
        }
    };

    const validate = () => {
        let tempErrors = {};
        tempErrors.firstName = owner.firstName ? '' : 'First Name is required';
        tempErrors.lastName = owner.lastName ? '' : 'Last Name is required';
        tempErrors.address = owner.address ? '' : 'Address is required';
        tempErrors.phoneNumber = owner.phoneNumber ? (/^\d{10}$/.test(owner.phoneNumber) ? '' : 'Invalid phone number (10 digits)') : 'Phone Number is required';
        tempErrors.email = owner.email ? (/\S+@\S+\.\S+/.test(owner.email) ? '' : 'Invalid email') : 'Email is required';
        tempErrors.password = owner.password ? (owner.password.length >= 6 ? '' : 'Password must be at least 6 characters') : 'Password is required';
        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === '');
    };

    const handleChange = (e) => {
        setOwner({ ...owner, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOwner({ ...owner, image: reader.result }); // Base64 string
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (validate()) {
            try {
                console.log('Updating owner data:', owner);
                const response = await axios.put(`http://localhost:8080/api/owners/${ownerId}`, owner, {
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('Update successful:', response.data);
                alert('Profile updated successfully');
                fetchOwnerProfile(); // Refresh data
            } catch (error) {
                console.error('Update failed:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                setErrors({ form: error.response?.data || 'Update failed. Check console.' });
            }
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Owner Profile
                </Typography>
                {errors.fetch && <Typography color="error" align="center">{errors.fetch}</Typography>}
                {errors.form && <Typography color="error" align="center">{errors.form}</Typography>}

                <Box display="flex" justifyContent="center" mb={2}>
                    <Avatar
                        src={imagePreview}
                        sx={{ width: 100, height: 100 }}
                        alt="Owner Image"
                    />
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                        type="file"
                        onChange={handleImageChange}
                    />
                    <label htmlFor="image-upload">
                        <IconButton color="primary" component="span">
                            <PhotoCamera />
                        </IconButton>
                    </label>
                </Box>

                <TextField
                    name="firstName"
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={owner.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                />
                <TextField
                    name="lastName"
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={owner.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                />
                <TextField
                    name="address"
                    label="Address"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={owner.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                />
                <TextField
                    name="phoneNumber"
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={owner.phoneNumber}
                    onChange={handleChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                />
                <TextField
                    name="email"
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={owner.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    name="password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={owner.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                >
                    Update Profile
                </Button>
            </Container>
        </>
    );
}

export default OwnerProfile;