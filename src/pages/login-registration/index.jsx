import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginRegistration = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const { signIn, signUp, user, userProfile, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Remove the hardcoded '/dashboard' default
  const from = location?.state?.from?.pathname;

  useEffect(() => {
    if (user && userProfile) {
      // Role-based routing
      let redirectPath;
      
      if (from) {
        // If user was trying to access a specific page, redirect there
        redirectPath = from;
      } else {
        // Default routing based on role
        redirectPath = isAdmin ? '/admin-dashboard' : '/dashboard';
      }
      
      navigate(redirectPath, { replace: true });
    }
  }, [user, userProfile, isAdmin, navigate, from]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!resetMode) {
      if (!formData?.password) {
        newErrors.password = 'Password is required';
      } else if (formData?.password?.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (isSignUp) {
        if (!formData?.fullName) {
          newErrors.fullName = 'Full name is required';
        }

        if (!formData?.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData?.password !== formData?.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      let result;

      if (resetMode) {
        // Password reset logic would go here
        console.log('Password reset for:', formData?.email);
        setErrors({ general: 'Password reset functionality not implemented yet' });
        return;
      }

      if (isSignUp) {
        result = await signUp(formData?.email, formData?.password, {
          userData: {
            full_name: formData?.fullName
          }
        });
      } else {
        result = await signIn(formData?.email, formData?.password);
      }

      if (result?.error) {
        if (result?.error?.message?.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password' });
        } else if (result?.error?.message?.includes('User already registered')) {
          setErrors({ general: 'An account with this email already exists' });
        } else {
          setErrors({ general: result?.error?.message || 'An error occurred' });
        }
      } else if (isSignUp) {
        setErrors({ 
          general: 'Account created successfully! Please check your email for verification.' 
        });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setResetMode(false);
    setErrors({});
    setFormData({
      email: formData?.email, // Keep email
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  const toggleResetMode = () => {
    setResetMode(!resetMode);
    setIsSignUp(false);
    setErrors({});
    setFormData({
      email: formData?.email, // Keep email
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-gray-600" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </Button>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              key={isSignUp ? 'signup' : resetMode ? 'reset' : 'signin'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {resetMode ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </motion.h1>
            <p className="text-gray-600 dark:text-gray-400">
              {resetMode 
                ? 'Enter your email to receive reset instructions'
                : isSignUp 
                  ? 'Join us to manage your finances better' :'Sign in to your account'
              }
            </p>
          </div>

          {/* Mode Toggle */}
          {!resetMode && (
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => !isSignUp && toggleMode()}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isSignUp
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => isSignUp && toggleMode()}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  isSignUp
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error Message */}
          {errors?.general && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{errors?.general}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {/* Full Name - Only for Sign Up */}
              {isSignUp && !resetMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData?.fullName}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors?.fullName ? 'border-red-300 dark:border-red-600' : ''}`}
                    />
                  </div>
                  {errors?.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors?.fullName}</p>
                  )}
                </motion.div>
              )}

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData?.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors?.email ? 'border-red-300 dark:border-red-600' : ''}`}
                  />
                </div>
                {errors?.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors?.email}</p>
                )}
              </div>

              {/* Password - Hidden in Reset Mode */}
              {!resetMode && (
                <motion.div
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={formData?.password}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 ${errors?.password ? 'border-red-300 dark:border-red-600' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors?.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors?.password}</p>
                  )}
                </motion.div>
              )}

              {/* Confirm Password - Only for Sign Up */}
              {isSignUp && !resetMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData?.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 ${errors?.confirmPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors?.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors?.confirmPassword}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password Link */}
            {!isSignUp && !resetMode && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={toggleResetMode}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                resetMode ? 'Send Reset Instructions' : isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {resetMode ? (
              <button
                type="button"
                onClick={toggleResetMode}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Back to Sign In
              </button>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}
          </div>

          {/* Social Login Placeholder */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              Or continue with
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                disabled
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                disabled
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">Apple</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginRegistration;