import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        hireDate: '',
        jobTitle: '',
        address: '',
        salary: '',
    });
    const [errors, setErrors] = useState({});

    // Fetch all employees
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

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' }); // Clear validation error
    };

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email address must include @gmail.com';
        }
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be 10 digits';
        }
        if (!formData.hireDate) newErrors.hireDate = 'Hire date is required';
        if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.salary) newErrors.salary = 'Salary is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission (add or update employee)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (selectedEmployee) {
                await axios.put(`http://localhost:8080/api/employees/${selectedEmployee.id}`, formData);
            } else {
                await axios.post('http://localhost:8080/api/employees', formData);
            }
            fetchEmployees(); // Refresh the employee list
            setSelectedEmployee(null); // Clear the selected employee
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                hireDate: '',
                jobTitle: '',
                address: '',
                salary: '',
            });
            setAddDialogOpen(false); // Close the dialog
        } catch (error) {
            console.error('Error saving employee:', error);
        }
    };

    // Handle employee edit
    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phoneNumber: employee.phoneNumber,
            hireDate: employee.hireDate,
            jobTitle: employee.jobTitle,
            address: employee.address,
            salary: employee.salary,
        });
        setAddDialogOpen(true); // Open the dialog
    };

    // Handle employee deletion
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/employees/${id}`);
            fetchEmployees(); // Refresh the employee list
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Employee Management
                </Typography>

                {/* Add Employee Button */}
                <Button variant="contained" onClick={() => setAddDialogOpen(true)} sx={{ mb: 2 }}>
                    Add New Employee
                </Button>

                {/* Employee List */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Employee List
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone Number</TableCell>
                                    <TableCell>Hire Date</TableCell>
                                    <TableCell>Job Title</TableCell>
                                    <TableCell>Salary</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.phoneNumber}</TableCell>
                                        <TableCell>{employee.hireDate}</TableCell>
                                        <TableCell>{employee.jobTitle}</TableCell>
                                        <TableCell>Rs.{employee.salary}</TableCell>
                                        <TableCell>{employee.address}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEdit(employee)}>Edit</Button>
                                            <Button onClick={() => handleDelete(employee.id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Add/Edit Employee Dialog */}
                <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                    <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                <TextField
                                    name="firstName"
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                    required
                                />
                                <TextField
                                    name="lastName"
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                    required
                                />
                                <TextField
                                    name="email"
                                    label="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    required
                                />
                                <TextField
                                    name="phoneNumber"
                                    label="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber}
                                    required
                                />
                                <TextField
                                    name="hireDate"
                                    label="Hire Date"
                                    type="date"
                                    value={formData.hireDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.hireDate}
                                    helperText={errors.hireDate}
                                    required
                                />
                                <TextField
                                    name="jobTitle"
                                    label="Job Title"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    error={!!errors.jobTitle}
                                    helperText={errors.jobTitle}
                                    required
                                />
                                <TextField
                                    name="salary"
                                    label="Salary"
                                    type="number"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    error={!!errors.salary}
                                    helperText={errors.salary}
                                    required
                                />
                                <TextField
                                    name="address"
                                    label="Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    error={!!errors.address}
                                    helperText={errors.address}
                                    required
                                />
                            </Box>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained">
                            {selectedEmployee ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default EmployeeManagement;