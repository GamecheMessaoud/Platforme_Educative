import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, Target, Languages, Info, Image as ImageIcon } from 'lucide-react';
import { createCourse, updateCourse } from '../../services/courseService';
import { useTheme } from '../../context/ThemeContext';
import type { Course } from '../../types';

interface CourseModalProps {
    course: Course | null;
    onClose: (saved: boolean) => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ course, onClose }) => {
    const { isDark } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'settings'>('basic');

    const [formData, setFormData] = useState({
        title_ar: '',
        title_en: '',
        title_fr: '',
        description: '',
        description_en: '',
        description_fr: '',
        learning_objectives: '',
        estimated_duration: '60',
        thumbnail: '',
        categoryType: 'scratch',
        difficulty: 'BEGINNER',
        level: '1',
        xp_reward: '100',
        status: 'draft' as 'published' | 'draft'
    });

    useEffect(() => {
        if (course) {
            setFormData({
                title_ar: course.title || '',
                title_en: course.title_en || '',
                title_fr: course.title_fr || '',
                description: course.description || '',
                description_en: course.description_en || '',
                description_fr: course.description_fr || '',
                learning_objectives: course.learning_objectives || '',
                estimated_duration: course.estimated_duration?.toString() || '60',
                thumbnail: course.thumbnail || '',
                categoryType: course.category.toLowerCase().includes('python') ? 'python' :
                    course.category.toLowerCase().includes('scratch') ? 'scratch' : 'other',
                difficulty: course.difficulty || 'BEGINNER',
                level: (course as any).level?.toString() || '1',
                xp_reward: course.xp_reward?.toString() || '100',
                status: course.status
            });
        }
    }, [course]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (course) {
                await updateCourse(course.id, formData);
            } else {
                await createCourse(formData);
            }
            onClose(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ غير متوقع');
        } finally {
            setIsSubmitting(false);
        }
    };

    const cardBg = isDark ? 'bg-[#1c2128] border-[#30363d]' : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
    const inputBg = isDark ? 'bg-[#0d1117] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
            <div className={`w-full max-w-6xl rounded-[2.5rem] border ${cardBg} shadow-2xl relative animate-fade-in max-h-[95vh] flex flex-col`}>

                {/* Header */}
                <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${textMain}`}>
                                {course ? 'تعديل الدورة' : 'إنشاء دورة تعليمية جديدة'}
                            </h3>
                            <p className={`text-xs ${muted} font-bold`}>أكمل البيانات لجعل الدورة جاهزة للطلاب</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        className={`p-2.5 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} transition-colors`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className={`flex px-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} gap-6`}>
                    {[
                        { id: 'basic', label: 'المعلومات الأساسية', icon: Info },
                        { id: 'content', label: 'المحتوى والوصف', icon: Languages },
                        { id: 'settings', label: 'الإعدادات والمكافآت', icon: Target },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 text-sm font-black flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-100 text-red-700 font-bold text-sm border border-red-200 animate-shake">
                            {error}
                        </div>
                    )}

                    <form id="courseForm" onSubmit={handleSubmit} className="space-y-6">
                        {activeTab === 'basic' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={`block font-black mb-2 text-sm ${textMain}`}>عنوان الدورة (بالعربية) *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title_ar}
                                            onChange={e => setFormData({ ...formData, title_ar: e.target.value })}
                                            placeholder="مثال: مدخل إلى برمجة الألعاب بسكراتش"
                                            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold ${inputBg}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block font-black mb-2 text-sm ${textMain}`}>العنوان (English)</label>
                                        <input
                                            type="text"
                                            value={formData.title_en}
                                            onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                                            placeholder="e.g. Intro to Game Dev"
                                            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${inputBg}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block font-black mb-2 text-sm ${textMain}`}>Titre (Français)</label>
                                        <input
                                            type="text"
                                            value={formData.title_fr}
                                            onChange={e => setFormData({ ...formData, title_fr: e.target.value })}
                                            placeholder="ex. Introduction au développement"
                                            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${inputBg}`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block font-black mb-2 text-sm ${textMain}`}>مسار الدورة *</label>
                                        <select
                                            value={formData.categoryType}
                                            onChange={e => setFormData({ ...formData, categoryType: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold ${inputBg}`}
                                        >
                                            <option value="scratch">🎨 سكراتش (Scratch)</option>
                                            <option value="python">🐍 بايثون (Python)</option>
                                            <option value="mobile-dev">📱 تطوير تطبيقات الهاتف</option>
                                            <option value="web-dev">🌐 تطوير واجهات الويب</option>
                                            <option value="ai">🤖 الذكاء الاصطناعي</option>
                                            <option value="3d-printing">🖨️ الطباعة ثلاثية الأبعاد</option>
                                            <option value="robotics">🤖 الروبوتات</option>
                                            <option value="other">📚 مسار آخر</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block font-black mb-2 text-sm ${textMain}`}>مستوى الصعوبة</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold ${inputBg}`}
                                        >
                                            <option value="BEGINNER">🟢 مبتدئ (Beginner)</option>
                                            <option value="INTERMEDIATE">🟡 متوسط (Intermediate)</option>
                                            <option value="ADVANCED">🔴 متقدم (Advanced)</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block font-black mb-2 text-sm ${textMain}`}>مستوى الدورة</label>
                                            <select
                                                value={formData.level}
                                                onChange={e => setFormData({ ...formData, level: e.target.value })}
                                                className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold ${inputBg}`}
                                            >
                                                <option value="1">1️⃣ المستوى الأول (للمستجدين)</option>
                                                <option value="2">2️⃣ المستوى الثاني (متوسط)</option>
                                                <option value="3">3️⃣ المستوى الثالث (متقدم)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block font-black mb-2 text-sm ${textMain} flex items-center gap-2`}>
                                        <ImageIcon size={16} className="text-emerald-500" /> رابط صورة الغلاف
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.thumbnail}
                                        onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${inputBg}`}
                                    />
                                    <p className={`mt-2 text-[10px] ${muted} font-medium`}>يفضل استخدام صور عالية الجودة بأبعاد 16:9</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className={`block font-black mb-2 text-sm ${textMain}`}>وصف الدورة (Arabic) *</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="اشرح للطلاب ماذا سيتعلمون في هذه الدورة..."
                                        className={`w-full p-4 rounded-2xl border outline-none h-32 resize-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium ${inputBg}`}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block font-black mb-2 text-sm ${textMain}`}>Description (English)</label>
                                        <textarea
                                            value={formData.description_en}
                                            onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                                            placeholder="Explain in English..."
                                            className={`w-full p-4 rounded-2xl border outline-none h-28 resize-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm ${inputBg}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block font-black mb-2 text-sm ${textMain}`}>Description (Français)</label>
                                        <textarea
                                            value={formData.description_fr}
                                            onChange={e => setFormData({ ...formData, description_fr: e.target.value })}
                                            placeholder="Expliquer en Français..."
                                            className={`w-full p-4 rounded-2xl border outline-none h-28 resize-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm ${inputBg}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block font-black mb-2 text-sm ${textMain} flex items-center gap-2`}>
                                        <Target size={16} className="text-emerald-500" /> أهداف التعلم (سطر لكل هدف)
                                    </label>
                                    <textarea
                                        value={formData.learning_objectives}
                                        onChange={e => setFormData({ ...formData, learning_objectives: e.target.value })}
                                        placeholder="1. تعلم واجهة سكراتش&#10;2. فهم الحلقات التكرارية&#10;3. بناء أول مشروع متكامل..."
                                        className={`w-full p-4 rounded-2xl border outline-none h-32 resize-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium ${inputBg}`}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block font-black mb-2 text-sm ${textMain} flex items-center gap-2`}>
                                            <Clock size={16} className="text-emerald-500" /> الوقت المقدر (بالدقائق)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.estimated_duration}
                                            onChange={e => setFormData({ ...formData, estimated_duration: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold ${inputBg}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block font-black mb-2 text-sm ${textMain} flex items-center gap-2`}>
                                            <Target size={16} className="text-emerald-500" /> مكافأة XP عند الإكمال
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.xp_reward}
                                            onChange={e => setFormData({ ...formData, xp_reward: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold ${inputBg}`}
                                        />
                                    </div>
                                </div>

                                {true && (
                                    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <label className={`block font-black mb-3 text-sm ${textMain}`}>حالة ظهور الدورة</label>
                                        <div className="flex gap-4">
                                            {[
                                                { id: 'draft', label: 'مسودة ✏️', desc: 'لن يراها الطلاب' },
                                                { id: 'published', label: 'منشورة ✅', desc: 'ستكون متاحة للجميع' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: opt.id as any })}
                                                    className={`flex-1 p-4 rounded-2xl border-2 transition-all text-right ${formData.status === opt.id
                                                        ? 'border-emerald-500 bg-emerald-500/10'
                                                        : 'border-transparent bg-white/5'
                                                        }`}
                                                >
                                                    <div className={`font-black text-sm ${formData.status === opt.id ? 'text-emerald-500' : textMain}`}>{opt.label}</div>
                                                    <div className={`text-[10px] ${muted} font-medium`}>{opt.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Controls */}
                <div className={`p-8 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-4`}>
                    <button
                        type="submit"
                        form="courseForm"
                        disabled={isSubmitting}
                        className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري الحفظ...</>
                        ) : (course ? 'تحديث بيانات الدورة' : 'إنشاء الدورة الآن 🚀')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onClose(false)}
                        className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseModal;
