// app/register-admin/page.tsx
// CREATE THIS FILE TEMPORARILY, DELETE AFTER CREATING ADMIN
'use client';

import { useState } from 'react';
import { registerAdmin } from '@/lib/appwrite';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Admin User');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await registerAdmin(email, password, name);
      setSuccess(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to register admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-green-900/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-green-600 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Success!</h2>
          <p className="text-green-200 mb-6 text-center">
            Admin user created successfully. You can now login.
          </p>
          <div className="text-center">
            <Link 
              href="/login" 
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md transition-colors font-medium"
            >
              Go to Login
            </Link>
          </div>
          <p className="text-yellow-300 text-sm mt-4 text-center">
            ⚠️ Remember to delete this registration page after use!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative px-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/splashbg2.jpg" 
          alt="DJ Afro Background" 
          fill 
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="DJ Afro Logo" width={60} height={60} />
            <h1 className="text-3xl font-bold text-red-600">DJ Afro Admin</h1>
          </Link>
        </div>
        
        <div className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Register Admin</h2>
          
          <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-4 py-3 rounded mb-4 text-sm">
            ⚠️ This is a temporary page. Delete it after creating your admin account!
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                minLength={8}
              />
              <p className="text-gray-400 text-sm mt-1">Minimum 8 characters</p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Admin...' : 'Create Admin'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-gray-400">
            <p>This will create your admin account.</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}