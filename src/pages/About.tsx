import React from 'react';

const About: React.FC = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth font-manrope">
    <div className="w-4/5 mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8 text-center">About FinanceFlow</h1>
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        FinanceFlow is your all-in-one personal finance platform. We help you track spending, manage budgets, set savings goals, and even handle lending and borrowing—all in a secure, modern, and easy-to-use interface.
      </p>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Our mission is to empower individuals and families to take control of their financial future. We believe everyone deserves access to powerful, intuitive tools that make managing money simple, transparent, and stress-free.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Team & Vision</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
          FinanceFlow was created by a passionate team of developers, designers, and finance enthusiasts. Our vision is to make financial wellness accessible to everyone, everywhere.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          We’re committed to continuous improvement, listening to our users, and building features that truly make a difference in your financial life.
        </p>
      </div>
    </div>
  </div>
);

export default About; 