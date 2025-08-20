/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMovies } from '@/lib/appwrite';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    featuredMovies: 0,
    trendingMovies: 0,
    premiumMovies: 0
  });
  const [recentMovies, setRecentMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const movies: Movie[] = (await getMovies(10)).map(doc => ({
          is_featured: doc.is_featured,
          is_trending: doc.is_trending,
          premium_only: doc.premium_only,
          $createdAt: doc.$createdAt,
          $id: doc.$id,
          title: doc.title,
        }));
        
        // Calculate stats
        interface Movie {
          is_featured: boolean;
          is_trending: boolean;
          premium_only: boolean;
          $createdAt: string;
          $id: string;
          title: string;
        }

        const featured = movies.filter((m: Movie) => m.is_featured).length;
        const trending = movies.filter((m: { is_trending: any; }) => m.is_trending).length;
        const premium = movies.filter((m: { premium_only: any; }) => m.premium_only).length;
        
        setStats({
          totalMovies: movies.length,
          featuredMovies: featured,
          trendingMovies: trending,
          premiumMovies: premium
        });
        
        // Get most recent movies
        const sorted = [...movies].sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        ).slice(0, 5);
        
        setRecentMovies(sorted);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {loading ? (
        <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 animate-pulse h-32 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Movies" 
            value={stats.totalMovies} 
            icon="film" 
            color="blue"
          />
          <StatCard 
            title="Featured Movies" 
            value={stats.featuredMovies} 
            icon="star" 
            color="yellow"
          />
          <StatCard 
            title="Trending Movies" 
            value={stats.trendingMovies} 
            icon="trending-up" 
            color="green"
          />
          <StatCard 
            title="Premium Only" 
            value={stats.premiumMovies} 
            icon="lock" 
            color="purple"
          />
        </div>
      )}
      
      <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/dashboard/add-movie"
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="mb-2">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              <span>Add Movie</span>
            </Link>
            <Link 
              href="/dashboard/bulk-upload"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="mb-2">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
              </svg>
              <span>Bulk Upload</span>
            </Link>
            <Link 
              href="/dashboard/movies"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="mb-2">
                <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"/>
              </svg>
              <span>View All Movies</span>
            </Link>
            <a 
              href="https://cloud.appwrite.io/console/project-dj-afro-movies/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="mb-2">
                <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
              </svg>
              <span>Appwrite Console</span>
            </a>
          </div>
        </div>
        
        {/* Recent Movies */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recently Added Movies</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-700/50 animate-pulse h-16 rounded"></div>
              ))}
            </div>
          ) : recentMovies.length > 0 ? (
            <div className="space-y-3">
              {recentMovies.map((movie) => (
                <div key={movie.$id} className="bg-gray-700/50 p-3 rounded flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{movie.title}</h3>
                    <p className="text-gray-400 text-sm">
                      Added {new Date(movie.$createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link 
                    href={`/dashboard/movies/${movie.$id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No movies added yet.</p>
              <Link href="/dashboard/add-movie" className="text-red-500 hover:text-red-400 mt-2 inline-block">
                Add your first movie
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional Dashboard Content */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Tips</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Movie Files</h3>
            <p className="text-gray-300">
              Upload your movie files to Google Drive first, then use the file ID in the movie details form.
            </p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Poster Images</h3>
            <p className="text-gray-300">
              For best results, use poster images with 2:3 aspect ratio (e.g., 600x900px) in JPG or PNG format.
            </p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Bulk Uploads</h3>
            <p className="text-gray-300">
              Prepare a CSV file with all movie details following the template for efficient batch importing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const getColorClass = () => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-emerald-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getIcon = () => {
    switch (icon) {
      case 'film':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"/>
          </svg>
        );
      case 'star':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
          </svg>
        );
      case 'trending-up':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
          </svg>
        );
      case 'lock':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex items-center">
      <div className={`${getColorClass()} p-3 rounded-lg mr-4`}>
        {getIcon()}
      </div>
      <div>
        <p className="text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}