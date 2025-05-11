import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

// Enhanced 2025 color palette that matches your dashboard
const palette = {
    background: 'rgba(235, 242, 250, 0.8)',       // soft glass bg
    navBg: 'linear-gradient(90deg, rgba(181, 199, 231, 0.85) 0%, rgba(235, 242, 250, 0.75) 100%)',
    primary: '#b5c7e7',
    secondary: '#8592e5',
    accent: '#efb5b5',
    success: '#7bcea0',
    warning: '#f8c175',
    textDark: '#1a2639',
    textSecondary: '#5a6e8c',
    cardBg: 'rgba(255, 255, 255, 0.85)',
    glassShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
    glassBorder: '1px solid rgba(255, 255, 255, 0.18)',
};

function handleLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
}

const navLinks = [
    { to: '/owner-dashboard', label: 'OwnerDashboard' },
    { to: '/product-management', label: 'Products' },
    { to: '/sales', label: 'Sales' },
    { to: '/return', label: 'Return' },
    { to: '/report', label: 'Reports' },
    { to: '/employeeRegistration', label: 'Employees' },
    { to: '/supplierManagement', label: 'Suppliers' },
    { to: '/profile', label: 'Profile' },
];

const ShoeLogo = () => (
    <svg width="40" height="32" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg"
         style={{
             marginRight: 12,
             filter: 'drop-shadow(0 2px 8px rgba(26, 38, 57, 0.2))',
         }}
    >
        <rect x="1" y="19" width="34" height="7" rx="3.5" fill={palette.primary} fillOpacity="0.9"/>
        <path d="M2 19C2 14 8 4 18 4C28 4 34 14 34 19" stroke={palette.accent} strokeWidth="2" fill="rgba(255, 255, 255, 0.7)"/>
        <ellipse cx="18" cy="8" rx="4" ry="2" fill={palette.accent} fillOpacity="0.8"/>
        <circle cx="28" cy="10" r="2" fill={palette.primary}/>
        <circle cx="8" cy="10" r="2" fill={palette.primary}/>
    </svg>
);

const OwnerNavbar = () => {
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                background: palette.navBg,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: palette.glassShadow,
                borderRadius: '0 0 28px 28px',
                padding: '6px 0',
                borderBottom: palette.glassBorder,
                // marginBottom REMOVED to attach navbar to dashboard
            }}
        >
            <Toolbar sx={{ minHeight: { xs: 64, md: 80 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <ShoeLogo />
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: `'Poppins', sans-serif`,
                            fontWeight: 800,
                            color: palette.textDark,
                            letterSpacing: 1.2,
                            textShadow: '0 2px 4px rgba(181, 199, 231, 0.5)',
                            mr: 2,
                            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                            userSelect: 'none',
                        }}
                    >
                        SARASI SHOE CORNER!
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        gap: { xs: 0.5, sm: 1 },
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}
                >
                    {navLinks.map((link) => (
                        <Button
                            key={link.to}
                            color="inherit"
                            component={Link}
                            to={link.to}
                            sx={{
                                background: link.to === '/owner-dashboard'
                                    ? `linear-gradient(145deg, ${palette.secondary}, ${palette.primary})`
                                    : 'rgba(255, 255, 255, 0.75)',
                                color: link.to === '/owner-dashboard' ? '#fff' : palette.textDark,
                                fontWeight: 600,
                                borderRadius: '999px',
                                px: { xs: 1.2, sm: 1.8 },
                                py: 0.8,
                                textTransform: 'none',
                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                border: palette.glassBorder,
                                backdropFilter: 'blur(5px)',
                                WebkitBackdropFilter: 'blur(5px)',
                                boxShadow: '0 4px 11px rgba(0, 0, 0, 0.08)',
                                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                m: 0.5,
                                '&:hover': {
                                    background: `linear-gradient(145deg, ${palette.secondary}, ${palette.primary})`,
                                    color: '#fff',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.12)',
                                },
                                '&:active': {
                                    transform: 'translateY(0px)',
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            {link.label}
                        </Button>
                    ))}
                    <Button
                        color="inherit"
                        onClick={handleLogout}
                        sx={{
                            background: `linear-gradient(145deg, ${palette.accent}, #f8c0c0)`,
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: '999px',
                            px: { xs: 1.2, sm: 1.8 },
                            py: 0.8,
                            m: 0.5,
                            textTransform: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.8,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            boxShadow: '0 4px 14px rgba(239, 181, 181, 0.25)',
                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            '&:hover': {
                                background: `linear-gradient(145deg, #f8c0c0, ${palette.accent})`,
                                transform: 'translateY(-3px)',
                                boxShadow: '0 6px 18px rgba(239, 181, 181, 0.35)',
                            },
                            '&:active': {
                                transform: 'translateY(0px)',
                                boxShadow: '0 2px 5px rgba(239, 181, 181, 0.2)',
                            },
                        }}
                    >
                        <LogoutIcon sx={{ fontSize: 18 }} />
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default OwnerNavbar;
