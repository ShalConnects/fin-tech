import React from 'react';

const articles = [
  {
    title: '5 Simple Ways to Save More Money Every Month',
    date: 'July 2024',
    summary: 'Discover practical tips to boost your savings and reach your financial goals faster with these easy-to-implement strategies.',
    link: '#'
  },
  {
    title: 'Understanding the Basics of Budgeting',
    date: 'June 2024',
    summary: 'Learn how to create a budget that works for you, track your expenses, and avoid common pitfalls.',
    link: '#'
  },
  {
    title: 'How to Manage Loans and Borrow Responsibly',
    date: 'May 2024',
    summary: 'A guide to borrowing smart, keeping track of your loans, and staying out of debt trouble.',
    link: '#'
  }
];

const Blog: React.FC = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth font-manrope">
    <div className="w-4/5 mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8 text-center">FinanceFlow Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{article.title}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">{article.date}</span>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{article.summary}</p>
            <a href={article.link} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-auto">Read More</a>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Blog; 