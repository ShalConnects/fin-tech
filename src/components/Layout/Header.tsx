import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Menu, Bell, Search, Sun, Moon, User, Settings, LogOut, ArrowLeftRight, LifeBuoy, Globe, Heart } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotificationStore } from '../../store/notificationStore';
import { ProfileEditModal } from './ProfileEditModal';
import { useNavigate, Link } from 'react-router-dom';
import { GlobalSearchDropdown } from './GlobalSearchDropdown';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
  subtitle?: string | React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Accounts', href: '/accounts' },
  { name: 'Reports', href: '/reports' },
  { name: 'Savings', href: '/savings' },
];

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title, subtitle }) => {
  const { setGlobalSearchTerm, globalSearchTerm } = useFinanceStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, profile, signOut, isLoading } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { i18n, t } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const languageBtnRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  // Click outside to close user menu and language menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close user menu
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      
      // Close language menu
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node) &&
        languageBtnRef.current &&
        !languageBtnRef.current.contains(event.target as Node)
      ) {
        setShowLanguageMenu(false);
      }
    }
    if (showUserMenu || showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showLanguageMenu]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        // Check if click is inside the dropdown
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return; // Don't close if clicking inside dropdown
        }
        setIsSearchFocused(false);
      }
    }
    if (isSearchFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchFocused]);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setShowLanguageMenu(false);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-0.5">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white" style={{ marginLeft: 0 }}>{title}</h1>
          </div>
          {subtitle && (
            <div className="text-gray-600 text-sm sm:text-base mt-0.5 hidden xs:block">
              {subtitle}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search */}
          <div className="hidden sm:block relative w-80">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-full">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2" />
            <input
              type="text"
                placeholder={t('search')}
                className="bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none w-full"
              value={globalSearchTerm}
              onChange={e => setGlobalSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                ref={searchInputRef}
            />
            </div>
            <GlobalSearchDropdown 
              isFocused={isSearchFocused} 
              inputRef={searchInputRef} 
              dropdownRef={dropdownRef}
              onClose={() => setIsSearchFocused(false)}
            />
          </div>
          
          {/* Language Switcher */}
          {/* <div className="relative">
            <button
              ref={languageBtnRef}
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg transition-colors"
              style={{ background: 'rgb(243 244 246 / var(--tw-bg-opacity, 1))' }}
              title={t('changeLanguage')}
            >
              <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getCurrentLanguage().flag}
              </span>
            </button>

            {showLanguageMenu && (
              <div ref={languageMenuRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('selectLanguage')}</p>
                </div>
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                      i18n.language === language.code
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span>{language.name}</span>
                    {i18n.language === language.code && (
                      <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div> */}
          
          {/* Theme Toggle & Notifications */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title={isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
              style={{ height: 28, width: 28 }}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-300" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-300" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <button
              ref={profileBtnRef}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {isLoading ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : profile?.profilePicture ? (
                <img
                  src={supabase.storage.from('avatars').getPublicUrl(profile.profilePicture + '?t=' + Date.now()).data.publicUrl}
                  alt={profile.fullName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm sm:text-lg font-bold">
                  {profile?.fullName
                    ? profile.fullName.trim().split(' ').map((n: string, i: number, arr: string[]) => i === 0 || i === arr.length - 1 ? n[0].toUpperCase() : '').join('')
                    : 'U'}
                </span>
              )}
            </button>

            {showUserMenu && (
              <div ref={userMenuRef} className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile?.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('defaultCurrency')}: {profile?.local_currency || 'USD'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t('editProfile')}
                </button>
                <button
                  onClick={() => {
                    navigate('/history');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <LifeBuoy className="w-4 h-4 mr-2" />
                  {t('history')}
                </button>
                <button
                  onClick={() => {
                    navigate('/transfers');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  {t('transfers')}
                </button>
                <button
                  onClick={() => {
                    navigate('/donations');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donations
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};