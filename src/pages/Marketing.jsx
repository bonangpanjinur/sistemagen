import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Komponen Dummy untuk Sub-halaman Marketing
const MarketingDashboard = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-gray-800">Marketing Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Link to="/marketing/campaigns" className="p-6 bg-white shadow rounded-lg hover:bg-gray-50">
        <h3 className="font-bold text-blue-600">Kampanye</h3>
        <p className="text-sm text-gray-500">Kelola kampanye iklan dan promosi.</p>
      </Link>
      <Link to="/marketing/leads" className="p-6 bg-white shadow rounded-lg hover:bg-gray-50">
        <h3 className="font-bold text-green-600">Leads (Calon Jamaah)</h3>
        <p className="text-sm text-gray-500">Database prospek jamaah baru.</p>
      </Link>
    </div>
  </div>
);

const Campaigns = () => <div className="p-4 bg-white shadow rounded"><h3>Halaman Kampanye (Under Construction)</h3></div>;
const Leads = () => <div className="p-4 bg-white shadow rounded"><h3>Halaman Leads (Under Construction)</h3></div>;

const Marketing = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/" element={<MarketingDashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/leads" element={<Leads />} />
      </Routes>
    </div>
  );
};

export default Marketing;