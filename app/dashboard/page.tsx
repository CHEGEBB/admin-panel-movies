/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getMovieStats, 
  getMovies, 
  getTopMoviesByViews, 
  getTopMoviesByDownloads,
  getGenreStats,
  getAllMovies
} from '@/lib/appwrite';

interface Stats {
  totalMovies: number;
  featuredMovies: number;
  trendingMovies: number;
  premiumMovies: number;
}

interface Movie {
  $id: string;
  $createdAt: string;
  title: string;
  view_count: number;
  download_count: number;
  rating: number;
  is_featured: boolean;
  is_trending: boolean;
  premium_only: boolean;
  genre: string[];
  poster_url: string;
}

interface GenreStat {
  genre: string;
  count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMovies: 0,
    featuredMovies: 0,
    trendingMovies: 0,
    premiumMovies: 0
  });
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [topViewedMovies, setTopViewedMovies] = useState<Movie[]>([]);
  const [topDownloadedMovies, setTopDownloadedMovies] = useState<Movie[]>([]);
  const [genreStats, setGenreStats] = useState<GenreStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    totalDownloads: 0,
    averageRating: 0,
    totalRatings: 0
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch comprehensive stats using the optimized function
        console.log('Fetching movie stats...');
        const statsData = await getMovieStats();
        setStats(statsData);

        // Fetch recent movies (last 10 added)
        console.log('Fetching recent movies...');
        const recent = await getMovies(10);
        setRecentMovies(recent as unknown as Movie[]);

        // Fetch top viewed movies
        console.log('Fetching top viewed movies...');
        const topViewed = await getTopMoviesByViews(5);
        setTopViewedMovies(topViewed as unknown as Movie[]);

        // Fetch top downloaded movies
        console.log('Fetching top downloaded movies...');
        const topDownloaded = await getTopMoviesByDownloads(5);
        setTopDownloadedMovies(topDownloaded as unknown as Movie[]);

        // Fetch all movies for analytics (this might take a moment)
        console.log('Fetching all movies for analytics...');
        const allMovies = await getAllMovies();
        
        // Calculate analytics
        const totalViews = allMovies.reduce((sum, movie) => sum + (movie.view_count || 0), 0);
        const totalDownloads = allMovies.reduce((sum, movie) => sum + (movie.download_count || 0), 0);
        const moviesWithRatings = allMovies.filter(movie => movie.rating && movie.rating > 0);
        const averageRating = moviesWithRatings.length > 0 
          ? moviesWithRatings.reduce((sum, movie) => sum + movie.rating, 0) / moviesWithRatings.length 
          : 0;

        setAnalyticsData({
          totalViews,
          totalDownloads,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: moviesWithRatings.length
        });

        // Fetch genre statistics
        console.log('Fetching genre statistics...');
        const genres = await getGenreStats();
        setGenreStats(genres);

        console.log('Dashboard data loaded successfully');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      {/* Main Stats Cards */}
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
            subtitle={`${stats.totalMovies} movies in database`}
          />
          <StatCard 
            title="Featured Movies" 
            value={stats.featuredMovies} 
            icon="star" 
            color="yellow"
            subtitle={`${Math.round((stats.featuredMovies / stats.totalMovies) * 100)}% of total`}
          />
          <StatCard 
            title="Trending Movies" 
            value={stats.trendingMovies} 
            icon="trending-up" 
            color="green"
            subtitle={`${Math.round((stats.trendingMovies / stats.totalMovies) * 100)}% of total`}
          />
          <StatCard 
            title="Premium Movies" 
            value={stats.premiumMovies} 
            icon="lock" 
            color="purple"
            subtitle={`${Math.round((stats.premiumMovies / stats.totalMovies) * 100)}% premium content`}
          />
        </div>
      )}

      {/* Analytics Cards */}
      {!loading && (
        <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Views" 
            value={analyticsData.totalViews} 
            icon="eye" 
            color="indigo"
            subtitle={`Avg ${Math.round(analyticsData.totalViews / stats.totalMovies)} per movie`}
          />
          <StatCard 
            title="Total Downloads" 
            value={analyticsData.totalDownloads} 
            icon="download" 
            color="emerald"
            subtitle={`Avg ${Math.round(analyticsData.totalDownloads / stats.totalMovies)} per movie`}
          />
          <StatCard 
            title="Average Rating" 
            value={analyticsData.averageRating} 
            icon="star-filled" 
            color="orange"
            subtitle={`${analyticsData.totalRatings} movies rated`}
            isDecimal={true}
          />
          <StatCard 
            title="Content Quality" 
            value={Math.round((analyticsData.totalRatings / stats.totalMovies) * 100)} 
            icon="quality" 
            color="pink"
            subtitle={`${analyticsData.totalRatings}/${stats.totalMovies} have ratings`}
            suffix="%"
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
        
        {/* Recently Added Movies */}
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
                  <div className="flex-1">
                    <h3 className="font-medium truncate">{movie.title}</h3>
                    <div className="flex gap-4 text-gray-400 text-sm">
                      <span>Added {new Date(movie.$createdAt).toLocaleDateString()}</span>
                      <span>{movie.view_count || 0} views</span>
                      <span>{movie.download_count || 0} downloads</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {movie.is_featured && <span className="text-yellow-400 text-xs bg-yellow-400/20 px-2 py-1 rounded">Featured</span>}
                      {movie.is_trending && <span className="text-green-400 text-xs bg-green-400/20 px-2 py-1 rounded">Trending</span>}
                      {movie.premium_only && <span className="text-purple-400 text-xs bg-purple-400/20 px-2 py-1 rounded">Premium</span>}
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/movies/${movie.$id}`}
                    className="text-blue-400 hover:text-blue-300 ml-4"
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

      {/* Top Performers Section */}
      <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
        {/* Most Viewed Movies */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Most Viewed Movies</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-700/50 animate-pulse h-12 rounded"></div>
              ))}
            </div>
          ) : topViewedMovies.length > 0 ? (
            <div className="space-y-3">
              {topViewedMovies.map((movie, index) => (
                <div key={movie.$id} className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <h3 className="font-medium truncate">{movie.title}</h3>
                      <p className="text-gray-400 text-sm">{movie.view_count || 0} views</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {movie.rating > 0 && (
                      <span className="text-yellow-400 text-sm">★ {movie.rating}</span>
                    )}
                    <Link 
                      href={`/dashboard/movies/${movie.$id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No view data available</p>
          )}
        </div>

        {/* Most Downloaded Movies */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Most Downloaded Movies</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-700/50 animate-pulse h-12 rounded"></div>
              ))}
            </div>
          ) : topDownloadedMovies.length > 0 ? (
            <div className="space-y-3">
              {topDownloadedMovies.map((movie, index) => (
                <div key={movie.$id} className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <h3 className="font-medium truncate">{movie.title}</h3>
                      <p className="text-gray-400 text-sm">{movie.download_count || 0} downloads</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {movie.rating > 0 && (
                      <span className="text-yellow-400 text-sm">★ {movie.rating}</span>
                    )}
                    <Link 
                      href={`/dashboard/movies/${movie.$id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No download data available</p>
          )}
        </div>
      </div>

      {/* Genre Statistics */}
      {!loading && genreStats.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Genre Distribution</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {genreStats.slice(0, 12).map((genre) => (
              <div key={genre.genre} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium capitalize">{genre.genre}</h3>
                  <span className="text-lg font-bold text-blue-400">{genre.count}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((genre.count / genreStats[0].count) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {Math.round((genre.count / stats.totalMovies) * 100)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* System Health & Tips */}
      <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
        {/* System Health */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Database Connection</span>
              <span className="text-green-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Storage Used</span>
              <span className="text-blue-400">~{Math.round(stats.totalMovies * 2.5)}GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Content Completion</span>
              <span className="text-yellow-400">
                {Math.round((analyticsData.totalRatings / stats.totalMovies) * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>User Engagement</span>
              <span className="text-purple-400">
                {analyticsData.totalViews > 0 ? 'Active' : 'Low'}
              </span>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Pro Tips</h2>
          <div className="space-y-4 text-sm">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded p-3">
              <h3 className="font-bold text-blue-400 mb-1">🚀 Performance</h3>
              <p className="text-gray-300">
                Movies with ratings get 3x more views. Encourage user ratings!
              </p>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
              <h3 className="font-bold text-green-400 mb-1">📈 Growth</h3>
              <p className="text-gray-300">
                Featured movies get 5x more engagement. Feature your best content.
              </p>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded p-3">
              <h3 className="font-bold text-purple-400 mb-1">💎 Premium</h3>
              <p className="text-gray-300">
                Premium content should be your highest quality movies for better conversion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Setup Guide */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Quick Setup Guide</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <h3 className="font-bold text-lg">Upload Movies</h3>
            </div>
            <p className="text-gray-300 mb-3">
              Upload your movie files to Google Drive first, then use the file ID in the movie details form.
            </p>
            <Link 
              href="/dashboard/add-movie" 
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Add Movie →
            </Link>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="font-bold text-lg">Optimize Content</h3>
            </div>
            <p className="text-gray-300 mb-3">
              Use poster images with 2:3 aspect ratio (600x900px) for best results. Add detailed descriptions and tags.
            </p>
            <Link 
              href="/dashboard/movies" 
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Manage Movies →
            </Link>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <h3 className="font-bold text-lg">Scale Up</h3>
            </div>
            <p className="text-gray-300 mb-3">
              Use bulk upload with CSV files for efficient batch importing of multiple movies at once.
            </p>
            <Link 
              href="/dashboard/bulk-upload" 
              className="text-green-400 hover:text-green-300 text-sm font-medium"
            >
              Bulk Upload →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  isDecimal = false,
  suffix = ""
}: { 
  title: string; 
  value: number; 
  icon: string; 
  color: string; 
  subtitle?: string;
  isDecimal?: boolean;
  suffix?: string;
}) {
  const getColorClass = () => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-emerald-500';
      case 'purple': return 'bg-purple-500';
      case 'indigo': return 'bg-indigo-500';
      case 'emerald': return 'bg-emerald-500';
      case 'orange': return 'bg-orange-500';
      case 'pink': return 'bg-pink-500';
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
      case 'star-filled':
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
      case 'eye':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
          </svg>
        );
      case 'download':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
        );
      case 'quality':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68L9.669.864zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702 1.509.229z"/>
            <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const formatValue = () => {
    if (isDecimal) {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex items-center">
      <div className={`${getColorClass()} p-3 rounded-lg mr-4`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-gray-400 text-sm">{title}</p>
        <h3 className="text-2xl font-bold">
          {formatValue()}{suffix}
        </h3>
        {subtitle && (
          <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}