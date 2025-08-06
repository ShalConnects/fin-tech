import React from 'react';
import { LifeBuoy, Database, BarChart2, DollarSign, Wallet, ArrowLeftRight, Moon, PlusCircle, StickyNote, Lock, User, Search } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  tech: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, tech }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all transform hover:-translate-y-1">
    <div className="flex items-center gap-4 mb-3">
      <Icon className="w-8 h-8 text-blue-500" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
      <span className="font-semibold">Tech:</span> {tech}
    </div>
  </div>
);

export const HelpAndSupport: React.FC = () => {
  const features = [
    {
      icon: Lock,
      title: 'Authentication',
      description: 'Secure user registration and login system. Users can sign up with an email and password, or use social providers like Google and GitHub. Passwords are encrypted and all sessions are managed securely.',
      tech: 'Supabase Auth, Zustand',
    },
    {
      icon: BarChart2,
      title: 'Dashboard & Analytics',
      description: 'A central hub displaying key financial metrics. Features interactive charts for income vs. expense, account balances, and category-wise spending. Provides a quick overview of your financial health.',
      tech: 'Recharts, Tailwind CSS',
    },
    {
      icon: DollarSign,
      title: 'Transaction Management',
      description: 'A complete CRUD (Create, Read, Update, Delete) system for financial transactions. Users can add income or expenses, categorize them, and view a detailed history. All data is saved in real-time.',
      tech: 'Supabase (Realtime), React Hook Form, Zod',
    },
    {
      icon: Wallet,
      title: 'Account Management',
      description: 'Users can create and manage multiple financial accounts (e.g., checking, savings). Each account tracks its own balance, which is automatically updated as new transactions are added.',
      tech: 'Supabase, Zustand',
    },
    {
      icon: ArrowLeftRight,
      title: 'Fund Transfers',
      description: 'Allows for transferring funds between different user-owned accounts. The system ensures that balances are updated correctly on both the source and destination accounts.',
      tech: 'Supabase transactions',
    },
    {
      icon: User,
      title: 'User Profile Management',
      description: 'Users can edit their profile information, including their full name, default currency, and profile picture. Profile images are uploaded securely to Supabase Storage.',
      tech: 'Supabase Storage',
    },
    {
      icon: StickyNote,
      title: 'Persistent Sticky Note',
      description: 'A simple, fixed-position sticky note on the dashboard for jotting down quick reminders. The note content is saved automatically to the browser\'s local storage.',
      tech: 'React State, LocalStorage',
    },
    {
      icon: Moon,
      title: 'Light/Dark Theme',
      description: 'A theme toggler that allows users to switch between a light and a dark user interface. The user\'s preference is saved and automatically applied on their next visit.',
      tech: 'Tailwind CSS (Class Strategy), Zustand (Persist)',
    },
    {
      icon: PlusCircle,
      title: 'Floating Action Button (FAB)',
      description: 'A modern "speed dial" button that provides quick access to common actions like adding a transaction, creating an account, or initiating a transfer. Features smooth, professional animations.',
      tech: 'Headless UI, Tailwind CSS',
    },
    {
      icon: Search,
      title: 'Global Search',
      description: 'A search bar in the header that allows users to quickly find transactions. The search is performed across all transaction records in the database.',
      tech: 'Supabase (DB search), Zustand',
    },
    {
      icon: Database,
      title: 'Backend & Database',
      description: 'The entire application is powered by Supabase, which provides the database, authentication, real-time data, and file storage. Row Level Security is enforced to protect user data.',
      tech: 'Supabase, PostgreSQL',
    },
  ];

  return (
    <div className="p-6 md:p-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <LifeBuoy className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            A complete guide to all the features in the FinTrack application.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}; 