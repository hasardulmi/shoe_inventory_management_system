import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import InventoryManagement from './pages/InventoryManagement';
import Profile from './pages/Profile';
import SalesReport from './pages/SalesReport';
import SupplierManagement from './pages/SupplierManagement';
import ViewReport from './pages/ViewReport';
import EmployeeManagement from './pages/EmployeeManagement';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeSalesReport from './pages/EmployeeSalesReport';
import Payment from './pages/PaymentManagement'; // Add this import



const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/inventoryManagement" element={<InventoryManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/report" element={<SalesReport />} />
          <Route path="/view" element={<ViewReport />} />
          <Route path="/employeeManagement" element={<EmployeeManagement />} />
          <Route path="/supplierManagement" element={<SupplierManagement />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/EmployeeProfile" element={<EmployeeProfile />} />
          <Route path="/EmployeeSalesReport" element={<EmployeeSalesReport />} />


        </Routes>
      </Router>
  );
};

export default App;