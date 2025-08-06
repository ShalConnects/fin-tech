import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import InteractiveBackground from '../components/InteractiveBackground';



// Password strength meter component
const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(password);
  const getColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    return 'Strong';
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 w-full rounded-full transition-all duration-300 ${
                i <= strength ? getColor() : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${
          strength <= 2 ? 'text-red-500' : 
          strength <= 3 ? 'text-yellow-500' : 'text-green-500'
        }`}>
          {getText()}
        </span>
      </div>
    </div>
  );
};

// Social login button component
const SocialButton: React.FC<{
  provider: 'google' | 'apple';
  onClick: () => void;
  isLoading?: boolean;
}> = ({ provider, onClick, isLoading = false }) => {
  const isGoogle = provider === 'google';
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 shadow-sm rounded-lg ${
        isGoogle 
          ? 'text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-300 hover:bg-white/95 dark:bg-gray-800/90 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/95' 
          : 'text-white bg-black/90 backdrop-blur-sm border border-gray-800 hover:bg-black/95 dark:bg-gray-900/90 dark:border-gray-700 dark:hover:bg-gray-900/95'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-3"></div>
          Connecting...
        </div>
      ) : (
        <>
          {isGoogle ? (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          )}
          Continue with {isGoogle ? 'Google' : 'Apple'}
        </>
      )}
    </button>
  );
};

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('login');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  
  // Refs for focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const { signIn, signUp, signInWithProvider, isLoading, error, success, clearMessages } = useAuthStore();
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<boolean | null>(null);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  // Debug: Log auth store state changes
  useEffect(() => {
    console.log('Auth store state:', { error, success, isLoading });
  }, [error, success, isLoading]);

  // Auto-focus first input on tab switch and clear messages
  useEffect(() => {
    // Clear any existing messages when switching tabs
    clearMessages();
    
    const timer = setTimeout(() => {
      if (activeTab === 'login') {
        emailRef.current?.focus();
      } else if (activeTab === 'signup' && signupStep === 1) {
        emailRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, signupStep, clearMessages]);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  // Name validation
  const validateName = (name: string) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  // Handle email input for signup step 1
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  // Handle continue button for signup step 1
  const handleContinue = () => {
    const error = validateEmail(email);
    setEmailError(error);
    
    if (!error) {
      setSignupStep(2);
      // Focus name field after animation
      setTimeout(() => nameRef.current?.focus(), 300);
    } else {
      emailRef.current?.focus();
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    try {
      const result = await signInWithProvider(provider);
      
      if (!result.success) {
        console.error('Social login failed:', result.message);
      } else {
        console.log('Social login initiated successfully');
        // The user will be redirected to the OAuth provider
      }
    } catch (error) {
      console.error('Social login exception:', error);
    } finally {
      setSocialLoading(null);
    }
  };

  // Handle signup submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const nameErr = validateName(fullName);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setNameError(nameErr);
    
    if (emailErr || passwordErr || nameErr) {
      // Focus first error field
      if (emailErr) emailRef.current?.focus();
      else if (nameErr) nameRef.current?.focus();
      else if (passwordErr) passwordRef.current?.focus();
      return;
    }

    try {
      // Use the auth store's signUp method
      const result = await signUp(email, password, fullName);
      
      if (result.success) {
        // Reset form on success
        setEmail('');
        setPassword('');
        setFullName('');
        setSignupStep(1);
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  // Handle login submission
  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    
    if (emailErr || passwordErr) {
      if (emailErr) emailRef.current?.focus();
      else if (passwordErr) passwordRef.current?.focus();
      return;
    }

    try {
      console.log('Attempting login for:', email);
      // Use the auth store's signIn method
      const result = await signIn(email, password);
      
      if (result.success) {
        console.log('Login successful');
        // The auth store will handle navigation
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    setForgotPasswordMessage(null);
    setForgotPasswordSuccess(null);
    if (!email) {
      setEmailError('Please enter your email address');
      emailRef.current?.focus();
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        setForgotPasswordMessage(error.message);
        setForgotPasswordSuccess(false);
      } else {
        setForgotPasswordMessage('Password reset email sent! Check your inbox.');
        setForgotPasswordSuccess(true);
      }
    } catch (error) {
      setForgotPasswordMessage('An unexpected error occurred.');
      setForgotPasswordSuccess(false);
    }
  };

  // Handle key down for input fields
  const handleKeyDown = (e: React.KeyboardEvent, ref?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter' && ref) {
      ref.current?.focus();
    } else if (e.key === 'Enter' && activeTab === 'signup' && signupStep === 2) {
      handleSignUp(e as React.FormEvent);
    } else if (e.key === 'Enter' && activeTab === 'login') {
      handleLogIn(e as React.FormEvent);
    }
  };

  // Inline feedback logic
  const getLoginErrorMessage = () => {
    if (error && typeof error === 'string' && error.toLowerCase().includes('email not confirmed')) {
      return 'Please confirm your email before logging in.';
    }
    return error;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Interactive Background */}
      <InteractiveBackground />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Tab Switcher */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6 border border-white/20 dark:border-gray-700/50">
          {/* Header Row with Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                FinTrack
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your finances with confidence
              </p>
            </div>
            <button
              onClick={() => useThemeStore.getState().toggleTheme()}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 border border-gray-300/50 dark:border-gray-600/50 rounded-full hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="flex bg-gray-100/50 dark:bg-gray-700/50 rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setSignupStep(1);
                setEmail('');
                setPassword('');
                setFullName('');
                setEmailError('');
                setPasswordError('');
                setNameError('');
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setSignupStep(1);
                setEmail('');
                setPassword('');
                setFullName('');
                setEmailError('');
                setPasswordError('');
                setNameError('');
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <SocialButton 
              provider="google" 
              onClick={() => handleSocialLogin('google')} 
              isLoading={socialLoading === 'google'}
            />
            <SocialButton 
              provider="apple" 
              onClick={() => handleSocialLogin('apple')} 
              isLoading={socialLoading === 'apple'}
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50 dark:border-gray-600/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Feedback Messages */}
          {activeTab === 'signup' && (success || error) && (
            <div className={`rounded-md p-4 mb-4 border ${success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {success ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>{success || error}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'login' && error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{getLoginErrorMessage()}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'login' && (
            <form onSubmit={handleLogIn} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="sr-only">
                  Email address
                </label>
                <input
                  ref={emailRef}
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(validateEmail(e.target.value));
                  }}
                  onKeyDown={e => handleKeyDown(e)}
                  placeholder="Email address"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm ${
                    emailError
                      ? 'border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20'
                      : 'border-gray-300/50 dark:border-gray-600/50'
                  }`}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'login-email-error' : undefined}
                />
                {emailError && (
                  <p id="login-email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(validatePassword(e.target.value));
                    }}
                    onKeyDown={e => handleKeyDown(e)}
                    placeholder="Password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm ${
                      passwordError
                        ? 'border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20'
                        : 'border-gray-300/50 dark:border-gray-600/50'
                    }`}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? 'login-password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p id="login-password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
              {forgotPasswordMessage && (
                <div className={`mt-2 text-sm ${forgotPasswordSuccess ? 'text-green-600' : 'text-red-600'}`}>{forgotPasswordMessage}</div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-primary border border-transparent rounded-lg hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus-ring-gradient transition-all duration-200 shadow-lg"
              >
                <LockClosedIcon className="w-4 h-4 mr-2" />
                Sign In
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <div className="space-y-4">
              {/* Step 1: Email Only */}
              {signupStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="signup-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      ref={emailRef}
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => {
                        if (activeTab === 'signup' && signupStep === 1 && e.key === 'Enter') {
                          e.preventDefault();
                          handleContinue();
                        } else {
                          handleKeyDown(e);
                        }
                      }}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm ${
                        emailError
                          ? 'border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20'
                          : 'border-gray-300/50 dark:border-gray-600/50'
                      }`}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? 'signup-email-error' : undefined}
                    />
                    {emailError && (
                      <p id="signup-email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {emailError}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-primary border border-transparent rounded-lg hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus-ring-gradient transition-all duration-200 shadow-lg"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Full Form */}
              {signupStep === 2 && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label htmlFor="signup-name" className="sr-only">
                      Full name
                    </label>
                    <input
                      ref={nameRef}
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setNameError(validateName(e.target.value));
                      }}
                      onKeyDown={e => handleKeyDown(e, passwordRef)}
                      placeholder="Full name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm ${
                        nameError
                          ? 'border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20'
                          : 'border-gray-300/50 dark:border-gray-600/50'
                      }`}
                      aria-invalid={!!nameError}
                      aria-describedby={nameError ? 'signup-name-error' : undefined}
                    />
                    {nameError && (
                      <p id="signup-name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="sr-only">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        ref={passwordRef}
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError(validatePassword(e.target.value));
                        }}
                        onKeyDown={e => handleKeyDown(e)}
                        placeholder="Create a password"
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm ${
                          passwordError
                            ? 'border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20'
                            : 'border-gray-300/50 dark:border-gray-600/50'
                        }`}
                        aria-invalid={!!passwordError}
                        aria-describedby={passwordError ? 'signup-password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p id="signup-password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {passwordError}
                      </p>
                    )}
                    
                    {/* Password strength meter */}
                    <PasswordStrengthMeter password={password} />
                    
                    {/* Password requirements */}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      8+ characters, upper & lower case, number
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-primary border border-transparent rounded-lg hover:bg-gradient-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus-ring-gradient transition-all duration-200 shadow-lg"
                  >
                    <LockClosedIcon className="w-4 h-4 mr-2" />
                    Create Account
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <a href="/termsofservice" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacypolicy" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;