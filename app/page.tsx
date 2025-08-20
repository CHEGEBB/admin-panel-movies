// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '../lib/appwrite';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      const user = await getCurrentUser();
      if (user) {
        router.push('/dashboard');
      }
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="animate-pulse text-red-600 text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/poster2.jpg" 
            alt="DJ Afro Movies" 
            fill 
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        </div>
        
        {/* Navigation */}
        <header className="relative z-10 py-6 px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="DJ Afro Logo" width={50} height={50} />
            <h1 className="text-2xl font-bold text-red-600"> Afro Admin</h1>
          </div>
          <Link 
            href="/login" 
            className="bg-red-600 hover:bg-red-700 transition-colors px-6 py-2 rounded-md font-medium"
          >
            Login
          </Link>
        </header>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-red-600"> Afro</span> Movies Admin
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mb-10 text-gray-300">
            Your centralized platform for managing the DJ Afro movie collection.
            Upload, edit, and organize content for your streaming app.
          </p>
          <Link 
            href="/login" 
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-md text-xl font-medium transition-transform hover:scale-105"
          >
            Access Dashboard
          </Link>
        </div>
        
        {/* Scrolling Animation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" 
            height="32" 
            fill="currentColor" 
            className="bi bi-chevron-down" 
            viewBox="0 0 16 16"
          >
            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
          </svg>
        </div>
      </div>
      
      {/* Features Section */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Admin Panel Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-800 rounded-xl p-8 transform transition-transform hover:-translate-y-2">
              <div className="text-red-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Single Movie Upload</h3>
              <p className="text-gray-400">
                Upload individual movies with custom details, posters, and Google Drive links.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-8 transform transition-transform hover:-translate-y-2">
              <div className="text-red-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                  <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Bulk Upload</h3>
              <p className="text-gray-400">
                Import multiple movies at once using CSV files to save time and streamline your workflow.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-8 transform transition-transform hover:-translate-y-2">
              <div className="text-red-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Complete Management</h3>
              <p className="text-gray-400">
                Edit, delete, and manage all your movie content from a single, intuitive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="DJ Afro Logo" width={40} height={40} />
              <span className="text-xl font-bold text-red-600"> Afro Admin</span>
            </div>
            <p className="text-gray-500 mt-2">© {new Date().getFullYear()} DJ Afro Movies Box</p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}