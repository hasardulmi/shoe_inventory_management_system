import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import OwnerNavbar from '../components/OwnerNavbar';
import './styles.css';

// Utility function to normalize date to YYYY-MM-DD string
const normalizeDate = (date) => {
    if (!date) {
        console.warn('Date is null or undefined');
        return new Date().toISOString().split('T')[0]; // Fallback to current date
    }
    if (typeof date === 'string') {
        return date.includes('T') ? date.split('T')[0] : date;
    }
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    console.warn('Unexpected date format:', date);
    return new Date().toISOString().split('T')[0]; // Fallback
};

// Utility function to format currency safely
const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00';
    }
    return Number(value).toFixed(2);
};

const ViewReport = () => {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [returns, setReturns] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [tabValue, setTabValue] = useState(0); // 0: Daily, 1: Monthly, 2: Yearly
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const BASE_URL = 'http://localhost:8080';

    const categoryOptions = [
        '', 'Shoes', 'Water Bottle', 'Bags', 'Slippers', 'Shoe Polish', 'Socks', 'Other Accessories'
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [productsResponse, salesResponse, returnsResponse] = await Promise.all([
                    axios.get(`${BASE_URL}/api/products`),
                    axios.get(`${BASE_URL}/api/sales`),
                    axios.get(`${BASE_URL}/api/returns`).catch(() => ({ data: [] })) // Handle missing returns endpoint
                ]);
                console.log('Fetched Products:', productsResponse.data);
                console.log('Fetched Sales:', salesResponse.data);
                console.log('Fetched Returns:', returnsResponse.data);
                setProducts(productsResponse.data);
                setSales(salesResponse.data);
                setReturns(returnsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(`Failed to load report data: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Process sales data with profit calculations
    const calculateReports = () => {
        console.log('Calculating reports with:', {
            productsCount: products.length,
            salesCount: sales.length,
            returnsCount: returns.length,
            categoryFilter
        });

        // Log product and sale IDs for debugging
        const productIds = products.map(p => p.productId);
        const saleProductIds = sales.map(s => s.productId);
        const returnedSaleIds = returns.map(r => r.saleId);
        console.log('Product IDs:', productIds);
        console.log('Sale Product IDs:', saleProductIds);
        console.log('Returned Sale IDs:', returnedSaleIds);

        // Filter out returned sales and products with status 'RETURNED'
        const activeSales = sales.filter(sale => {
            const product = products.find(p => p.productId === sale.productId);
            const isReturned = product?.status === 'RETURNED' || returns.some(ret => ret.saleId === sale.id);
            if (isReturned) {
                console.log('Sale excluded due to return or RETURNED status:', {
                    saleId: sale.id,
                    productId: sale.productId,
                    productStatus: product?.status,
                    isInReturns: returns.some(ret => ret.saleId === sale.id)
                });
            }
            return !isReturned;
        });

        // Filter sales by category (case-insensitive)
        const filteredSales = categoryFilter
            ? activeSales.filter(sale => {
                const product = products.find(p => p.productId === sale.productId);
                const productCategory = (product?.category || '').toLowerCase();
                const filterCategory = categoryFilter.toLowerCase();
                const matches = product && productCategory === filterCategory;
                if (!matches) {
                    console.log('Sale filtered out due to category mismatch:', {
                        saleId: sale.id,
                        productId: sale.productId,
                        productCategory,
                        filterCategory
                    });
                }
                return matches;
            })
            : activeSales;

        console.log('Filtered Sales:', filteredSales);

        // Calculate metrics per sale
        const salesWithProfit = filteredSales.map(sale => {
            const product = products.find(p => p.productId === sale.productId);
            if (!product) {
                console.warn(`Product not found for sale:`, {
                    saleId: sale.id,
                    productId: sale.productId
                });
                return null;
            }
            const normalizedDate = normalizeDate(sale.saleDate);
            const salePrice = typeof sale.salePrice === 'number' && !isNaN(sale.salePrice)
                ? sale.salePrice
                : parseFloat(sale.salePrice || 0);
            const purchasePrice = typeof product.purchasePrice === 'number' && !isNaN(product.purchasePrice)
                ? product.purchasePrice
                : parseFloat(product.purchasePrice || 0);
            const sellingPrice = typeof product.sellingPrice === 'number' && !isNaN(product.sellingPrice)
                ? product.sellingPrice
                : parseFloat(product.sellingPrice || 0);
            const discount = typeof sale.discount === 'number' && !isNaN(sale.discount)
                ? sale.discount
                : parseFloat(sale.discount || 0);

            // Log invalid data
            if (isNaN(salePrice) || salePrice < 0) {
                console.warn(`Invalid salePrice for sale:`, {
                    saleId: sale.id,
                    productId: sale.productId,
                    salePrice: sale.salePrice
                });
            }
            if (isNaN(purchasePrice)) {
                console.warn(`Invalid purchasePrice for product:`, {
                    productId: product.productId,
                    purchasePrice: product.purchasePrice
                });
            }
            if (isNaN(sellingPrice)) {
                console.warn(`Invalid sellingPrice for product:`, {
                    productId: product.productId,
                    sellingPrice: product.sellingPrice
                });
            }

            const discountPrice = sellingPrice * discount; // discount is a fraction (e.g., 0.1 for 10%)
            const finalSoldPrice = salePrice; // salePrice is final price after discount
            const profit = finalSoldPrice - purchasePrice;

            return {
                productId: sale.productId,
                saleId: sale.id,
                productName: product.productName || 'Unknown',
                category: product.category || 'Unknown',
                purchasePrice: isNaN(purchasePrice) ? 0 : purchasePrice,
                sellingPrice: isNaN(sellingPrice) ? 0 : sellingPrice,
                discountPrice: isNaN(discountPrice) ? 0 : discountPrice,
                finalSoldPrice: isNaN(finalSoldPrice) ? 0 : finalSoldPrice,
                profit: isNaN(profit) ? 0 : profit,
                saleDate: normalizedDate
            };
        }).filter(sale => sale !== null && sale.saleDate !== null);

        console.log('Sales with Profit:', salesWithProfit);

        // Daily report
        const dailyReport = {};
        salesWithProfit.forEach(sale => {
            const date = sale.saleDate;
            if (!dailyReport[date]) {
                dailyReport[date] = {
                    totalPurchasePrice: 0,
                    totalSellingPrice: 0,
                    totalDiscountPrice: 0,
                    totalFinalSoldPrice: 0,
                    totalProfit: 0
                };
            }
            dailyReport[date].totalPurchasePrice += sale.purchasePrice;
            dailyReport[date].totalSellingPrice += sale.sellingPrice;
            dailyReport[date].totalDiscountPrice += sale.discountPrice;
            dailyReport[date].totalFinalSoldPrice += sale.finalSoldPrice;
            dailyReport[date].totalProfit += sale.profit;
        });

        // Monthly report
        const monthlyReport = {};
        salesWithProfit.forEach(sale => {
            const month = sale.saleDate.slice(0, 7);
            if (!monthlyReport[month]) {
                monthlyReport[month] = {
                    totalPurchasePrice: 0,
                    totalSellingPrice: 0,
                    totalDiscountPrice: 0,
                    totalFinalSoldPrice: 0,
                    totalProfit: 0
                };
            }
            monthlyReport[month].totalPurchasePrice += sale.purchasePrice;
            monthlyReport[month].totalSellingPrice += sale.sellingPrice;
            monthlyReport[month].totalDiscountPrice += sale.discountPrice;
            monthlyReport[month].totalFinalSoldPrice += sale.finalSoldPrice;
            monthlyReport[month].totalProfit += sale.profit;
        });

        // Yearly report
        const yearlyReport = {};
        salesWithProfit.forEach(sale => {
            const year = sale.saleDate.slice(0, 4);
            if (!yearlyReport[year]) {
                yearlyReport[year] = {
                    totalPurchasePrice: 0,
                    totalSellingPrice: 0,
                    totalDiscountPrice: 0,
                    totalFinalSoldPrice: 0,
                    totalProfit: 0
                };
            }
            yearlyReport[year].totalPurchasePrice += sale.purchasePrice;
            yearlyReport[year].totalSellingPrice += sale.sellingPrice;
            yearlyReport[year].totalDiscountPrice += sale.discountPrice;
            yearlyReport[year].totalFinalSoldPrice += sale.finalSoldPrice;
            yearlyReport[year].totalProfit += sale.profit;
        });

        // Total aggregates
        const totals = salesWithProfit.reduce((acc, sale) => ({
            totalPurchasePrice: acc.totalPurchasePrice + sale.purchasePrice,
            totalSellingPrice: acc.totalSellingPrice + sale.sellingPrice,
            totalDiscountPrice: acc.totalDiscountPrice + sale.discountPrice,
            totalFinalSoldPrice: acc.totalFinalSoldPrice + sale.finalSoldPrice,
            totalProfit: acc.totalProfit + sale.profit
        }), {
            totalPurchasePrice: 0,
            totalSellingPrice: 0,
            totalDiscountPrice: 0,
            totalFinalSoldPrice: 0,
            totalProfit: 0
        });

        console.log('Reports:', { dailyReport, monthlyReport, yearlyReport, totals });

        return { salesWithProfit, dailyReport, monthlyReport, yearlyReport, totals };
    };

    const { salesWithProfit, dailyReport, monthlyReport, yearlyReport, totals } = calculateReports();

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCategoryFilterChange = (e) => {
        setCategoryFilter(e.target.value);
    };

    const renderTable = () => {
        if (tabValue === 0) {
            return (
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Total Purchase Price</TableCell>
                                <TableCell>Total Selling Price</TableCell>
                                <TableCell>Total Discount Price</TableCell>
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
                                        <TableCell>{formatCurrency(data.totalSellingPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalDiscountPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalFinalSoldPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalProfit)}</TableCell>
                                    </TableRow>
                                ))}
                            {Object.keys(dailyReport).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        } else if (tabValue === 1) {
            return (
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Total Purchase Price</TableCell>
                                <TableCell>Total Selling Price</TableCell>
                                <TableCell>Total Discount Price</TableCell>
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
                                        <TableCell>{formatCurrency(data.totalSellingPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalDiscountPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalFinalSoldPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalProfit)}</TableCell>
                                    </TableRow>
                                ))}
                            {Object.keys(monthlyReport).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        } else {
            return (
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Year</TableCell>
                                <TableCell>Total Purchase Price</TableCell>
                                <TableCell>Total Selling Price</TableCell>
                                <TableCell>Total Discount Price</TableCell>
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
                                        <TableCell>{formatCurrency(data.totalSellingPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalDiscountPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalFinalSoldPrice)}</TableCell>
                                        <TableCell>{formatCurrency(data.totalProfit)}</TableCell>
                                    </TableRow>
                                ))}
                            {Object.keys(yearlyReport).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }
    };

    console.log('Rendering ViewReport:', { loading, error, salesWithProfitLength: salesWithProfit.length });

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
                                    {cat ? cat : 'All Categories'}
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
                        <Typography variant="h6" gutterBottom>Product-Level Profit</Typography>
                        <TableContainer component={Paper} className="table-container" sx={{ mb: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product ID</TableCell>
                                        <TableCell>Sale ID</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Sale Date</TableCell>
                                        <TableCell>Purchase Price</TableCell>
                                        <TableCell>Selling Price</TableCell>
                                        <TableCell>Discount Price</TableCell>
                                        <TableCell>Final Sold Price</TableCell>
                                        <TableCell>Profit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {salesWithProfit.map((sale, index) => (
                                        <TableRow key={`${sale.saleId}-${index}`}>
                                            <TableCell>{sale.productId}</TableCell>
                                            <TableCell>{sale.saleId}</TableCell>
                                            <TableCell>{sale.productName}</TableCell>
                                            <TableCell>{sale.category}</TableCell>
                                            <TableCell>{sale.saleDate}</TableCell>
                                            <TableCell>{formatCurrency(sale.purchasePrice)}</TableCell>
                                            <TableCell>{formatCurrency(sale.sellingPrice)}</TableCell>
                                            <TableCell>{formatCurrency(sale.discountPrice)}</TableCell>
                                            <TableCell>{formatCurrency(sale.finalSoldPrice)}</TableCell>
                                            <TableCell>{formatCurrency(sale.profit)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {salesWithProfit.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                No sales data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Typography variant="h6" gutterBottom>Total Aggregates</Typography>
                        <TableContainer component={Paper} className="table-container" sx={{ mb: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Total Purchase Price</TableCell>
                                        <TableCell>Total Selling Price</TableCell>
                                        <TableCell>Total Discount Price</TableCell>
                                        <TableCell>Total Final Sold Price</TableCell>
                                        <TableCell>Total Profit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>{formatCurrency(totals.totalPurchasePrice)}</TableCell>
                                        <TableCell>{formatCurrency(totals.totalSellingPrice)}</TableCell>
                                        <TableCell>{formatCurrency(totals.totalDiscountPrice)}</TableCell>
                                        <TableCell>{formatCurrency(totals.totalFinalSoldPrice)}</TableCell>
                                        <TableCell>{formatCurrency(totals.totalProfit)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

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