import React from 'react';
import { Typography, Box } from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';

const  OwnerDashboard = () => {
    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1">
                    Owner Dashboard
                </Typography>
                <Typography variant="body1">
                    This is the Owner Dashboard page.
                </Typography>
            </Box>
        </>
    );
};

export default OwnerDashboard;