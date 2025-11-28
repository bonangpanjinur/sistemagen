import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories';
import Departures from './pages/Departures';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Jamaah from './pages/Jamaah';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Finance from './pages/Finance';
import HR from './pages/HR';
import Logistics from './pages/Logistics';
import Marketing from './pages/Marketing';
import Masters from './pages/Masters';
import Settings from './pages/Settings';
import Manifest from './pages/Manifest';
import RoomingList from './pages/RoomingList';
import Tasks from './pages/Tasks';
import Payroll from './pages/Payroll';
import Categories from './pages/Categories';
import { DataProvider } from './contexts/DataContext';
import './index.css';

const container = document.getElementById('umroh-manager-dashboard');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <HashRouter>
                <DataProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="agents" element={<Agents />} />
                            <Route path="bookings" element={<Bookings />} />
                            <Route path="bookings/create" element={<CreateBooking />} />
                            <Route path="packages" element={<Packages />} />
                            <Route path="packages/categories" element={<PackageCategories />} />
                            <Route path="departures" element={<Departures />} />
                            <Route path="flights" element={<Flights />} />
                            <Route path="hotels" element={<Hotels />} />
                            <Route path="jamaah" element={<Jamaah />} />
                            <Route path="users" element={<Users />} />
                            <Route path="roles" element={<Roles />} />
                            <Route path="finance" element={<Finance />} />
                            <Route path="hr" element={<HR />} />
                            <Route path="logistics" element={<Logistics />} />
                            <Route path="marketing" element={<Marketing />} />
                            <Route path="masters" element={<Masters />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="manifest" element={<Manifest />} />
                            <Route path="rooming" element={<RoomingList />} />
                            <Route path="tasks" element={<Tasks />} />
                            <Route path="payroll" element={<Payroll />} />
                            <Route path="categories" element={<Categories />} />
                        </Route>
                    </Routes>
                </DataProvider>
            </HashRouter>
        </React.StrictMode>
    );
}