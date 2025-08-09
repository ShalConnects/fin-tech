import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw, Heart, Bookmark, ExternalLink, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { MotivationalQuoteSkeleton } from './MotivationalQuoteSkeleton';

interface QuoteData {
  q: string;
  a: string;
}

export const MotivationalQuote: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { addFavoriteQuote, removeFavoriteQuote, isQuoteFavorited, favoriteQuotes } = useNotificationStore();
  
  // Check if quote widget is hidden
  const [showQuoteWidget, setShowQuoteWidget] = useState(() => {
    const saved = localStorage.getItem('showQuoteWidget');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save quote widget visibility preference to localStorage
  useEffect(() => {
    localStorage.setItem('showQuoteWidget', JSON.stringify(showQuoteWidget));
  }, [showQuoteWidget]);

  // Fallback quotes for when API fails
  const fallbackQuotes = [
    // Financial Quotes
    { q: "Financial freedom is not about having a lot of money, it's about having a lot of options.", a: "Robert Kiyosaki" },
    { q: "The best investment you can make is in yourself.", a: "Warren Buffett" },
    { q: "Wealth consists not in having great possessions, but in having few wants.", a: "Epictetus" },
    { q: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.", a: "Ayn Rand" },
    { q: "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought.", a: "T. T. Munger" },
    { q: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", a: "Dave Ramsey" },
    { q: "The goal isn't more money. The goal is living life on your terms.", a: "Chris Brogan" },
    { q: "Every dollar you save is a dollar you can invest in your future.", a: "Unknown" },
    { q: "Small amounts saved daily add up to huge investments in the end.", a: "Robert G. Allen" },
    { q: "The more you learn, the more you earn.", a: "Warren Buffett" },
    { q: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.", a: "Albert Einstein" },
    { q: "Don't save what is left after spending, but spend what is left after saving.", a: "Warren Buffett" },
    { q: "A budget is telling your money where to go instead of wondering where it went.", a: "John C. Maxwell" },
    { q: "The lack of money is the root of all evil.", a: "Mark Twain" },
    { q: "It's not how much money you make, but how much money you keep.", a: "Robert Kiyosaki" },
    
    // Motivation Quotes
    { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
    { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
    { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
    { q: "Don't watch the clock; do what it does. Keep going.", a: "Sam Levenson" },
    { q: "The only limit to our realization of tomorrow is our doubts of today.", a: "Franklin D. Roosevelt" },
    { q: "What you get by achieving your goals is not as important as what you become by achieving your goals.", a: "Zig Ziglar" },
    { q: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
    { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
    { q: "Success usually comes to those who are too busy to be looking for it.", a: "Henry David Thoreau" },
    { q: "The harder you work for something, the greater you'll feel when you achieve it.", a: "Unknown" },
    { q: "Dream big and dare to fail.", a: "Norman Vaughan" },
    { q: "Your time is limited, don't waste it living someone else's life.", a: "Steve Jobs" },
    { q: "The only person you are destined to become is the person you decide to be.", a: "Ralph Waldo Emerson" },
    
    // Success Quotes
    { q: "Success is walking from failure to failure with no loss of enthusiasm.", a: "Winston Churchill" },
    { q: "I have not failed. I've just found 10,000 ways that won't work.", a: "Thomas Edison" },
    { q: "The difference between ordinary and extraordinary is that little extra.", a: "Jimmy Johnson" },
    { q: "Success is not the key to happiness. Happiness is the key to success.", a: "Albert Schweitzer" },
    { q: "The road to success and the road to failure are almost exactly the same.", a: "Colin Davis" },
    { q: "Success is getting what you want. Happiness is wanting what you get.", a: "Dale Carnegie" },
    { q: "The secret of success is to do the common thing uncommonly well.", a: "John D. Rockefeller Jr." },
    { q: "Success is not in what you have, but who you are.", a: "Bo Bennett" },
    { q: "The successful warrior is the average man, with laser-like focus.", a: "Bruce Lee" },
    { q: "Success is not just about making money. It's about making a difference.", a: "Unknown" },
    
    // Wisdom Quotes
    { q: "The only true wisdom is in knowing you know nothing.", a: "Socrates" },
    { q: "In the middle of difficulty lies opportunity.", a: "Albert Einstein" },
    { q: "The journey of a thousand miles begins with one step.", a: "Lao Tzu" },
    { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
    { q: "The best time to plant a tree was 20 years ago. The second best time is now.", a: "Chinese Proverb" },
    { q: "Happiness is not something ready made. It comes from your own actions.", a: "Dalai Lama" },
    { q: "The mind is everything. What you think you become.", a: "Buddha" },
    { q: "Quality is not an act, it is a habit.", a: "Aristotle" },
    { q: "The only impossible journey is the one you never begin.", a: "Tony Robbins" },
    { q: "Change your thoughts and you change your world.", a: "Norman Vincent Peale" },
    { q: "The greatest glory in living lies not in never falling, but in rising every time we fall.", a: "Nelson Mandela" },
    { q: "Life is 10% what happens to you and 90% how you react to it.", a: "Charles R. Swindoll" },
    { q: "The purpose of our lives is to be happy.", a: "Dalai Lama" }
  ];

  const fetchQuote = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const response = await fetch('https://zenquotes.io/api/random');
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      
      const data = await response.json();
      
      if (data && data[0] && data[0].q) {
        setQuote({
          q: data[0].q,
          a: data[0].a
        });
      } else {
        throw new Error('Invalid quote data');
      }
    } catch (err) {
      console.warn('Failed to fetch quote from API, using fallback:', err);
      setError(true);
      // Use a random fallback quote
      const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
      setQuote(fallbackQuotes[randomIndex]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch quote on component mount
  useEffect(() => {
    fetchQuote();
  }, []);

  // Auto-refresh quote every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuote();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  if (!quote) {
    return <MotivationalQuoteSkeleton />;
  }

  // Don't render if widget is hidden
  if (!showQuoteWidget) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 relative overflow-hidden">
      {/* Close button */}
      <button
        onClick={() => setShowQuoteWidget(false)}
        className="absolute top-2 right-2 p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 transition-colors z-20"
        aria-label="Close Quote Widget"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
        <Quote className="w-full h-full text-purple-600 dark:text-purple-400" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">
              Daily Inspiration
            </span>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <Quote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <blockquote className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed italic">
              "{quote.q}"
            </blockquote>
            
            <div className="flex items-center justify-between mt-2">
              <cite className="text-purple-600 dark:text-purple-400 text-xs font-medium not-italic">
                — {quote.a}
              </cite>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchQuote}
                  disabled={loading}
                  className="p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors group"
                  title={t('dashboard.getNewQuote')}
                >
                  <RefreshCw className={`w-4 h-4 text-purple-600 dark:text-purple-400 ${
                    loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'
                  }`} />
                </button>
                
                <button
                  onClick={() => {
                    if (quote) {
                      if (isQuoteFavorited(quote.q, quote.a)) {
                        // Find and remove the favorite quote
                        const favorites = useNotificationStore.getState().favoriteQuotes;
                        const favorite = favorites.find(f => f.quote === quote.q && f.author === quote.a);
                        if (favorite) {
                          removeFavoriteQuote(favorite.id);
                        }
                      } else {
                        // Determine category based on quote content
                        const quoteText = quote.q.toLowerCase();
                        let category: 'financial' | 'motivation' | 'success' | 'wisdom' = 'wisdom';
                        
                        if (quoteText.includes('money') || quoteText.includes('financial') || 
                            quoteText.includes('wealth') || quoteText.includes('investment') ||
                            quoteText.includes('saving') || quoteText.includes('debt') ||
                            quoteText.includes('income') || quoteText.includes('expense') ||
                            quoteText.includes('budget') || quoteText.includes('profit')) {
                          category = 'financial';
                        } else if (quoteText.includes('motivation') || quoteText.includes('inspire') ||
                                   quoteText.includes('dream') || quoteText.includes('goal') ||
                                   quoteText.includes('passion') || quoteText.includes('drive')) {
                          category = 'motivation';
                        } else if (quoteText.includes('success') || quoteText.includes('achieve') ||
                                   quoteText.includes('win') || quoteText.includes('victory') ||
                                   quoteText.includes('triumph') || quoteText.includes('accomplish')) {
                          category = 'success';
                        }
                        
                        addFavoriteQuote({
                          quote: quote.q,
                          author: quote.a,
                          category: category
                        });
                      }
                    }
                  }}
                  className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors group"
                  title={isQuoteFavorited(quote?.q || '', quote?.a || '') ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors ${
                      isQuoteFavorited(quote?.q || '', quote?.a || '') 
                        ? 'text-red-600 fill-red-600' 
                        : 'text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400'
                    }`} 
                  />
                </button>
                
                <button
                  onClick={() => navigate('/favorite-quotes')}
                  className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors group"
                  title={`View all favorite quotes (${favoriteQuotes.length})`}
                >
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle animation */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20"></div>
    </div>
  );
}; 