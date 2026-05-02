/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/add-series/page.tsx
'use client';

import { ChangeEvent, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage } from '@/lib/appwrite';
import { ID } from 'appwrite';

// ── Appwrite config ────────────────────────────────────────────────────────────
const DB_ID      = process.env.NEXT_PUBLIC_DATABASE_ID!;
const SERIES_COL = process.env.NEXT_PUBLIC_SERIES_COLLECTION_ID ?? 'series';
const EP_COL     = process.env.NEXT_PUBLIC_EPISODES_COLLECTION_ID ?? 'episodes';
const BUCKET_ID  = process.env.NEXT_PUBLIC_MEDIA_BUCKET_ID!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const ENDPOINT   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;

// ── Types ──────────────────────────────────────────────────────────────────────

interface EpisodeInput {
  id: string; // local only — for UI keying
  title: string;
  description: string;
  episode_number: number;
  season_number: number;
  duration: string;
  video_url: string;
  drive_file_id: string;
  telegram_file_id: string;
  channel_id: string;
  message_id: string;
  thumbnail_url: string;
  premium_only: boolean;
  download_enabled: boolean;
  tags: string;
}

interface SeriesFormData {
  title: string;
  description: string;
  ai_summary: string;
  genre: string[];
  poster_url: string;
  banner_url: string;
  premium_only: boolean;
  download_enabled: boolean;
  view_count: number;
  rating: number;
  is_featured: boolean;
  is_trending: boolean;
  tags: string;
  release_year: string;
  total_seasons: number;
  status: 'ongoing' | 'completed' | 'hiatus';
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function newEpisode(season = 1, epNum = 1): EpisodeInput {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    episode_number: epNum,
    season_number: season,
    duration: '',
    video_url: '',
    drive_file_id: '',
    telegram_file_id: '',
    channel_id: '',
    message_id: '',
    thumbnail_url: '',
    premium_only: false,
    download_enabled: true,
    tags: '',
  };
}

async function uploadImage(file: File): Promise<string> {
  const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${result.$id}/view?project=${PROJECT_ID}`;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const GENRES = [
  'Action', 'Comedy', 'Horror', 'Drama', 'Romance',
  'Sci-Fi', 'Thriller', 'Adventure', 'Fantasy', 'Animation',
  'Documentary', 'Crime', 'Mystery', 'War', 'Western',
  'Nollywood', 'Bollywood', 'Asian',
];

const STEPS = ['Series Info', 'Media & Settings', 'Episodes', 'Review & Save'];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
              ${i < current  ? 'bg-red-600 border-red-600 text-white' : ''}
              ${i === current ? 'bg-red-600 border-red-600 text-white ring-4 ring-red-600/30' : ''}
              ${i > current  ? 'bg-gray-700 border-gray-600 text-gray-400' : ''}
            `}>
              {i < current ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (i + 1)}
            </div>
            <span className={`text-xs mt-1.5 font-medium whitespace-nowrap
              ${i <= current ? 'text-red-400' : 'text-gray-500'}
            `}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300
              ${i < current ? 'bg-red-600' : 'bg-gray-700'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
      <div>
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-gray-400 text-xs mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-800
          ${checked ? 'bg-red-600' : 'bg-gray-600'}
        `}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </button>
    </div>
  );
}

function ImageUploadBox({
  label, preview, onFile, onUrl, urlValue, urlPlaceholder, accept = 'image/*',
}: {
  label: string;
  preview: string;
  onFile: (f: File) => void;
  onUrl: (v: string) => void;
  urlValue: string;
  urlPlaceholder: string;
  accept?: string;
}) {
  return (
    <div>
      <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
      <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-700/30 hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200 cursor-pointer mb-3">
        {preview ? (
          <img src={preview} alt="preview" className="max-h-52 w-auto object-contain rounded-lg shadow-lg" />
        ) : (
          <>
            <svg className="w-12 h-12 text-gray-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-400 text-sm">Drop image or click to browse</p>
            <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 10MB</p>
          </>
        )}
        <input type="file" accept={accept} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} className="absolute inset-0 opacity-0 cursor-pointer" />
      </div>
      <input
        type="url"
        value={urlValue}
        onChange={e => onUrl(e.target.value)}
        placeholder={urlPlaceholder}
        className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
      />
      <p className="text-gray-500 text-xs mt-1">Or paste a direct image URL above</p>
    </div>
  );
}

// ── Episode Row ────────────────────────────────────────────────────────────────

function EpisodeRow({
  ep, index, totalEps, onChange, onRemove, onMoveUp, onMoveDown,
}: {
  ep: EpisodeInput;
  index: number;
  totalEps: number;
  onChange: (id: string, field: keyof EpisodeInput, val: any) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border border-gray-600 rounded-xl overflow-hidden mb-3">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-700/60 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex flex-col gap-0.5">
          <button type="button" onClick={e => { e.stopPropagation(); onMoveUp(ep.id); }} disabled={index === 0} className="text-gray-500 hover:text-gray-300 disabled:opacity-30 leading-none">▲</button>
          <button type="button" onClick={e => { e.stopPropagation(); onMoveDown(ep.id); }} disabled={index === totalEps - 1} className="text-gray-500 hover:text-gray-300 disabled:opacity-30 leading-none">▼</button>
        </div>
        <div className="w-8 h-8 rounded-full bg-red-600/80 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          E{ep.episode_number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{ep.title || <span className="text-gray-500 italic">Untitled Episode</span>}</p>
          <p className="text-gray-500 text-xs">Season {ep.season_number} · Episode {ep.episode_number}{ep.duration ? ` · ${ep.duration}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {ep.premium_only && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded">PRO</span>}
          {ep.video_url || ep.drive_file_id ? <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded">Has Video</span> : <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">No Video</span>}
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(ep.id); }} className="text-gray-500 hover:text-red-400 transition-colors p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
          <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="px-4 py-5 bg-gray-800/40 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Episode Title *</label>
            <input type="text" value={ep.title} onChange={e => onChange(ep.id, 'title', e.target.value)} placeholder="Episode title" className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Season / Episode */}
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Season #</label>
            <input type="number" min={1} value={ep.season_number} onChange={e => onChange(ep.id, 'season_number', parseInt(e.target.value) || 1)} className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Episode #</label>
            <input type="number" min={1} value={ep.episode_number} onChange={e => onChange(ep.id, 'episode_number', parseInt(e.target.value) || 1)} className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Duration</label>
            <input type="text" value={ep.duration} onChange={e => onChange(ep.id, 'duration', e.target.value)} placeholder="e.g. 42min or 1h 10min" className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Thumbnail URL</label>
            <input type="url" value={ep.thumbnail_url} onChange={e => onChange(ep.id, 'thumbnail_url', e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Video URL */}
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Video URL</label>
            <input type="url" value={ep.video_url} onChange={e => onChange(ep.id, 'video_url', e.target.value)} placeholder="https://drive.google.com/file/d/... or direct mp4 link" className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Google Drive File ID */}
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Google Drive File ID</label>
            <input type="text" value={ep.drive_file_id} onChange={e => onChange(ep.id, 'drive_file_id', e.target.value)} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs..." className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
            <p className="text-gray-500 text-xs mt-1">The ID from the Drive share link</p>
          </div>

          {/* Telegram File ID */}
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Telegram File ID</label>
            <input type="text" value={ep.telegram_file_id} onChange={e => onChange(ep.id, 'telegram_file_id', e.target.value)} placeholder="Telegram file_id" className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Channel ID */}
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Channel ID</label>
            <input type="text" value={ep.channel_id} onChange={e => onChange(ep.id, 'channel_id', e.target.value)} placeholder="@channelname or -100..." className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Message ID */}
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Message ID</label>
            <input type="text" value={ep.message_id} onChange={e => onChange(ep.id, 'message_id', e.target.value)} placeholder="Telegram message ID" className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Tags (comma separated)</label>
            <input type="text" value={ep.tags} onChange={e => onChange(ep.id, 'tags', e.target.value)} placeholder="season1, pilot, action" className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
          </div>

          {/* Toggles */}
          <Toggle label="Premium Episode" hint="Only premium subscribers can watch" checked={ep.premium_only} onChange={v => onChange(ep.id, 'premium_only', v)} />
          <Toggle label="Enable Download" hint="Allow downloading this episode" checked={ep.download_enabled} onChange={v => onChange(ep.id, 'download_enabled', v)} />

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Episode Description</label>
            <textarea value={ep.description} onChange={e => onChange(ep.id, 'description', e.target.value)} rows={3} placeholder="Brief synopsis of this episode…" className="w-full px-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AddSeries() {
  const router = useRouter();
  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [progress, setProgress]   = useState('');

  // Poster/banner file states
  const [posterFile,   setPosterFile]   = useState<File | null>(null);
  const [posterPreview,setPosterPreview]= useState('');
  const [bannerFile,   setBannerFile]   = useState<File | null>(null);
  const [bannerPreview,setBannerPreview]= useState('');

  // Series form
  const [form, setForm] = useState<SeriesFormData>({
    title: '',
    description: '',
    ai_summary: '',
    genre: [],
    poster_url: '',
    banner_url: '',
    premium_only: false,
    download_enabled: true,
    view_count: 0,
    rating: 0,
    is_featured: false,
    is_trending: false,
    tags: '',
    release_year: String(new Date().getFullYear()),
    total_seasons: 1,
    status: 'ongoing',
  });

  // Episodes
  const [episodes, setEpisodes] = useState<EpisodeInput[]>([newEpisode(1, 1)]);

  // ── Form helpers ─────────────────────────────────────────────────────────────

  function setF<K extends keyof SeriesFormData>(key: K, val: SeriesFormData[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSeriesChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setF(name as any, (e.target as HTMLInputElement).checked as any);
    } else if (name === 'genre') {
      const opts = Array.from((e.target as HTMLSelectElement).selectedOptions, o => o.value);
      setF('genre', opts);
    } else if (name === 'rating') {
      setF('rating', Math.min(10, Math.max(0, parseFloat(value) || 0)));
    } else if (name === 'total_seasons' || name === 'view_count') {
      setF(name as any, Math.max(0, parseInt(value) || 0));
    } else {
      setF(name as any, value as any);
    }
  }

  // ── Episode helpers ──────────────────────────────────────────────────────────

  function updateEpisode(id: string, field: keyof EpisodeInput, val: any) {
    setEpisodes(eps => eps.map(e => e.id === id ? { ...e, [field]: val } : e));
  }

  function removeEpisode(id: string) {
    setEpisodes(eps => eps.filter(e => e.id !== id));
  }

  function addEpisode() {
    const lastEp = episodes[episodes.length - 1];
    const season = lastEp?.season_number ?? 1;
    const epNum  = (episodes.filter(e => e.season_number === season).length) + 1;
    setEpisodes(eps => [...eps, newEpisode(season, epNum)]);
  }

  function addSeason() {
    const maxSeason = episodes.reduce((m, e) => Math.max(m, e.season_number), 0);
    const newSeason = maxSeason + 1;
    setEpisodes(eps => [...eps, newEpisode(newSeason, 1)]);
    setF('total_seasons', newSeason);
  }

  function moveUp(id: string) {
    setEpisodes(eps => {
      const i = eps.findIndex(e => e.id === id);
      if (i <= 0) return eps;
      const arr = [...eps];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return arr;
    });
  }

  function moveDown(id: string) {
    setEpisodes(eps => {
      const i = eps.findIndex(e => e.id === id);
      if (i >= eps.length - 1) return eps;
      const arr = [...eps];
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      return arr;
    });
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validateStep(s: number): string {
    if (s === 0) {
      if (!form.title.trim())       return 'Series title is required.';
      if (!form.description.trim()) return 'Description is required.';
      if (form.genre.length === 0)  return 'Select at least one genre.';
      if (!form.release_year)       return 'Release year is required.';
    }
    if (s === 1) {
      if (!posterFile && !form.poster_url.trim()) return 'Poster image is required — upload a file or paste a URL.';
    }
    if (s === 2) {
      if (episodes.length === 0) return 'Add at least one episode.';
      for (const ep of episodes) {
        if (!ep.title.trim()) return `Episode ${ep.episode_number} (Season ${ep.season_number}) needs a title.`;
        if (!ep.video_url.trim() && !ep.drive_file_id.trim() && !ep.telegram_file_id.trim()) {
          return `Episode "${ep.title || `S${ep.season_number}E${ep.episode_number}`}" needs a video URL, Drive file ID, or Telegram file ID.`;
        }
      }
    }
    return '';
  }

  function goNext() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setError('');
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep(2);
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Upload poster if file provided
      let finalPosterUrl = form.poster_url.trim();
      if (posterFile) {
        setProgress('Uploading poster image…');
        finalPosterUrl = await uploadImage(posterFile);
      }

      // 2. Upload banner if file provided
      let finalBannerUrl = form.banner_url.trim();
      if (bannerFile) {
        setProgress('Uploading banner image…');
        finalBannerUrl = await uploadImage(bannerFile);
      }

      // 3. Compute total_seasons from episodes
      const maxSeason = episodes.reduce((m, e) => Math.max(m, e.season_number), form.total_seasons);

      // 4. Create series document
      setProgress('Creating series…');
      const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const seriesDoc = await databases.createDocument(DB_ID, SERIES_COL, ID.unique(), {
        title:            form.title.trim(),
        description:      form.description.trim() || null,
        ai_summary:       form.ai_summary.trim()  || null,
        genre:            form.genre,
        poster_url:       finalPosterUrl           || null,
        banner_url:       finalBannerUrl           || null,
        premium_only:     form.premium_only,
        download_enabled: form.download_enabled,
        view_count:       form.view_count,
        rating:           form.rating,
        is_featured:      form.is_featured,
        is_trending:      form.is_trending,
        tags:             tagsArr,
        release_year:     form.release_year.trim() || null,
        total_seasons:    maxSeason,
        total_episodes:   episodes.length,
        status:           form.status,
      });

      // 5. Create each episode
      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        setProgress(`Saving episode ${i + 1} of ${episodes.length}…`);
        const epTags = ep.tags.split(',').map(t => t.trim()).filter(Boolean);
        await databases.createDocument(DB_ID, EP_COL, ID.unique(), {
          series_id:        seriesDoc.$id,
          title:            ep.title.trim(),
          description:      ep.description.trim() || null,
          episode_number:   ep.episode_number,
          season_number:    ep.season_number,
          duration:         ep.duration.trim()    || null,
          video_url:        ep.video_url.trim()   || null,
          drive_file_id:    ep.drive_file_id.trim()    || null,
          telegram_file_id: ep.telegram_file_id.trim() || null,
          channel_id:       ep.channel_id.trim()       || null,
          message_id:       ep.message_id.trim()       || null,
          thumbnail_url:    ep.thumbnail_url.trim()    || null,
          premium_only:     ep.premium_only,
          download_enabled: ep.download_enabled,
          view_count:       0,
          tags:             epTags,
        });
      }

      setProgress('');
      setSuccess(`"${form.title}" and ${episodes.length} episode${episodes.length !== 1 ? 's' : ''} saved successfully! 🎬`);

      setTimeout(() => router.push('/dashboard/series'), 2200);
    } catch (err: any) {
      setError(err?.message || 'Failed to save series. Please try again.');
      setProgress('');
    } finally {
      setLoading(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const seasonGroups = episodes.reduce<Record<number, EpisodeInput[]>>((acc, ep) => {
    (acc[ep.season_number] = acc[ep.season_number] || []).push(ep);
    return acc;
  }, {});

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto p-6 pb-16">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Add New Series</h1>
        <p className="text-gray-400">Create a new TV series with all its seasons and episodes in one go.</p>
      </div>

      <StepIndicator current={step} steps={STEPS} />

      {/* Alerts */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">

            {/* ══ STEP 0 — Series Info ══════════════════════════════════════════ */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Series Information
                </h2>

                {/* Title */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Series Title *</label>
                  <input name="title" type="text" value={form.title} onChange={handleSeriesChange} placeholder="e.g. Breaking Bad" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleSeriesChange} rows={4} placeholder="Write a compelling description of the series…" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" required />
                </div>

                {/* AI Summary */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">AI Summary <span className="text-gray-500 font-normal">(optional)</span></label>
                  <textarea name="ai_summary" value={form.ai_summary} onChange={handleSeriesChange} rows={3} placeholder="Short AI-generated summary shown in cards…" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                </div>

                {/* Genre + Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Genres * <span className="text-gray-500 font-normal text-xs">(Ctrl/Cmd for multi)</span></label>
                    <select name="genre" multiple value={form.genre} onChange={handleSeriesChange} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[140px]">
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {form.genre.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {form.genre.map(g => <span key={g} className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">{g}</span>)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Release Year *</label>
                      <input name="release_year" type="number" min="1900" max={new Date().getFullYear() + 2} value={form.release_year} onChange={handleSeriesChange} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
                      <select name="status" value={form.status} onChange={handleSeriesChange} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="ongoing">🟢 Ongoing</option>
                        <option value="completed">✅ Completed</option>
                        <option value="hiatus">⏸ On Hiatus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Rating (0 – 10)</label>
                      <input name="rating" type="number" min="0" max="10" step="0.1" value={form.rating} onChange={handleSeriesChange} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Tags <span className="text-gray-500 font-normal text-xs">(comma separated)</span></label>
                  <input name="tags" type="text" value={form.tags} onChange={handleSeriesChange} placeholder="crime, heist, dark, binge-worthy" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
            )}

            {/* ══ STEP 1 — Media & Settings ════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Media &amp; Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Poster */}
                  <ImageUploadBox
                    label="Poster Image * (2:3 portrait)"
                    preview={posterPreview}
                    onFile={f => { setPosterFile(f); setPosterPreview(URL.createObjectURL(f)); }}
                    onUrl={v => setF('poster_url', v)}
                    urlValue={posterFile ? '' : form.poster_url}
                    urlPlaceholder="https://example.com/poster.jpg"
                  />

                  {/* Banner */}
                  <ImageUploadBox
                    label="Banner Image (16:9 landscape)"
                    preview={bannerPreview}
                    onFile={f => { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); }}
                    onUrl={v => setF('banner_url', v)}
                    urlValue={bannerFile ? '' : form.banner_url}
                    urlPlaceholder="https://example.com/banner.jpg"
                  />
                </div>

                {/* Toggles */}
                <div>
                  <h3 className="text-gray-300 text-sm font-semibold mb-4 uppercase tracking-widest">Series Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle label="Premium Only" hint="Restrict to premium subscribers" checked={form.premium_only} onChange={v => setF('premium_only', v)} />
                    <Toggle label="Enable Downloads" hint="Allow downloading episodes" checked={form.download_enabled} onChange={v => setF('download_enabled', v)} />
                    <Toggle label="Featured Series" hint="Show in the hero banner" checked={form.is_featured} onChange={v => setF('is_featured', v)} />
                    <Toggle label="Trending Now" hint="Highlight in trending sections" checked={form.is_trending} onChange={v => setF('is_trending', v)} />
                  </div>
                </div>

                {/* Initial view count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Initial View Count</label>
                    <input name="view_count" type="number" min="0" value={form.view_count} onChange={handleSeriesChange} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Number of Seasons (auto-updated from episodes)</label>
                    <input name="total_seasons" type="number" min="1" value={form.total_seasons} onChange={handleSeriesChange} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 2 — Episodes ════════════════════════════════════════════ */}
            {step === 2 && (
              <div>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Episodes
                    <span className="text-sm font-normal text-gray-400">({episodes.length} total, {Object.keys(seasonGroups).length} season{Object.keys(seasonGroups).length !== 1 ? 's' : ''})</span>
                  </h2>
                  <div className="flex gap-3">
                    <button type="button" onClick={addSeason} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                      New Season
                    </button>
                    <button type="button" onClick={addEpisode} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                      Add Episode
                    </button>
                  </div>
                </div>

                {episodes.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-600 rounded-xl">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553.106A1 1 0 0014 7v6l3.447 1.724A1 1 0 0019 13.878V6.122a1 1 0 00-1.447-.894L14 7V6.106z" /></svg>
                    <p className="text-gray-400 mb-4">No episodes yet.</p>
                    <button type="button" onClick={addEpisode} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">Add First Episode</button>
                  </div>
                ) : (
                  Object.entries(seasonGroups).sort(([a], [b]) => Number(a) - Number(b)).map(([season, eps]) => (
                    <div key={season} className="mb-8">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-px flex-1 bg-gray-700" />
                        <span className="text-xs font-bold tracking-widest uppercase text-gray-400 px-3 py-1 border border-gray-600 rounded-full">
                          Season {season} · {eps.length} episode{eps.length !== 1 ? 's' : ''}
                        </span>
                        <div className="h-px flex-1 bg-gray-700" />
                      </div>
                      {eps.map((ep, idx) => {
                        const globalIdx = episodes.findIndex(e => e.id === ep.id);
                        return (
                          <EpisodeRow
                            key={ep.id}
                            ep={ep}
                            index={globalIdx}
                            totalEps={episodes.length}
                            onChange={updateEpisode}
                            onRemove={removeEpisode}
                            onMoveUp={moveUp}
                            onMoveDown={moveDown}
                          />
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ══ STEP 3 — Review ══════════════════════════════════════════════ */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Review &amp; Save
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Poster preview */}
                  <div>
                    {(posterPreview || form.poster_url) && (
                      <img src={posterPreview || form.poster_url} alt="poster" className="w-full rounded-xl object-cover shadow-2xl" style={{ aspectRatio: '2/3' }} />
                    )}
                  </div>

                  {/* Series summary */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Title</p>
                      <p className="text-white text-2xl font-bold">{form.title}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.genre.map(g => <span key={g} className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-1 rounded">{g}</span>)}
                      <span className={`text-xs px-2 py-1 rounded border ${form.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : form.status === 'hiatus' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                        {form.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{form.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Year',     val: form.release_year },
                        { label: 'Seasons',  val: Math.max(...episodes.map(e => e.season_number), form.total_seasons) },
                        { label: 'Episodes', val: episodes.length },
                        { label: 'Rating',   val: form.rating > 0 ? `${form.rating}/10` : '—' },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-700/50 rounded-lg p-3 text-center">
                          <p className="text-white font-bold">{s.val}</p>
                          <p className="text-gray-500 text-xs">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {form.is_featured    && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded">⭐ Featured</span>}
                      {form.is_trending    && <span className="text-xs bg-red-500/20    text-red-400    border border-red-500/30    px-2 py-1 rounded">🔥 Trending</span>}
                      {form.premium_only   && <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded">💎 Premium</span>}
                      {form.download_enabled && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded">⬇ Downloads On</span>}
                    </div>
                  </div>
                </div>

                {/* Episodes summary */}
                <div>
                  <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-widest mb-4">Episodes ({episodes.length})</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {episodes.map(ep => (
                      <div key={ep.id} className="flex items-center gap-3 bg-gray-700/50 rounded-lg px-4 py-2.5 border border-gray-600">
                        <span className="w-7 h-7 bg-red-600/80 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {ep.episode_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{ep.title}</p>
                          <p className="text-gray-500 text-xs">S{ep.season_number} E{ep.episode_number}{ep.duration ? ` · ${ep.duration}` : ''}</p>
                        </div>
                        <div className="flex gap-1">
                          {(ep.video_url || ep.drive_file_id || ep.telegram_file_id) ? (
                            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded">✓ Video</span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">⚠ No video</span>
                          )}
                          {ep.premium_only && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded">PRO</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress indicator during save */}
                {progress && (
                  <div className="flex items-center gap-3 bg-blue-900/30 border border-blue-500/40 rounded-lg px-4 py-3">
                    <svg className="animate-spin w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-blue-300 text-sm">{progress}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer nav ───────────────────────────────────────────────────── */}
          <div className="border-t border-gray-700 px-8 py-5 bg-gray-800/50 flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={step === 0 ? () => router.push('/dashboard') : goBack}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors border border-gray-600"
            >
              {step === 0 ? 'Cancel' : '← Back'}
            </button>

            <div className="flex items-center gap-3">
              {/* Step dots */}
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-red-500 w-4' : i < step ? 'bg-red-700' : 'bg-gray-600'}`} />
                ))}
              </div>

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={goNext} className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all shadow-lg">
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center gap-2 min-w-[160px] justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                      Save Series
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}