// src/components/EmployeeNavbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const EmployeeNavbar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Employee Dashboard
                </Typography>
                <Button color="inherit" component={Link} to="/employee-sales-report">
                    Sales Report
                </Button>
                {/* Add other navigation items as needed */}
                <Button color="inherit" component={Link} to="/">
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default EmployeeNavbar;