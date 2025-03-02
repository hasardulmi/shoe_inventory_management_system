import React from 'react';
import { Typography, Box } from '@mui/material';
import EmployeeNavbar from '../components/EmployeeNavbar';

const  EmployeeSalesReport = () => {
    return (
        <>
            <EmployeeNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1">
                    Sales Report
                </Typography>
                <Typography variant="body1">
                    This is the sales report page.
                </Typography>
            </Box>
        </>
    );
};

export default EmployeeSalesReport;