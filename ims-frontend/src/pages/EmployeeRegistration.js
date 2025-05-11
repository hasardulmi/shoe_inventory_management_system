import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    CircularProgress,
    Box,
    Paper,
    Snackbar,
    Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

// Configure Axios to include credentials for session-based authentication
axios.defaults.withCredentials = true;

function EmployeeRegistration() {
    const [open, setOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        firstName: '',
        lastName: '',
        address: '',
        phoneNumber: '',
        email: '',
        jobTitle: 'Employee',
        salary: '',
        hireDate: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const navigate = useNavigate();

    const BASE_URL = 'http://localhost:8080';

    // Check session and fetch employees on mount
    useEffect(() => {
        const checkSessionAndFetch = async () => {
            try {
                const role = localStorage.getItem('userRole');
                if (role !== 'OWNER') {
                    navigate('/login');
                    return;
                }
                await fetchEmployees();
            } catch (err) {
                console.error('Session check failed:', err);
                navigate('/login');
            }
        };
        checkSessionAndFetch();
    }, [navigate]);

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${BASE_URL}/api/employees`);
            const employeeData = response.data.map(user => {
                let hireDateStr = '';
                if (user.hire_date) {
                    if (Array.isArray(user.hire_date)) {
                        // Handle array format [year, month, day]
                        const [year, month, day] = user.hire_date;
                        hireDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    } else if (typeof user.hire_date === 'string') {
                        hireDateStr = user.hire_date.split('T')[0]; // Handle ISO string
                    } else if (user.hire_date instanceof Object && user.hire_date.hasOwnProperty('year')) {
                        // Handle object format { year, month, day }
                        hireDateStr = `${user.hire_date.year}-${String(user.hire_date.month).padStart(2, '0')}-${String(user.hire_date.day).padStart(2, '0')}`;
                    } else {
                        hireDateStr = user.hire_date.toString().split('T')[0] || user.hire_date.toString();
                    }
                }
                console.log('User hire_date:', user.hire_date, 'Processed hireDateStr:', hireDateStr); // Debug log
                return {
                    id: user.id,
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    address: user.address || '',
                    phoneNumber: user.phoneNumber || '',
                    email: user.email || '',
                    jobTitle: user.job_title || 'Employee',
                    salary: user.salary || 0,
                    hireDate: hireDateStr,
                    role: user.role || ''
                };
            });
            console.log('Raw API Response:', response.data);
            console.log('Mapped Employees:', employeeData);
            setEmployees(employeeData);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError(`Failed to load employees: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setEmailError('');
        setError('');
        setSuccess('');

        if (!isUpdate) { // Only validate password when adding a new employee
            if (formData.password !== formData.confirmPassword) {
                setPasswordError('Passwords do not match');
                return;
            }
            if (!formData.password) {
                setPasswordError('Password is required');
                return;
            }
        }

        const salary = parseFloat(formData.salary);
        if (isNaN(salary) || salary < 0) {
            setError('Salary must be a valid positive number');
            return;
        }

        const payload = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            job_title: formData.jobTitle,
            role: formData.jobTitle.toUpperCase(),
            salary: salary,
            hire_date: formData.hireDate,
            ...(formData.password && { password: formData.password })
        };
        console.log('Submitting Payload:', payload);

        try {
            setLoading(true);
            if (isUpdate) {
                await axios.put(`${BASE_URL}/api/employees/${formData.id}`, payload);
                setSuccess('Employee updated successfully!');
            } else {
                await axios.post(`${BASE_URL}/api/register-employee`, payload);
                setSuccess('Employee added successfully!');
            }
            setOpen(false);
            fetchEmployees();
            resetForm();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorMessage = error.response.data.error;
                if (errorMessage.includes("Email already exists")) {
                    setEmailError('Email already exists');
                } else {
                    setError(errorMessage || 'Failed to save employee');
                }
            } else {
                console.error('Error submitting form:', error);
                setError('Failed to save employee: Network Error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`${BASE_URL}/api/employees/${id}`);
            setSuccess('Employee deleted successfully!');
            setDeleteConfirm(null);
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            setError(`Failed to delete employee: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (employee) => {
        setFormData({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            address: employee.address,
            phoneNumber: employee.phoneNumber,
            email: employee.email,
            jobTitle: employee.jobTitle,
            salary: employee.salary || '',
            hireDate: employee.hireDate || '',
            password: '',
            confirmPassword: ''
        });
        setIsUpdate(true);
        setOpen(true);
    };

    const resetForm = () => {
        setFormData({
            id: null,
            firstName: '',
            lastName: '',
            address: '',
            phoneNumber: '',
            email: '',
            jobTitle: 'Employee',
            salary: '',
            hireDate: '',
            password: '',
            confirmPassword: ''
        });
        setPasswordError('');
        setEmailError('');
        setError('');
        setIsUpdate(false);
    };

    const handleOpenDeleteConfirm = (id) => {
        setDeleteConfirm(id);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm(null);
    };

    const formatDate = (date) => {
        if (!date || date === 'N/A') return 'N/A';
        return typeof date === 'string' ? date.split('T')[0] : date.toString().split('T')[0];
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{
                p: { xs: 2, md: 4 },
                bgcolor: '#fff',
                minHeight: '100vh',
                fontFamily: 'Roboto, sans-serif'
            }}>
                <Typography
                    variant="h4"
                    sx={{
                        mb: 4,
                        color: '#000000',
                        fontWeight: 600,
                        textAlign: 'center',
                        letterSpacing: 0.5
                    }}
                >
                    Employee Management
                </Typography>

                <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                    <Alert onClose={() => setError('')} severity="error" sx={{
                        width: '100%',
                        bgcolor: '#ff5e62',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}>
                        {error}
                    </Alert>
                </Snackbar>
                <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                    <Alert onClose={() => setSuccess('')} severity="success" sx={{
                        width: '100%',
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}>
                        {success}
                    </Alert>
                </Snackbar>

                <Button
                    variant="contained"
                    onClick={() => { resetForm(); setOpen(true); }}
                    disabled={loading}
                    sx={{
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        borderRadius: '8px',
                        px: 3,
                        py: 1.5,
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(83, 209, 182, 0.2)',
                        '&:hover': {
                            bgcolor: '#46b69d',
                            boxShadow: '0 4px 12px rgba(83, 209, 182, 0.3)'
                        }
                    }}
                >
                    Add Employee
                </Button>

                {loading && !open ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{
                            mt: 4,
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)',
                            maxHeight: '600px',
                            overflowY: 'auto',
                            bgcolor: '#fff',
                            '& .MuiTableHead-root': {
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                                backgroundColor: '#4ecdc4',
                            },
                        }}
                    >
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #45b7aa',
                                        backgroundColor: '#4ecdc4',
                                        py: 2,
                                        px: 3
                                    }}>
                                        Name
                                    </TableCell>
                                    <TableCell sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #45b7aa',
                                        backgroundColor: '#4ecdc4',
                                        py: 2,
                                        px: 3
                                    }}>
                                        Email
                                    </TableCell>
                                    <TableCell sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #45b7aa',
                                        backgroundColor: '#4ecdc4',
                                        py: 2,
                                        px: 3
                                    }}>
                                        Address
                                    </TableCell>
                                    <TableCell sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #45b7aa',
                                        backgroundColor: '#4ecdc4',
                                        py: 2,
                                        px: 3
                                    }}>
                                        Phone Number
                                    </TableCell>
                                    <TableCell sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #45b7aa',
                                        backgroundColor: '#4ecdc4',
                                        py: 2,
                                        px: 3
                                    }}>
                                        Job Title
                                    </TableCell>
                                    <TableCell sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #45b7aa',
                                        backgroundColor: '#4ecdc4',
                                        py: 2,
                                        px: 3
                                    }}>
                                        Salary
                                    </TableCell>
                                    <TableCell sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #45b7aa',
                                        backgroundColor: '#4ecdc4',
                                        py: 2,
                                        px: 3
                                    }}>
                                        Hire Date
                                    </TableCell>
                                    <TableCell sx={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #45b7aa',
                                        backgroundColor: '#4ecdc4',
                                        py: 2,
                                        px: 3
                                    }}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body2" color="#000000" sx={{ py: 4 }}>
                                                No employees found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employees.map((emp) => (
                                        <TableRow
                                            key={emp.id}
                                            sx={{
                                                bgcolor: '#fff',
                                                '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.05)' }
                                            }}
                                        >
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {`${emp.firstName} ${emp.lastName}`}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {emp.email}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {emp.address}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {emp.phoneNumber}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {emp.jobTitle}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {formatCurrency(emp.salary)}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000', py: 2, px: 3 }}>
                                                {formatDate(emp.hireDate)}
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Button
                                                    onClick={() => handleUpdate(emp)}
                                                    sx={{ mr: 1, color: '#4ecdc4', '&:hover': { bgcolor: 'rgba(78, 205, 196, 0.1)' } }}
                                                >
                                                    Update
                                                </Button>
                                                <Button
                                                    onClick={() => handleOpenDeleteConfirm(emp.id)}
                                                    color="error"
                                                    sx={{ color: '#ff5e62', '&:hover': { bgcolor: 'rgba(255, 94, 98, 0.1)' } }}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
                        sx={{
                            '& .MuiDialog-paper': {
                                borderRadius: '12px',
                                boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)'
                            }
                        }}
                >
                    <DialogTitle sx={{
                        bgcolor: '#53d1b6',
                        color: '#fff',
                        py: 2,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px'
                    }}>
                        {isUpdate ? 'Update Employee' : 'Add Employee'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, bgcolor: '#fff' }}>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="First Name"
                                fullWidth
                                margin="normal"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#e3e8ee' },
                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#000000',
                                        '&.Mui-focused': { color: '#6c63ff' }
                                    }
                                }}
                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                margin="normal"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#e3e8ee' },
                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#000000',
                                        '&.Mui-focused': { color: '#6c63ff' }
                                    }
                                }}
                            />
                            <TextField
                                label="Address"
                                fullWidth
                                margin="normal"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#e3e8ee' },
                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#000000',
                                        '&.Mui-focused': { color: '#6c63ff' }
                                    }
                                }}
                            />
                            <TextField
                                label="Phone Number"
                                fullWidth
                                margin="normal"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#e3e8ee' },
                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#000000',
                                        '&.Mui-focused': { color: '#6c63ff' }
                                    }
                                }}
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                margin="normal"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    setEmailError('');
                                }}
                                required
                                type="email"
                                InputLabelProps={{ shrink: true }}
                                error={!!emailError}
                                helperText={emailError}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#e3e8ee' },
                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#000000',
                                        '&.Mui-focused': { color: '#6c63ff' }
                                    }
                                }}
                            />
                            <FormControl fullWidth margin="normal" required
                                         sx={{
                                             '& .MuiOutlinedInput-root': {
                                                 borderRadius: '8px',
                                                 '& fieldset': { borderColor: '#e3e8ee' },
                                                 '&:hover fieldset': { borderColor: '#6c63ff' },
                                                 '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                             },
                                             '& .MuiInputLabel-root': {
                                                 color: '#000000',
                                                 '&.Mui-focused': { color: '#6c63ff' }
                                             }
                                         }}
                            >
                                <InputLabel shrink>Job Title</InputLabel>
                                <Select
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    label="Job Title"
                                >
                                    <MenuItem value="Employee">Employee</MenuItem>
                                    <MenuItem value="Owner">Owner</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Salary"
                                fullWidth
                                margin="normal"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                required
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#e3e8ee' },
                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#000000',
                                        '&.Mui-focused': { color: '#6c63ff' }
                                    }
                                }}
                            />
                            <TextField
                                label="Hire Date"
                                fullWidth
                                margin="normal"
                                value={formData.hireDate}
                                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                required
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#e3e8ee' },
                                        '&:hover fieldset': { borderColor: '#6c63ff' },
                                        '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#000000',
                                        '&.Mui-focused': { color: '#6c63ff' }
                                    }
                                }}
                            />
                            {!isUpdate && ( // Show password fields only when adding a new employee
                                <>
                                    <TextField
                                        label="Password"
                                        fullWidth
                                        margin="normal"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        type="password"
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                '& fieldset': { borderColor: '#e3e8ee' },
                                                '&:hover fieldset': { borderColor: '#6c63ff' },
                                                '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#000000',
                                                '&.Mui-focused': { color: '#6c63ff' }
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="Confirm Password"
                                        fullWidth
                                        margin="normal"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        type="password"
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        error={!!passwordError}
                                        helperText={passwordError}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                '& fieldset': { borderColor: '#e3e8ee' },
                                                '&:hover fieldset': { borderColor: '#6c63ff' },
                                                '&.Mui-focused fieldset': { borderColor: '#6c63ff' }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#000000',
                                                '&.Mui-focused': { color: '#6c63ff' }
                                            }
                                        }}
                                    />
                                </>
                            )}
                        </form>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#fff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <Button
                            onClick={() => setOpen(false)}
                            variant="outlined"
                            sx={{
                                borderColor: '#e3e8ee',
                                color: '#000000',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#6c63ff',
                                    bgcolor: 'rgba(108, 99, 255, 0.05)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{
                                bgcolor: '#53d1b6',
                                color: '#fff',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#46b69d',
                                    boxShadow: '0 2px 8px rgba(83, 209, 182, 0.3)'
                                },
                                '&:disabled': {
                                    bgcolor: '#e3e8ee',
                                    color: '#6b7280'
                                }
                            }}
                        >
                            {isUpdate ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={!!deleteConfirm}
                    onClose={handleCloseDeleteConfirm}
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px 0 rgba(39, 68, 114, 0.08)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        color: '#000000',
                        fontWeight: 600,
                        borderBottom: '1px solid #e3e8ee'
                    }}>
                        Confirm Delete
                    </DialogTitle>
                    <DialogContent sx={{ bgcolor: '#fff' }}>
                        <Typography>
                            Are you sure you want to delete this employee?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: '#fff' }}>
                        <Button
                            onClick={handleCloseDeleteConfirm}
                            variant="outlined"
                            sx={{
                                borderColor: '#e3e8ee',
                                color: '#000000',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#6c63ff',
                                    bgcolor: 'rgba(108, 99, 255, 0.05)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleDelete(deleteConfirm)}
                            color="error"
                            sx={{
                                bgcolor: '#ff5e62',
                                color: '#fff',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#e04e51',
                                    boxShadow: '0 2px 8px rgba(255, 94, 98, 0.3)'
                                },
                                '&:disabled': {
                                    bgcolor: '#e3e8ee',
                                    color: '#6b7280'
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <style>
                {`
                    body {
                        font-family: 'Roboto', sans-serif;
                    }

                    @media print {
                        body {
                            margin: 0;
                            padding: 20px;
                        }
                        .filter-section, .MuiTabs-root {
                            display: none;
                        }
                        .table-container {
                            box-shadow: none;
                            max-height: none;
                            overflow-y: visible;
                        }
                        .table {
                            page-break-inside: auto;
                        }
                        .table tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                    }
                `}
            </style>
        </>
    );
}

const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00';
    }
    return Number(value).toFixed(2);
};

export default EmployeeRegistration;