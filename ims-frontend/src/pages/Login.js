import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    InputAdornment,
    Paper,
    Link,
    useTheme
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import axios from 'axios';
import shoeImage from '../images/download.jpg'; // Adjust path if needed

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:8080/api/login',
                { email, password },
                { withCredentials: true }
            );
            const { user, role } = response.data;
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmail', user.email);
            if (role === 'OWNER') {
                navigate('/owner-dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
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
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #f7f3ec 0%, #e6a1a1 100%)',
                transition: 'background 0.5s',
            }}
        >
            <Paper
                elevation={12}
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    maxWidth: 900,
                    width: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px 0 rgba(230,161,161,0.15)',
                    background: '#fff',
                }}
            >
                {/* Image Section */}
                <Box
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        width: { md: 390 },
                        minHeight: 420,
                        height: '100%',
                        position: 'relative',
                        borderRadius: '0 24px 24px 0',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        background: '#fff',
                    }}
                    aria-label="Shoe shop image"
                >
                    <img
                        src={shoeImage}
                        alt="Shoe"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            borderRadius: '0 24px 24px 0',
                        }}
                    />
                    {/* Soft overlay for effect */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            background: 'linear-gradient(120deg, rgba(247,243,236,0.3) 0%, rgba(230,161,161,0.15) 100%)',
                            zIndex: 1,
                        }}
                    />
                </Box>

                {/* Form Section */}
                <Box
                    sx={{
                        flex: 1,
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 6 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                    }}
                >
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontFamily: theme.typography.subtitle1.fontFamily,
                            fontWeight: 'bold',
                            fontSize: { xs: '2.2rem', md: '3rem' },
                            color: '#4B3D3D',
                            letterSpacing: 2,
                            textShadow: '0 4px 18px #f1e1d3, 0 1px 0 #fff',
                            mb: 1.5,
                            lineHeight: 1.1,
                            textTransform: 'uppercase',
                            transition: 'color 0.3s',
                            borderBottom: '3px solid #e6a1a1',
                            display: 'inline-block',
                            px: 1.5,
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px #f4d3c4',
                        }}
                    >
                        Sarasi Shoe Corner
                    </Typography>

                    <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{
                            mb: 3,
                            color: '#b7c7d6',
                            fontWeight: 500,
                            fontSize: '1.2rem',
                        }}
                    >
                        Step in style. Welcome back!
                    </Typography>
                    <form onSubmit={handleLogin} autoComplete="on">
                        <TextField
                            label="Email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            type="email"
                            autoFocus
                            InputLabelProps={{
                                style: { color: '#3a2d23', fontWeight: 500 },
                            }}
                            InputProps={{
                                style: { color: '#222', background: '#f7f3ec', borderRadius: 8 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: '#b7c7d6' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#b7c7d6' },
                                    '&:hover fieldset': { borderColor: '#e6a1a1' },
                                    '&.Mui-focused fieldset': { borderColor: '#e6a1a1' },
                                }
                            }}
                        />
                        <TextField
                            label="Password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type="password"
                            InputLabelProps={{
                                style: { color: '#3a2d23', fontWeight: 500 },
                            }}
                            InputProps={{
                                style: { color: '#222', background: '#f7f3ec', borderRadius: 8 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: '#e6a1a1' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 1,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#b7c7d6' },
                                    '&:hover fieldset': { borderColor: '#e6a1a1' },
                                    '&.Mui-focused fieldset': { borderColor: '#e6a1a1' },
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Link
                                href="#"
                                underline="hover"
                                sx={{
                                    fontSize: '0.97rem',
                                    color: '#e6a1a1',
                                    fontWeight: 500,
                                    '&:hover': { color: '#b7c7d6' },
                                    transition: 'color 0.2s',
                                }}
                                tabIndex={0}
                                aria-label="Forgot password"
                            >
                                Forgot password?
                            </Link>
                        </Box>
                        {error && (
                            <Typography color="error" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 1,
                                py: 1.5,
                                fontWeight: 'bold',
                                fontSize: '1.07rem',
                                borderRadius: 3,
                                background: 'linear-gradient(90deg, #b7c7d6 0%, #e6a1a1 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 16px #f8d6d0',
                                letterSpacing: 1,
                                transition: 'background 0.4s, box-shadow 0.3s',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #e6a1a1 0%, #b7c7d6 100%)',
                                    boxShadow: '0 6px 20px #e6a1a1',
                                    color: '#fff',
                                },
                            }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>
                    </form>
                </Box>
            </Paper>
        </Box>
    );
}

export default Login;
