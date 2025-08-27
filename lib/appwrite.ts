// lib/appwrite.ts
import { Client, Account, Databases, Storage, Models, ID, Query } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('dj-afro-movies');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database constants
export const DATABASE_ID = 'movies_db';
export const MOVIES_COLLECTION_ID = 'movies';
export const MEDIA_BUCKET_ID = 'media_files';

// Define Movie interface - UPDATED to match your form data structure
export interface MovieData {
    title: string;
    description: string;
    ai_summary?: string;
    genre: string[]; // Changed from string to string[]
    poster_url: string;
    quality_options: string[]; // Changed from string to string[]
    premium_only: boolean;
    download_enabled: boolean;
    view_count: number;
    rating: number;
    download_count: number;
    is_featured: boolean;
    is_trending: boolean;
    tags: string[]; // Added missing tags field
    release_year: string;
    duration: string;
    video_url: string;
    [key: string]: any; // Allow additional fields
}

// Movie operations - FIXED VERSION
export async function getMovies(limit?: number) {
    try {
        const queries = [];
        
        // If no limit specified or limit is high, fetch all movies using pagination
        if (!limit || limit > 25) {
            let allDocuments: any[] = [];
            let offset = 0;
            const batchSize = 25; // Appwrite's max limit per request
            let hasMore = true;

            while (hasMore) {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    MOVIES_COLLECTION_ID,
                    [
                        Query.limit(batchSize),
                        Query.offset(offset)
                    ]
                );

                allDocuments = [...allDocuments, ...response.documents];
                
                // Check if we have more documents to fetch
                hasMore = response.documents.length === batchSize;
                offset += batchSize;

                // If user specified a limit, respect it
                if (limit && allDocuments.length >= limit) {
                    allDocuments = allDocuments.slice(0, limit);
                    break;
                }
            }

            return allDocuments;
        } else {
            // If limit is 25 or less, use simple query
            const response = await databases.listDocuments(
                DATABASE_ID,
                MOVIES_COLLECTION_ID,
                [Query.limit(limit)]
            );
            return response.documents;
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
}

// Alternative function to get all movies (simpler approach)
export async function getAllMovies() {
    try {
        let allDocuments: any[] = [];
        let offset = 0;
        const batchSize = 25;
        let hasMore = true;

        while (hasMore) {
            const response = await databases.listDocuments(
                DATABASE_ID,
                MOVIES_COLLECTION_ID,
                [
                    Query.limit(batchSize),
                    Query.offset(offset)
                ]
            );

            allDocuments = [...allDocuments, ...response.documents];
            hasMore = response.documents.length === batchSize;
            offset += batchSize;
        }

        return allDocuments;
    } catch (error) {
        console.error('Error fetching all movies:', error);
        throw error;
    }
}

// Get movies with pagination info (useful for UI pagination)
export async function getMoviesPaginated(page = 1, limit = 25) {
    try {
        const offset = (page - 1) * limit;
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [
                Query.limit(limit),
                Query.offset(offset)
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

// Authentication
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