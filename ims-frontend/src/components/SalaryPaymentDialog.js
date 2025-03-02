import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import axios from 'axios';

const SalaryPaymentDialog = ({ open, onClose, employeeId, onSave }) => {
    const [paymentDate, setPaymentDate] = useState('');
    const [amount, setAmount] = useState('');
    const [paid, setPaid] = useState(false);

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/salary-payments', {
                employeeId,
                paymentDate,
                amount,
                paid
            });
            onSave(response.data); // Notify parent component
            onClose();
        } catch (error) {
            console.error('Error saving salary payment:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Salary Payment</DialogTitle>
            <DialogContent>
                <TextField
                    label="Payment Date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Paid"
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SalaryPaymentDialog;