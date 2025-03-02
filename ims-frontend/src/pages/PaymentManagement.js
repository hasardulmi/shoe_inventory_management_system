import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';
import SalaryPaymentDialog from '../components/SalaryPaymentDialog';

const PaymentManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

    // Fetch all employees
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/employees');
            console.log('API Response:', response.data); // Log the response
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Handle salary payment dialog open
    const handleSalaryDialogOpen = (employeeId) => {
        setSelectedEmployeeId(employeeId);
        setSalaryDialogOpen(true);
    };

    // Handle salary payment dialog close
    const handleSalaryDialogClose = () => {
        setSalaryDialogOpen(false);
    };

    // Handle salary payment save
    const handleSalaryPaymentSave = (paymentData) => {
        const updatedEmployees = employees.map(employee => {
            if (employee.id === paymentData.employeeId) {
                return { ...employee, salaryStatus: paymentData.paid ? 'Paid' : 'Unpaid' };
            }
            return employee;
        });
        setEmployees(updatedEmployees);
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Payment Management
                </Typography>

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
                                    <TableCell>Job Title</TableCell>
                                    <TableCell>Salary</TableCell>
                                    <TableCell>Salary Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.jobTitle}</TableCell>
                                        <TableCell>${employee.salary}</TableCell>
                                        <TableCell>{employee.salaryStatus || 'Unpaid'}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleSalaryDialogOpen(employee.id)}>Manage Salary</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Salary Payment Dialog */}
                <SalaryPaymentDialog
                    open={salaryDialogOpen}
                    onClose={handleSalaryDialogClose}
                    employeeId={selectedEmployeeId}
                    onSave={handleSalaryPaymentSave}
                />
            </Box>
        </>
    );
};

export default PaymentManagement;