import React from 'react';
import { Typography, Box } from '@mui/material';
import EmployeeNavbar from '../components/EmployeeNavbar';

const  EmployeeDashboard = () => {
    return (
        <>
            <EmployeeNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1">
                    Employee Dashboard
                </Typography>
                <Typography variant="body1">
                    This is the Employee Dashboard page.
                </Typography>
            </Box>
        </>
    );
};

export default  EmployeeDashboard;