import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Search, Filter, Bookmark, Calendar, User, Eye, Quote } from 'lucide-react';
import { useNotificationStore, FavoriteQuote } from '../store/notificationStore';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const FavoriteQuotes: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { favoriteQuotes, removeFavoriteQuote } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'author' | 'category'>('date');
  
  // Check if Quote Widget is hidden on dashboard
  const [showQuoteWidget, setShowQuoteWidget] = useState(() => {
    const saved = localStorage.getItem('showQuoteWidget');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Filter quotes based on search and category
  const filteredQuotes = favoriteQuotes
    .filter(quote => {
      const matchesSearch = quote.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || quote.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'author':
          return a.author.localeCompare(b.author);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

  const categories = ['all', 'financial', 'motivation', 'success', 'wisdom'];

  const handleShowQuoteWidget = () => {
    setShowQuoteWidget(true);
    localStorage.setItem('showQuoteWidget', 'true');
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'financial':
        return '💰';
      case 'motivation':
        return '💪';
      case 'success':
        return '🎯';
      case 'wisdom':
        return '🧠';
      default:
        return '💭';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'financial':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'motivation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'success':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'wisdom':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (favoriteQuotes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              No Favorite Quotes Yet
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Start collecting your favorite motivational quotes by clicking the heart icon on any quote you love!
            </p>
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                  How to add favorites
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Visit your dashboard and click the heart icon next to any quote that inspires you. 
                Your favorites will appear here for easy access.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Favorite Quotes
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Your collection of inspiring financial wisdom
                </p>
              </div>
            </div>
            
            {/* Show Quote Widget Button */}
            {!showQuoteWidget && (
              <button
                onClick={handleShowQuoteWidget}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                title="Show Quote Widget on Dashboard"
              >
                <Quote className="w-4 h-4" />
                <span>Show on Dashboard</span>
              </button>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Bookmark className="w-5 h-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Quotes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{favoriteQuotes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {favoriteQuotes.filter(q => {
                      const quoteDate = new Date(q.createdAt);
                      const now = new Date();
                      return quoteDate.getMonth() === now.getMonth() && 
                             quoteDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <User className="w-5 h-5 text-purple-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique Authors</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(favoriteQuotes.map(q => q.author)).size}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-orange-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(favoriteQuotes.map(q => q.category).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quotes or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'author' | 'category')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="author">Sort by Author</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredQuotes.length} of {favoriteQuotes.length} favorite quotes
          </p>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              {/* Quote Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(quote.category)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(quote.category)}`}>
                    {quote.category || 'General'}
                  </span>
                </div>
                <button
                  onClick={() => removeFavoriteQuote(quote.id)}
                  className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                </button>
              </div>

              {/* Quote Text */}
              <blockquote className="text-gray-900 dark:text-white text-lg font-medium mb-4 leading-relaxed">
                "{quote.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <cite className="text-gray-600 dark:text-gray-300 font-medium not-italic">
                    — {quote.author}
                  </cite>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for Filtered Results */}
        {filteredQuotes.length === 0 && favoriteQuotes.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No quotes found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 