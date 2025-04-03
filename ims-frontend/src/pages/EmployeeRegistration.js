// src/components/OwnerDashboard.js
import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography
} from '@mui/material';
import axios from 'axios';
import './styles.css';
import OwnerNavbar from "../components/OwnerNavbar";

function EmployeeRegistration() {
    const [open, setOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        id: null, // Added for update functionality
        firstName: '',
        lastName: '',
        address: '',
        phoneNumber: '',
        email: '',
        jobTitle: '',
        salary: '',
        hireDate: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState(''); // State for email uniqueness error
    const [isUpdate, setIsUpdate] = useState(false); // Flag to determine if it's an update or add

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        setPasswordError('');

        // Prepare payload
        const payload = {
            ...formData,
            role: formData.jobTitle.toUpperCase()
        };

        try {
            if (isUpdate) {
                // Update existing employee
                await axios.put(`http://localhost:8080/api/employees/${formData.id}`, payload);
            } else {
                // Check email uniqueness for new registration
                const emailExists = employees.some(emp => emp.email === formData.email);
                if (emailExists) {
                    setEmailError('Email already exists');
                    return;
                }
                await axios.post('http://localhost:8080/api/register-employee', payload);
            }
            setOpen(false);
            fetchEmployees();
            resetForm();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setEmailError('Email already exists');
            } else {
                console.error('Error submitting form:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/employees/${id}`);
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
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
            salary: employee.salary,
            hireDate: employee.hireDate,
            password: '', // Don't prefill password
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
            jobTitle: '',
            salary: '',
            hireDate: '',
            password: '',
            confirmPassword: ''
        });
        setPasswordError('');
        setEmailError('');
        setIsUpdate(false);
    };

    return (
        <>
            <OwnerNavbar />
            <div className="dashboard-container">
                <div className="dashboard-box">
                    <Button variant="contained" onClick={() => { resetForm(); setOpen(true); }}>
                        Add Employee
                    </Button>

                    <Table sx={{ mt: 2 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Job Title</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell>{`${emp.firstName} ${emp.lastName}`}</TableCell>
                                    <TableCell>{emp.email}</TableCell>
                                    <TableCell>{emp.jobTitle}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleUpdate(emp)} sx={{ mr: 1 }}>Update</Button>
                                        <Button onClick={() => handleDelete(emp.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Dialog open={open} onClose={() => setOpen(false)}>
                        <form onSubmit={handleSubmit} style={{ padding: '20px', minWidth: '300px' }}>
                            <TextField
                                label="First Name"
                                fullWidth
                                margin="normal"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                margin="normal"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            <TextField
                                label="Address"
                                fullWidth
                                margin="normal"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            <TextField
                                label="Phone Number"
                                fullWidth
                                margin="normal"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                margin="normal"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({...formData, email: e.target.value});
                                    setEmailError(''); // Clear error when typing
                                }}
                                required
                                type="email"
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            {emailError && (
                                <Typography color="error" sx={{ mt: 1, fontSize: '0.9rem' }}>
                                    {emailError}
                                </Typography>
                            )}
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel
                                    shrink
                                    sx={{ fontSize: '0.9rem' }}
                                >
                                    Job Title
                                </InputLabel>
                                <Select
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                                    label="Job Title"
                                >
                                    <MenuItem value="Owner">Owner</MenuItem>
                                    <MenuItem value="Employee">Employee</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Salary"
                                fullWidth
                                margin="normal"
                                value={formData.salary}
                                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                required
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            <TextField
                                label="Hire Date"
                                fullWidth
                                margin="normal"
                                value={formData.hireDate}
                                onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                                required
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            <TextField
                                label="Password"
                                fullWidth
                                margin="normal"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required={!isUpdate} // Not required for update
                                type="password"
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            <TextField
                                label="Confirm Password"
                                fullWidth
                                margin="normal"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                required={!isUpdate} // Not required for update
                                type="password"
                                InputLabelProps={{
                                    shrink: true,
                                    sx: { fontSize: '0.9rem' }
                                }}
                            />
                            {passwordError && (
                                <Typography color="error" sx={{ mt: 1, fontSize: '0.9rem' }}>
                                    {passwordError}
                                </Typography>
                            )}
                            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                                {isUpdate ? 'Update' : 'Register'}
                            </Button>
                        </form>
                    </Dialog>
                </div>
            </div>
        </>
    );
}

export default EmployeeRegistration;