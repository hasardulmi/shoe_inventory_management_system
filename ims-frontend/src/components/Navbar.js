import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const NavBar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    SARASI SHOE CORNER!
                </Typography>
                <Button color="inherit" component={Link} to="/register">
                    Register
                </Button>
                <Button color="inherit" component={Link} to="/login">
                    Login
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;