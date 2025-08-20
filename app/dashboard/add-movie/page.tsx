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
  release_year: string;
  duration: string;
  poster_url: string;
  video_url: string; // Single video URL instead of file_references
  premium_only: boolean;
  download_enabled: boolean;
  rating: number;
  view_count: number;
  download_count: number;
  is_featured: boolean;
  is_trending: boolean;
  tags: string[];
}

export default function AddMovie() {
  const router = useRouter();
  const [formData, setFormData] = useState<MovieData>({
    title: '',
    description: '',
    ai_summary: '',
    genre: [],
    release_year: '',
    duration: '',
    poster_url: '',
    video_url: '', // Single video URL
    premium_only: false,
    download_enabled: true,
    rating: 0,
    view_count: 0,
    download_count: 0,
    is_featured: false,
    is_trending: false,
    tags: []
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
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'genre' || name === 'tags') {
      // Handle multiple select
      if ('selectedOptions' in e.target && e.target.selectedOptions) {
        const options = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData({
          ...formData,
          [name]: options
        });
      }
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
      if (!formData.title) throw new Error('Title is required');
      if (!formData.description) throw new Error('Description is required');
      if (formData.genre.length === 0) throw new Error('At least one genre is required');
      if (!formData.release_year) throw new Error('Release year is required');
      if (!formData.duration) throw new Error('Duration is required');
      if (!formData.video_url) throw new Error('Video URL is required');
      
      // Prepare movie data
      const movieData = { ...formData };
      
      // Upload poster if provided
      if (posterFile) {
        const uploadResult = await uploadPoster(posterFile);
        const posterUrl = `https://cloud.appwrite.io/v1/storage/buckets/${uploadResult.bucketId}/files/${uploadResult.$id}/view?project=dj-afro-movies`;
        movieData.poster_url = posterUrl;
      } else if (!formData.poster_url) {
        throw new Error('Poster image is required');
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
        release_year: '',
        duration: '',
        poster_url: '',
        video_url: '',
        premium_only: false,
        download_enabled: true,
        rating: 0,
        view_count: 0,
        download_count: 0,
        is_featured: false,
        is_trending: false,
        tags: []
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
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Movie</h1>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-white px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Basic Information */}
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Basic Information</h2>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="title">
                Movie Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter movie title"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter movie description"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="ai_summary">
                AI Summary
              </label>
              <textarea
                id="ai_summary"
                name="ai_summary"
                value={formData.ai_summary}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="AI-generated summary (optional)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="release_year">
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
                  className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="YYYY"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="duration">
                  Duration (min) *
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  max="999"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Minutes"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="genre">
                Genres *
              </label>
              <select
                id="genre"
                name="genre"
                multiple
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                {availableGenres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple genres</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="video_url">
                Video URL *
              </label>
              <input
                id="video_url"
                name="video_url"
                type="url"
                value={formData.video_url}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://drive.google.com/file/d/..."
                required
              />
              <p className="text-gray-400 text-sm mt-1">
                Google Drive share link for the movie file
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="tags">
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
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>
          
          <div>
            {/* Poster Image */}
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Poster Image</h2>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                Upload Poster Image
              </label>
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 transition-colors mb-4">
                {posterPreview ? (
                  <div className="relative">
                    <img 
                      src={posterPreview} 
                      alt="Poster Preview" 
                      className="max-h-52 object-contain mb-2" 
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview('');
                      }}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-gray-400 mb-4" viewBox="0 0 16 16">
                      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.577.076L1 11.439V3.5a.5.5 0 0 1 .5-.5h13z"/>
                    </svg>
                    <p className="text-gray-400 text-center mb-1">Drag and drop your poster image here</p>
                    <p className="text-gray-500 text-sm text-center">or click to browse</p>
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
              <p className="text-gray-400 text-sm">
                Recommended: 2:3 aspect ratio (e.g. 600x900px), JPG or PNG format.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="poster_url">
                Or Poster URL
              </label>
              <input
                id="poster_url"
                name="poster_url"
                type="url"
                value={formData.poster_url}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com/poster.jpg"
                disabled={!!posterFile}
              />
              <p className="text-gray-400 text-sm mt-1">
                Direct link to an existing poster image (only if not uploading)
              </p>
            </div>
            
            {/* Movie Settings */}
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 mt-8">Movie Settings</h2>
            
            <div className="flex flex-wrap -mx-2 mb-4">
              <div className="px-2 w-1/2 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="premium_only"
                    checked={formData.premium_only}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-red-500 rounded focus:ring-red-500 bg-gray-700 border-gray-600"
                  />
                  <span className="ml-2 text-gray-300">Premium Only</span>
                </label>
              </div>
              
              <div className="px-2 w-1/2 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="download_enabled"
                    checked={formData.download_enabled}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-red-500 rounded focus:ring-red-500 bg-gray-700 border-gray-600"
                  />
                  <span className="ml-2 text-gray-300">Enable Downloads</span>
                </label>
              </div>
              
              <div className="px-2 w-1/2 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-red-500 rounded focus:ring-red-500 bg-gray-700 border-gray-600"
                  />
                  <span className="ml-2 text-gray-300">Featured Movie</span>
                </label>
              </div>
              
              <div className="px-2 w-1/2 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_trending"
                    checked={formData.is_trending}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-red-500 rounded focus:ring-red-500 bg-gray-700 border-gray-600"
                  />
                  <span className="ml-2 text-gray-300">Trending Now</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={() => router.push('/dashboard/movies')}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Movie...' : 'Add Movie'}
          </button>
        </div>
      </form>
    </div>
  );
}