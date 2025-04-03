// src/components/OwnerDashboard.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

function OwnerDashboard() {
    return (
        <>
            <OwnerNavbar />
            <Container className="dashboard-container">
                <Box className="dashboard-box">
                    <Typography variant="h4" gutterBottom align="center">Owner Dashboard</Typography>
                    <Typography variant="h6" gutterBottom>Welcome, Owner!</Typography>
                </Box>
            </Container>
        </>
    );
}

export default OwnerDashboard;