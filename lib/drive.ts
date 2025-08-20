/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/drive.ts - Google Drive integration for extracting file IDs

export const extractGoogleDriveFileId = (url: string): string | null => {
    // Match patterns like https://drive.google.com/file/d/{fileId}/view
    const fileIdRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(fileIdRegex);
    
    if (match && match[1]) {
        return match[1];
    }
    
    // Match patterns like https://drive.google.com/open?id={fileId}
    const openIdRegex = /id=([a-zA-Z0-9_-]+)/;
    const openMatch = url.match(openIdRegex);
    
    if (openMatch && openMatch[1]) {
        return openMatch[1];
    }
    
    return null;
};

export const getGoogleDriveStreamUrl = (fileId: string): string => {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

export const getGoogleDriveEmbedUrl = (fileId: string): string => {
    return `https://drive.google.com/file/d/${fileId}/preview`;
};

// Parse Google Drive links from a CSV file
export const parseGoogleDriveUrls = (csvData: any[]) => {
    const results: { title: any; description: any; genre: any; release_year: number; duration: number; file_references: string; quality_options: string[]; premium_only: boolean; download_enabled: boolean; tags: any; }[] = [];
    
    csvData.forEach((row: { [x: string]: any; title: any; description: any; genre: string; release_year: string; duration: string; premium_only: string; download_enabled: string; tags: string; }) => {
        const driveUrls: { [key: string]: { primary_drive: string; file_size: number } } = {};
        
        if (row['720p_url']) {
            const fileId = extractGoogleDriveFileId(row['720p_url']);
            if (fileId) {
                driveUrls['720p'] = {
                    primary_drive: fileId,
                    file_size: row['720p_size'] || 0
                };
            }
        }
        
        if (row['1080p_url']) {
            const fileId = extractGoogleDriveFileId(row['1080p_url']);
            if (fileId) {
                driveUrls['1080p'] = {
                    primary_drive: fileId,
                    file_size: row['1080p_size'] || 0
                };
            }
        }
        
        if (row['4k_url']) {
            const fileId = extractGoogleDriveFileId(row['4k_url']);
            if (fileId) {
                driveUrls['4k'] = {
                    primary_drive: fileId,
                    file_size: row['4k_size'] || 0
                };
            }
        }
        
        results.push({
            title: row.title,
            description: row.description || '',
            genre: row.genre ? row.genre.split(',').map((g: string) => g.trim()) : [],
            release_year: parseInt(row.release_year) || 0,
            duration: parseInt(row.duration) || 0,
            file_references: JSON.stringify(driveUrls),
            quality_options: Object.keys(driveUrls),
            premium_only: row.premium_only === 'true',
            download_enabled: row.download_enabled !== 'false',
            tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : []
        });
    });
    
    return results;
};