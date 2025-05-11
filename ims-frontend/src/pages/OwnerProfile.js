import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';
import { useNavigate } from 'react-router-dom';

function OwnerProfile() {
    const [user, setUser] = useState({
        id: null,
        firstName: '',
        lastName: '',
        address: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        jobTitle: '',
        role: '',
        salary: null,
        hireDate: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                setErrors({ fetch: 'User not logged in. Please log in again.' });
                navigate('/login');
                return;
            }

            console.log('Fetching profile for email:', email);
            const response = await axios.get('http://localhost:8080/api/employee/self', {
                params: { email },
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('API Response:', response.data);
            const userData = response.data;
            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid response data');
            }

            setUser({
                id: userData.id,
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                address: userData.address || '',
                phoneNumber: userData.phoneNumber || '',
                email: userData.email || '',
                password: '',
                confirmPassword: '',
                jobTitle: userData.job_title || '',
                role: userData.role || '',
                salary: userData.salary || null,
                hireDate: userData.hire_date ? (typeof userData.hire_date === 'string' ? userData.hire_date : userData.hire_date.toString()) : ''
            });
            setErrors({});
        } catch (error) {
            console.error('Fetch user failed:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || error.message;
            if (errorMessage.includes('User not found')) {
                setErrors({ fetch: 'User not found. Please log in with a valid account.' });
                navigate('/login');
            } else if (error.message.includes('Network Error')) {
                setErrors({ fetch: 'Cannot connect to the server. Please ensure the backend is running.' });
            } else {
                setErrors({ fetch: 'Failed to load profile: ' + errorMessage });
            }
        }
    };

    const validate = () => {
        let tempErrors = {};
        tempErrors.firstName = user.firstName ? '' : 'First Name is required';
        tempErrors.lastName = user.lastName ? '' : 'Last Name is required';
        tempErrors.address = user.address ? '' : 'Address is required';
        tempErrors.phoneNumber = user.phoneNumber
            ? (/^\d{10}$/.test(user.phoneNumber) ? '' : 'Invalid phone number (10 digits)')
            : 'Phone Number is required';
        tempErrors.email = user.email
            ? (/\S+@\S+\.\S+/.test(user.email) ? '' : 'Invalid email')
            : 'Email is required';
        if (user.password || user.confirmPassword) {
            tempErrors.password = user.password
                ? (user.password.length >= 6 ? '' : 'Password must be at least 6 characters')
                : 'Password is required for update';
            tempErrors.confirmPassword = user.confirmPassword
                ? (user.password === user.confirmPassword ? '' : 'Passwords do not match')
                : 'Confirm Password is required';
        }
        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === '');
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (validate()) {
            try {
                const payload = {
                    id: user.id,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    address: user.address,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                    password: user.password || undefined,
                    job_title: user.jobTitle,
                    role: user.role,
                    salary: user.salary
                    // Exclude hire_date to avoid type mismatch
                };

                console.log('Submitting payload:', payload);
                const response = await axios.put(`http://localhost:8080/api/employees/${user.id}`, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });

                console.log('Update response:', response.data);
                if (user.email !== localStorage.getItem('userEmail')) {
                    localStorage.setItem('userEmail', user.email);
                }

                alert('Profile updated successfully');
                fetchUserProfile();
            } catch (error) {
                console.error('Update failed:', error.response?.data || error.message);
                const errorMessage = error.response?.data?.error || error.message;
                setErrors({ form: 'Update failed: ' + errorMessage });
            }
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    My Profile
                </Typography>
                {errors.fetch && <Typography color="error" align="center">{errors.fetch}</Typography>}
                {errors.form && <Typography color="error" align="center">{errors.form}</Typography>}

                <TextField
                    name="firstName"
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={user.firstName}
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
                    value={user.lastName}
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
                    value={user.address}
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
                    value={user.phoneNumber}
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
                    value={user.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    name="jobTitle"
                    label="Job Title"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={user.jobTitle}
                    onChange={handleChange}
                    disabled
                />
                <TextField
                    name="role"
                    label="Role"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={user.role}
                    onChange={handleChange}
                    disabled
                />
                <TextField
                    name="salary"
                    label="Salary"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={user.salary || ''}
                    onChange={handleChange}
                    disabled
                />
                <TextField
                    name="hireDate"
                    label="Hire Date"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={user.hireDate}
                    onChange={handleChange}
                    disabled
                />
                <TextField
                    name="password"
                    label="New Password (leave blank to keep unchanged)"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={user.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                />
                <TextField
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={user.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
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