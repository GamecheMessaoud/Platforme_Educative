import React, { useState } from 'react';
import { X, Rocket, MessageSquare, Image as ImageIcon, Sparkles, Send } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../lib/api';

interface CreatePostModalProps {
    initialType?: 'PROJECT' | 'QUESTION';
    onClose: (saved: boolean) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ initialType = 'PROJECT', onClose }) => {
    const { isDark } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        type: initialType,
        title: '',
        content: '',
        media_url: ''
    });

    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploadingImage(true);
        setError('');
        try {
            const res = await api.post('/community/posts/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData({ ...formData, media_url: res.data.imageUrl });
        } catch (err: any) {
            setError(err.response?.data?.error || 'فشل رفع الصورة');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await api.post('/community/posts', formData);
            onClose(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء نشر المشاركة');
        } finally {
            setIsSubmitting(false);
        }
    };

    const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-white' : 'text-slate-900';
    const inputBg = isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md" dir="rtl">
            <div className={`w-full max-w-2xl rounded-[3rem] border ${cardBg} shadow-2xl relative animate-premium-in overflow-hidden`}>

                {/* Header Gradient */}
                <div className={`h-2 bg-gradient-to-r ${formData.type === 'PROJECT' ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-purple-500 via-pink-500 to-rose-500'}`} />

                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${formData.type === 'PROJECT' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-purple-600 shadow-purple-500/20'
                            }`}>
                            {formData.type === 'PROJECT' ? <Rocket size={28} /> : <MessageSquare size={28} />}
                        </div>
                        <div>
                            <h3 className={`text-2xl font-black ${textMain}`}>
                                {formData.type === 'PROJECT' ? 'شارك مشروعك الإبداعي' : 'اطرح سؤالك البرمجي'}
                            </h3>
                            <p className={`text-sm ${muted} font-medium`}>تواصل مع زملائك الأبطال في مجتمع كيد-تيك</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        className={`p-3 rounded-2xl ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} transition-all`}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 pt-4">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 text-rose-500 font-bold text-sm border border-rose-500/20 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type Toggle */}
                        <div className={`p-2 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} flex gap-2`}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'PROJECT' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${formData.type === 'PROJECT'
                                    ? (isDark ? 'bg-slate-700 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-lg')
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Rocket size={18} />
                                مجرة المشاريع
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'QUESTION' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${formData.type === 'QUESTION'
                                    ? (isDark ? 'bg-slate-700 text-white shadow-lg' : 'bg-white text-purple-600 shadow-lg')
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <MessageSquare size={18} />
                                ساحة النقاش
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label className={`block font-black mb-2 text-sm ${textMain}`}>العنوان *</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder={formData.type === 'PROJECT' ? "ما هو اسم مشروعك الرائع؟" : "ما هي المشكلة التي تواجهها؟"}
                                className={`w-full p-4 rounded-2xl border outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold ${inputBg}`}
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className={`block font-black mb-2 text-sm ${textMain}`}>التفاصيل *</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder={formData.type === 'PROJECT' ? "اشرح لنا فكرة مشروعك وكيف بنيته؟" : "اشرح المشكلة بالتفصيل وضع الكود إن وجد..."}
                                className={`w-full p-4 rounded-2xl border outline-none h-40 resize-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium ${inputBg}`}
                            />
                        </div>

                        {/* Media Upload / URL */}
                        <div>
                            <label className={`block font-black mb-2 text-sm ${textMain} flex items-center gap-2`}>
                                <ImageIcon size={16} className="text-indigo-500" /> رابط الصورة أو رفع صورة (اختياري)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={formData.media_url}
                                    onChange={e => setFormData({ ...formData, media_url: e.target.value })}
                                    placeholder="أدخل الرابط أو ارفع من جهازك..."
                                    className={`flex-1 p-4 rounded-2xl border outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all ${inputBg}`}
                                />
                                <label className={`flex items-center justify-center px-4 py-3 rounded-2xl border cursor-pointer transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}>
                                    {uploadingImage ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <span className="font-bold text-sm">رفع صورة</span>}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                                </label>
                            </div>
                            <p className={`mt-2 text-[10px] ${muted} font-medium`}>يفضل استخدام صور تظهر جمال مشروعك</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-[2] py-4 bg-gradient-to-r ${formData.type === 'PROJECT' ? 'from-indigo-600 to-purple-600' : 'from-purple-600 to-pink-600'
                                    } text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3`}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>انشر الآن</span>
                                        <Send size={20} />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => onClose(false)}
                                className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all border-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
