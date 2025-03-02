import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Grid, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Navbar from '../components/Navbar';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send a POST request to your backend API for authentication
            const response = await axios.post('http://localhost:8080/api/users/login', formData);
            console.log('Backend Response:', response.data); // Log the response for debugging

            // Check if the login was successful
            if (response.data.message === 'Login successful') {
                const { userType } = response.data;

                // Navigate based on userType
                if (userType === 'OWNER') {
                    navigate('/owner-dashboard'); // Redirect to Owner Dashboard
                } else if (userType === 'EMPLOYEE') {
                    navigate('/employee-dashboard'); // Redirect to Employee Dashboard
                } else {
                    setError('Invalid user type'); // Handle unexpected userType
                }
            } else {
                setError('Invalid credentials');
            }
        } catch (error) {
            console.error('Login Error:', error); // Log the error for debugging
            setError('Invalid credentials or there was an error.');
        }
    };

    return (
        <>
            <Navbar />
            <Container maxWidth="sm">
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh'
                    }}
                >
                    <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden', padding: 4 }}>
                        <Grid container spacing={2} direction="column" alignItems="center">
                            <Grid item>
                                <LockIcon sx={{ fontSize: 80 }} />
                            </Grid>
                            <Grid item>
                                <Typography variant="h4" component="h1">
                                    Login
                                </Typography>
                            </Grid>
                            <Grid item>
                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {error && (
                                        <Typography color="error" sx={{ mt: 2 }}>
                                            {error}
                                        </Typography>
                                    )}
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        sx={{ mt: 3 }}
                                    >
                                        Login
                                    </Button>
                                </form>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            </Container>
        </>
    );
};

export default Login;