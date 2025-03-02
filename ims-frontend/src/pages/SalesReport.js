import React from 'react';
import { Typography, Box } from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';

const  SalesReport = () => {
    return (
        <>
            <OwnerNavbar />
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

export default SalesReport;