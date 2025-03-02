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
                <Button color="inherit" component={Link} to="/inventoryManagement">
                    Inventory
                </Button>
                <Button color="inherit" component={Link} to="/employeeManagement">
                    Employees
                </Button>
                <Button color="inherit" component={Link} to="/supplierManagement">
                    Suppliers
                </Button>
                <Button color="inherit" component={Link} to="/report">
                    Sales
                </Button>
                <Button color="inherit" component={Link} to="/payment">
                    Payment
                </Button>
                <Button color="inherit" component={Link} to="/view">
                    ViewReport
                </Button>
                <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default OwnerNavbar;