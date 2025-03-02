import React from 'react';
import { Typography, Box } from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';

const Profile = () => {
    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1">
                    Profile
                </Typography>
                <Typography variant="body1">
                    This is the profile page.
                </Typography>
            </Box>
        </>
    );
};

export default Profile;