import React from 'react';

const TermsOfService: React.FC = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth font-manrope">
    <div className="w-4/5 mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8 text-center">Terms of Service</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">By using FinanceFlow, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the app.</p>
        <h2 className="text-2xl font-bold mb-4">2. User Responsibilities</h2>
        <p className="mb-4">You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
        <h2 className="text-2xl font-bold mb-4">3. Prohibited Activities</h2>
        <p className="mb-4">You may not use FinanceFlow for any unlawful purpose, to harass others, or to attempt to gain unauthorized access to our systems.</p>
        <h2 className="text-2xl font-bold mb-4">4. Disclaimer of Liability</h2>
        <p>FinanceFlow is provided as-is without warranties of any kind. We are not liable for any damages or losses resulting from your use of the app.</p>
      </div>
      <p className="text-center text-gray-500 dark:text-gray-400">These terms may be updated from time to time. Please review them regularly.</p>
    </div>
  </div>
);

export default TermsOfService; 