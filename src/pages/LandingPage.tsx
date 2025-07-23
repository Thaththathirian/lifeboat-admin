import React from 'react';
import ZohoOAuthLogin from '@/components/ZohoOAuthLogin';
import { getZohoOAuthConfig } from '@/config/zoho-oauth';

const LandingPage: React.FC = () => {
  const config = getZohoOAuthConfig();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Scholarship Connect</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Administrative Portal for Managing Scholarship Programs
        </p>
      </div>
      
      <ZohoOAuthLogin />
      
      <div className="mt-8 text-xs text-gray-500 text-center space-y-1">
        <p>Redirect URL: {config.REDIRECT_URL}</p>
        <p>Environment: {import.meta.env.MODE}</p>
        <p>Backend API: {config.BACKEND_ADMIN_ENDPOINT}</p>
      </div>
    </div>
  );
};

export default LandingPage;