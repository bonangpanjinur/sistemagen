import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext'; // WAJIB ADA: Import Context Data
import Layout from './components/Layout';

// Import Pages
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Departures from './pages/Departures';
import Manifest from './pages/Manifest';
import RoomingList from './pages/RoomingList';
import Jamaah from './pages/Jamaah';
import Logistics from './pages/Logistics';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import HR from './pages/HR';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import Masters from './pages/Masters';
import Categories from './pages/Categories';
import Tasks from './pages/Tasks';
import Payroll from './pages/Payroll';
import './index.css';

const container = document.getElementById('umroh-manager-app');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      {/* WAJIB: Bungkus aplikasi dengan DataProvider agar tidak error 'undefined' */}
      <DataProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </DataProvider>
    </React.StrictMode>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="agents" element={<Agents />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/create" element={<CreateBooking />} />
        <Route path="packages" element={<Packages />} />
        <Route path="packages/categories" element={<PackageCategories />} />
        <Route path="inventory/flights" element={<Flights />} />
        <Route path="inventory/hotels" element={<Hotels />} />
        <Route path="departures" element={<Departures />} />
        <Route path="operations/manifest" element={<Manifest />} />
        <Route path="operations/rooming" element={<RoomingList />} />
        <Route path="operations/logistics" element={<Logistics />} />
        <Route path="jamaah" element={<Jamaah />} />
        <Route path="finance" element={<Finance />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="hr" element={<HR />} />
        <Route path="hr/payroll" element={<Payroll />} />
        <Route path="users/list" element={<Users />} />
        <Route path="users/roles" element={<Roles />} />
        <Route path="masters" element={<Masters />} />
        <Route path="masters/categories" element={<Categories />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}