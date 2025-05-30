import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, TextField, CircularProgress, Button,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import OwnerNavbar from '../components/OwnerNavbar';
import DownloadIcon from '@mui/icons-material/Download';
import Tooltip from '@mui/material/Tooltip';

// Utility function to normalize date to MM/DD/YYYY string to match SalesManagement.js
const normalizeDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
    const [filterValue, setFilterValue] = useState(''); // Filter by Product ID or Sale ID
    const [tabValue, setTabValue] = useState(0); // 0: Daily, 1: Monthly, 2: Yearly
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const reportRef = useRef(null);

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
                const salesData = salesResponse.data.data || salesResponse.data;
                setSales(salesData);
                console.log('Raw sales data:', salesData);
                salesData.forEach(sale => {
                    console.log(`Sale ID: ${sale.id}, Sale Date (raw): ${sale.saleDate}, Normalized: ${normalizeDate(sale.saleDate)}`);
                });
            } catch (error) {
                setError(`Failed to load report data: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Load jsPDF and html2canvas dynamically via CDN
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script1.onload = () => checkScriptsLoaded();
        document.body.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script2.onload = () => checkScriptsLoaded();
        document.body.appendChild(script2);

        return () => {
            document.body.removeChild(script1);
            document.body.removeChild(script2);
        };
    }, []);

    const checkScriptsLoaded = () => {
        if (window.html2canvas && window.jspdf && window.jspdf.jsPDF) {
            setScriptsLoaded(true);
        }
    };

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

            // Check if sizeQuantities exists and has entries
            const hasSizeQuantities = sale.sizeQuantities && Object.keys(sale.sizeQuantities).length > 0;

            // Calculate total quantity for this sale
            const totalQuantity = hasSizeQuantities
                ? Object.values(sale.sizeQuantities).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0)
                : (parseInt(sale.quantity) || 0);

            // Calculate purchase price for this sale
            const totalPurchasePrice = unitPurchasePrice * totalQuantity;

            // Calculate total selling price for this sale
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

        // Daily report: filter sales by selected date
        const currentDate = normalizeDate(selectedDate);
        console.log(`Selected Date (normalized): ${currentDate}`);
        const dailySales = salesDetails.filter(sale => sale.saleDate === currentDate);
        const dailyReport = {};
        dailySales.forEach(sale => {
            const date = sale.saleDate;
            if (!dailyReport[date]) {
                dailyReport[date] = {};
            }
            if (!dailyReport[date][sale.productId]) {
                dailyReport[date][sale.productId] = {
                    sales: [],
                    totalSellingPrice: 0,
                    totalPurchasePrice: 0,
                    totalProfit: 0,
                };
            }
            dailyReport[date][sale.productId].sales.push(sale);
            dailyReport[date][sale.productId].totalSellingPrice += sale.totalSellingPrice;
            dailyReport[date][sale.productId].totalPurchasePrice += sale.totalPurchasePrice;
            dailyReport[date][sale.productId].totalProfit += sale.profit;
        });

        // Monthly report
        const monthlyReport = {};
        salesDetails.forEach(sale => {
            const date = new Date(sale.saleDate.split('/').reverse().join('-')); // Convert MM/DD/YYYY to Date
            const month = date.toISOString().slice(0, 7); // YYYY-MM
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
            const date = new Date(sale.saleDate.split('/').reverse().join('-')); // Convert MM/DD/YYYY to Date
            const year = date.getFullYear().toString();
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

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    const renderSummaryBox = (totalSellingPrice, totalPurchasePrice, totalProfit, date) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#e0f7fa', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Date: {date}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total Selling Price: Rs. {formatCurrency(totalSellingPrice)}</Typography>
                <Typography variant="subtitle1">Total Purchase Price: Rs. {formatCurrency(totalPurchasePrice)}</Typography>
                <Typography variant="subtitle1">Total Profit: Rs. {formatCurrency(totalProfit)}</Typography>
            </Box>
        </Box>
    );

    const downloadReport = () => {
        if (!scriptsLoaded) {
            alert('PDF libraries are not loaded yet. Please wait a moment.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        const input = reportRef.current;
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Profit_Report_${getFormattedDate().replace(/ /g, '_')}.pdf`);
        });
    };

    const printReport = () => {
        if (!scriptsLoaded) {
            alert('PDF libraries are not loaded yet. Please wait a moment.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        const input = reportRef.current;
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const pdfDataUri = pdf.output('datauristring');
            const printWindow = window.open();
            printWindow.document.write(`
                <html>
                <head><title>Profit Report</title></head>
                <body style="margin:0;"><img src="${pdfDataUri}" style="width:100%;"></body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        });
    };

    const renderTable = () => {
        if (tabValue === 0) {
            const currentDate = normalizeDate(selectedDate);
            const dateData = dailyReport[currentDate] || {};
            const totalSellingPrice = Object.values(dateData).reduce((sum, data) => sum + data.totalSellingPrice, 0);
            const totalPurchasePrice = Object.values(dateData).reduce((sum, data) => sum + data.totalPurchasePrice, 0);
            const totalProfit = Object.values(dateData).reduce((sum, data) => sum + data.totalProfit, 0);

            return (
                <Box ref={reportRef}>
                    {renderSummaryBox(totalSellingPrice, totalPurchasePrice, totalProfit, currentDate)}
                    {Object.keys(dateData).length > 0 ? (
                        Object.entries(dateData).map(([productId, data]) => (
                            <Box key={productId} sx={{ mb: 4 }}>
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
                                                .sort((a, b) => b.saleId - a.saleId)
                                                .slice(0, 25)
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
                        ))
                    ) : (
                        <Typography align="center" className="no-data">
                            No sales available for {currentDate}.
                        </Typography>
                    )}
                </Box>
            );
        } else if (tabValue === 1) {
            const totalMonthlySellingPrice = Object.values(monthlyReport).reduce((sum, data) => sum + data.totalSellingPrice, 0);
            const totalMonthlyPurchasePrice = Object.values(monthlyReport).reduce((sum, data) => sum + data.totalPurchasePrice, 0);
            const totalMonthlyProfit = Object.values(monthlyReport).reduce((sum, data) => sum + data.totalProfit, 0);

            return (
                <Box ref={reportRef}>
                    {renderSummaryBox(totalMonthlySellingPrice, totalMonthlyPurchasePrice, totalMonthlyProfit, 'All Months')}
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
                                    .sort((a, b) => b[0].localeCompare(a[0]))
                                    .slice(0, 25)
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
                <Box ref={reportRef}>
                    {renderSummaryBox(
                        salesDetails.reduce((sum, sale) => sum + sale.totalSellingPrice, 0),
                        salesDetails.reduce((sum, sale) => sum + sale.totalPurchasePrice, 0),
                        totalYearlyProfit,
                        'All Years'
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
                                    .sort((a, b) => b[0] - a[0])
                                    .slice(0, 25)
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

                <Box className="filter-section" sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                    <TextField
                        label="Filter by Product ID or Sale ID"
                        value={filterValue}
                        onChange={handleFilterChange}
                        sx={{ width: '250px' }}
                        variant="outlined"
                        className="filter-input"
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            renderInput={(params) => <TextField {...params} />}
                            sx={{ width: '250px' }}
                        />
                    </LocalizationProvider>
                    <Tooltip title="Download Report (PDF)">
                        <Button
                            variant="contained"
                            onClick={downloadReport}
                            disabled={!scriptsLoaded}
                            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, height: '56px', minWidth: '56px', padding: '8px' }}
                        >
                            <DownloadIcon />
                        </Button>
                    </Tooltip>
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
                        justifyContent: 'center';
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

                    @media print {
                        body {
                            margin: 0;
                            padding: 20px;
                        }
                        .filter-section, .report-tabs, .MuiTabs-root {
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
                        .summary {
                            page-break-inside: avoid;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default ViewReport;