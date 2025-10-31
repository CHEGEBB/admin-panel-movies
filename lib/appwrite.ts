/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/appwrite.ts
import { Client, Account, Databases, Storage, Models, ID, Query } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('dj-afro-movies-2');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database constants
export const DATABASE_ID = 'movies_db';
export const MOVIES_COLLECTION_ID = 'movies';
export const MEDIA_BUCKET_ID = 'media_files';

// Define Movie interface
export interface MovieData {
    title: string;
    description: string;
    ai_summary?: string;
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
    [key: string]: any;
}

// FIXED: Get all movies using proper pagination
export async function getAllMovies() {
    try {
        let allDocuments: any[] = [];
        let offset = 0;
        const batchSize = 100; // Increase batch size for better performance
        let hasMore = true;

        while (hasMore) {
            const response = await databases.listDocuments(
                DATABASE_ID,
                MOVIES_COLLECTION_ID,
                [
                    Query.limit(batchSize),
                    Query.offset(offset),
                    Query.orderDesc('$createdAt') // Order by creation date
                ]
            );

            allDocuments = [...allDocuments, ...response.documents];
            hasMore = response.documents.length === batchSize;
            offset += batchSize;

            // Safety check to prevent infinite loops
            if (offset > 10000) {
                console.warn('Breaking pagination loop at 10,000 movies');
                break;
            }
        }

        console.log(`Fetched ${allDocuments.length} total movies`);
        return allDocuments;
    } catch (error) {
        console.error('Error fetching all movies:', error);
        throw error;
    }
}

// Get limited number of movies (for recent movies, etc.)
export async function getMovies(limit: number = 100) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [
                Query.limit(Math.min(limit, 100)), // Appwrite max is 100
                Query.orderDesc('$createdAt')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
}

// Get movies with specific filters
export async function getMoviesByFilter(filters: {
    featured?: boolean;
    trending?: boolean;
    premium?: boolean;
    genre?: string;
    limit?: number;
}) {
    try {
        const queries = [];
        
        if (filters.featured !== undefined) {
            queries.push(Query.equal('is_featured', filters.featured));
        }
        if (filters.trending !== undefined) {
            queries.push(Query.equal('is_trending', filters.trending));
        }
        if (filters.premium !== undefined) {
            queries.push(Query.equal('premium_only', filters.premium));
        }
        if (filters.genre) {
            queries.push(Query.contains('genre', filters.genre));
        }
        
        queries.push(Query.limit(filters.limit || 25));
        queries.push(Query.orderDesc('$createdAt'));

        const response = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            queries
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching filtered movies:', error);
        throw error;
    }
}

// Get movies with pagination info (useful for UI pagination)
export async function getMoviesPaginated(page = 1, limit = 50) {
    try {
        const offset = (page - 1) * limit;
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [
                Query.limit(Math.min(limit, 100)),
                Query.offset(offset),
                Query.orderDesc('$createdAt')
            ]
        );

        return {
            documents: response.documents,
            total: response.total,
            page,
            limit,
            hasNext: offset + limit < response.total,
            hasPrev: page > 1
        };
    } catch (error) {
        console.error('Error fetching movies with pagination:', error);
        throw error;
    }
}

// Get movie statistics efficiently
export async function getMovieStats() {
    try {
        // Get total count
        const totalResponse = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [Query.limit(1)]
        );
        const totalMovies = totalResponse.total;

        // Get featured count
        const featuredResponse = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [Query.equal('is_featured', true), Query.limit(1)]
        );
        const featuredCount = featuredResponse.total;

        // Get trending count
        const trendingResponse = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [Query.equal('is_trending', true), Query.limit(1)]
        );
        const trendingCount = trendingResponse.total;

        // Get premium count
        const premiumResponse = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [Query.equal('premium_only', true), Query.limit(1)]
        );
        const premiumCount = premiumResponse.total;

        return {
            totalMovies,
            featuredMovies: featuredCount,
            trendingMovies: trendingCount,
            premiumMovies: premiumCount
        };
    } catch (error) {
        console.error('Error fetching movie stats:', error);
        throw error;
    }
}

// Get top movies by views
export async function getTopMoviesByViews(limit = 10) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [
                Query.limit(limit),
                Query.orderDesc('view_count')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching top movies by views:', error);
        throw error;
    }
}

// Get top movies by downloads
export async function getTopMoviesByDownloads(limit = 10) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [
                Query.limit(limit),
                Query.orderDesc('download_count')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching top movies by downloads:', error);
        throw error;
    }
}

// Get movies by genre with counts
export async function getGenreStats() {
    try {
        // This is a simplified approach - for better performance, 
        // consider implementing this on the backend or using Appwrite Functions
        const allMovies = await getAllMovies();
        const genreMap = new Map();

        allMovies.forEach(movie => {
            if (movie.genre && Array.isArray(movie.genre)) {
                movie.genre.forEach((g: any) => {
                    genreMap.set(g, (genreMap.get(g) || 0) + 1);
                });
            }
        });

        return Array.from(genreMap.entries())
            .map(([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error('Error fetching genre stats:', error);
        throw error;
    }
}

// Get single movie by ID
export async function getMovieById(movieId: string) {
    try {
        const response = await databases.getDocument(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            movieId
        );
        return response;
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        throw error;
    }
}

// Search movies by title or description
export async function searchMovies(searchTerm: string, limit = 25) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [
                Query.or([
                    Query.search('title', searchTerm),
                    Query.search('description', searchTerm)
                ]),
                Query.limit(limit)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error searching movies:', error);
        throw error;
    }
}

export async function addMovie(movie: MovieData) {
    try {
        const response = await databases.createDocument(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            ID.unique(),
            movie
        );
        return response;
    } catch (error) {
        console.error('Error adding movie:', error);
        throw error;
    }
}

export async function uploadPoster(file: File) {
    try {
        const response = await storage.createFile(
            MEDIA_BUCKET_ID,
            'unique()',
            file
        );
        return response;
    } catch (error) {
        console.error('Error uploading poster:', error);
        throw error;
    }
}

export async function deleteMovie(movieId: string) {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            movieId
        );
        return true;
    } catch (error) {
        console.error('Error deleting movie:', error);
        throw error;
    }
}

export async function updateMovie(movieId: string, updates: Partial<MovieData>) {
    try {
        const response = await databases.updateDocument(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            movieId,
            updates
        );
        return response;
    } catch (error) {
        console.error('Error updating movie:', error);
        throw error;
    }
}

// Increment view count
export async function incrementViewCount(movieId: string) {
    try {
        const movie = await getMovieById(movieId);
        const currentViews = movie.view_count || 0;
        
        await updateMovie(movieId, {
            view_count: currentViews + 1
        });
        
        return currentViews + 1;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        throw error;
    }
}

// Increment download count
export async function incrementDownloadCount(movieId: string) {
    try {
        const movie = await getMovieById(movieId);
        const currentDownloads = movie.download_count || 0;
        
        await updateMovie(movieId, {
            download_count: currentDownloads + 1
        });
        
        return currentDownloads + 1;
    } catch (error) {
        console.error('Error incrementing download count:', error);
        throw error;
    }
}

// Authentication functions
export async function login(email: string, password: string) {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export async function registerAdmin(email: string, password: string, name: string = 'Admin User') {
    try {
        const user = await account.create(
            ID.unique(),
            email,
            password,
            name
        );
        console.log('Admin user created successfully:', user);
        return user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

export async function logout() {
    try {
        await account.deleteSession('current');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

export type { Models };