// lib/appwrite.ts
import { Client, Account, Databases, Storage, Models, ID } from 'appwrite';

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

// Movie operations
export async function getMovies(limit = 10) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            [
                // Optional query parameters
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
}

export async function addMovie(movie: Models.DataWithoutDocumentKeys) {
    try {
        const response = await databases.createDocument(
            DATABASE_ID,
            MOVIES_COLLECTION_ID,
            'unique()',
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

export async function updateMovie(movieId: string, updates: Partial<Models.DataWithoutDocumentKeys> | undefined) {
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

// ADD THIS REGISTRATION FUNCTION
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

export { Models };
