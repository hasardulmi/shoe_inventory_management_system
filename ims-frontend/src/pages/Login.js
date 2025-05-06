import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import './styles.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/login', {
                email,
                password
            }, {
                withCredentials: true
            });
            const { user, role } = response.data;
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmail', user.email);
            if (role === 'OWNER') {
                navigate('/owner-dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            console.error('Error response:', err.response);
            console.error('Error request:', err.request);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else if (err.response) {
                setError(`Server error: ${err.response.status} ${err.response.statusText}`);
            } else if (err.request) {
                setError('No response from server. Is the backend running on http://localhost:8080?');
            } else {
                setError('Request failed: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Box className="login-box">
                <Typography variant="h5" gutterBottom>Login</Typography>
                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        type="email"
                    />
                    <TextField
                        label="Password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        type="password"
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                </form>
            </Box>
        </div>
    );
}

export default Login;