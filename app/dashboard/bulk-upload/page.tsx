// app/dashboard/bulk-upload/page.tsx
'use client';

import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addMovie } from '@/lib/appwrite';

interface FileReference {
  primary_drive: string;
  file_size: number;
}

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
  file_references: string;
}

interface CsvRowData {
  [key: string]: string | undefined;
  title?: string;
  description?: string;
  ai_summary?: string;
  genre?: string;
  poster_url?: string;
  quality_options?: string;
  premium_only?: string;
  download_enabled?: string;
  view_count?: string;
  rating?: string;
  download_count?: string;
  is_featured?: string;
  is_trending?: string;
  tags?: string;
  release_year?: string;
  duration?: string;
  video_url?: string;
  primary_drive_720p?: string;
  file_size_720p?: string;
  primary_drive_1080p?: string;
  file_size_1080p?: string;
  primary_drive_4k?: string;
  file_size_4k?: string;
}

interface CsvPreviewRow {
  [key: string]: string;
}

export default function BulkUpload() {
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvPreviewRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleCsvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      
      // Preview CSV content
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const text = event.target?.result as string;
        if (!text) return;
        
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        const previewData: CsvPreviewRow[] = [];
        for (let i = 1; i < Math.min(6, rows.length); i++) {
          if (rows[i].trim()) {
            const rowData: CsvPreviewRow = {};
            const values = rows[i].split(',');
            
            headers.forEach((header, index) => {
              rowData[header.trim()] = values[index]?.trim() || '';
            });
            
            previewData.push(rowData);
          }
        }
        
        setCsvPreview(previewData);
      };
      
      reader.readAsText(file);
    }
  };

  const parseCsvRow = (row: CsvRowData): MovieData => {
    // Create file references object
    const fileReferences: Record<string, FileReference | undefined> = {};

    if (row.primary_drive_720p) {
      fileReferences['720p'] = {
        primary_drive: row.primary_drive_720p,
        file_size: parseInt(row.file_size_720p || '0') || 0
      };
    }

    if (row.primary_drive_1080p) {
      fileReferences['1080p'] = {
        primary_drive: row.primary_drive_1080p,
        file_size: parseInt(row.file_size_1080p || '0') || 0
      };
    }

    if (row.primary_drive_4k) {
      fileReferences['4K'] = {
        primary_drive: row.primary_drive_4k,
        file_size: parseInt(row.file_size_4k || '0') || 0
      };
    }

    // Remove undefined values
    Object.keys(fileReferences).forEach(key => {
      if (fileReferences[key] === undefined) {
        delete fileReferences[key];
      }
    });

    // Process a single row of CSV data into a movie object
    return {
      title: row.title || '',
      description: row.description || '',
      ai_summary: row.ai_summary || '',
      genre: row.genre ? row.genre.split('|') : [],
      poster_url: row.poster_url || '',
      quality_options: row.quality_options ? row.quality_options.split('|') : ['720p'],
      premium_only: row.premium_only === 'true',
      download_enabled: row.download_enabled !== 'false',
      view_count: parseInt(row.view_count || '0') || 0,
      rating: parseFloat(row.rating || '0') || 0,
      download_count: parseInt(row.download_count || '0') || 0,
      is_featured: row.is_featured === 'true',
      is_trending: row.is_trending === 'true',
      tags: row.tags ? row.tags.split('|') : [],
      release_year: row.release_year || '',
      duration: row.duration || '',
      video_url: row.video_url || '',
      file_references: JSON.stringify(fileReferences)
    };
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }
    
    setLoading(true);
    setIsUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const text = event.target?.result as string;
        if (!text) {
          setError('Failed to read CSV file');
          setLoading(false);
          setIsUploading(false);
          return;
        }

        const rows = text.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());
        
        // Validate required headers
        const requiredHeaders = ['title', 'description', 'genre', 'release_year', 'duration'];
        for (const header of requiredHeaders) {
          if (!headers.includes(header)) {
            setError(`Missing required header: ${header}`);
            setLoading(false);
            setIsUploading(false);
            return;
          }
        }
        
        // Process all rows
        const movies: MovieData[] = [];
        for (let i = 1; i < rows.length; i++) {
          if (rows[i].trim()) {
            const values = rows[i].split(',');
            const rowData: CsvRowData = {};
            
            headers.forEach((header, index) => {
              rowData[header] = values[index]?.trim() || '';
            });
            
            movies.push(parseCsvRow(rowData));
          }
        }
        
        // Upload movies one by one
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < movies.length; i++) {
          try {
            await addMovie(movies[i]);
            successCount++;
          } catch (err) {
            console.error(`Error adding movie ${movies[i].title}:`, err);
            errorCount++;
          }
          
          // Update progress
          setUploadProgress(Math.round(((i + 1) / movies.length) * 100));
        }
        
        setSuccess(`Bulk upload complete! Added ${successCount} movies successfully. ${errorCount > 0 ? `${errorCount} failed.` : ''}`);
        setCsvFile(null);
        setCsvPreview([]);
        
        // Redirect after a delay
        setTimeout(() => {
          router.push('/dashboard/movies');
        }, 3000);
      };
      
      reader.readAsText(csvFile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error processing CSV: ${errorMessage}`);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'title',
      'description',
      'ai_summary',
      'genre',
      'poster_url',
      'quality_options',
      'premium_only',
      'download_enabled',
      'view_count',
      'rating',
      'download_count',
      'is_featured',
      'is_trending',
      'tags',
      'release_year',
      'duration',
      'video_url',
      'primary_drive_720p',
      'file_size_720p',
      'primary_drive_1080p',
      'file_size_1080p',
      'primary_drive_4k',
      'file_size_4k'
    ].join(',');
    
    const sampleRow = [
      'Sample Movie Title',
      'This is a sample movie description about DJ Afro narration',
      'AI-generated summary would go here',
      'Action|Comedy',
      'https://example.com/poster.jpg',
      '720p|1080p',
      'false',
      'true',
      '0',
      '4.5',
      '0',
      'false',
      'true',
      'DJ Afro|Funny|Classic',
      '2023',
      '120',
      'https://example.com/video.mp4',
      '1ABC123XYZ_720p',
      '800',
      '1ABC123XYZ_1080p',
      '1500',
      '',
      ''
    ].join(',');
    
    const csvContent = `${headers}\n${sampleRow}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'dj_afro_movies_template.csv');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Bulk Upload Movies</h1>
      
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
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Upload CSV File</h2>
        
        <div className="mb-8">
          <p className="text-gray-300 mb-4">
            Import multiple movies at once by uploading a CSV file with movie details.
            Download our template below to ensure your CSV has the correct format.
          </p>
          
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Download CSV Template
          </button>
        </div>
        
        <div className="mb-6">
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-8 bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 transition-colors">
            {csvFile ? (
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-green-500 mx-auto mb-4" viewBox="0 0 16 16">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                  <path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm1.639-3.708 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047l1.888.974V7.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V7s1.54-1.274 1.639-1.208zM6.25 5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/>
                </svg>
                <p className="text-green-400 font-medium">{csvFile.name}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {(csvFile.size / 1024).toFixed(2)} KB - {csvPreview.length} movies detected
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCsvFile(null);
                    setCsvPreview([]);
                  }}
                  className="mt-3 text-red-400 hover:text-red-300 text-sm flex items-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-gray-400 mb-4" viewBox="0 0 16 16">
                  <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z"/>
                  <path d="M8.5 7.5a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V11a.5.5 0 0 0 1 0V10H10a.5.5 0 0 0 0-1H8.5V7.5z"/>
                </svg>
                <p className="text-gray-300 text-center mb-1">Drag and drop your CSV file here</p>
                <p className="text-gray-500 text-sm text-center">or click to browse</p>
              </>
            )}
            <input 
              type="file" 
              id="csv" 
              name="csv"
              accept=".csv"
              onChange={handleCsvChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        
        {csvPreview.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">CSV Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 bg-gray-700/50">
                  <tr>
                    {Object.keys(csvPreview[0]).slice(0, 6).map((header, index) => (
                      <th key={index} className="px-4 py-2">
                        {header}
                      </th>
                    ))}
                    <th className="px-4 py-2">...</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-700">
                      {Object.values(row).slice(0, 6).map((value, valueIndex) => (
                        <td key={valueIndex} className="px-4 py-2 text-gray-300">
                          {typeof value === 'string' && value.length > 30 ? value.substring(0, 30) + '...' : value}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-gray-300">...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Showing preview of {csvPreview.length} rows with first 6 columns. Full CSV may contain more data.
            </p>
          </div>
        )}
        
        {isUploading && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Upload Progress</h3>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div 
                className="bg-red-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm">{uploadProgress}% Complete</p>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/movies')}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors mr-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!csvFile || loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Movies'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">CSV Format Guide</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-lg mb-3 text-red-400">Required Fields</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              <li><strong>title</strong> - Movie title</li>
              <li><strong>description</strong> - Movie description</li>
              <li><strong>genre</strong> - Movie genres (separate multiple with |)</li>
              <li><strong>release_year</strong> - Year of release (as string)</li>
              <li><strong>duration</strong> - Length in minutes (as string)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3 text-blue-400">Content Fields</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              <li><strong>ai_summary</strong> - AI-generated summary</li>
              <li><strong>poster_url</strong> - URL to poster image</li>
              <li><strong>video_url</strong> - Direct video URL</li>
              <li><strong>quality_options</strong> - Available qualities (720p|1080p|4K)</li>
              <li><strong>tags</strong> - Tags separated by |</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3 text-green-400">Settings & Stats</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              <li><strong>premium_only</strong> - true/false</li>
              <li><strong>download_enabled</strong> - true/false</li>
              <li><strong>is_featured</strong> - true/false</li>
              <li><strong>is_trending</strong> - true/false</li>
              <li><strong>rating</strong> - Rating (0-5)</li>
              <li><strong>view_count</strong> - Number of views</li>
              <li><strong>download_count</strong> - Number of downloads</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-3 text-yellow-400">File Reference Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              <li><strong>primary_drive_720p</strong> - Google Drive file ID for 720p</li>
              <li><strong>file_size_720p</strong> - File size in MB for 720p</li>
            </ul>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              <li><strong>primary_drive_1080p</strong> - Google Drive file ID for 1080p</li>
              <li><strong>file_size_1080p</strong> - File size in MB for 1080p</li>
            </ul>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
              <li><strong>primary_drive_4k</strong> - Google Drive file ID for 4K</li>
              <li><strong>file_size_4k</strong> - File size in MB for 4K</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Important Notes</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• <strong>Strings fields:</strong> release_year and duration are stored as strings in Appwrite</li>
            <li>• <strong>Array fields:</strong> Use | (pipe) to separate multiple values for genre, quality_options, and tags</li>
            <li>• <strong>Boolean fields:</strong> Use &apos;true&apos; or &apos;false&apos; (case-sensitive) for boolean values</li>
            <li>• <strong>Number fields:</strong> rating supports decimals (e.g., 4.5), others are integers</li>
            <li>• <strong>File references:</strong> At least 720p drive ID is recommended for each movie</li>
          </ul>
        </div>
        
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Sample CSV Row</h3>
          <p className="text-gray-300 mb-2">Here&apos;s how a complete row in your CSV should look:</p>
          <div className="bg-gray-700/50 p-3 rounded text-gray-300 overflow-x-auto text-xs">
            <code>
              &quot;Action Hero&quot;,&quot;An action-packed movie with DJ Afro narration&quot;,&quot;Epic action sequences...&quot;,&quot;Action|Thriller&quot;,&quot;https://poster.jpg&quot;,&quot;720p|1080p&quot;,&quot;false&quot;,&quot;true&quot;,&quot;0&quot;,&quot;4.5&quot;,&quot;0&quot;,&quot;false&quot;,&quot;true&quot;,&quot;Action|DJ Afro&quot;,&quot;2023&quot;,&quot;120&quot;,&quot;https://video.mp4&quot;,&quot;1ABC123_720p&quot;,&quot;800&quot;,&quot;1DEF456_1080p&quot;,&quot;1500&quot;,&quot;&quot;,&quot;&quot;
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}