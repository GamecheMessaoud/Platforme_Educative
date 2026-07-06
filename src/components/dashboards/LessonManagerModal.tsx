import React, { useState, useEffect } from 'react';
import { X, BookOpen, Layers, Award, Languages, Trash2, Save, HelpCircle, Plus, Check, FileText, Upload } from 'lucide-react';
import { getCourseLessons, createLesson, deleteLesson, updateLesson, uploadLessonPdf } from '../../services/lessonService';
import { useTheme } from '../../context/ThemeContext';
import type { Lesson } from '../../types/lesson';
import Loading from '../Loading';

interface LessonManagerModalProps {
    courseId: string;
    courseTitle: string;
    onClose: () => void;
}

interface QcmQuestion {
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correct: 'A' | 'B' | 'C' | 'D';
    explanation: string;
}

const emptyQuestion = (): QcmQuestion => ({
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correct: 'A',
    explanation: ''
});

const initialFormData = {
    title_ar: '',
    title_en: '',
    title_fr: '',
    content_ar: '',
    content_en: '',
    content_fr: '',
    lesson_type: 'VIDEO',
    xp_reward: '50',
    video_url: '',
    youtube_url: '',
    lab_url: '',
    guide_content: '',
    submission_url_example: '',
    pdf_url: '',
};

// Environment presets for quick lab_url filling
const ENV_PRESETS = [
    { label: '🐍 Python', url: 'https://trinket.io/embed/python3#code=print("مرحبا!")' },
    { label: '🎮 Scratch', url: 'https://ide.pictoblox.ai/' },
    { label: '🤖 PictoBlox', url: 'https://ide.pictoblox.ai/' },
    { label: '⚡ Arduino (Wokwi)', url: 'https://wokwi.com/projects/new/arduino-uno' },
    { label: '🤖 Arduino (mBlock)', url: 'https://ide.mblock.cc/' },
    { label: '📱 MIT App', url: 'https://appinventor.mit.edu/olla/' },
    { label: '🌐 Web Dev', url: 'https://stackblitz.com/fork/web?file=index.html' },
];

const LessonManagerModal: React.FC<LessonManagerModalProps> = ({ courseId, courseTitle, onClose }) => {
    const { isDark } = useTheme();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'settings' | 'qcm'>('basic');
    const [formData, setFormData] = useState(initialFormData);
    const [qcmQuestions, setQcmQuestions] = useState<QcmQuestion[]>([emptyQuestion()]);

    const loadLessons = async () => {
        try {
            setLoading(true);
            const data = await getCourseLessons(courseId);
            setLessons(data);
        } catch (error) {
            console.error('Failed to load lessons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLessons(); }, [courseId]);

    const handleEditLesson = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setFormData({
            title_ar: lesson.title_ar || '',
            title_en: lesson.title_en || '',
            title_fr: lesson.title_fr || '',
            content_ar: lesson.content_ar || '',
            content_en: lesson.content_en || '',
            content_fr: lesson.content_fr || '',
            lesson_type: lesson.lesson_type || 'VIDEO',
            xp_reward: lesson.xp_reward?.toString() || '50',
            video_url: lesson.video_url || '',
            youtube_url: lesson.youtube_url || '',
            lab_url: lesson.lab_url || '',
            guide_content: lesson.guide_content || '',
            submission_url_example: lesson.submission_url_example || '',
            pdf_url: lesson.pdf_url || '',
        });
        // Parse QCM from extra_qcm field
        if (lesson.extra_qcm && Array.isArray(lesson.extra_qcm) && lesson.extra_qcm.length > 0) {
            setQcmQuestions(lesson.extra_qcm);
        } else {
            setQcmQuestions([emptyQuestion()]);
        }
        setActiveTab('basic');
    };

    const handleCancelEdit = () => {
        setEditingLesson(null);
        setFormData(initialFormData);
        setQcmQuestions([emptyQuestion()]);
    };

    const [uploadingPdf, setUploadingPdf] = useState(false);

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('يرجى اختيار ملف PDF فقط');
            return;
        }

        try {
            setUploadingPdf(true);
            const { url } = await uploadLessonPdf(file);
            setFormData(prev => ({ ...prev, pdf_url: url }));
        } catch (error) {
            console.error('PDF upload failed');
            alert('فشل رفع الملف');
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Filter out empty questions
            const validQcm = qcmQuestions.filter(q => q.question.trim() && q.options.A.trim());
            const lessonData = {
                ...formData,
                xp_reward: parseInt(formData.xp_reward),
                video_url: formData.video_url || null,
                youtube_url: formData.youtube_url || null,
                lab_url: formData.lab_url || null,
                guide_content: formData.guide_content || null,
                pdf_url: formData.pdf_url || null,
                extra_qcm: validQcm.length > 0 ? validQcm : {},
            };
            if (editingLesson) {
                await updateLesson(editingLesson.id, lessonData);
            } else {
                await createLesson({ ...lessonData, courseId, order_index: lessons.length });
            }
            setFormData(initialFormData);
            setEditingLesson(null);
            setQcmQuestions([emptyQuestion()]);
            loadLessons();
        } catch (error) {
            console.error('Failed to save lesson');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
        try {
            await deleteLesson(id);
            if (editingLesson?.id === id) handleCancelEdit();
            loadLessons();
        } catch (error) {
            console.error('Failed to delete lesson');
        }
    };

    // QCM helpers
    const updateQuestion = (idx: number, field: keyof QcmQuestion, value: any) => {
        setQcmQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
    };
    const updateOption = (idx: number, opt: 'A' | 'B' | 'C' | 'D', value: string) => {
        setQcmQuestions(prev => prev.map((q, i) => i === idx ? { ...q, options: { ...q.options, [opt]: value } } : q));
    };
    const addQuestion = () => {
        if (qcmQuestions.length < 10) setQcmQuestions(prev => [...prev, emptyQuestion()]);
    };
    const removeQuestion = (idx: number) => {
        if (qcmQuestions.length > 1) setQcmQuestions(prev => prev.filter((_, i) => i !== idx));
    };

    const cardBg = isDark ? 'bg-[#1c2128] border-[#30363d]' : 'bg-white border-slate-200';
    const inputBg = isDark ? 'bg-[#0d1117] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
            <div className={`w-full max-w-7xl rounded-[2.5rem] border ${cardBg} shadow-2xl relative animate-fade-in max-h-[95vh] flex flex-col overflow-hidden`}>

                {/* Header */}
                <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between shrink-0`}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${textMain}`}>إدارة الدروس: {courseTitle}</h3>
                            <p className={`text-xs ${muted} font-bold`}>أنشئ محتوى تعليمي تفاعلي وقسمه لدروس شيقة</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2.5 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} transition-colors`}>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: Lessons List */}
                    <div className={`w-72 border-l ${isDark ? 'border-slate-700 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'} flex flex-col shrink-0 overflow-hidden`}>
                        <div className="p-4 border-b border-inherit">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className={`font-black text-sm ${textMain}`}>قائمة الدروس</h4>
                                <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">{lessons.length} درس</span>
                            </div>
                            {editingLesson && (
                                <button onClick={handleCancelEdit} className="w-full py-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl text-xs font-black hover:bg-indigo-500/20 transition-all">
                                    + درس جديد
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {loading ? (
                                <div className="py-10 text-center"><Loading /></div>
                            ) : lessons.map((lesson, idx) => (
                                <div key={lesson.id} className={`group p-3 rounded-2xl border transition-all cursor-pointer ${editingLesson?.id === lesson.id ? 'bg-indigo-500/10 border-indigo-500/40' : `border-transparent ${isDark ? 'hover:bg-slate-800' : 'hover:bg-white hover:shadow-sm'}`}`}>
                                    <div className="flex items-center gap-3" onClick={() => handleEditLesson(lesson)}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${editingLesson?.id === lesson.id ? 'bg-indigo-500 text-white' : `${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'}`}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-black truncate ${textMain}`}>{lesson.title_ar}</div>
                                            <div className={`text-[10px] ${muted} font-bold`}>
                                                {lesson.lesson_type} • {lesson.xp_reward} XP
                                                {lesson.extra_qcm && Array.isArray(lesson.extra_qcm) && lesson.extra_qcm.length > 0 &&
                                                    <span className="mr-1 text-indigo-400">• {lesson.extra_qcm.length} سؤال</span>
                                                }
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(lesson.id); }} className="p-1.5 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Form */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className={`flex px-8 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} gap-6 shrink-0 overflow-x-auto`}>
                            {[
                                { id: 'basic', label: 'الأساسيات', icon: BookOpen },
                                { id: 'content', label: 'المحتوى والوسائط', icon: Languages },
                                { id: 'settings', label: 'الإعدادات', icon: Award },
                                { id: 'qcm', label: `اختبار QCM (${qcmQuestions.filter(q => q.question.trim()).length}/10)`, icon: HelpCircle },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-5 text-sm font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-500'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <form id="lessonForm" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">

                                {/* ─── Tab: BASIC ─── */}
                                {activeTab === 'basic' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <label className={`block font-black mb-2 text-sm ${textMain}`}>العنوان بالعربية *</label>
                                            <input required type="text" value={formData.title_ar}
                                                onChange={e => setFormData({ ...formData, title_ar: e.target.value })}
                                                placeholder="مثال: مقدمة في سكراتش وواجهته"
                                                className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold ${inputBg}`} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className={`block font-black mb-2 text-xs ${muted}`}>Title (English)</label>
                                                <input type="text" value={formData.title_en}
                                                    onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                                                    className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${inputBg}`} />
                                            </div>
                                            <div>
                                                <label className={`block font-black mb-2 text-xs ${muted}`}>Titre (Français)</label>
                                                <input type="text" value={formData.title_fr}
                                                    onChange={e => setFormData({ ...formData, title_fr: e.target.value })}
                                                    className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${inputBg}`} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ─── Tab: CONTENT ─── */}
                                {activeTab === 'content' && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            {/* Media URLs */}
                                            <div className="space-y-5">
                                                <h4 className={`font-black text-sm border-b pb-2 ${textMain} ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>🔗 الروابط والوسائط</h4>

                                                {/* Environment Presets */}
                                                <div>
                                                    <label className={`block font-black mb-2 text-xs ${muted}`}>⚡ بيئة برمجية سريعة (اختر لملء الرابط تلقائياً)</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ENV_PRESETS.map(preset => (
                                                            <button
                                                                key={preset.label}
                                                                type="button"
                                                                onClick={() => setFormData(f => ({ ...f, lab_url: preset.url }))}
                                                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 ${
                                                                    formData.lab_url === preset.url
                                                                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg'
                                                                        : `${isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:border-indigo-500/50' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-400 hover:bg-indigo-50'}`
                                                                }`}
                                                            >
                                                                {preset.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className={`block font-black mb-2 text-xs ${muted}`}>🎬 رابط فيديو YouTube</label>
                                                    <input type="text" placeholder="https://youtube.com/watch?v=..."
                                                        value={formData.youtube_url}
                                                        onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                                                        className={`w-full p-3 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm ${inputBg}`} />
                                                </div>
                                                <div>
                                                    <label className={`block font-black mb-2 text-xs ${muted}`}>📹 رابط فيديو مباشر (mp4)</label>
                                                    <input type="text" placeholder="https://example.com/video.mp4"
                                                        value={formData.video_url}
                                                        onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                                        className={`w-full p-3 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm ${inputBg}`} />
                                                </div>
                                                <div>
                                                    <label className={`block font-black mb-2 text-xs ${muted}`}>🧪 رابط المختبر (يُملأ تلقائياً بالضغط أعلاه)</label>
                                                    <input type="text" placeholder="https://trinket.io/embed/python3..."
                                                        value={formData.lab_url}
                                                        onChange={e => setFormData({ ...formData, lab_url: e.target.value })}
                                                        className={`w-full p-3 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm ${inputBg}`} />
                                                    <p className={`mt-1 text-[10px] ${muted}`}>اتركه فارغاً لاستخدام البيئة الافتراضية للدورة تلقائياً</p>
                                                </div>
                                                <div>
                                                    <label className={`block font-black mb-2 text-xs ${muted}`}>🔗 مثال رابط تسليم (اختياري)</label>
                                                    <input type="text" placeholder="https://scratch.mit.edu/projects/123456"
                                                        value={formData.submission_url_example}
                                                        onChange={e => setFormData({ ...formData, submission_url_example: e.target.value })}
                                                        className={`w-full p-3 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm ${inputBg}`} />
                                                    <p className={`mt-1 text-[10px] ${muted}`}>مثال على رابط تسليم يُظهر للطالب كمرجع</p>
                                                </div>

                                                <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                                    <label className={`block font-black mb-3 text-xs flex items-center gap-2 ${textMain}`}>
                                                        <FileText size={14} className="text-indigo-500" />
                                                        ملف PDF (مرجع للمشروع)
                                                    </label>
                                                    
                                                    {formData.pdf_url ? (
                                                        <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <Check size={16} className="text-green-500 flex-shrink-0" />
                                                                <span className="text-xs font-bold text-green-600 truncate">تم إرفاق الملف بنجاح</span>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setFormData(p => ({ ...p, pdf_url: '' }))}
                                                                className="p-1.5 hover:bg-green-500/20 rounded-lg text-green-600 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group ${uploadingPdf ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            <Upload size={20} className={`mb-2 group-hover:scale-110 transition-transform ${muted}`} />
                                                            <span className={`text-[10px] font-black ${muted}`}>
                                                                {uploadingPdf ? 'جاري الرفع...' : 'اضغط لرفع ملف PDF كمرجع'}
                                                            </span>
                                                            <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Text Content */}
                                            <div className="space-y-5">
                                                <h4 className={`font-black text-sm border-b pb-2 ${textMain} ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>📝 المحتوى النصي</h4>
                                                <div>
                                                    <label className={`block font-black mb-2 text-sm ${textMain}`}>شرح الدرس (عربي) *</label>
                                                    <textarea required value={formData.content_ar}
                                                        onChange={e => setFormData({ ...formData, content_ar: e.target.value })}
                                                        placeholder="اشرح الدرس للطالب..."
                                                        className={`w-full p-4 rounded-2xl border outline-none h-40 resize-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium ${inputBg}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Guide Steps */}
                                        <div className={`pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                            <label className={`block font-black mb-3 text-sm ${textMain}`}>📋 خطوات الإنجاز (سطر لكل خطوة)</label>
                                            <textarea
                                                placeholder={"الخطوة الأولى: افتح Scratch وأنشئ مشروعاً جديداً\nالخطوة الثانية: أضف شخصية جديدة من المكتبة\nالخطوة الثالثة: برمج الشخصية لتتحرك عند الضغط"}
                                                value={formData.guide_content}
                                                onChange={e => setFormData({ ...formData, guide_content: e.target.value })}
                                                className={`w-full p-4 rounded-2xl border outline-none h-36 resize-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium ${inputBg}`} />
                                        </div>
                                    </div>
                                )}

                                {/* ─── Tab: SETTINGS ─── */}
                                {activeTab === 'settings' && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div>
                                            <label className={`block font-black mb-2 text-sm ${textMain}`}>💎 مكافأة XP عند إكمال الدرس</label>
                                            <input type="number" min="0" max="1000"
                                                value={formData.xp_reward}
                                                onChange={e => setFormData({ ...formData, xp_reward: e.target.value })}
                                                className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-black text-2xl ${inputBg}`} />
                                            <p className={`mt-2 text-xs ${muted} font-bold`}>سيحصل الطالب على هذه النقاط عند إكمال كافة أقسام هذا الدرس (مشاهدة، تطبيق، وحل الاختبار).</p>
                                        </div>
                                    </div>
                                )}

                                {/* ─── Tab: QCM ─── */}
                                {activeTab === 'qcm' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className={`font-black text-lg ${textMain}`}>اختبار الفهم QCM</h4>
                                                <p className={`text-sm ${muted} font-medium`}>أضف حتى 10 أسئلة متعددة الخيارات لتقييم فهم الطلاب</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-bold px-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                    {qcmQuestions.filter(q => q.question.trim()).length}/10 سؤال
                                                </span>
                                                {qcmQuestions.length < 10 && (
                                                    <button type="button" onClick={addQuestion}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-500/30">
                                                        <Plus size={16} /> إضافة سؤال
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {qcmQuestions.map((q, idx) => (
                                                <div key={idx} className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/30">
                                                                {idx + 1}
                                                            </div>
                                                            <span className={`font-black text-sm ${textMain}`}>سؤال {idx + 1}</span>
                                                        </div>
                                                        {qcmQuestions.length > 1 && (
                                                            <button type="button" onClick={() => removeQuestion(idx)}
                                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Question text */}
                                                    <div className="mb-4">
                                                        <label className={`block font-black mb-2 text-xs ${muted}`}>نص السؤال *</label>
                                                        <input type="text"
                                                            value={q.question}
                                                            onChange={e => updateQuestion(idx, 'question', e.target.value)}
                                                            placeholder="ما هو الهدف الرئيسي من المشروع؟"
                                                            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold text-sm ${inputBg}`} />
                                                    </div>

                                                    {/* Options */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                        {(['A', 'B', 'C', 'D'] as const).map(opt => (
                                                            <div key={opt} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${q.correct === opt ? 'border-emerald-500 bg-emerald-500/10' : `${isDark ? 'border-slate-700' : 'border-slate-200'}`}`}>
                                                                <button type="button"
                                                                    onClick={() => updateQuestion(idx, 'correct', opt)}
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 border-2 transition-all ${q.correct === opt ? 'bg-emerald-500 border-emerald-500 text-white' : `${isDark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'}`}`}>
                                                                    {q.correct === opt ? <Check size={14} /> : opt}
                                                                </button>
                                                                <input type="text"
                                                                    value={q.options[opt]}
                                                                    onChange={e => updateOption(idx, opt, e.target.value)}
                                                                    placeholder={`الخيار ${opt}`}
                                                                    className={`flex-1 bg-transparent outline-none font-bold text-sm ${textMain} placeholder:text-slate-400`} />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Explanation */}
                                                    <div>
                                                        <label className={`block font-black mb-2 text-xs ${muted}`}>💡 شرح الإجابة الصحيحة (اختياري)</label>
                                                        <input type="text"
                                                            value={q.explanation}
                                                            onChange={e => updateQuestion(idx, 'explanation', e.target.value)}
                                                            placeholder="لأن..."
                                                            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium ${inputBg}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {qcmQuestions.length < 10 && (
                                            <button type="button" onClick={addQuestion}
                                                className={`w-full py-4 rounded-2xl border-2 border-dashed font-black text-sm transition-all flex items-center justify-center gap-2 ${isDark ? 'border-slate-700 text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400' : 'border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'}`}>
                                                <Plus size={18} /> إضافة سؤال جديد ({qcmQuestions.length}/10)
                                            </button>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className={`p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex gap-4 shrink-0`}>
                            <button type="submit" form="lessonForm"
                                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2">
                                <Save size={20} />
                                {editingLesson ? 'تعديل الدرس الحالي' : 'إضافة الدرس 🚀'}
                            </button>
                            {editingLesson && (
                                <button type="button" onClick={handleCancelEdit}
                                    className={`flex-1 py-4 border-2 rounded-2xl font-black text-sm transition-all ${isDark ? 'border-slate-700 text-slate-400 bg-slate-800' : 'border-slate-100 text-slate-600 bg-slate-50'}`}>
                                    إلغاء التعديل
                                </button>
                            )}
                            <button type="button" onClick={onClose}
                                className={`px-8 py-4 border-2 rounded-2xl font-black text-sm transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-100 text-slate-700 hover:bg-slate-100'}`}>
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonManagerModal;
