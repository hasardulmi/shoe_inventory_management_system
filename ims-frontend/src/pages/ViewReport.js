import React from 'react';
import { Typography, Box } from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';

const   ViewReports = () => {
    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1">
                    View Reports
                </Typography>
                <Typography variant="body1">
                    This is the View Reports page.
                </Typography>
            </Box>
        </>
    );
};

export default ViewReports;