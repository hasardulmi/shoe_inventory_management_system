import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, MenuItem, Select, InputLabel, FormControl, Grid, Paper } from '@mui/material';
import LocalMallIcon from '@mui/icons-material/LocalMall'; // Shop-related icon
import Navbar from '../components/Navbar';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        email: '',
        phone: '',
        address: '',
        userType: 'EMPLOYEE'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/users/register', formData);
            if (response.status === 200) {
                alert('Registration is successful');
            } else {
                alert('An error occurred during registration.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during registration.');
        }
    };

    return (
        <>
            <Navbar />
            <Box
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="lg">
                    <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                        <Grid container>
                            <Grid
                                item
                                xs={12}
                                md={6}
                                sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 4,
                                    textAlign: 'center'
                                }}
                            >
                                <LocalMallIcon sx={{ fontSize: 180, mb: 4 }} /> {/* Shop-related icon */}
                                <Typography variant="h3" component="h1" gutterBottom>
                                    SARASI SHOE CORNER
                                </Typography>
                                <Typography variant="subtitle1">
                                    Step into Style and Comfort
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                md={6}
                                sx={{
                                    backgroundColor: 'white',
                                    padding: 4
                                }}
                            >
                                <Typography variant="h5" component="h2" gutterBottom>
                                    User Registration
                                </Typography>
                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />

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

                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />

                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>User Type</InputLabel>
                                        <Select
                                            name="userType"
                                            value={formData.userType}
                                            onChange={handleChange}
                                            required
                                        >
                                            <MenuItem value="OWNER">Owner</MenuItem>
                                            <MenuItem value="EMPLOYEE">Employee</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Register
                                    </Button>
                                </form>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </Box>
        </>
    );
};

export default Register;