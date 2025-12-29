'use client';

import React from 'react';

const AdminDashboard: React.FC = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
    <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl border border-gray-100 p-8 text-center">
      <h1 className="text-2xl font-semibold mb-3">Admin dashboard disabled</h1>
      <p className="text-gray-600">
        Firebase client features were removed to keep secrets out of the build.
        Manage bookings via email, or re-enable Firebase in a private admin backend.
      </p>
    </div>
  </div>
);

export default AdminDashboard;
