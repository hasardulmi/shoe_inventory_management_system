import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import OwnerNavbar from '../components/OwnerNavbar';
import axios from 'axios';
import './styles.css';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
    Legend
);

function OwnerDashboard() {
    const [overviewData, setOverviewData] = useState({
        totalProducts: 0,
        totalSales: 0,
        totalStock: 0,
        outOfStock: 0,
    });
    const [userData, setUserData] = useState({ totalOwners: 0, totalEmployees: 0 });
    const [inventoryData, setInventoryData] = useState({ soldProducts: 0, totalProducts: 0 });
    const [topProductsData, setTopProductsData] = useState({ labels: [], percentages: [] });
    const [profitData, setProfitData] = useState({ labels: [], data: [] });

    const fetchData = async () => {
        try {
            const [productsRes, salesRes] = await Promise.all([
                axios.get('http://localhost:8080/api/products'),
                axios.get('http://localhost:8080/api/sales'),
            ]);

            // Extract data from API responses
            const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.data || []);
            const sales = Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data.data || []);

            // Overview Data
            const totalProducts = products.length;
            const totalSales = sales.length;
            const totalStock = products.reduce((sum, p) => {
                return sum + (p.hasSizes && p.sizeQuantities
                    ? Object.values(p.sizeQuantities).reduce((s, q) => s + (parseInt(q.quantity) || 0), 0)
                    : parseInt(p.quantity) || 0);
            }, 0);
            const outOfStock = products.filter(p =>
                !p.hasSizes ? (parseInt(p.quantity) || 0) === 0 :
                    (p.sizeQuantities && Object.values(p.sizeQuantities).every(q => (parseInt(q.quantity) || 0) === 0))
            ).length;
            setOverviewData({ totalProducts, totalSales, totalStock, outOfStock });

            // User Data (placeholders until actual endpoints are available)
            const totalEmployees = 0; // Replace with /api/employees if implemented
            const totalOwners = 2;    // Replace with /api/users if implemented
            setUserData({ totalOwners, totalEmployees });

            // Inventory Data
            const soldProducts = sales.reduce((sum, s) => {
                return sum + (s.sizeQuantities
                    ? Object.values(s.sizeQuantities).reduce((s, q) => s + (parseInt(q) || 0), 0)
                    : parseInt(s.quantity) || 0);
            }, 0);
            setInventoryData({ soldProducts, totalProducts: totalStock });

            // Top 10 Most Sold Products
            const productSales = {};
            sales.forEach(sale => {
                const quantity = sale.sizeQuantities
                    ? Object.values(sale.sizeQuantities).reduce((s, q) => s + (parseInt(q) || 0), 0)
                    : parseInt(sale.quantity) || 0;
                productSales[sale.productId] = (productSales[sale.productId] || 0) + quantity;
            });
            const totalSold = Object.values(productSales).reduce((sum, qty) => sum + qty, 0);
            const topProducts = Object.entries(productSales)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([productId, quantity]) => {
                    const product = products.find(p => p.productId === productId);
                    return {
                        productName: product ? product.productName : productId,
                        soldPercentage: totalSold > 0 ? ((quantity / totalSold) * 100).toFixed(2) : 0,
                    };
                });
            const labels = topProducts.map(p => p.productName);
            const percentages = topProducts.map(p => parseFloat(p.soldPercentage));
            setTopProductsData({ labels, percentages });

            // Months vs Profit
            const monthlyProfit = {};
            sales.forEach(sale => {
                const product = products.find(p => p.productId === sale.productId);
                if (product) {
                    const date = new Date(sale.saleDate).toISOString().slice(0, 7); // YYYY-MM
                    const quantity = sale.sizeQuantities
                        ? Object.values(sale.sizeQuantities).reduce((s, q) => s + (parseInt(q) || 0), 0)
                        : parseInt(sale.quantity) || 0;
                    const purchasePrice = parseFloat(product.purchasePrice) || 0;
                    const sellingPrice = parseFloat(sale.sellingPrice) || 0;
                    const discount = parseFloat(sale.discount) || 0;
                    const profit = (sellingPrice - purchasePrice) * quantity - discount;
                    monthlyProfit[date] = (monthlyProfit[date] || 0) + profit;
                }
            });
            const profitLabels = Object.keys(monthlyProfit).sort();
            const profitDataValues = profitLabels.map(date => monthlyProfit[date] || 0);
            setProfitData({ labels: profitLabels, data: profitDataValues });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Chart Data
    const inventoryChartData = {
        labels: ['Sold Products', 'Available Products'],
        datasets: [
            {
                data: [inventoryData.soldProducts, inventoryData.totalProducts - inventoryData.soldProducts],
                backgroundColor: ['#36A2EB', '#FF6384'],
            },
        ],
    };

    const topProductsChartData = {
        labels: topProductsData.labels,
        datasets: [
            {
                label: 'Sold Percentage (%)',
                data: topProductsData.percentages,
                backgroundColor: '#36A2EB',
            },
        ],
    };

    const profitChartData = {
        labels: profitData.labels,
        datasets: [
            {
                label: 'Profit',
                data: profitData.data,
                borderColor: '#FF6384',
                fill: false,
            },
        ],
    };

    return (
        <>
            <OwnerNavbar />
            <Container maxWidth="lg" sx={{ py: 4, background: '#e3f2fd', minHeight: '100vh' }}>
                <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 1, boxShadow: 2 }}>
                    {/* Overview Section */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Over View
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item>
                                <Card sx={{ bgcolor: '#e8f5e9', p: 2, borderRadius: 1, width: 150, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Products
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {overviewData.totalProducts}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item>
                                <Card sx={{ bgcolor: '#e0f7fa', p: 2, borderRadius: 1, width: 150, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Sales
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {overviewData.totalSales}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item>
                                <Card sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1, width: 150, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Stock
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {overviewData.totalStock}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item>
                                <Card sx={{ bgcolor: '#ffebee', p: 2, borderRadius: 1, width: 150, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Out of Stock
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {overviewData.outOfStock}
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Charts Section */}
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            <Card sx={{ p: 2, borderRadius: 1, boxShadow: 1, height: '100%' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    No of users
                                </Typography>
                                <Typography variant="body1">
                                    Total Customers: {userData.totalOwners}K
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={4}>
                            <Card sx={{ p: 2, borderRadius: 1, boxShadow: 1, height: '100%' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Inventory Values
                                </Typography>
                                <Box sx={{ height: 200 }}>
                                    <Pie data={inventoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </Box>
                            </Card>
                        </Grid>
                        <Grid item xs={4}>
                            <Card sx={{ p: 2, borderRadius: 1, boxShadow: 1, height: '100%' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Expense vs Profit
                                </Typography>
                                <Box sx={{ height: 200 }}>
                                    <Line
                                        data={profitChartData}
                                        options={{ responsive: true, maintainAspectRatio: false, scales: { y: { title: { display: true, text: 'Profit' } }, x: { title: { display: true, text: 'Month' } } } }}
                                    />
                                </Box>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <Card sx={{ p: 2, borderRadius: 1, boxShadow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Top 10 Most Sold Products (by Percentage)
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <Bar
                                        data={topProductsChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: { beginAtZero: true, max: 100, title: { display: true, text: 'Sold Percentage (%)' }, ticks: { callback: value => `${value}%` } },
                                                x: { title: { display: true, text: 'Product Name' } },
                                            },
                                        }}
                                    />
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </>
    );
}

export default OwnerDashboard;