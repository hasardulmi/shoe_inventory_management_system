// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import EmployeeRegistration from './pages/EmployeeRegistration';
import SupplierManagement  from './pages/SupplierManagement';
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProductManagement from "./pages/ProductManagement";
import EmployeeProfile from './pages/EmployeeProfile';
import OwnerProfile from './pages/OwnerProfile';
import Sales from "./pages/Sales";
import EmployeeSalesReport from './pages/EmployeeSalesReport';
import Return from './pages/ReturnManagement';




function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                <Route path="/employeeRegistration" element={<EmployeeRegistration />} />
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                <Route path="/supplierManagement" element={<SupplierManagement />} />
                <Route path="/product-management" element={<ProductManagement />} />
                <Route path="/employeeProfile" element={<EmployeeProfile />} />
                <Route path="/profile" element={<OwnerProfile />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/employee-sales-report" element={<EmployeeSalesReport />} />
                <Route path="/return" element={<Return />} />


                {/* Add more routes as needed */}
            </Routes>
        </Router>
    );
}

export default App;