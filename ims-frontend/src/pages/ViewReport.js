// src/pages/ViewReport.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

const ViewReport = () => {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [tabValue, setTabValue] = useState(0); // 0: Daily, 1: Monthly, 2: Yearly
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const BASE_URL = 'http://localhost:8080';

    const categoryOptions = [
        '', 'shoes', 'water bottle', 'bags', 'slippers', 'shoe polish', 'socks', 'other accessories'
    ];

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
                setSales(salesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load report data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Process sales data with profit calculations
    const calculateReports = () => {
        // Filter sales by category
        const filteredSales = categoryFilter
            ? sales.filter(sale => {
                const product = products.find(p => p.productId === sale.productId);
                return product && product.category.toLowerCase() === categoryFilter.toLowerCase();
            })
            : sales;

        // Calculate profit per sale
        const salesWithProfit = filteredSales.map(sale => {
            const product = products.find(p => p.productId === sale.productId);
            if (!product) return null;
            const profit = sale.finalSoldPrice - product.purchasePrice;
            return {
                ...sale,
                productName: product.productName,
                category: product.category,
                purchasePrice: product.purchasePrice,
                profit
            };
        }).filter(sale => sale !== null);

        // Daily report
        const dailyReport = {};
        salesWithProfit.forEach(sale => {
            const date = sale.soldDate.split('T')[0]; // Handle YYYY-MM-DD or ISO
            if (!dailyReport[date]) {
                dailyReport[date] = {
                    totalPurchasePrice: 0,
                    totalFinalSoldPrice: 0,
                    totalProfit: 0
                };
            }
            dailyReport[date].totalPurchasePrice += sale.purchasePrice;
            dailyReport[date].totalFinalSoldPrice += sale.finalSoldPrice;
            dailyReport[date].totalProfit += sale.profit;
        });

        // Monthly report
        const monthlyReport = {};
        salesWithProfit.forEach(sale => {
            const date = sale.soldDate.split('T')[0];
            const month = date.slice(0, 7); // YYYY-MM
            if (!monthlyReport[month]) {
                monthlyReport[month] = {
                    totalPurchasePrice: 0,
                    totalFinalSoldPrice: 0,
                    totalProfit: 0
                };
            }
            monthlyReport[month].totalPurchasePrice += sale.purchasePrice;
            monthlyReport[month].totalFinalSoldPrice += sale.finalSoldPrice;
            monthlyReport[month].totalProfit += sale.profit;
        });

        // Yearly report
        const yearlyReport = {};
        salesWithProfit.forEach(sale => {
            const date = sale.soldDate.split('T')[0];
            const year = date.slice(0, 4); // YYYY
            if (!yearlyReport[year]) {
                yearlyReport[year] = {
                    totalPurchasePrice: 0,
                    totalFinalSoldPrice: 0,
                    totalProfit: 0
                };
            }
            yearlyReport[year].totalPurchasePrice += sale.purchasePrice;
            yearlyReport[year].totalFinalSoldPrice += sale.finalSoldPrice;
            yearlyReport[year].totalProfit += sale.profit;
        });

        // Total aggregates
        const totals = salesWithProfit.reduce((acc, sale) => ({
            totalPurchasePrice: acc.totalPurchasePrice + sale.purchasePrice,
            totalFinalSoldPrice: acc.totalFinalSoldPrice + sale.finalSoldPrice,
            totalProfit: acc.totalProfit + sale.profit
        }), { totalPurchasePrice: 0, totalFinalSoldPrice: 0, totalProfit: 0 });

        return { salesWithProfit, dailyReport, monthlyReport, yearlyReport, totals };
    };

    const { salesWithProfit, dailyReport, monthlyReport, yearlyReport, totals } = calculateReports();

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCategoryFilterChange = (e) => {
        setCategoryFilter(e.target.value);
    };

    const formatCurrency = (value) => {
        return value.toFixed(2);
    };

    const renderTable = () => {
        if (tabValue === 0) {
            // Daily Report
            return (
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Total Purchase Price</TableCell>
                                <TableCell>Total Final Sold Price</TableCell>
                                <TableCell>Total Profit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(dailyReport)
                                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                                .map(([date, data]) => (
                                    <TableRow key={date}>
                                        <TableCell>{date}</TableCell>
                                        <TableCell>{formatCurrency(data.totalPurchasePrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalFinalSoldPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalProfit)}</TableCell>
                                    </TableRow>
                                ))}
                            {Object.keys(dailyReport).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        } else if (tabValue === 1) {
            // Monthly Report
            return (
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Total Purchase Price</TableCell>
                                <TableCell>Total Final Sold Price</TableCell>
                                <TableCell>Total Profit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(monthlyReport)
                                .sort((a, b) => b[0].localeCompare(a[0]))
                                .map(([month, data]) => (
                                    <TableRow key={month}>
                                        <TableCell>{month}</TableCell>
                                        <TableCell>{formatCurrency(data.totalPurchasePrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalFinalSoldPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalProfit)}</TableCell>
                                    </TableRow>
                                ))}
                            {Object.keys(monthlyReport).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        } else {
            // Yearly Report
            return (
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Year</TableCell>
                                <TableCell>Total Purchase Price</TableCell>
                                <TableCell>Total Final Sold Price</TableCell>
                                <TableCell>Total Profit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(yearlyReport)
                                .sort((a, b) => b[0] - a[0])
                                .map(([year, data]) => (
                                    <TableRow key={year}>
                                        <TableCell>{year}</TableCell>
                                        <TableCell>{formatCurrency(data.totalPurchasePrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalFinalSoldPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalProfit)}</TableCell>
                                    </TableRow>
                                ))}
                            {Object.keys(yearlyReport).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ p: 4 }} className="page-container">
                <Typography variant="h4" component="h1" gutterBottom className="page-title">
                    Profit Report
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <FormControl sx={{ width: '200px' }}>
                        <InputLabel>Filter Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={handleCategoryFilterChange}
                            label="Filter Category"
                        >
                            {categoryOptions.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                    {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'All Categories'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Product-Level Profit Table */}
                        <Typography variant="h6" gutterBottom>Product-Level Profit</Typography>
                        <TableContainer
                            component={Paper}
                            className="table-container"
                            sx={{ mb: 4, maxHeight: '400px', overflowY: 'auto' }}
                        >
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product ID</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Sold Date</TableCell>
                                        <TableCell>Purchase Price</TableCell>
                                        <TableCell>Sold Price</TableCell>
                                        <TableCell>Discount (%)</TableCell>
                                        <TableCell>Discount Price</TableCell>
                                        <TableCell>Final Sold Price</TableCell>
                                        <TableCell>Profit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {salesWithProfit.map((sale, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{sale.productId}</TableCell>
                                            <TableCell>{sale.productName}</TableCell>
                                            <TableCell>{sale.category}</TableCell>
                                            <TableCell>{sale.soldDate.split('T')[0]}</TableCell>
                                            <TableCell>{formatCurrency(sale.purchasePrice)}</TableCell>
                                            <TableCell>{formatCurrency(sale.soldPrice)}</TableCell>
                                            <TableCell>{sale.discountPercentage || 0}</TableCell>
                                            <TableCell>{formatCurrency(sale.discountPrice || 0)}</TableCell>
                                            <TableCell>{formatCurrency(sale.finalSoldPrice)}</TableCell>
                                            <TableCell>{formatCurrency(sale.profit)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {salesWithProfit.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">No sales data available</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Totals */}
                        <Typography variant="h6" gutterBottom>Total Aggregates</Typography>
                        <TableContainer component={Paper} className="table-container" sx={{ mb: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Total Purchase Price</TableCell>
                                        <TableCell>Total Final Sold Price</TableCell>
                                        <TableCell>Total Profit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>{formatCurrency(totals.totalPurchasePrice)}</TableCell>
                                        <TableCell>{formatCurrency(totals.totalFinalSoldPrice)}</TableCell>
                                        <TableCell>{formatCurrency(totals.totalProfit)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Tabs for Daily/Monthly/Yearly */}
                        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                            <Tab label="Daily" />
                            <Tab label="Monthly" />
                            <Tab label="Yearly" />
                        </Tabs>
                        {renderTable()}
                    </>
                )}
            </Box>
        </>
    );
};

export default ViewReport;