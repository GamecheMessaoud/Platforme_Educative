import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Trash2, User, Share2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

interface PostDetailsModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
    onPostDeleted?: () => void;
}

export default function PostDetailsModal({ postId, isOpen, onClose, onPostDeleted }: PostDetailsModalProps) {
    const { isDark } = useTheme();
    const { user } = useAuthStore();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            fetchPostDetails();
        }
    }, [isOpen, postId]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            await Promise.all([
                api.get(`/community/posts/${postId}`),
                api.get(`/community/posts/${postId}/comments`)
            ]);
            // Re-checking routes from community.routes.ts: router.get('/posts/:postId', getPostById);
            // Prefix is /community. So /community/posts/:postId
            // My previous call in StudentCommunityTab was api.get(`/community/posts/${postId}/comments`)

            const pRes = await api.get(`/community/posts/${postId}`);
            const cRes = await api.get(`/community/posts/${postId}/comments`);

            setPost(pRes.data);
            setComments(cRes.data);
        } catch (error) {
            console.error('Error fetching post details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLike = async () => {
        if (!post) return;
        try {
            await api.post(`/community/posts/${postId}/react`, { type: 'LIKE' });
            fetchPostDetails();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || submittingComment) return;

        try {
            setSubmittingComment(true);
            await api.post(`/community/posts/${postId}/comments`, { content: commentText });
            setCommentText('');
            const cRes = await api.get(`/community/posts/${postId}/comments`);
            setComments(cRes.data);
            // Also refresh post to get updated comment count if needed
            const pRes = await api.get(`/community/posts/${postId}`);
            setPost(pRes.data);
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
        try {
            await api.delete(`/community/posts/${postId}`);
            onPostDeleted?.();
            onClose();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('خطأ في حذف المنشور');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('حذف التعليق؟')) return;
        try {
            await api.delete(`/community/comments/${commentId}`);
            const cRes = await api.get(`/community/posts/${postId}/comments`);
            setComments(cRes.data);
            const pRes = await api.get(`/community/posts/${postId}`);
            setPost(pRes.data);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    if (!isOpen) return null;

    const canManage = user?.role === 'ADMIN' || user?.role === 'TEACHER' || (post && post.author?.user_id === user?.id);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`${isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200'} w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative`}>

                {/* Header */}
                <div className={`p-6 border-b ${isDark ? 'border-[#30363d] bg-gradient-to-r from-blue-600/10 to-purple-600/10' : 'border-slate-100 bg-slate-50/50'} flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            {post?.type === 'PROJECT' ? <Share2 size={24} /> : <MessageCircle size={24} />}
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{post?.title || 'جاري التحميل...'}</h3>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs font-bold`}>
                                {post?.type === 'PROJECT' ? 'مشروع إبداعي' : 'سؤال تقني'} • {post && new Date(post.created_at).toLocaleDateString('ar-EG')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canManage && (
                            <button
                                onClick={handleDeletePost}
                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                                title="حذف المنشور"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className={`p-3 ${isDark ? 'bg-[#161b22] text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} rounded-2xl transition-all`}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row">
                    {/* Left Side: Content */}
                    <div className={`flex-1 p-8 border-b lg:border-b-0 lg:border-l ${isDark ? 'border-[#30363d]' : 'border-slate-100'}`}>
                        {loading ? (
                            <div className="h-40 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-8 text-right" dir="rtl">
                                {/* Author Info */}
                                <div className={`flex items-center gap-3 ${isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-slate-50 border-slate-100'} p-4 rounded-2xl border`}>
                                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'} overflow-hidden border`}>
                                        {post.author?.user?.avatar_url ? (
                                            <img src={post.author.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={20} /></div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.author?.user?.first_name} {post.author?.user?.last_name}</div>
                                        <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold`}>بطل كيد-تيك المبدع</div>
                                    </div>
                                </div>

                                {/* Media */}
                                {post.media_url && (
                                    <div className={`rounded-3xl overflow-hidden border ${isDark ? 'border-[#30363d] bg-slate-900' : 'border-slate-100 bg-slate-50'} shadow-inner`}>
                                        <img src={post.media_url} alt={post.title} className="w-full h-auto max-h-[400px] object-contain" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed text-lg whitespace-pre-wrap font-medium`}>
                                    {post.content}
                                </div>

                                {/* Actions */}
                                <div className={`flex items-center gap-6 pt-6 border-t ${isDark ? 'border-[#30363d]' : 'border-slate-100'}`}>
                                    <button
                                        onClick={handleToggleLike}
                                        className="flex items-center gap-2 group"
                                    >
                                        <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-lg shadow-pink-500/5">
                                            <Heart size={20} />
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{post._count?.reactions || 0}</div>
                                            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold`}>إعجاب</div>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-2 group">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                            <MessageCircle size={20} />
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{post._count?.comments || 0}</div>
                                            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold`}>تعليق</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Comments */}
                    <div className={`w-full lg:w-80 ${isDark ? 'bg-[#0d1117]/50' : 'bg-slate-50/30'} flex flex-col max-h-[500px] lg:max-h-full`}>
                        <div className={`p-6 border-b ${isDark ? 'border-[#30363d] bg-[#161b22]/50' : 'border-slate-100 bg-white/50'} text-right`}>
                            <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>المناقشة</h4>
                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold`}>شارك رأيك وشجع زملاءك</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {comments.length === 0 ? (
                                <div className="text-center py-10">
                                    <MessageCircle size={40} className={`mx-auto ${isDark ? 'text-slate-700' : 'text-slate-200'} mb-2 opacity-20`} />
                                    <p className={`${isDark ? 'text-slate-600' : 'text-slate-400'} text-xs font-bold`}>لا يوجد تعليقات بعد. كن أول من يعلق!</p>
                                </div>
                            ) : (
                                comments.map((c: any) => (
                                    <div key={c.id} className="text-right group">
                                        <div className={`flex items-start gap-3 ${isDark ? 'bg-[#161b22] border-transparent hover:border-[#30363d]' : 'bg-white border-slate-100 hover:border-slate-200'} p-3 rounded-2xl border transition-all relative`}>
                                            <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'} overflow-hidden flex-shrink-0`}>
                                                {c.author?.user?.avatar_url ? (
                                                    <img src={c.author.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-slate-600' : 'text-slate-300'}`}><User size={14} /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{c.author?.user?.first_name} {c.author?.user?.last_name}</div>
                                                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs leading-relaxed break-words`}>{c.content}</p>
                                                <div className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'} mt-1 font-bold`}>{new Date(c.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                            {(user?.role === 'ADMIN' || user?.role === 'TEACHER' || c.author?.user_id === user?.id) && (
                                                <button
                                                    onClick={() => handleDeleteComment(c.id)}
                                                    className="absolute top-2 left-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className={`p-6 border-t ${isDark ? 'border-[#30363d] bg-[#161b22]/50' : 'border-slate-100 bg-white/50'}`}>
                            <form onSubmit={handleAddComment} className="relative">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="اكتب تعليقاً..."
                                    className={`w-full ${isDark ? 'bg-[#0d1117] border-[#30363d] text-white focus:ring-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500'} py-3 pr-4 pl-12 rounded-xl text-xs outline-none transition-all font-bold text-right`}
                                    dir="rtl"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || submittingComment}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingComment ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Send size={14} />
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
