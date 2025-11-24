import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Komponen Dummy untuk Sub-halaman HR
const HRDashboard = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-gray-800">HR Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link to="/hr/employees" className="p-6 bg-white shadow rounded-lg hover:bg-gray-50">
        <h3 className="font-bold text-blue-600">Data Karyawan</h3>
        <p className="text-sm text-gray-500">Kelola data staff dan pengguna.</p>
      </Link>
      <Link to="/hr/payroll" className="p-6 bg-white shadow rounded-lg hover:bg-gray-50">
        <h3 className="font-bold text-green-600">Payroll (Gaji)</h3>
        <p className="text-sm text-gray-500">Kelola penggajian bulanan.</p>
      </Link>
      <Link to="/hr/attendance" className="p-6 bg-white shadow rounded-lg hover:bg-gray-50">
        <h3 className="font-bold text-purple-600">Absensi</h3>
        <p className="text-sm text-gray-500">Rekap kehadiran karyawan.</p>
      </Link>
    </div>
  </div>
);

const Employees = () => <div className="p-4 bg-white shadow rounded"><h3>Halaman Data Karyawan (Under Construction)</h3></div>;
const Payroll = () => <div className="p-4 bg-white shadow rounded"><h3>Halaman Penggajian (Under Construction)</h3></div>;
const Attendance = () => <div className="p-4 bg-white shadow rounded"><h3>Halaman Absensi (Under Construction)</h3></div>;

const HR = () => {
  return (
    <div className="space-y-6">
      {/* Sub-Routing untuk Modul HR */}
      <Routes>
        <Route path="/" element={<HRDashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </div>
  );
};

export default HR;