'use client';

import { useState, useEffect } from 'react';
import { 
  getMovies, 
  deleteMovie, 
  updateMovie, 
  uploadPoster, 
  Models, 
  DATABASE_ID, 
  MOVIES_COLLECTION_ID,
  storage,
  MEDIA_BUCKET_ID
} from '@/lib/appwrite';

// Define the Movie type based on Appwrite document structure
interface Movie extends Models.Document {
    title: string;
    description?: string;
    ai_summary?: string;
    genre?: string[];
    poster_url?: string;
    video_url?: string; // Single video URL field
    premium_only?: boolean;
    download_enabled?: boolean;
    view_count?: number;
    rating?: number;
    download_count?: number;
    is_featured?: boolean;
    is_trending?: boolean;
    tags?: string[];
    release_year?: number;
    duration?: number;
}

export default function Movies() {
  // State management
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // CRUD operation states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // View movie details state
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Edit movie state
  const [editMode, setEditMode] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [updatedMovie, setUpdatedMovie] = useState<Partial<Movie>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  
  // Available genres for filter dropdown
  const availableGenres = [
    'All',
    'Action', 'Comedy', 'Horror', 'Drama', 'Romance', 
    'Sci-Fi', 'Thriller', 'Adventure', 'Fantasy', 'Animation',
    'Documentary', 'Crime', 'Mystery', 'War', 'Western',
    'Nollywood', 'Bollywood', 'Asian'
  ];

  // Fetch movies on component mount
  useEffect(() => {
    fetchMovies();
  }, []);
  
  // Fetch movies from Appwrite
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const fetchedMovies = await getMovies(100); // Get up to 100 movies
      setMovies(fetchedMovies as unknown as Movie[]);
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      console.error('Fetch movies error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // DELETE FUNCTIONALITY
  const handleDeleteClick = (movie: Movie) => {
    setMovieToDelete(movie);
    setShowDeleteModal(true);
    // Close other modals if open
    setShowViewModal(false);
    setEditMode(false);
  };
  
  const confirmDelete = async () => {
    if (!movieToDelete) return;
    
    try {
      setIsDeleting(true);
      setError(''); // Clear any previous errors
      await deleteMovie(movieToDelete.$id);
      // Remove the deleted movie from the local state
      setMovies(prevMovies => prevMovies.filter(m => m.$id !== movieToDelete.$id));
      setShowDeleteModal(false);
      setMovieToDelete(null);
    } catch (err) {
      setError('Failed to delete movie. Please try again.');
      console.error('Delete movie error:', err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMovieToDelete(null);
  };
  
  // VIEW FUNCTIONALITY
  const handleViewClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowViewModal(true);
    // Close other modals if open
    setShowDeleteModal(false);
    setEditMode(false);
  };
  
  // EDIT FUNCTIONALITY
  const handleEditClick = (movie: Movie) => {
    setMovieToEdit(movie);
    setUpdatedMovie({ ...movie }); // Copy all movie fields to the edit form
    setEditMode(true);
    setPosterPreview(movie.poster_url || null);
    // Close other modals if open
    setShowViewModal(false);
    setShowDeleteModal(false);
  };
  
  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movieToEdit) return;
    
    try {
      setIsUpdating(true);
      setError('');
      
      const updates: Partial<Movie> = { ...updatedMovie };
      
      // Handle poster upload if a new file was selected
      if (posterFile) {
        const uploadResult = await uploadPoster(posterFile);
        const fileId = uploadResult.$id;
        const fileUrl = storage.getFileView(MEDIA_BUCKET_ID, fileId).toString();
        updates.poster_url = fileUrl;
      }
      
      // Remove Appwrite document metadata properties before updating
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => 
          !key.startsWith('$') && key !== '$id' && key !== '$createdAt' && key !== '$updatedAt'
        )
      );
      
      // Update the movie in Appwrite
      const updated = await updateMovie(movieToEdit.$id, cleanUpdates);
      
      // Update the local state
      setMovies(prevMovies => 
        prevMovies.map(m => m.$id === updated.$id ? updated as unknown as Movie : m)
      );
      
      // Reset edit mode
      setEditMode(false);
      setMovieToEdit(null);
      setUpdatedMovie({});
      setPosterFile(null);
      setPosterPreview(null);
      
    } catch (err) {
      setError('Failed to update movie. Please try again.');
      console.error('Update movie error:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPosterFile(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPosterPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'genre' || name === 'tags') {
      // Handle multi-select for arrays
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions);
      const values = selectedOptions.map(option => option.value);
      setUpdatedMovie(prev => ({ ...prev, [name]: values }));
      return;
    }
    
    // Handle checkbox values (boolean)
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setUpdatedMovie(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setUpdatedMovie(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
      return;
    }
    
    // Handle regular text inputs (including video_url)
    setUpdatedMovie(prev => ({ ...prev, [name]: value }));
  };
  
  const cancelEdit = () => {
    setEditMode(false);
    setMovieToEdit(null);
    setUpdatedMovie({});
    setPosterFile(null);
    setPosterPreview(null);
  };
  
  // FILTER AND SORT MOVIES
  const filteredMovies = movies.filter(movie => {
    // Search filter - check title and description
    const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Genre filter - check if movie has the selected genre
    const matchesGenre = selectedGenre === 'All' || 
                        (movie.genre && Array.isArray(movie.genre) && movie.genre.includes(selectedGenre));
    
    return matchesSearch && matchesGenre;
  });
  
  // Sort movies
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
      case 'oldest':
        return new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'year-new':
        return (b.release_year || 0) - (a.release_year || 0);
      case 'year-old':
        return (a.release_year || 0) - (b.release_year || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Movies Management</h1>
          <p className="text-gray-400">View, edit, and delete your movies</p>
        </div>
        
        <button 
          onClick={() => {
            setMovieToEdit(null);
            setUpdatedMovie({
                title: '',
                description: '',
                ai_summary: '',
                genre: [],
                video_url: '', // Single video URL
                premium_only: false,
                download_enabled: false,
                view_count: 0,
                rating: 0,
                download_count: 0,
                is_featured: false,
                is_trending: false,
                tags: [],
                release_year: new Date().getFullYear(),
                duration: 0
              });
            setEditMode(true);
            setPosterFile(null);
            setPosterPreview(null);
            // Close other modals if open
            setShowViewModal(false);
            setShowDeleteModal(false);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 self-start md:self-auto mt-4 md:mt-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Add New Movie
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-4 text-red-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>
      )}
      
      {/* Edit form modal */}
      {editMode && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={cancelEdit}
            >
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-[1001]">
              <form onSubmit={handleUpdateMovie}>
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      {movieToEdit ? 'Edit Movie' : 'Add New Movie'}
                    </h3>
                    <button 
                      type="button"
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column - Form fields */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                          Movie Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={updatedMovie.title || ''}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={5}
                          value={updatedMovie.description || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-300">
                          Genres
                        </label>
                        <select
                          id="genre"
                          name="genre"
                          multiple
                          value={updatedMovie.genre || []}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                        >
                          {availableGenres.filter(g => g !== 'All').map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                          Hold Ctrl (or Cmd) to select multiple genres
                        </p>
                      </div>
                      <div>
  <label htmlFor="video_url" className="block text-sm font-medium text-gray-300">
    Video URL
  </label>
  <input
    type="url"
    id="video_url"
    name="video_url"
    value={updatedMovie.video_url || ''}
    onChange={handleInputChange}
    placeholder="https://drive.google.com/file/d/..."
    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
  />
  <p className="text-xs text-gray-400 mt-1">
    Google Drive share link for the movie file
  </p>
</div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="release_year" className="block text-sm font-medium text-gray-300">
                            Release Year
                          </label>
                          <input
                            type="number"
                            id="release_year"
                            name="release_year"
                            min="1900"
                            max={new Date().getFullYear() + 5}
                            value={updatedMovie.release_year || new Date().getFullYear()}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="duration" className="block text-sm font-medium text-gray-300">
                            Duration (min)
                          </label>
                          <input
                            type="number"
                            id="duration"
                            name="duration"
                            min="1"
                            value={updatedMovie.duration || 0}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_featured"
                            name="is_featured"
                            checked={updatedMovie.is_featured || false}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                          />
                          <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-300">
                            Featured Movie
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_trending"
                            name="is_trending"
                            checked={updatedMovie.is_trending || false}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                          />
                          <label htmlFor="is_trending" className="ml-2 block text-sm text-gray-300">
                            Trending Movie
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="premium_only"
                            name="premium_only"
                            checked={updatedMovie.premium_only || false}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                          />
                          <label htmlFor="premium_only" className="ml-2 block text-sm text-gray-300">
                            Premium Only
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column - Poster */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Movie Poster
                      </label>
                      
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 mb-4">
                        {posterPreview ? (
                          <div className="relative aspect-[2/3] bg-gray-700 rounded overflow-hidden">
                            <img
                              src={posterPreview}
                              alt="Movie poster preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPosterPreview(null);
                                setPosterFile(null);
                                // Only reset the poster URL for new movies or when explicitly removing
                                if (!movieToEdit || posterFile) {
                                  setUpdatedMovie(prev => ({ ...prev, poster_url: undefined }));
                                }
                              }}
                              className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-70 text-white hover:bg-opacity-90"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-gray-500 mb-4" viewBox="0 0 16 16">
                              <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                              <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
                            </svg>
                            <p className="text-sm text-gray-400 text-center mb-2">
                              Drag and drop a poster image or
                            </p>
                            <label htmlFor="poster-upload" className="cursor-pointer bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white text-sm transition-colors">
                              Select File
                            </label>
                          </div>
                        )}
                        
                        <input
                          type="file"
                          id="poster-upload"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      
                      <p className="text-xs text-gray-400">
                        Recommended: JPG or PNG, 2:3 aspect ratio (e.g., 800×1200px)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {movieToEdit ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      movieToEdit ? 'Update Movie' : 'Add Movie'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={cancelEdit}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* View movie details modal */}
      {showViewModal && selectedMovie && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={() => {
                setShowViewModal(false);
                setSelectedMovie(null);
              }}
            >
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-[1001]">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">
                    Movie Details
                  </h3>
                  <button 
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedMovie(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Poster */}
                  <div className="w-full md:w-1/3">
                    <div className="aspect-[2/3] bg-gray-700 rounded overflow-hidden">
                      {selectedMovie.poster_url ? (
                        <img
                          src={selectedMovie.poster_url}
                          alt={`${selectedMovie.title} poster`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                            <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                            <path d="M10.648 8.646a.5.5 0 0 1 .577-.093l1.777 1.947V14h-12v-1l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Movie details */}
                  <div className="w-full md:w-2/3">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedMovie.is_featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                          Featured
                        </span>
                      )}
                      {selectedMovie.is_trending && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                          Trending
                        </span>
                      )}
                      {selectedMovie.premium_only && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-300">
                          Premium
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Release Year</h4>
                        <p className="text-white">{selectedMovie.release_year || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Duration</h4>
                        <p className="text-white">{selectedMovie.duration ? `${selectedMovie.duration} min` : 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Added On</h4>
                        <p className="text-white">{new Date(selectedMovie.$createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Movie ID</h4>
                        <p className="text-white font-mono text-xs truncate">{selectedMovie.$id}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Genres</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMovie.genre && selectedMovie.genre.length > 0 ? (
                          selectedMovie.genre.map(genre => (
                            <span 
                              key={genre} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300"
                            >
                              {genre}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No genres specified</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                      <p className="text-white whitespace-pre-line">
                        {selectedMovie.description || 'No description available.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditClick(selectedMovie);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                  </svg>
                  Edit Movie
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    handleDeleteClick(selectedMovie);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  Delete Movie
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedMovie(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 mb-1" htmlFor="search">
              Search Movies
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-1" htmlFor="genre">
              Filter by Genre
            </label>
            <select
              id="genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 mb-1" htmlFor="sort">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="year-new">Release Year (Newest)</option>
              <option value="year-old">Release Year (Oldest)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Movies List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading movies...</p>
          </div>
        ) : sortedMovies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-3">Poster</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Genres</th>
                  <th className="px-6 py-3">Year</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedMovies.map(movie => (
                  <tr key={movie.$id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-24 relative bg-gray-700 rounded overflow-hidden">
                        {movie.poster_url ? (
                          <img 
                            src={movie.poster_url} 
                            alt={`${movie.title} poster`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                              <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                              <path d="M10.648 8.646a.5.5 0 0 1 .577-.093l1.777 1.947V14h-12v-1l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="max-w-xs">
                        <h3 className="font-semibold text-white truncate">{movie.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {movie.is_featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900 text-yellow-300">
                              Featured
                            </span>
                          )}
                          {movie.is_trending && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-300">
                              Trending
                            </span>
                          )}
                          {movie.premium_only && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900 text-purple-300">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {movie.genre && Array.isArray(movie.genre) && movie.genre.length > 0 ? movie.genre.map(g => (
                          <span key={g} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-300">
                            {g}
                          </span>
                        )) : (
                          <span className="text-gray-500 text-sm">No genres</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{movie.release_year || 'N/A'}</td>
                    <td className="px-6 py-4">{movie.duration ? `${movie.duration} min` : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-3">
                        {/* VIEW Action */}
                        <button 
                          onClick={() => handleViewClick(movie)}
                          className="text-blue-500 hover:text-blue-400 transition-colors"
                          title="View movie details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                          </svg>
                        </button>
                        
                        {/* EDIT Action */}
                        <button 
                          onClick={() => handleEditClick(movie)}
                          className="text-yellow-500 hover:text-yellow-400 transition-colors"
                          title="Edit movie"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                        </button>
                        
                        {/* DELETE Action */}
                        <button 
                          onClick={() => handleDeleteClick(movie)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="Delete movie"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="text-gray-600 mx-auto mb-4" viewBox="0 0 16 16">
              <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"/>
            </svg>
            <h3 className="text-xl font-bold mb-2 text-white">No movies found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || selectedGenre !== 'All' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first movie to get started'}
            </p>
            <button 
              onClick={() => {
                setMovieToEdit(null);
                setUpdatedMovie({
                    title: '',
                    description: '',
                    ai_summary: '',
                    genre: [],
                    video_url: '', // Single video URL
                    premium_only: false,
                    download_enabled: false,
                    view_count: 0,
                    rating: 0,
                    download_count: 0,
                    is_featured: false,
                    is_trending: false,
                    tags: [],
                    release_year: new Date().getFullYear(),
                    duration: 0
                  });
                setEditMode(true);
                setPosterFile(null);
                setPosterPreview(null);
                // Close other modals if open
                setShowViewModal(false);
                setShowDeleteModal(false);
              }}
              className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Add your first movie
            </button>
          </div>
        )}
        
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              Showing {sortedMovies.length} of {movies.length} movies
            </p>
            
            {/* Refresh button */}
            <button 
              onClick={fetchMovies}
              disabled={loading}
              className="text-red-500 hover:text-red-400 disabled:opacity-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={loading ? 'animate-spin' : ''}>
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && movieToDelete && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={cancelDelete}
            >
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[1001]">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-red-600" viewBox="0 0 16 16">
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                      Delete Movie
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-300">
                        Are you sure you want to delete &quot;{movieToDelete.title}&quot;? This action cannot be undone and will permanently remove the movie from your database.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Movie'
                  )}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={cancelDelete}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}