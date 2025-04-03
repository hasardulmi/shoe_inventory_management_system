// src/components/EmployeeDashboard.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import EmployeeNavbar from '../components/EmployeeNavbar';
import './styles.css';

function EmployeeDashboard() {
    return (
        <>
            <EmployeeNavbar />
            <Container className="dashboard-container">
                <Box className="dashboard-box">
                    <Typography variant="h4" gutterBottom align="center">Employee Dashboard</Typography>
                    <Typography variant="h6" gutterBottom>Welcome, Employee!</Typography>
                </Box>
            </Container>
        </>
    );
}

export default EmployeeDashboard;