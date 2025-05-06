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
    Paper
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
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const navigate = useNavigate();

    const BASE_URL = 'http://localhost:8080';

    // Check session and fetch employees on mount
    useEffect(() => {
        const checkSessionAndFetch = async () => {
            try {
                // Verify session by fetching current user (assumes /api/employee/self is accessible)
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
            const employeeData = response.data.filter(user =>
                user.jobTitle && user.jobTitle.toLowerCase() === 'employee'
            );
            console.log('Raw API Response:', response.data);
            console.log('Filtered Employees:', employeeData);
            setEmployees(employeeData);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError(`Failed to load employees: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setEmailError('');

        if (!isUpdate || (isUpdate && formData.password)) {
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
            setError('Salary must be a valid number');
            return;
        }

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            jobTitle: formData.jobTitle,
            role: formData.jobTitle.toUpperCase(),
            salary: salary,
            hireDate: formData.hireDate,
            ...(formData.password && { password: formData.password })
        };
        console.log('Submitting Payload:', payload);

        try {
            setLoading(true);
            if (isUpdate) {
                await axios.put(`${BASE_URL}/api/employees/${formData.id}`, payload);
            } else {
                await axios.post(`${BASE_URL}/api/register-employee`, payload);
            }
            setOpen(false);
            fetchEmployees();
            resetForm();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setEmailError('Email already exists');
            } else {
                console.error('Error submitting form:', error);
                setError('Failed to save employee');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`${BASE_URL}/api/employees/${id}`);
            setDeleteConfirm(null);
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            setError('Failed to delete employee');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (employee) => {
        setFormData({
            id: employee.id,
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            address: employee.address || '',
            phoneNumber: employee.phoneNumber || '',
            email: employee.email || '',
            jobTitle: employee.jobTitle || 'Employee',
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

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }} className="dashboard-container">
                <Typography variant="h4" gutterBottom>
                    Employee Management
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => { resetForm(); setOpen(true); }}
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    Add Employee
                </Button>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {loading && !open ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Phone Number</TableCell>
                                    <TableCell>Job Title</TableCell>
                                    <TableCell>Salary</TableCell>
                                    <TableCell>Hire Date</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No employees found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employees.map((emp) => (
                                        <TableRow key={emp.id}>
                                            <TableCell>{`${emp.firstName} ${emp.lastName}`}</TableCell>
                                            <TableCell>{emp.email}</TableCell>
                                            <TableCell>{emp.address}</TableCell>
                                            <TableCell>{emp.phoneNumber}</TableCell>
                                            <TableCell>{emp.jobTitle}</TableCell>
                                            <TableCell>{formatCurrency(emp.salary)}</TableCell>
                                            <TableCell>{emp.hireDate}</TableCell>
                                            <TableCell>
                                                <Button
                                                    onClick={() => handleUpdate(emp)}
                                                    sx={{ mr: 1 }}
                                                    disabled={loading}
                                                >
                                                    Update
                                                </Button>
                                                <Button
                                                    onClick={() => handleOpenDeleteConfirm(emp.id)}
                                                    color="error"
                                                    disabled={loading}
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

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{isUpdate ? 'Update Employee' : 'Add Employee'}</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="First Name"
                                fullWidth
                                margin="normal"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                margin="normal"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Address"
                                fullWidth
                                margin="normal"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Phone Number"
                                fullWidth
                                margin="normal"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
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
                            />
                            <FormControl fullWidth margin="normal" required>
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
                            />
                            <TextField
                                label="Password"
                                fullWidth
                                margin="normal"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                type="password"
                                required={!isUpdate}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Confirm Password"
                                fullWidth
                                margin="normal"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                type="password"
                                required={!isUpdate}
                                InputLabelProps={{ shrink: true }}
                                error={!!passwordError}
                                helperText={passwordError}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {isUpdate ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={!!deleteConfirm}
                    onClose={handleCloseDeleteConfirm}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this employee?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteConfirm} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleDelete(deleteConfirm)}
                            color="error"
                            disabled={loading}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
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