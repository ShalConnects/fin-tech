import React from 'react';

const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth font-manrope">
    <div className="w-4/5 mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8 text-center">Privacy Policy</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">1. Data Collection</h2>
        <p className="mb-4">We collect only the information necessary to provide you with a secure and personalized finance experience. This includes your name, email, account data, and transaction history.</p>
        <h2 className="text-2xl font-bold mb-4">2. Data Usage</h2>
        <p className="mb-4">Your data is used solely to deliver and improve FinanceFlow’s features. We do not sell or share your personal information with third parties for marketing purposes.</p>
        <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
        <p className="mb-4">We use industry-standard encryption and security practices to protect your data, both in transit and at rest. Access to your data is strictly controlled.</p>
        <h2 className="text-2xl font-bold mb-4">4. User Rights</h2>
        <p>You have the right to access, update, or delete your personal data at any time. Contact us at salauddin.kader406@gmail.com for any privacy-related requests.</p>
      </div>
      <p className="text-center text-gray-500 dark:text-gray-400">This policy may be updated from time to time. Please review it regularly.</p>
    </div>
  </div>
);

export default PrivacyPolicy; 