import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, BookOpen, MessageSquare, User, X, BookMarked, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import api from '../../lib/api';

interface SearchResult {
    courses: Array<{ id: string; title_ar: string; title_fr: string; thumbnail_url: string; category: { slug: string } }>;
    posts: Array<{ id: string; title: string; content: string; type: string; author: { user: { first_name: string; last_name: string; avatar_url: string } } }>;
    users: Array<{ id: string; first_name: string; last_name: string; avatar_url: string; role: string }>;
}

export default function GlobalSearch() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'posts' | 'users'>('all');
    
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // CMD/Ctrl + K opens search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            // Escape closes search
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Handle initial state on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            if (!query) setResults(null);
        }
    }, [isOpen]);

    // Perform Search with Debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await api.get<SearchResult>(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
                setResults(data);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query, activeTab]);

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

    return (
        <>
            {/* Search Trigger Button for Header */}
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${
                    isDark 
                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' 
                    : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'
                }`}
            >
                <Search size={18} />
                <span className="text-sm font-bold truncate max-w-[120px] hidden sm:inline-block">ابحث عن أي شيء...</span>
                <div className={`hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-black ${
                    isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-400 shadow-sm'
                }`}>
                    <span>⌘</span><span>K</span>
                </div>
            </button>

            {/* Search Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-start pt-[10vh] px-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0 animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div 
                        ref={modalRef}
                        className={`relative z-10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border-2 animate-premium-in ${
                            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'
                        }`}
                    >
                        {/* Search Input Area */}
                        <div className={`flex items-center px-6 py-5 border-b-2 ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-50 bg-white/90'}`}>
                            <Search className={`${isDark ? 'text-indigo-400' : 'text-indigo-500'} mr-4 ml-4 flex-shrink-0 animate-pulse-slow`} size={24} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ابحث عن دورات، مشاريع، أشخاص..."
                                className={`flex-1 bg-transparent text-lg font-bold outline-none border-none ${
                                    isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                                }`}
                                dir="rtl"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className={`p-2 rounded-full hover:bg-slate-500/10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className={`flex items-center gap-2 px-6 py-3 border-b border-dashed ${isDark ? 'border-slate-800/50 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'} overflow-x-auto no-scrollbar`}>
                            {[
                                { id: 'all', label: 'الكل', icon: '' },
                                { id: 'courses', label: 'الدورات', icon: BookOpen },
                                { id: 'posts', label: 'المجتمع', icon: MessageSquare },
                                { id: 'users', label: 'المستخدمين', icon: User }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all flex-shrink-0 ${
                                        activeTab === tab.id 
                                        ? isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-200/50'
                                    }`}
                                >
                                    {tab.icon && typeof tab.icon !== 'string' && <tab.icon size={14} />}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Results Area */}
                        <div className={`h-[400px] overflow-y-auto w-full p-6 text-right ${isDark ? 'bg-slate-900/90' : 'bg-slate-50/50'}`}>
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                    <p className={`font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>جاري البحث في قاعدة البيانات...</p>
                                </div>
                            ) : results && (results.courses.length > 0 || results.posts.length > 0 || results.users.length > 0) ? (
                                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                                    {/* Courses Results */}
                                    {results.courses.length > 0 && (activeTab === 'all' || activeTab === 'courses') && (
                                        <div className="space-y-3">
                                            <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}>
                                                <BookMarked size={14} /> الدورات التعليمية
                                            </h3>
                                            <div className="grid gap-2">
                                                {results.courses.map((course) => (
                                                    <div 
                                                        key={course.id}
                                                        onClick={() => handleNavigate(`/course-viewer/${course.id}`)}
                                                        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                                                            isDark ? 'hover:bg-slate-800 border border-transparent hover:border-slate-700' : 'hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md'
                                                        }`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl overflow-hidden ${!course.thumbnail_url ? 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white' : ''}`}>
                                                            {course.thumbnail_url ? <img src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/${course.thumbnail_url}`} className="w-full h-full object-cover" /> : '📚'}
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{course.title_ar}</h4>
                                                            <p className={`text-[10px] font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>قسم: {course.category?.slug}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Community Posts */}
                                    {results.posts.length > 0 && (activeTab === 'all' || activeTab === 'posts') && (
                                        <div className="space-y-3">
                                            <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}>
                                                <Globe size={14} /> مناقشات المجتمع
                                            </h3>
                                            <div className="grid gap-2">
                                                {results.posts.map((post) => (
                                                    <div 
                                                        key={post.id}
                                                        onClick={() => handleNavigate(`/community`)}
                                                        className={`p-3 rounded-2xl cursor-pointer transition-all ${
                                                            isDark ? 'hover:bg-slate-800 border border-transparent hover:border-slate-700' : 'hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${
                                                                post.type === 'GALAXY' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-500'
                                                            }`}>
                                                                {post.type === 'GALAXY' ? '⭐' : '💬'}
                                                            </div>
                                                            <h4 className={`font-bold text-sm truncate max-w-[80%] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{post.title}</h4>
                                                        </div>
                                                        <p className={`text-xs line-clamp-1 mr-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{post.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Users */}
                                    {results.users.length > 0 && (activeTab === 'all' || activeTab === 'users') && (
                                        <div className="space-y-3">
                                            <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} flex items-center gap-2`}>
                                                <User size={14} /> الأعضاء والأساتذة
                                            </h3>
                                            <div className="grid gap-2">
                                                {results.users.map((u) => (
                                                    <div 
                                                        key={u.id}
                                                        onClick={() => handleNavigate(`/profile/${u.id}`)}
                                                        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                                                            isDark ? 'hover:bg-slate-800 border border-transparent hover:border-slate-700' : 'hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-md'
                                                        }`}
                                                    >
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                            {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : '👤'}
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{u.first_name} {u.last_name}</h4>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${
                                                                u.role === 'TEACHER' ? 'bg-amber-500/10 text-amber-500' : 
                                                                u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : 
                                                                'bg-indigo-500/10 text-indigo-500'
                                                            }`}>
                                                                {u.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ) : results ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-300'}`}>
                                        <Search size={32} />
                                    </div>
                                    <h3 className={`font-black text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>لم نجد أي نتائج</h3>
                                    <p className={`font-bold text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>جرب بكلمات مفتاحية أخرى</p>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <h3 className={`font-black text-lg ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>اكتب أي شيء للبحث</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
