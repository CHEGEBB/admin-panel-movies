/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Client, Account } from 'appwrite';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('dj-afro-movies');

const account = new Account(client);

interface URLParams {
  userId?: string;
  secret?: string;
  expire?: string;
}

export default function ForgotPasswordPage() {
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState(false);
  const [urlParams, setUrlParams] = useState<URLParams>({});
  const [isValidLink, setIsValidLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);

  useEffect(() => {
    // Extract URL parameters
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const secret = params.get('secret');
    const expire = params.get('expire');

    if (userId && secret) {
      setUrlParams({ 
        userId: userId || undefined, 
        secret: secret || undefined, 
        expire: expire || undefined 
      });
      setIsValidLink(true);
    } else {
      setIsValidLink(false);
    }
    setIsCheckingLink(false);
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};

    // Validate password
    const passwordError = validatePassword(passwords.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate confirm password
    if (passwords.password !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await account.updateRecovery(
        urlParams.userId!,
        urlParams.secret!,
        passwords.password
      );

      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setErrors({ 
        general: error.message || 'Failed to reset password. Please try again or request a new reset link.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
          <p className="text-center text-white/80">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h1>
            <p className="text-white/70 mb-6">
              This password reset link is invalid or has expired. Please request a new password reset from the DJ Afro MoviesBox app.
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-2">How to reset your password:</h3>
            <ol className="text-left text-white/80 text-sm space-y-1">
              <li>1. Open the DJ Afro MoviesBox app</li>
              <li>2. Go to the login screen</li>
              <li>3. Tap &quot;Forgot Password?&quot;</li>
              <li>4. Enter your email address</li>
              <li>5. Check your email for a new reset link</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Password Reset Successful!</h1>
            <p className="text-white/80 mb-6">
              Your password has been successfully updated. You can now log in to the DJ Afro MoviesBox app with your new password.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-white/20 mb-6">
            <h3 className="font-semibold text-white mb-3 flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Next Steps
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">1</div>
                <p className="text-white/90 text-sm">Open the DJ Afro MoviesBox app on your device</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">2</div>
                <p className="text-white/90 text-sm">Use your email and new password to log in</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">3</div>
                <p className="text-white/90 text-sm">Continue enjoying DJ Afro movies!</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-sm">
              For security reasons, you cannot browse this website. This page is only for password resets.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
            <p className="text-white/70 text-sm">
              Create a new secure password for your DJ Afro MoviesBox account
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label className="block text-white font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwords.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                placeholder="Enter your new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-white font-medium mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3 text-sm">Password Requirements:</h3>
            <ul className="space-y-1 text-white/70 text-sm">
              <li className={`flex items-center gap-2 ${passwords.password.length >= 8 ? 'text-green-400' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${passwords.password.length >= 8 ? 'bg-green-400' : 'bg-white/30'}`}></div>
                At least 8 characters long
              </li>
              <li className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(passwords.password) ? 'text-green-400' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[a-z])/.test(passwords.password) ? 'bg-green-400' : 'bg-white/30'}`}></div>
                One lowercase letter
              </li>
              <li className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(passwords.password) ? 'text-green-400' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[A-Z])/.test(passwords.password) ? 'bg-green-400' : 'bg-white/30'}`}></div>
                One uppercase letter
              </li>
              <li className={`flex items-center gap-2 ${/(?=.*\d)/.test(passwords.password) ? 'text-green-400' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*\d)/.test(passwords.password) ? 'bg-green-400' : 'bg-white/30'}`}></div>
                One number
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !passwords.password || !passwords.confirmPassword}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Updating Password...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-center text-white/60 text-sm">
            This is a secure password reset page for DJ Afro MoviesBox users only.
          </p>
        </div>
      </div>
    </div>
  );
}