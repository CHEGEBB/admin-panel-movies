"use client";

// admin/series/page.tsx  (or wherever your admin movies page lives, same folder)

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DB_ID      = process.env.NEXT_PUBLIC_DATABASE_ID!;
const SERIES_COL = process.env.NEXT_PUBLIC_SERIES_COLLECTION_ID ?? "series";
const EP_COL     = process.env.NEXT_PUBLIC_EPISODES_COLLECTION_ID ?? "episodes";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SeriesDoc {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description?: string;
  genre?: string[];
  poster_url?: string;
  banner_url?: string;
  premium_only?: boolean;
  download_enabled?: boolean;
  view_count?: number;
  rating?: number;
  is_featured?: boolean;
  is_trending?: boolean;
  tags?: string[];
  release_year?: string;
  total_seasons?: number;
  total_episodes?: number;
  status?: string;
}

const GENRES = [
  "Action","Comedy","Horror","Drama","Romance","Sci-Fi","Thriller",
  "Adventure","Fantasy","Animation","Documentary","Crime","Mystery",
  "War","Western","Nollywood","Bollywood","Asian",
];

const STATUSES = ["ongoing","completed","hiatus"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusColor(status?: string) {
  if (status === "completed") return { bg: "bg-green-900", text: "text-green-300" };
  if (status === "hiatus")    return { bg: "bg-orange-900", text: "text-orange-300" };
  return { bg: "bg-blue-900", text: "text-blue-300" };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSeriesPage() {
  const router = useRouter();

  const [series, setSeries]         = useState<SeriesDoc[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy]         = useState("newest");
  const [currentPage, setCurrentPage]   = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(10);

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete]     = useState<SeriesDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View
  const [toView, setToView]         = useState<SeriesDoc | null>(null);

  // Edit
  const [editDoc, setEditDoc]       = useState<SeriesDoc | null>(null);
  const [editForm, setEditForm]     = useState<Partial<SeriesDoc>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => { fetchSeries(); }, []);

  async function fetchSeries() {
    try {
      setLoading(true);
      setError("");
      const res = await databases.listDocuments(DB_ID, SERIES_COL, [Query.limit(200), Query.orderDesc("$createdAt")]);
      setSeries(res.documents as unknown as SeriesDoc[]);
    } catch (e: unknown) {
      setError("Failed to fetch series.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      setIsDeleting(true);
      // Delete all episodes belonging to this series first
      const eps = await databases.listDocuments(DB_ID, EP_COL, [Query.equal("series_id", toDelete.$id), Query.limit(200)]);
      await Promise.all(eps.documents.map(ep => databases.deleteDocument(DB_ID, EP_COL, ep.$id)));
      await databases.deleteDocument(DB_ID, SERIES_COL, toDelete.$id);
      setSeries(prev => prev.filter(s => s.$id !== toDelete.$id));
      setShowDeleteModal(false);
      setToDelete(null);
    } catch (e: unknown) {
      setError("Failed to delete series.");
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────

  function openEdit(doc: SeriesDoc) {
    setEditDoc(doc);
    setEditForm({ ...doc });
    setToView(null);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editDoc) return;
    try {
      setIsUpdating(true);
      setError("");
      const clean: Record<string, unknown> = {};
      const allowed = [
        "title","description","genre","poster_url","banner_url","premium_only",
        "download_enabled","view_count","rating","is_featured","is_trending",
        "tags","release_year","total_seasons","status",
      ];
      for (const key of allowed) {
        if (key in editForm) clean[key] = (editForm as Record<string, unknown>)[key];
      }
      const updated = await databases.updateDocument(DB_ID, SERIES_COL, editDoc.$id, clean);
      setSeries(prev => prev.map(s => s.$id === editDoc.$id ? updated as unknown as SeriesDoc : s));
      setEditDoc(null);
      setEditForm({});
    } catch (e: unknown) {
      setError("Failed to update series.");
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setEditForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === "genre") {
      const opts = Array.from((e.target as HTMLSelectElement).selectedOptions, o => o.value);
      setEditForm(prev => ({ ...prev, genre: opts }));
    } else if (name === "rating" || name === "view_count" || name === "total_seasons") {
      setEditForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  }

  // ── Filter + Sort ──────────────────────────────────────────────────────────

  const filtered = series
    .filter(s => {
      const matchSearch = s.title?.toLowerCase().includes(searchTerm.toLowerCase()) || s.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGenre  = selectedGenre === "All" || (s.genre && s.genre.includes(selectedGenre));
      return matchSearch && matchGenre;
    })
    .sort((a, b) => {
      if (sortBy === "newest")     return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
      if (sortBy === "oldest")     return new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime();
      if (sortBy === "title-asc")  return a.title.localeCompare(b.title);
      if (sortBy === "title-desc") return b.title.localeCompare(a.title);
      return 0;
    });

  const totalPages   = Math.max(1, Math.ceil(filtered.length / moviesPerPage));
  const safePage     = Math.min(currentPage, totalPages);
  const currentItems = filtered.slice((safePage - 1) * moviesPerPage, safePage * moviesPerPage);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Series Management</h1>
          <p className="text-gray-400">View, edit, and delete your TV series</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/add-series")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 self-start md:self-auto mt-4 md:mt-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Add New Series
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-300 hover:text-white ml-4">✕</button>
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {editDoc && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pb-20">
            <div className="fixed inset-0 bg-black opacity-75" onClick={() => setEditDoc(null)} />
            <div className="relative z-[1001] bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl">
              <form onSubmit={submitEdit}>
                <div className="px-6 pt-6 pb-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Edit Series</h3>
                    <button type="button" onClick={() => setEditDoc(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-1">Title *</label>
                      <input name="title" type="text" value={editForm.title ?? ""} onChange={handleFormChange} required className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-1">Description</label>
                      <textarea name="description" rows={3} value={editForm.description ?? ""} onChange={handleFormChange} className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                    </div>

                    {/* Poster URL */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">Poster URL</label>
                      <input name="poster_url" type="url" value={editForm.poster_url ?? ""} onChange={handleFormChange} placeholder="https://..." className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Banner URL */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">Banner URL</label>
                      <input name="banner_url" type="url" value={editForm.banner_url ?? ""} onChange={handleFormChange} placeholder="https://..." className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Genre */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">Genres</label>
                      <select name="genre" multiple value={editForm.genre ?? []} onChange={handleFormChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]">
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>

                    {/* Status / Year / Rating / Seasons */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Status</label>
                        <select name="status" value={editForm.status ?? "ongoing"} onChange={handleFormChange} className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-1">Release Year</label>
                          <input name="release_year" type="text" value={editForm.release_year ?? ""} onChange={handleFormChange} placeholder="2024" className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-1">Rating</label>
                          <input name="rating" type="number" min="0" max="10" step="0.1" value={editForm.rating ?? 0} onChange={handleFormChange} className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Total Seasons</label>
                        <input name="total_seasons" type="number" min="1" value={editForm.total_seasons ?? 1} onChange={handleFormChange} className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(editForm.tags) ? editForm.tags.join(", ") : ""}
                        onChange={e => setEditForm(prev => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))}
                        placeholder="crime, drama, binge-worthy"
                        className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { name: "is_featured",      label: "Featured"  },
                        { name: "is_trending",      label: "Trending"  },
                        { name: "premium_only",     label: "Premium"   },
                        { name: "download_enabled", label: "Downloads" },
                      ].map(({ name, label }) => (
                        <label key={name} className="flex items-center gap-2 cursor-pointer bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                          <input type="checkbox" name={name} checked={!!(editForm as Record<string, unknown>)[name]} onChange={handleFormChange} className="h-4 w-4 text-red-600 border-gray-600 rounded bg-gray-700" />
                          <span className="text-sm text-gray-300">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                  <button type="button" onClick={() => setEditDoc(null)} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 text-sm font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={isUpdating} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                    {isUpdating && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>}
                    {isUpdating ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ──────────────────────────────────────────────────────── */}
      {toView && !editDoc && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pb-20">
            <div className="fixed inset-0 bg-black opacity-75" onClick={() => setToView(null)} />
            <div className="relative z-[1001] bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl">
              <div className="px-6 pt-6 pb-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Series Details</h3>
                  <button onClick={() => setToView(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Poster */}
                  <div>
                    <div className="aspect-[2/3] bg-gray-700 rounded-lg overflow-hidden">
                      {toView.poster_url
                        ? <img src={toView.poster_url} alt={toView.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">🎬</div>}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold text-white">{toView.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {toView.genre?.map(g => <span key={g} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">{g}</span>)}
                      {toView.status && (() => { const c = statusColor(toView.status); return <span className={`text-xs px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{toView.status}</span>; })()}
                    </div>
                    {toView.description && <p className="text-gray-300 text-sm leading-relaxed">{toView.description}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Year",     val: toView.release_year ?? "—" },
                        { label: "Seasons",  val: toView.total_seasons ?? "—" },
                        { label: "Episodes", val: toView.total_episodes ?? "—" },
                        { label: "Rating",   val: toView.rating ? `${toView.rating}/10` : "—" },
                      ].map(item => (
                        <div key={item.label} className="bg-gray-700/50 rounded-lg p-3 text-center">
                          <p className="text-white font-bold">{item.val}</p>
                          <p className="text-gray-500 text-xs">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {toView.is_featured    && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded">⭐ Featured</span>}
                      {toView.is_trending    && <span className="text-xs bg-red-500/20    text-red-400    border border-red-500/30    px-2 py-1 rounded">🔥 Trending</span>}
                      {toView.premium_only   && <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded">💎 Premium</span>}
                      {toView.download_enabled && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded">⬇ Downloads On</span>}
                    </div>
                    {toView.tags && toView.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {toView.tags.map(tag => <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{tag}</span>)}
                      </div>
                    )}
                    <p className="text-gray-500 text-xs">Added {new Date(toView.$createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button onClick={() => { setToView(null); setShowDeleteModal(true); setToDelete(toView); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">Delete</button>
                <button onClick={() => openEdit(toView)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">Edit</button>
                <button onClick={() => setToView(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium border border-gray-600 transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ────────────────────────────────────────────────────── */}
      {showDeleteModal && toDelete && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pb-20">
            <div className="fixed inset-0 bg-black opacity-75" onClick={() => { setShowDeleteModal(false); setToDelete(null); }} />
            <div className="relative z-[1001] bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Delete Series</h3>
                  <p className="text-gray-300 text-sm">Are you sure you want to delete <strong>&quot;{toDelete.title}&quot;</strong>? This will also delete all its episodes. This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setToDelete(null); }} disabled={isDeleting} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium border border-gray-600 transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isDeleting && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>}
                  {isDeleting ? "Deleting…" : "Delete Series"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Search</label>
            <input type="text" placeholder="Search by title or description…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Filter by Genre</label>
            <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="All">All Genres</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
              <option value="title-asc">Title (A–Z)</option>
              <option value="title-desc">Title (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading series…</p>
          </div>
        ) : currentItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 text-sm">
                <tr>
                  <th className="px-4 py-3">Poster</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3 hidden md:table-cell">Genres</th>
                  <th className="px-4 py-3 hidden md:table-cell">Year</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Eps / Seasons</th>
                  <th className="px-4 py-3 hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentItems.map(s => (
                  <tr key={s.$id} className="hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-12 h-18 relative bg-gray-700 rounded overflow-hidden" style={{ minWidth: 48, height: 72 }}>
                        {s.poster_url
                          ? <img src={s.poster_url} alt={s.title} className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          : <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl">🎬</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="font-semibold text-white truncate">{s.title}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.is_featured  && <span className="text-xs bg-yellow-900 text-yellow-300 px-1.5 py-0.5 rounded">Featured</span>}
                          {s.is_trending  && <span className="text-xs bg-green-900  text-green-300  px-1.5 py-0.5 rounded">Trending</span>}
                          {s.premium_only && <span className="text-xs bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded">Premium</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {s.genre?.slice(0, 2).map(g => <span key={g} className="text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">{g}</span>)}
                        {(s.genre?.length ?? 0) > 2 && <span className="text-gray-400 text-xs">+{(s.genre?.length ?? 0) - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-300 text-sm">{s.release_year ?? "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-300 text-sm">{s.total_episodes ?? 0} eps / {s.total_seasons ?? 1} season{(s.total_seasons ?? 1) !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {s.status && (() => { const c = statusColor(s.status); return <span className={`text-xs px-2 py-0.5 rounded capitalize ${c.bg} ${c.text}`}>{s.status}</span>; })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-3">
                        {/* View */}
                        <button onClick={() => setToView(s)} className="text-blue-500 hover:text-blue-400 transition-colors" title="View">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                          </svg>
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEdit(s)} className="text-yellow-500 hover:text-yellow-400 transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                        </button>
                        {/* Delete */}
                        <button onClick={() => { setToDelete(s); setShowDeleteModal(true); }} className="text-red-500 hover:text-red-400 transition-colors" title="Delete">
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
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-bold text-white mb-2">No series found</h3>
            <p className="text-gray-400 mb-4">{searchTerm || selectedGenre !== "All" ? "Try adjusting your search or filters." : "Add your first series to get started."}</p>
            <button onClick={() => router.push("/dashboard/add-series")} className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-medium">
              + Add your first series
            </button>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Items per page:</span>
              <select value={moviesPerPage} onChange={e => { setMoviesPerPage(parseInt(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white hover:bg-gray-600 disabled:opacity-40 transition-colors text-sm">«</button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white hover:bg-gray-600 disabled:opacity-40 transition-colors text-sm">‹</button>
              <span className="px-3 py-1 bg-gray-700 border border-gray-600 text-white rounded text-sm">Page {safePage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white hover:bg-gray-600 disabled:opacity-40 transition-colors text-sm">›</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white hover:bg-gray-600 disabled:opacity-40 transition-colors text-sm">»</button>
            </div>

            <p className="text-gray-400 text-sm whitespace-nowrap">
              {filtered.length > 0 ? `${(safePage - 1) * moviesPerPage + 1}–${Math.min(safePage * moviesPerPage, filtered.length)} of ${filtered.length}` : "0 results"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}