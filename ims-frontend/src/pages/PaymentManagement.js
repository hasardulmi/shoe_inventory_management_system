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
    MenuItem,
} from '@mui/material';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';

const PaymentManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year

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

    // Handle marking an employee as paid for the selected month and year
    const handleMarkAsPaid = async (employeeId) => {
        try {
            const employee = employees.find(emp => emp.id === employeeId);
            if (!employee) {
                console.error('Employee not found');
                return;
            }

            // Check if the payment for the selected month and year already exists
            const existingPaymentIndex = employee.paymentHistory?.findIndex(
                payment => payment.month === selectedMonth && payment.year === selectedYear
            );

            let updatedPaymentHistory;
            if (existingPaymentIndex !== -1) {
                // Update the existing payment
                updatedPaymentHistory = [...employee.paymentHistory];
                updatedPaymentHistory[existingPaymentIndex] = {
                    ...updatedPaymentHistory[existingPaymentIndex],
                    paid: true,
                };
            } else {
                // Add a new payment
                updatedPaymentHistory = [
                    ...(employee.paymentHistory || []),
                    {
                        month: selectedMonth,
                        year: selectedYear,
                        paid: true,
                    },
                ];
            }

            const updatedEmployee = {
                ...employee,
                paymentHistory: updatedPaymentHistory,
            };

            // Update the employee on the server
            await axios.put(`http://localhost:8080/api/employees/${employee.id}`, updatedEmployee);

            // Update the employees state locally to reflect the changes immediately
            const updatedEmployees = employees.map(emp =>
                emp.id === employeeId ? updatedEmployee : emp
            );
            setEmployees(updatedEmployees); // Update the state
        } catch (error) {
            console.error('Error marking payment as paid:', error);
            if (error.response) {
                console.error('Response Data:', error.response.data);
                console.error('Response Status:', error.response.status);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Payment Management
                </Typography>

                {/* Month and Year Selection */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <TextField
                        select
                        label="Month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Year"
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    />
                </Box>

                {/* Payment Details Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Job Title</TableCell>
                                <TableCell>Salary</TableCell>
                                <TableCell>Payment Status</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.map((employee) => {
                                const currentMonthPayment = employee.paymentHistory?.find(
                                    payment => payment.month === selectedMonth && payment.year === selectedYear
                                );
                                return (
                                    <TableRow key={employee.id}>
                                        <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                                        <TableCell>{employee.jobTitle}</TableCell>
                                        <TableCell>Rs.{employee.salary}</TableCell>
                                        <TableCell>
                                            {currentMonthPayment ? (currentMonthPayment.paid ? 'Paid' : 'Unpaid') : 'Unpaid'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleMarkAsPaid(employee.id)}
                                                disabled={currentMonthPayment?.paid}
                                            >
                                                Mark as Paid
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
};

export default PaymentManagement;