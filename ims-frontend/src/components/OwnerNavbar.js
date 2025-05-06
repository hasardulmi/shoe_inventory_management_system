import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout'; // Import the logout icon


function handleLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
}

const OwnerNavbar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    SARASI SHOE CORNER!
                </Typography>
                <Button color="inherit" component={Link} to="/owner-dashboard">
                    OwnerDashboard
                </Button>
                <Button color="inherit" component={Link} to="/profile">
                    Profile
                </Button>
                <Button color="inherit" component={Link} to="/product-management">
                    Products
                </Button>
                <Button color="inherit" component={Link} to="/employeeRegistration">
                    Employees
                </Button>
                <Button color="inherit" component={Link} to="/supplierManagement">
                    Suppliers
                </Button>
                <Button color="inherit" component={Link} to="/sales">
                    Sales
                </Button>
                <Button color="inherit" component={Link} to="/return">
                    Return
                </Button>
                <Button color="inherit" component={Link} to="/payment">
                    Payment
                </Button>
                <Button color="inherit" component={Link} to="/report">
                   Reports
                </Button>
                <Button color="inherit" component={Link} to="/">
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default OwnerNavbar;