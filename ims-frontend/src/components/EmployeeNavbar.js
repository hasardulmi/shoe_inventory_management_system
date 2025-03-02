import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';



function handleLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
}

const EmployeeNavbar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    SARASI SHOE CORNER!
                </Typography>
                <Button color="inherit" component={Link} to="/EmployeeProfile">
                    Profile
                </Button>
                <Button color="inherit" component={Link} to="/EmployeeSalesReport">
                    SalesReport
                </Button>
                <Button color="inherit" component={Link} to="/employee-dashboard">
                    EmployeeDashboard
                </Button>
                <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default EmployeeNavbar;