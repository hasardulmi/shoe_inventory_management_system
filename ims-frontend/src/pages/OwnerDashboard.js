import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, Typography, Container, Avatar
} from '@mui/material';
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
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GroupIcon from '@mui/icons-material/Group';
import axios from 'axios';
import OwnerNavbar from '../components/OwnerNavbar';

// Modern pastel palette with accent colors
const palette = {
    gradient: "#fff", // Set to white
    card: "#fff",
    cardAlt: "#f4f8fb",
    accent: "#6c63ff",
    accent2: "#ffb86c",
    accent3: "#53d1b6",
    accentDanger: "#ff5e62",
    heading: "#1a2639",
    textMain: "#2d3748",
    textSecondary: "#6b7280",
    border: "#e3e8ee",
    shadow: "0 4px 24px 0 rgba(39, 68, 114, 0.08)",
    chartBlue: "#7fa7c9",
    chartPurple: "#6c63ff",
    chartTeal: "#53d1b6",
};

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

    useEffect(() => {
        let isMounted = true;
        const fetchAndSetData = async () => {
            try {
                const [productsRes, salesRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/products'),
                    axios.get('http://localhost:8080/api/sales'),
                    axios.get('http://localhost:8080/api/employees'),
                ]);
                if (!isMounted) return;
                const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.data || []);
                const sales = Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data.data || []);
                const users = Array.isArray(usersRes.data) ? usersRes.data : [];

                const totalProducts = products.length;
                const totalSales = sales.length;
                const totalStock = products.reduce((sum, p) => {
                    return sum + (p.hasSizes && p.sizeQuantities
                        ? p.sizeQuantities.reduce((s, q) => s + (parseInt(q.quantity) || 0), 0)
                        : parseInt(p.quantity) || 0);
                }, 0);
                const outOfStock = products.filter(p =>
                    !p.hasSizes ? (parseInt(p.quantity) || 0) === 0 :
                        (p.sizeQuantities && p.sizeQuantities.every(q => (parseInt(q.quantity) || 0) === 0))
                ).length;
                setOverviewData({ totalProducts, totalSales, totalStock, outOfStock });

                const soldProducts = sales.reduce((sum, s) => {
                    if (s.sizeQuantities && Object.keys(s.sizeQuantities).length > 0) {
                        return sum + Object.values(s.sizeQuantities).reduce((total, qty) => total + (parseInt(qty) || 0), 0);
                    } else {
                        return sum + (parseInt(s.quantity) || 0);
                    }
                }, 0);
                setInventoryData({ soldProducts, totalProducts: totalStock });

                const productSales = {};
                sales.forEach(sale => {
                    if (!sale.productId) return;
                    const quantity = sale.sizeQuantities && Object.keys(sale.sizeQuantities).length > 0
                        ? Object.values(sale.sizeQuantities).reduce((s, q) => s + (parseInt(q) || 0), 0)
                        : parseInt(sale.quantity) || 0;
                    productSales[sale.productId] = (productSales[sale.productId] || 0) + quantity;
                });
                const totalSold = Object.values(productSales).reduce((sum, qty) => sum + qty, 0) || 1;
                const topProducts = Object.entries(productSales)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([productId, quantity]) => {
                        const product = products.find(p => p.productId === productId);
                        return {
                            productName: product ? product.productName : productId,
                            soldPercentage: totalSold > 0 ? (quantity / totalSold) * 100 : 0,
                        };
                    });
                const labels = topProducts.map(p => p.productName || "Unknown Product");
                const percentages = topProducts.map(p => p.soldPercentage || 0);
                setTopProductsData({ labels, percentages });

                const monthlyProfit = {};
                sales.forEach(sale => {
                    if (!sale.saleDate || !sale.productId) return;
                    const product = products.find(p => p.productId === sale.productId);
                    if (product) {
                        const date = new Date(sale.saleDate).toISOString().slice(0, 7);
                        const quantity = sale.sizeQuantities && Object.keys(sale.sizeQuantities).length > 0
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

                const totalOwners = users.filter(user => user.role === 'OWNER').length;
                const totalEmployees = users.filter(user => user.role === 'EMPLOYEE').length;
                setUserData({ totalOwners, totalEmployees });
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };

        fetchAndSetData();
        const intervalId = setInterval(fetchAndSetData, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    // Chart Data
    const inventoryChartData = {
        labels: ['Sold Products', 'Available Products'],
        datasets: [
            {
                data: [
                    inventoryData.soldProducts || 0,
                    inventoryData.totalProducts || 0
                ],
                backgroundColor: [palette.accent2, palette.chartTeal],
                borderWidth: 2,
                borderColor: palette.card,
            },
        ],
    };

    const topProductsChartData = {
        labels: topProductsData.labels,
        datasets: [
            {
                label: 'Sold Percentage (%)',
                data: topProductsData.percentages,
                backgroundColor: palette.chartPurple,
                borderRadius: 10,
                borderSkipped: false,
            },
        ],
    };

    const profitChartData = {
        labels: profitData.labels,
        datasets: [
            {
                label: 'Profit',
                data: profitData.data,
                borderColor: palette.accent,
                backgroundColor: palette.accent + '22',
                tension: 0.4,
                pointBackgroundColor: palette.accent,
                fill: true,
            },
        ],
    };

    // Card styles
    const cardStyle = {
        borderRadius: 18,
        boxShadow: palette.shadow,
        background: palette.card,
        border: `1px solid ${palette.border}`,
        p: 3,
        minWidth: 180,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    };

    return (
        <>
            <OwnerNavbar />
            <Box sx={{ minHeight: '100vh', background: "#fff" }}>
                <Box sx={{
                    px: { xs: 1, md: 5 },
                    py: { xs: 2, md: 4 },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                }}>
                    <Container maxWidth="xl" disableGutters>
                        {/* Header */}
                        <Box sx={{
                            mb: 4,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                        }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h4" sx={{
                                    fontWeight: 800,
                                    color: palette.heading,
                                    letterSpacing: 1,
                                    mb: 0.5,
                                    textAlign: 'left'
                                }}>
                                    Owner Dashboard
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: palette.textSecondary, textAlign: 'left' }}>
                                    Here’s an overview of your business performance.
                                </Typography>
                            </Box>
                            <Avatar sx={{
                                bgcolor: palette.accent,
                                width: 56,
                                height: 56,
                                fontWeight: 700,
                                fontSize: 28,
                                boxShadow: palette.shadow
                            }}>
                                O
                            </Avatar>
                        </Box>

                        {/* Overview Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center" alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ ...cardStyle, borderTop: `6px solid ${palette.accent}` }}>
                                    <StorefrontIcon sx={{ color: palette.accent, mb: 1, fontSize: 32 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: palette.textSecondary }}>
                                        Total Products
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: palette.textMain }}>
                                        {overviewData.totalProducts}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ ...cardStyle, borderTop: `6px solid ${palette.accent2}` }}>
                                    <ShoppingCartIcon sx={{ color: palette.accent2, mb: 1, fontSize: 32 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: palette.textSecondary }}>
                                        Total Sales
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: palette.textMain }}>
                                        {overviewData.totalSales}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ ...cardStyle, borderTop: `6px solid ${palette.accent3}` }}>
                                    <Inventory2Icon sx={{ color: palette.accent3, mb: 1, fontSize: 32 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: palette.textSecondary }}>
                                        Total Stock
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: palette.textMain }}>
                                        {overviewData.totalStock}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ ...cardStyle, borderTop: `6px solid ${palette.accentDanger}` }}>
                                    <WarningAmberIcon sx={{ color: palette.accentDanger, mb: 1, fontSize: 32 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: palette.textSecondary }}>
                                        Out of Stock
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: palette.textMain }}>
                                        {overviewData.outOfStock}
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Charts & User Info */}
                        <Grid container spacing={3} alignItems="stretch" sx={{ mb: 4 }} justifyContent="center">
                            <Grid item xs={12} md={4}>
                                <Card sx={{ ...cardStyle, alignItems: 'flex-start' }}>
                                    <GroupIcon sx={{ color: palette.accent, mb: 1, fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: palette.textSecondary }}>
                                        Users
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body1" sx={{ color: palette.textMain }}>
                                            Owners: <b>{userData.totalOwners}</b>
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: palette.textSecondary }}>
                                            Employees: <b>{userData.totalEmployees}</b>
                                        </Typography>
                                    </Box>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ ...cardStyle }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: palette.textSecondary }}>
                                        Inventory
                                    </Typography>
                                    <Box sx={{ height: 160, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Pie
                                            data={inventoryChartData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        position: 'bottom',
                                                        labels: { color: palette.textMain }
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ ...cardStyle }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: palette.textSecondary }}>
                                        Profit Trend
                                    </Typography>
                                    <Box sx={{ height: 160, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Line
                                            data={profitChartData}
                                            options={{
                                                responsive: true,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    y: {
                                                        title: { display: true, text: 'Profit', color: palette.textSecondary },
                                                        ticks: { color: palette.textMain }
                                                    },
                                                    x: {
                                                        title: { display: true, text: 'Month', color: palette.textSecondary },
                                                        ticks: { color: palette.textMain }
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Top Products */}
                        <Grid container justifyContent="center">
                            <Grid item xs={12} md={10} lg={8}>
                                <Card sx={{ ...cardStyle, mt: 2, width: '100%', alignItems: 'flex-start' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: palette.textSecondary }}>
                                        Top 10 Most Sold Products
                                    </Typography>
                                    <Box sx={{ height: 320, width: '100%' }}>
                                        <Bar
                                            data={topProductsChartData}
                                            options={{
                                                responsive: true,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        max: 100,
                                                        title: { display: true, text: 'Sold Percentage (%)', color: palette.textSecondary },
                                                        ticks: { callback: value => `${value}%`, color: palette.textMain }
                                                    },
                                                    x: {
                                                        title: { display: true, text: 'Product', color: palette.textSecondary },
                                                        ticks: { color: palette.textMain }
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </Box>
        </>
    );
}

export default OwnerDashboard;
