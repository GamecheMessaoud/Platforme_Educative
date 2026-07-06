import React, { useState, useEffect } from 'react';
import { Rocket, MessageSquare, Sparkles, Globe, Heart, MessageCircle, Share2, Plus, Search, Filter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import CreatePostModal from './CreatePostModal';
import PostDetailsModal from './PostDetailsModal';
import StatsHeader from './StatsHeader';

interface Post {
    id: string;
    title: string;
    content: string;
    type: 'PROJECT' | 'QUESTION';
    media_url?: string;
    created_at: string;
    reactions: any[];
    author: {
        id: string;
        user: {
            first_name: string;
            last_name: string;
            avatar?: string;
            avatar_url?: string;
        };
    };
    _count: {
        comments: number;
        reactions: number;
    };
}

export default function StudentCommunityTab() {
    const { isDark } = useTheme();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'galaxy' | 'arena'>('galaxy');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [postType, setPostType] = useState<'PROJECT' | 'QUESTION'>('PROJECT');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const fetchPosts = async () => {
        // ... existing fetchPosts ...
        // (Providing full block for context)
        try {
            setLoading(true);
            const type = activeTab === 'galaxy' ? 'PROJECT' : activeTab === 'arena' ? 'QUESTION' : undefined;
            if (type) {
                const response = await api.get(`/community/posts?type=${type}`);
                setPosts(response.data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [activeTab]);

    const handleCreatePost = (type: 'PROJECT' | 'QUESTION') => {
        setPostType(type);
        setIsCreateModalOpen(true);
    };

    const handleOpenDetails = (postId: string) => {
        setSelectedPostId(postId);
        setIsDetailsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setIsDetailsModalOpen(false);
        setSelectedPostId(null);
        fetchPosts();
    };


    const handleToggleLike = async (postId: string) => {
        try {
            await api.post(`/community/posts/${postId}/react`, { type: 'LIKE' });
            // Optimistic update or just refetch
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    // This is a bit simplified, ideally we'd track if user liked it
                    // For now we just refresh the feed to get accurate counts
                    return p;
                }
                return p;
            }));
            fetchPosts();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    return (
        <div className="space-y-8 animate-premium-in">
            <StatsHeader />
            {/* Hero Section */}
            <div className="relative h-64 rounded-[3rem] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />

                <div className="absolute inset-0 flex flex-col justify-center p-12 text-white z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit mb-4">
                        <Sparkles size={16} className="text-yellow-300 fill-yellow-300" />
                        <span className="text-xs font-bold tracking-widest uppercase">Sadeem Hub</span>
                    </div>
                    <h2 className="text-4xl font-black mb-2">مجتمع مبدعي المستقبل</h2>
                    <p className="text-white/80 font-medium text-lg max-w-xl">
                        مكانك المختار لمشاركة مشاريعك، طرح أسئلتك، والتعلم مع أبطال البرمجة من كل مكان.
                    </p>
                </div>

                <div className="absolute left-10 top-0 bottom-0 flex items-center opacity-10 pointer-events-none transform -rotate-12 scale-150">
                    <Globe size={300} strokeWidth={1} />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`p-2 rounded-[2rem] ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl border ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-2 overflow-x-auto no-scrollbar`}>
                {[
                    { id: 'galaxy', label: 'مجرة المشاريع', icon: Rocket, color: 'text-indigo-500' },
                    { id: 'arena', label: 'ساحة النقاش', icon: MessageSquare, color: 'text-purple-500' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all duration-300 ${activeTab === tab.id
                            ? `${isDark ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'} shadow-lg scale-105`
                            : `text-slate-400 hover:${isDark ? 'text-slate-200' : 'text-slate-600 hover:bg-slate-50'}`
                            }`}
                    >
                        <tab.icon size={20} className={activeTab === tab.id ? tab.color : ''} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'galaxy' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border`}>
                                    <Search size={18} className="text-slate-400" />
                                    <input type="text" placeholder="ابحث عن مشاريع..." className={`bg-transparent border-none focus:ring-0 text-sm font-bold w-48 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                                </div>
                                <button className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    <Filter size={18} className="text-slate-400" />
                                    تصفية
                                </button>
                            </div>
                            <button
                                onClick={() => handleCreatePost('PROJECT')}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform"
                            >
                                <Plus size={20} />
                                شارك مشروعك
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-80 rounded-[2.5rem] animate-pulse ${isDark ? 'bg-slate-800' : 'bg-white'}`} />
                                ))}
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => handleOpenDetails(post.id)}
                                        className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-[2.5rem] border overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col`}
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            {post.media_url ? (
                                                <img src={post.media_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                                    <Rocket size={48} className="text-indigo-500 opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black text-white uppercase tracking-widest">
                                                مشروع
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4 flex flex-col flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-indigo-500/20">
                                                    {post.author?.user.avatar_url ? (
                                                        <img src={post.author.user.avatar_url} alt="" />
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                                                            {post.author?.user.first_name[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.author?.user.first_name} {post.author?.user.last_name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400">منذ {new Date(post.created_at).toLocaleDateString('ar-DZ')}</p>
                                                </div>
                                            </div>
                                            <h3 className={`text-lg font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.title}</h3>
                                            <p className={`text-sm font-medium line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{post.content}</p>

                                            <div className="pt-4 border-t border-slate-100/10 flex items-center justify-between mt-auto">
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleLike(post.id); }}
                                                        className="flex items-center gap-1.5 text-slate-400 hover:text-pink-500 transition-colors"
                                                    >
                                                        <Heart size={18} className={post.reactions?.some((r: any) => r.user_id === user?.id) ? 'fill-pink-500 text-pink-500' : ''} />
                                                        <span className="text-xs font-black">{post._count.reactions}</span>
                                                    </button>
                                                    <div
                                                        className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); handleOpenDetails(post.id); }}
                                                    >
                                                        <MessageCircle size={18} />
                                                        <span className="text-xs font-black">{post._count.comments}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                                                        onClick={(e) => { e.stopPropagation(); handleOpenDetails(post.id); }}
                                                    >
                                                        <Rocket size={12} />
                                                        استكشف المشروع
                                                    </button>
                                                    <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={(e) => { e.stopPropagation(); /* Share logic */ }}>
                                                        <Share2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`p-20 rounded-[3rem] border-2 border-dashed ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50/30'} flex flex-col items-center text-center space-y-4`}>
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-indigo-500">
                                    <Rocket size={32} />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>لا توجد مشاريع بعد</h3>
                                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>كن أول بطل يشارك إبداعه في المجرة!</p>
                                </div>
                                <button
                                    onClick={() => handleCreatePost('PROJECT')}
                                    className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black shadow-lg hover:scale-105 transition-transform"
                                >
                                    ابدأ الآن
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'arena' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>ساحة النقاش</h3>
                            <button
                                onClick={() => handleCreatePost('QUESTION')}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
                            >
                                <Plus size={20} />
                                اسأل سؤالاً
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid gap-6">
                                {[1, 2].map(i => (
                                    <div key={i} className={`h-32 rounded-[2rem] animate-pulse ${isDark ? 'bg-slate-800' : 'bg-white'}`} />
                                ))}
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => handleOpenDetails(post.id)}
                                        className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-[2.5rem] border overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col`}
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            {post.media_url ? (
                                                <img src={post.media_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                                    <MessageSquare size={48} className="text-purple-500 opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black text-white uppercase tracking-widest">
                                                سؤال
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4 flex flex-col flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-purple-500/20">
                                                    {post.author?.user.avatar_url ? (
                                                        <img src={post.author.user.avatar_url} alt="" />
                                                    ) : (
                                                        <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-500 font-bold">
                                                            {post.author?.user.first_name[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.author?.user.first_name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400">منذ {new Date(post.created_at).toLocaleDateString('ar-DZ')}</p>
                                                </div>
                                            </div>

                                            <h3 className={`text-lg font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.title}</h3>
                                            <p className={`text-sm font-medium line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{post.content}</p>

                                            <div className="pt-4 border-t border-slate-100/10 flex items-center justify-between mt-auto">
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleLike(post.id); }}
                                                        className="flex items-center gap-1.5 text-slate-400 hover:text-pink-500 transition-colors"
                                                    >
                                                        <Heart size={18} className={post.reactions?.some((r: any) => r.user_id === user?.id) ? 'fill-pink-500 text-pink-500' : ''} />
                                                        <span className="text-xs font-black">{post._count.reactions}</span>
                                                    </button>
                                                    <div
                                                        className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-purple-500 transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); handleOpenDetails(post.id); }}
                                                    >
                                                        <MessageCircle size={18} />
                                                        <span className="text-xs font-black">{post._count.comments}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="px-4 py-2 bg-purple-600 text-white rounded-xl font-black text-[10px] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-purple-500/20 flex items-center gap-2"
                                                        onClick={(e) => { e.stopPropagation(); handleOpenDetails(post.id); }}
                                                    >
                                                        <MessageSquare size={12} />
                                                        اقرأ التفاصيل
                                                    </button>
                                                    <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={(e) => { e.stopPropagation(); /* Share logic */ }}>
                                                        <Share2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`p-20 rounded-[3rem] border-2 border-dashed ${isDark ? 'border-purple-500/20 bg-purple-500/5' : 'border-purple-100 bg-purple-50/30'} flex flex-col items-center text-center space-y-4`}>
                                <MessageSquare size={48} className="text-purple-500" />
                                <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>لا توجد نقاشات بعد</h3>
                                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ابدأ النقاش وكن أول من يطرح سؤالاً في الساحة!</p>
                                <button
                                    onClick={() => handleCreatePost('QUESTION')}
                                    className="px-8 py-3 rounded-2xl bg-purple-600 text-white font-black shadow-lg hover:scale-105 transition-transform"
                                >
                                    اسأل الآن
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Create Post Modal */}
            {isCreateModalOpen && (
                <CreatePostModal
                    initialType={postType}
                    onClose={handleCloseModal}
                />
            )}

            {/* Post Details Modal */}
            {isDetailsModalOpen && selectedPostId && (
                <PostDetailsModal
                    postId={selectedPostId}
                    isOpen={isDetailsModalOpen}
                    onClose={handleCloseModal}
                    onPostDeleted={fetchPosts}
                />
            )}
        </div>
    );
}
