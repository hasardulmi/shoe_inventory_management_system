import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, TextField, CircularProgress
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';

// Utility function to normalize date to YYYY-MM-DD string
const normalizeDate = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    if (typeof date === 'string') return date.includes('T') ? date.split('T')[0] : date;
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
};

// Utility function to format currency safely
const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0.00';
    return Number(value).toFixed(2);
};

// Utility function to get today's date in a formal format
const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const ViewReport = () => {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [filterValue, setFilterValue] = useState(''); // Changed from categoryFilter to filterValue
    const [tabValue, setTabValue] = useState(0); // 0: Daily, 1: Monthly, 2: Yearly
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [productsResponse, salesResponse] = await Promise.all([
                    axios.get(`${BASE_URL}/api/products`),
                    axios.get(`${BASE_URL}/api/sales`)
                ]);
                setProducts(productsResponse.data);
                setSales(salesResponse.data.data || salesResponse.data);
            } catch (error) {
                setError(`Failed to load report data: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Process sales data with corrected calculations
    const calculateReports = () => {
        // Filter sales by Product ID or Sale ID
        const filteredSales = filterValue
            ? sales.filter(sale => {
                const productIdMatch = sale.productId.toString().includes(filterValue);
                const saleIdMatch = sale.id.toString().includes(filterValue);
                return productIdMatch || saleIdMatch;
            })
            : sales;

        // Calculate details for each sale
        const salesDetails = filteredSales.map(sale => {
            const product = products.find(p => p.productId === sale.productId);
            if (!product) return null;

            const unitPurchasePrice = parseFloat(product.purchasePrice) || 0;
            const unitSellingPrice = parseFloat(sale.sellingPrice) || 0;
            const discount = parseFloat(sale.discount) || 0;

            // Calculate total quantity for this sale
            const totalQuantity = sale.sizeQuantities
                ? Object.values(sale.sizeQuantities).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0)
                : (parseInt(sale.quantity) || 0);

            // Calculate purchase price for this sale (Unit Purchase Price * Quantity)
            const totalPurchasePrice = unitPurchasePrice * totalQuantity;

            // Calculate total selling price for this sale (from SalesManagement.js logic)
            const totalSellingPrice = (unitSellingPrice * totalQuantity) - discount;

            // Calculate profit for this sale
            const profit = totalSellingPrice - totalPurchasePrice;

            return {
                productId: sale.productId,
                saleId: sale.id,
                productName: product.name || 'Unknown',
                totalQuantity,
                totalPurchasePrice,
                totalSellingPrice,
                discount,
                profit,
                saleDate: normalizeDate(sale.saleDate),
            };
        }).filter(sale => sale !== null);

        // Sort salesDetails by saleId in descending order (LIFO)
        salesDetails.sort((a, b) => b.saleId - a.saleId);

        // Daily report
        const dailyReport = {};
        salesDetails.forEach(sale => {
            const date = sale.saleDate;
            if (!dailyReport[date]) {
                dailyReport[date] = {
                    sales: [],
                    totalSellingPrice: 0,
                    totalPurchasePrice: 0,
                    totalProfit: 0,
                };
            }
            dailyReport[date].sales.push(sale);
            dailyReport[date].totalSellingPrice += sale.totalSellingPrice;
            dailyReport[date].totalPurchasePrice += sale.totalPurchasePrice;
            dailyReport[date].totalProfit += sale.profit;
        });

        // Monthly report
        const monthlyReport = {};
        salesDetails.forEach(sale => {
            const month = sale.saleDate.slice(0, 7);
            if (!monthlyReport[month]) {
                monthlyReport[month] = {
                    totalSellingPrice: 0,
                    totalPurchasePrice: 0,
                    totalProfit: 0,
                };
            }
            monthlyReport[month].totalSellingPrice += sale.totalSellingPrice;
            monthlyReport[month].totalPurchasePrice += sale.totalPurchasePrice;
            monthlyReport[month].totalProfit += sale.profit;
        });

        // Yearly report
        const yearlyReport = {};
        salesDetails.forEach(sale => {
            const year = sale.saleDate.slice(0, 4);
            if (!yearlyReport[year]) {
                yearlyReport[year] = {
                    totalProfit: 0,
                };
            }
            yearlyReport[year].totalProfit += sale.profit;
        });

        return { salesDetails, dailyReport, monthlyReport, yearlyReport };
    };

    const { salesDetails, dailyReport, monthlyReport, yearlyReport } = calculateReports();

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };

    const renderSummaryBox = (totalSellingPrice, totalPurchasePrice, totalProfit) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#e0f7fa', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle1">Total Selling Price: Rs. {formatCurrency(totalSellingPrice)}</Typography>
            <Typography variant="subtitle1">Total Purchase Price: Rs. {formatCurrency(totalPurchasePrice)}</Typography>
            <Typography variant="subtitle1">Total Profit: Rs. {formatCurrency(totalProfit)}</Typography>
        </Box>
    );

    const renderTable = () => {
        if (tabValue === 0) {
            return (
                <Box>
                    {Object.entries(dailyReport)
                        .sort((a, b) => new Date(b[0]) - new Date(a[0])) // Sort dates in descending order (LIFO)
                        .map(([date, data]) => (
                            <Box key={date} sx={{ mb: 4 }}>
                                <Typography variant="h6" className="section-title">
                                    Date: {date}
                                </Typography>
                                {renderSummaryBox(data.totalSellingPrice, data.totalPurchasePrice, data.totalProfit)}
                                <TableContainer component={Paper} className="table-container" sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#1976d2' }}>
                                                <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Product ID</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Sale ID</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Purchase Price</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Selling Price</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Discount</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Profit</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.sales
                                                .sort((a, b) => b.saleId - a.saleId) // Sort sales by saleId in descending order (LIFO)
                                                .slice(0, 25) // Limit to 25 items
                                                .map((sale, index) => (
                                                    <TableRow key={sale.saleId} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                                                        <TableCell>{sale.productId}</TableCell>
                                                        <TableCell>{sale.saleId}</TableCell>
                                                        <TableCell>Rs. {formatCurrency(sale.totalPurchasePrice)}</TableCell>
                                                        <TableCell>Rs. {formatCurrency(sale.totalSellingPrice)}</TableCell>
                                                        <TableCell>Rs. {formatCurrency(sale.discount)}</TableCell>
                                                        <TableCell>Rs. {formatCurrency(sale.profit)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            {data.sales.length > 25 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        <Typography variant="caption" color="textSecondary">
                                                            Scroll to view more sales...
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        ))}
                    {Object.keys(dailyReport).length === 0 && (
                        <Typography align="center" className="no-data">
                            No data available for the selected filter.
                        </Typography>
                    )}
                </Box>
            );
        } else if (tabValue === 1) {
            const totalMonthlySellingPrice = Object.values(monthlyReport).reduce((sum, data) => sum + data.totalSellingPrice, 0);
            const totalMonthlyPurchasePrice = Object.values(monthlyReport).reduce((sum, data) => sum + data.totalPurchasePrice, 0);
            const totalMonthlyProfit = Object.values(monthlyReport).reduce((sum, data) => sum + data.totalProfit, 0);

            return (
                <Box>
                    {renderSummaryBox(totalMonthlySellingPrice, totalMonthlyPurchasePrice, totalMonthlyProfit)}
                    <TableContainer component={Paper} className="table-container" sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#1976d2' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Month</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Total Selling Price</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Total Purchase Price</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Total Profit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(monthlyReport)
                                    .sort((a, b) => b[0].localeCompare(a[0])) // Sort months in descending order (LIFO)
                                    .slice(0, 25) // Limit to 25 items
                                    .map(([month, data], index) => (
                                        <TableRow key={month} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                                            <TableCell>{month}</TableCell>
                                            <TableCell>Rs. {formatCurrency(data.totalSellingPrice)}</TableCell>
                                            <TableCell>Rs. {formatCurrency(data.totalPurchasePrice)}</TableCell>
                                            <TableCell>Rs. {formatCurrency(data.totalProfit)}</TableCell>
                                        </TableRow>
                                    ))}
                                {Object.keys(monthlyReport).length > 25 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography variant="caption" color="textSecondary">
                                                Scroll to view more months...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {Object.keys(monthlyReport).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" className="no-data">
                                            No data available for the selected filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            );
        } else {
            const totalYearlyProfit = Object.values(yearlyReport).reduce((sum, data) => sum + data.totalProfit, 0);

            return (
                <Box>
                    {renderSummaryBox(
                        salesDetails.reduce((sum, sale) => sum + sale.totalSellingPrice, 0),
                        salesDetails.reduce((sum, sale) => sum + sale.totalPurchasePrice, 0),
                        totalYearlyProfit
                    )}
                    <TableContainer component={Paper} className="table-container" sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#1976d2' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Year</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: '600', borderBottom: '2px solid #1565c0' }}>Total Profit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(yearlyReport)
                                    .sort((a, b) => b[0] - a[0]) // Sort years in descending order (LIFO)
                                    .slice(0, 25) // Limit to 25 items
                                    .map(([year, data], index) => (
                                        <TableRow key={year} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                                            <TableCell>{year}</TableCell>
                                            <TableCell>Rs. {formatCurrency(data.totalProfit)}</TableCell>
                                        </TableRow>
                                    ))}
                                {Object.keys(yearlyReport).length > 25 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            <Typography variant="caption" color="textSecondary">
                                                Scroll to view more years...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {Object.keys(yearlyReport).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center" className="no-data">
                                            No data available for the selected filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            );
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4, bgcolor: '#f5f7fa' }} className="page-container">
                <Box className="report-header">
                    <Typography variant="h4" component="h1" className="report-title">
                        Profit Report
                    </Typography>
                    <Typography variant="subtitle2" className="report-date">
                        Generated on: {getFormattedDate()}
                    </Typography>
                </Box>

                <Box className="filter-section">
                    <TextField
                        label="Filter by Product ID or Sale ID"
                        value={filterValue}
                        onChange={handleFilterChange}
                        sx={{ width: '250px' }}
                        variant="outlined"
                        className="filter-input"
                    />
                </Box>

                {error && (
                    <Typography color="error" className="error-message">
                        {error}
                    </Typography>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            className="report-tabs"
                            TabIndicatorProps={{ style: { backgroundColor: '#1976d2' } }}
                        >
                            <Tab label="Daily Report" className="tab-item" />
                            <Tab label="Monthly Report" className="tab-item" />
                            <Tab label="Yearly Report" className="tab-item" />
                        </Tabs>
                        <Box className="table-wrapper">
                            {renderTable()}
                        </Box>
                    </>
                )}
            </Box>

            <style>
                {`
                    .page-container {
                        min-height: 100vh;
                        background-color: #f5f7fa;
                        font-family: 'Roboto', sans-serif;
                    }

                    .report-header {
                        text-align: center;
                        margin-bottom: 2rem;
                        padding: 1.5rem;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    }

                    .report-title {
                        color: #1a3c34;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                    }

                    .report-date {
                        color: #666;
                        font-style: italic;
                    }

                    .filter-section {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 2rem;
                    }

                    .filter-input {
                        background-color: #fff;
                        border-radius: 4px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }

                    .filter-input .MuiInputLabel-root {
                        color: #333;
                        font-weight: 500;
                    }

                    .error-message {
                        text-align: center;
                        margin-bottom: 1rem;
                        font-weight: 500;
                    }

                    .report-tabs {
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                        margin-bottom: 2rem;
                    }

                    .tab-item {
                        text-transform: none;
                        font-weight: 500;
                        color: #666;
                        padding: 12px 24px;
                    }

                    .tab-item.Mui-selected {
                        color: #1976d2;
                        font-weight: 600;
                    }

                    .table-wrapper {
                        max-width: 1200px;
                        margin: 0 auto;
                    }

                    .table-container {
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                        margin-bottom: 2rem;
                    }

                    .table-row-even {
                        background-color: #ffffff;
                    }

                    .table-row-odd {
                        background-color: #f9fafb;
                    }

                    .MuiTableCell-root {
                        padding: 12px 16px;
                        border-bottom: 1px solid #e0e0e0;
                        color: #333;
                    }

                    .section-title {
                        color: #1a3c34;
                        font-weight: 500;
                        margin-bottom: 1rem;
                        border-left: 4px solid #1976d2;
                        padding-left: 1rem;
                    }

                    .no-data {
                        color: #666;
                        font-style: italic;
                        padding: 2rem;
                    }
                `}
            </style>
        </>
    );
};

export default ViewReport;