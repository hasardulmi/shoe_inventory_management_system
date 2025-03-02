import React from 'react';
import { Typography, Box } from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';

const SupplierManagement = () => {
    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1">
                    Supplier Management
                </Typography>
                <Typography variant="body1">
                    This is the supplier Management page.
                </Typography>
            </Box>
        </>
    );
};

export default SupplierManagement;