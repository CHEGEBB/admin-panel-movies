/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/add-movie/page.tsx
'use client';

import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addMovie, uploadPoster } from '@/lib/appwrite';

interface MovieData {
  title: string;
  description: string;
  ai_summary: string;
  genre: string[];
  poster_url: string;
  quality_options: string[];
  premium_only: boolean;
  download_enabled: boolean;
  view_count: number;
  rating: number;
  download_count: number;
  is_featured: boolean;
  is_trending: boolean;
  tags: string[];
  release_year: string;
  duration: string;
  video_url: string;
}

export default function AddMovie() {
  const router = useRouter();
  const [formData, setFormData] = useState<MovieData>({
    title: '',
    description: '',
    ai_summary: '',
    genre: [],
    poster_url: '',
    quality_options: [],
    premium_only: false,
    download_enabled: true,
    view_count: 0,
    rating: 0,
    download_count: 0,
    is_featured: false,
    is_trending: false,
    tags: [],
    release_year: '',
    duration: '',
    video_url: ''
  });
  
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Available genres
  const availableGenres: string[] = [
    'Action', 'Comedy', 'Horror', 'Drama', 'Romance', 
    'Sci-Fi', 'Thriller', 'Adventure', 'Fantasy', 'Animation',
    'Documentary', 'Crime', 'Mystery', 'War', 'Western',
    'Nollywood', 'Bollywood', 'Asian'
  ];

  // Available quality options
  const availableQualityOptions: string[] = [
    '480p', '720p', '1080p', '1440p', '4K'
  ];
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'genre' || name === 'quality_options') {
      // Handle multiple select
      if ('selectedOptions' in e.target && e.target.selectedOptions) {
        const options = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData({
          ...formData,
          [name]: options
        });
      }
    } else if (name === 'rating') {
      // Handle rating as number
      const numValue = parseFloat(value) || 0;
      setFormData({
        ...formData,
        [name]: Math.min(Math.max(numValue, 0), 10) // Clamp between 0 and 10
      });
    } else if (name === 'view_count' || name === 'download_count') {
      // Handle integers
      const numValue = parseInt(value) || 0;
      setFormData({
        ...formData,
        [name]: Math.max(numValue, 0) // Ensure non-negative
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handlePosterChange = (file: File) => {
    setPosterFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPosterPreview(previewUrl);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Basic validation
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.description.trim()) throw new Error('Description is required');
      if (formData.genre.length === 0) throw new Error('At least one genre is required');
      if (!formData.release_year.trim()) throw new Error('Release year is required');
      if (!formData.duration.trim()) throw new Error('Duration is required');
      if (!formData.video_url.trim()) throw new Error('Video URL is required');
      
      // Validate release year
      const currentYear = new Date().getFullYear();
      const releaseYear = parseInt(formData.release_year);
      if (isNaN(releaseYear) || releaseYear < 1900 || releaseYear > currentYear) {
        throw new Error('Please enter a valid release year between 1900 and ' + currentYear);
      }
      
      // Validate duration
      const duration = parseInt(formData.duration);
      if (isNaN(duration) || duration < 1) {
        throw new Error('Duration must be a positive number');
      }
      
      // Validate video URL format
      try {
        new URL(formData.video_url);
      } catch {
        throw new Error('Please enter a valid video URL');
      }
      
      // Prepare movie data
      const movieData = { ...formData };
      
      // Ensure arrays are properly formatted
      movieData.genre = formData.genre.filter(g => g.trim() !== '');
      movieData.quality_options = formData.quality_options.filter(q => q.trim() !== '');
      movieData.tags = formData.tags.filter(t => t.trim() !== '');
      
      // Upload poster if provided
      if (posterFile) {
        const uploadResult = await uploadPoster(posterFile);
        const posterUrl = `https://cloud.appwrite.io/v1/storage/buckets/${uploadResult.bucketId}/files/${uploadResult.$id}/view?project=dj-afro-movies`;
        movieData.poster_url = posterUrl;
      } else if (!formData.poster_url.trim()) {
        throw new Error('Poster image is required (either upload a file or provide a URL)');
      }
      
      // Validate poster URL if provided
      if (movieData.poster_url && !posterFile) {
        try {
          new URL(movieData.poster_url);
        } catch {
          throw new Error('Please enter a valid poster URL');
        }
      }
      
      // Add movie to Appwrite
      await addMovie(movieData);
      
      setSuccess('Movie added successfully!');
      
      // Reset form after success
      setFormData({
        title: '',
        description: '',
        ai_summary: '',
        genre: [],
        poster_url: '',
        quality_options: [],
        premium_only: false,
        download_enabled: true,
        view_count: 0,
        rating: 0,
        download_count: 0,
        is_featured: false,
        is_trending: false,
        tags: [],
        release_year: '',
        duration: '',
        video_url: ''
      });
      
      setPosterFile(null);
      setPosterPreview('');
      
      // Redirect to movies list after a delay
      setTimeout(() => {
        router.push('/dashboard/movies');
      }, 2000);
      
    } catch (err) {
      setError((err as Error).message || 'Failed to add movie. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Add New Movie</h1>
        <p className="text-gray-400">Fill out the form below to add a new movie to your collection</p>
      </div>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-white px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="title">
                    Movie Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter the movie title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="release_year">
                    Release Year *
                  </label>
                  <input
                    id="release_year"
                    name="release_year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.release_year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="YYYY"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="duration">
                    Duration (minutes) *
                  </label>
                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    max="999"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="120"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="description">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Enter a detailed description of the movie"
                  required
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="ai_summary">
                  AI Summary
                </label>
                <textarea
                  id="ai_summary"
                  name="ai_summary"
                  value={formData.ai_summary}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="AI-generated summary (optional)"
                />
                <p className="text-gray-400 text-xs mt-1">This field can be populated automatically by AI</p>
              </div>
            </div>

            {/* Content Details Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
                Content Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="genre">
                    Genres *
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    multiple
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                    required
                  >
                    {availableGenres.map((genre) => (
                      <option key={genre} value={genre} className="py-2">
                        {genre}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-400 text-xs mt-1">Hold Ctrl/Cmd to select multiple genres</p>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="quality_options">
                    Quality Options
                  </label>
                  <select
                    id="quality_options"
                    name="quality_options"
                    multiple
                    value={formData.quality_options}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                  >
                    {availableQualityOptions.map((quality) => (
                      <option key={quality} value={quality} className="py-2">
                        {quality}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-400 text-xs mt-1">Select available video quality options</p>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="video_url">
                  Video URL *
                </label>
                <input
                  id="video_url"
                  name="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://drive.google.com/file/d/..."
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Direct link to the video file (Google Drive, YouTube, etc.)
                </p>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="tags">
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => {
                    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                    setFormData({
                      ...formData,
                      tags: tagsArray
                    });
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="action, thriller, blockbuster (separated by commas)"
                />
                <p className="text-gray-400 text-xs mt-1">Enter tags separated by commas</p>
              </div>
            </div>

            {/* Statistics Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                Statistics & Rating
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="rating">
                    Rating (0-10)
                  </label>
                  <input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="8.5"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="view_count">
                    Initial View Count
                  </label>
                  <input
                    id="view_count"
                    name="view_count"
                    type="number"
                    min="0"
                    value={formData.view_count}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="download_count">
                    Initial Download Count
                  </label>
                  <input
                    id="download_count"
                    name="download_count"
                    type="number"
                    min="0"
                    value={formData.download_count}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Poster & Settings */}
          <div className="space-y-8">
            {/* Poster Image Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                </svg>
                Poster Image
              </h2>
              
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Upload Poster Image
                </label>
                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-8 bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200">
                  {posterPreview ? (
                    <div className="relative">
                      <img 
                        src={posterPreview} 
                        alt="Poster Preview" 
                        className="max-h-64 w-auto object-contain mb-4 rounded-lg shadow-lg" 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setPosterFile(null);
                          setPosterPreview('');
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-gray-300 text-center mb-2 font-medium">Drop your poster here</p>
                      <p className="text-gray-400 text-sm text-center">or click to browse files</p>
                      <p className="text-gray-500 text-xs text-center mt-2">PNG, JPG up to 10MB</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    id="poster" 
                    name="poster"
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handlePosterChange(files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="poster_url">
                  Or Enter Poster URL
                </label>
                <input
                  id="poster_url"
                  name="poster_url"
                  type="url"
                  value={formData.poster_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://example.com/poster.jpg"
                  disabled={!!posterFile}
                />
                <p className="text-gray-400 text-xs mt-1">
                  Direct link to an existing poster image (only if not uploading)
                </p>
              </div>
            </div>
            
            {/* Movie Settings Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.286-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
                Movie Settings
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <div>
                        <label className="text-white font-medium">Premium Only</label>
                        <p className="text-gray-400 text-sm">Restrict access to premium subscribers</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="premium_only"
                        checked={formData.premium_only}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <label className="text-white font-medium">Enable Downloads</label>
                        <p className="text-gray-400 text-sm">Allow users to download this movie</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="download_enabled"
                        checked={formData.download_enabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <div>
                        <label className="text-white font-medium">Featured Movie</label>
                        <p className="text-gray-400 text-sm">Display in featured section</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <label className="text-white font-medium">Trending Now</label>
                        <p className="text-gray-400 text-sm">Show in trending section</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_trending"
                        checked={formData.is_trending}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="border-t border-gray-700 px-8 py-6 bg-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/movies')}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/25 flex items-center justify-center min-w-[140px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Movie...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                  Add Movie
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}