import React from 'react';
import { Typography, Box } from '@mui/material';
import EmployeeNavbar from '../components/EmployeeNavbar';

const EmployeeProfile = () => {
    return (
        <>
            <EmployeeNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1">
                    Employee Profile
                </Typography>
                <Typography variant="body1">
                    This is the profile page.
                </Typography>
            </Box>
        </>
    );
};

export default EmployeeProfile;