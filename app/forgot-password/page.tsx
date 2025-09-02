/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { Client, Account } from 'appwrite';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lottieData, setLottieData] = useState(null);

  // Initialize Appwrite client
  const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('dj-afro-movies');
  
  const account = new Account(client);

  useEffect(() => {
    // Load Lottie animation data
    fetch('/animations/forgot_password.json')
      .then(response => response.json())
      .then(data => setLottieData(data))
      .catch(error => console.error('Error loading animation:', error));
    
    // Check if we have both userId and secret for password recovery
    // If not, this is just the initial forgot password screen
    if (!userId || !secret) {
      return;
    }
  }, [userId, secret]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      // Complete the password recovery
      await account.updateRecovery(userId!, secret!, password);
      
      setSuccess(true);
      // Clear form after successful update
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password recovery error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const email = emailInput.value.trim();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send recovery email
      await account.createRecovery(
        email,
        `${window.location.origin}/forgot-password`
      );
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Send recovery email error:', err);
      setError(err.message || 'Failed to send recovery email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | DJ Afro MoviesBox</title>
        <meta name="description" content="Reset your password for DJ Afro MoviesBox" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black text-white">
        <nav className="p-4 border-b border-gray-800">
          <div className="max-w-7xl mx-auto flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-xl font-bold">DJ Afro MoviesBox</span>
          </div>
        </nav>
        
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden w-full max-w-md">
            <div className="p-8">
             {/* Replace the Lottie block with this SVG */}
<div className="flex justify-center mb-4">
  <svg 
    width="180" 
    height="180" 
    viewBox="0 0 180 180" 
    className="animate-pulse"
  >
    {/* Example: Simple animated circle */}
    <circle 
      cx="90" 
      cy="90" 
      r="60" 
      fill="none" 
      stroke="#3B82F6" 
      strokeWidth="4"
      className="animate-spin"
      style={{
        transformOrigin: 'center',
        animationDuration: '2s'
      }}
    />
    <circle 
      cx="90" 
      cy="90" 
      r="30" 
      fill="#3B82F6" 
      opacity="0.6"
    />
  </svg>
</div>
              
              <h1 className="text-2xl font-bold text-center mb-2">
                {userId && secret ? 'Create New Password' : 'Reset Your Password'}
              </h1>
              
              <p className="text-gray-300 text-center mb-6">
                {userId && secret 
                  ? 'Enter your new password below' 
                  : 'Enter your email to receive a password reset link'
                }
              </p>
              
              {error && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              {success ? (
                <div className="text-center">
                  <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
                    <p>
                      {userId && secret
                        ? 'Your password has been reset successfully!'
                        : 'Password reset instructions have been sent to your email.'
                      }
                    </p>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    {userId && secret
                      ? 'You can now return to the app and log in with your new password.'
                      : 'Please check your inbox and follow the instructions in the email.'
                    }
                  </p>
                  
                  <a 
                    href="djafromoviesbox://" 
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out"
                  >
                    Return to App
                  </a>
                </div>
              ) : (
                <form onSubmit={userId && secret ? handleResetPassword : handleSendRecoveryEmail}>
                  {userId && secret ? (
                    <>
                      <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          className="w-full bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-4 py-3 outline-none transition duration-200 ease-in-out"
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="w-full bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-4 py-3 outline-none transition duration-200 ease-in-out"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mb-6">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-4 py-3 outline-none transition duration-200 ease-in-out"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out ${
                      isLoading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : userId && secret ? (
                      'Reset Password'
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              )}
            </div>
            
            <div className="p-6 bg-gray-900 bg-opacity-50 border-t border-gray-700">
              <p className="text-center text-gray-400 text-sm">
                Return to the DJ Afro MoviesBox app to login once you&apos;ve reset your password.
              </p>
            </div>
          </div>
        </main>
        
        <footer className="border-t border-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DJ Afro MoviesBox. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}