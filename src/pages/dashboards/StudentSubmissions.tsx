import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
    FileText, CheckCircle, Clock, XCircle,
    ExternalLink, ChevronRight,
    Trophy, MessageCircle, Upload, Paperclip, Send, X, Link2, Code2, Image, Video
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';
type SubmissionTab = 'file' | 'link' | 'text';

export default function StudentSubmissions() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { user } = useAuthStore();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadCourseSlug, setUploadCourseSlug] = useState('scratch');
    const [uploadLessonRef, setUploadLessonRef] = useState('1');
    const [submissionTab, setSubmissionTab] = useState<SubmissionTab>('file');
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [submissionText, setSubmissionText] = useState('');
    const [viewTextModal, setViewTextModal] = useState<{ text: string; title: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchSubmissions(); }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/submissions/my');
            setSubmissions(res.data);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!user) return;
        // Validation per tab
        if (submissionTab === 'file' && !uploadFile) return;
        if (submissionTab === 'link' && !submissionUrl.trim()) return;
        if (submissionTab === 'text' && !submissionText.trim()) return;
        setUploading(true);

        try {
            const meRes = await api.get('/auth/me');
            const studentId = meRes.data.studentProfile?.id;
            if (!studentId) throw new Error('Student profile not found');

            const formData = new FormData();
            formData.append('lessonRefId', uploadLessonRef);
            formData.append('courseSlug', uploadCourseSlug);
            formData.append('description', uploadDescription);
            formData.append('submissionType', submissionTab === 'file' ? 'file' : submissionTab === 'link' ? 'link' : 'text');

            if (submissionTab === 'file' && uploadFile) {
                formData.append('file', uploadFile);
            } else if (submissionTab === 'link') {
                formData.append('submissionUrl', submissionUrl.trim());
            } else {
                formData.append('submissionText', submissionText.trim());
            }

            await api.post(`/submissions/upload/${studentId}`, formData);

            setShowUploadModal(false);
            setUploadFile(null);
            setUploadDescription('');
            setSubmissionUrl('');
            setSubmissionText('');
            fetchSubmissions();
            alert('✅ تم إرسال التسليم بنجاح! سيقوم المعلم بمراجعته قريباً.');
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`❌ خطأ: ${error?.response?.data?.message || 'حدث خطأ أثناء إرسال التسليم'}`);
        } finally {
            setUploading(false);
        }
    };

    const bg = isDark ? 'bg-[#0d1117] text-slate-100' : 'bg-slate-50 text-slate-900';
    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100 shadow-luxury';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
    const inputBg = isDark ? 'bg-slate-900/50 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900';

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'APPROVED': return { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle, label: 'تم القبول' };
            case 'PENDING': return { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock, label: 'قيد المراجعة' };
            case 'REJECTED': return { bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: XCircle, label: 'يرجى التعديل' };
            default: return { bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: FileText, label: 'غير معروف' };
        }
    };

    const courseOptions = [
        { value: 'scratch', label: 'سكراتش' },
        { value: 'python', label: 'بايثون' },
        { value: 'ai', label: 'الذكاء الاصطناعي' },
        { value: 'web-dev', label: 'تطوير الويب' },
        { value: 'arduino', label: 'أردوينو' },
        { value: 'game-dev', label: 'تطوير الألعاب' },
        { value: 'robotics', label: 'الروبوتات' },
    ];

    const tabStyles = (tab: SubmissionTab) =>
        submissionTab === tab
            ? 'bg-primary text-white shadow-md'
            : `${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} transition-all`;

    return (
        <div className={`min-h-screen ${bg} pb-32 overflow-hidden relative`} dir="rtl">
            {/* Decorative Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[50rem] h-[50rem] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
            </div>

            <header className={`${isDark ? 'bg-[#0d1117]/80 border-slate-800' : 'bg-white/80 border-slate-100'} border-b sticky top-0 z-40 backdrop-blur-2xl transition-all duration-500`}>
                <div className="max-w-[1200px] mx-auto px-8 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <button onClick={() => navigate('/student-dashboard')}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:shadow-xl'}`}>
                            <ChevronRight size={28} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-gradient flex items-center gap-4">
                                <FileText className="text-indigo-500" size={36} />
                                إنجازاتي ومهامي
                            </h1>
                            <p className={`text-base font-bold mt-1 ${muted}`}>تابع حالة مشاريعك وتقييمات المدربين ✨</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <Upload size={20} /> تسليم مشروع
                    </button>
                </div>
            </header>

            <main className="max-w-[1100px] mx-auto px-8 py-16 relative z-10">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        { label: 'إجمالي المشاريع', value: submissions.length, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                        { label: 'مشاريع مكتملة',  value: submissions.filter(s => s.status === 'APPROVED').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'إجمالي النقاط', value: submissions.reduce((acc, s) => acc + (s.xp || 0), 0), icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className={`${cardBg} rounded-[2.5rem] border-2 p-8 flex items-center gap-6 shadow-premium group hover:scale-[1.02] transition-all`}>
                            <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                <stat.icon size={32} />
                            </div>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest ${muted} mb-1`}>{stat.label}</p>
                                <h3 className={`text-3xl font-black ${textMain}`}>{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submissions List */}
                <div className={`${cardBg} rounded-[3.5rem] border-2 shadow-premium overflow-hidden animate-premium-in`}>
                    <div className="p-10 border-b border-slate-500/10 flex items-center justify-between bg-slate-500/5 backdrop-blur-xl">
                        <h2 className={`text-xl font-black ${textMain}`}>قائمة التسليمات</h2>
                    </div>
                    <div className="divide-y divide-slate-500/10">
                        {loading ? (
                            <div className="p-20 text-center animate-pulse">
                                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="font-bold text-slate-500">جاري تحميل مشاريعك...</p>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="p-20 text-center space-y-6">
                                <div className={`w-32 h-32 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto`}>
                                    <FileText size={64} className="text-slate-300" />
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-black ${textMain} mb-2`}>لا توجد تسليمات بعد</h3>
                                    <p className={`font-bold ${muted}`}>ابدأ دروسك وسلم مشاريعك لتظهر هنا!</p>
                                </div>
                                <button onClick={() => setShowUploadModal(true)} className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary/20">تسليم مشروع جديد</button>
                            </div>
                        ) : (
                            submissions.map((sub) => {
                                const statusInfo = getStatusStyles(sub.status);
                                const courseSlugMap: Record<string, string> = {
                                    'scratch': 'تطوير الألعاب بسكراتش', 'python': 'أساسيات البرمجة ببايثون', 'ai': 'ذكاء اصطناعي', 'web-dev': 'تطوير الويب', 'arduino': 'أردوينو'
                                };
                                return (
                                    <div key={sub.id} className="p-10 hover:bg-slate-500/5 transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-8">
                                                <div className={`w-20 h-20 rounded-[2rem] ${statusInfo.bg.split(' ')[0]} flex items-center justify-center border-2 ${statusInfo.bg.split(' ')[2]}`}>
                                                    <statusInfo.icon size={40} />
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <h3 className={`text-2xl font-black ${textMain}`}>الدرس {sub.lessonRefId}</h3>
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 ${statusInfo.bg}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                        {sub.submissionType && (
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                                                                {sub.submissionType === 'link' ? '🔗 رابط' : sub.submissionType === 'text' ? '📄 نص' : '📎 ملف'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-base font-bold ${muted} flex items-center gap-2`}>
                                                        الدورة: <span className={textMain}>{courseSlugMap[sub.courseSlug] || sub.courseSlug}</span>
                                                        <span className="opacity-20">•</span>
                                                        {new Date(sub.submittedAt).toLocaleDateString('ar-DZ')}
                                                    </p>
                                                    {/* File info */}
                                                    {sub.fileName && (
                                                        <p className={`text-sm ${muted} flex items-center gap-2`}>
                                                            <Paperclip size={14} /> {sub.fileName}
                                                            <span className="opacity-30">•</span>
                                                            {sub.fileSize ? `${(sub.fileSize / 1024).toFixed(1)} KB` : ''}
                                                        </p>
                                                    )}
                                                    {/* URL info */}
                                                    {sub.submissionUrl && (
                                                        <a href={sub.submissionUrl} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
                                                            <Link2 size={14} /> {sub.submissionUrl.length > 50 ? sub.submissionUrl.slice(0, 50) + '...' : sub.submissionUrl}
                                                        </a>
                                                    )}
                                                    {/* Text preview */}
                                                    {sub.submissionText && (
                                                        <button
                                                            onClick={() => setViewTextModal({ text: sub.submissionText, title: `نص التسليم — الدرس ${sub.lessonRefId}` })}
                                                            className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                                            <Code2 size={14} /> عرض الكود / النص المُرسل
                                                        </button>
                                                    )}
                                                    {/* Feedback */}
                                                    {sub.professorFeedback && (
                                                        <div className="mt-6 p-6 bg-slate-500/5 rounded-[2rem] border-2 border-slate-500/10 border-dashed max-w-2xl relative">
                                                            <MessageCircle className="absolute -top-3 -right-3 text-primary" size={24} />
                                                            <p className={`text-sm font-bold italic leading-relaxed ${textMain}`}>
                                                                "{sub.professorFeedback}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right space-y-4 flex-shrink-0">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-3xl font-black ${sub.xp > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>+{sub.xp || 0}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نقطة XP</span>
                                                </div>
                                                {/* Download button */}
                                                {sub.fileUrl && (
                                                    <a href={`${API_BASE}${sub.fileUrl}`} target="_blank" rel="noreferrer"
                                                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                                        تحميل الملف <ExternalLink size={16} />
                                                    </a>
                                                )}
                                                {/* Open link button */}
                                                {sub.submissionUrl && !sub.fileUrl && (
                                                    <a href={sub.submissionUrl} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                                                        فتح الرابط <ExternalLink size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowUploadModal(false)}>
                    <div className={`w-full max-w-lg ${cardBg} rounded-[3rem] border-2 p-10 shadow-2xl relative animate-premium-in`}>
                        <button onClick={() => setShowUploadModal(false)} className={`absolute top-6 left-6 p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            <X size={24} />
                        </button>

                        <h3 className={`text-2xl font-black ${textMain} mb-2 flex items-center gap-3`}>
                            <Upload className="text-primary" /> تسليم مشروع جديد
                        </h3>
                        <p className={`${muted} text-sm mb-8`}>اختر طريقة التسليم المناسبة لك</p>

                        <div className="space-y-6">
                            {/* Course + Lesson */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className={`text-xs font-black ${muted} uppercase tracking-widest`}>الدورة</label>
                                    <select value={uploadCourseSlug} onChange={(e) => setUploadCourseSlug(e.target.value)}
                                        className={`w-full p-4 rounded-2xl border-2 font-bold text-sm outline-none focus:border-primary/50 ${inputBg}`}>
                                        {courseOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs font-black ${muted} uppercase tracking-widest`}>رقم الدرس</label>
                                    <input type="number" min="1" value={uploadLessonRef} onChange={(e) => setUploadLessonRef(e.target.value)}
                                        className={`w-full p-4 rounded-2xl border-2 font-bold text-sm outline-none focus:border-primary/50 ${inputBg}`} />
                                </div>
                            </div>

                            {/* Submission Type Tabs */}
                            <div className="space-y-2">
                                <label className={`text-xs font-black ${muted} uppercase tracking-widest`}>طريقة التسليم</label>
                                <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-500/10">
                                    <button onClick={() => setSubmissionTab('file')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${tabStyles('file')}`}>
                                        <Paperclip size={14} /> ملف
                                    </button>
                                    <button onClick={() => setSubmissionTab('link')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${tabStyles('link')}`}>
                                        <Link2 size={14} /> رابط
                                    </button>
                                    <button onClick={() => setSubmissionTab('text')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${tabStyles('text')}`}>
                                        <Code2 size={14} /> نص / كود
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            {submissionTab === 'file' && (
                                <div className="space-y-2">
                                    <div onClick={() => fileInputRef.current?.click()}
                                        className={`p-8 rounded-[2rem] border-2 border-dashed cursor-pointer transition-all hover:border-primary/50 text-center ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
                                        {uploadFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <Paperclip className="text-primary" size={20} />
                                                <span className={`font-bold text-sm ${textMain}`}>{uploadFile.name}</span>
                                                <span className={`text-xs ${muted}`}>({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-center gap-4 mb-3">
                                                    <Upload className={muted} size={28} />
                                                    <Image className={muted} size={28} />
                                                    <Video className={muted} size={28} />
                                                </div>
                                                <p className={`font-bold text-sm ${muted}`}>ملف، صورة، فيديو، أو كود</p>
                                                <p className={`text-xs ${muted} mt-1`}>.sb3 .py .png .jpg .mp4 .zip .txt .pdf</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file"
                                        accept=".sb3,.py,.zip,.rar,.pdf,.html,.css,.js,.ino,.txt,.png,.jpg,.jpeg,.gif,.mp4,.mov"
                                        className="hidden"
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                                </div>
                            )}

                            {submissionTab === 'link' && (
                                <div className="space-y-2">
                                    <label className={`text-xs font-black ${muted} uppercase tracking-widest`}>رابط المشروع (GitHub, YouTube, Replit...)</label>
                                    <input type="url" value={submissionUrl} onChange={(e) => setSubmissionUrl(e.target.value)}
                                        placeholder="https://github.com/username/project"
                                        className={`w-full p-4 rounded-2xl border-2 font-bold text-sm outline-none focus:border-primary/50 ${inputBg}`} />
                                </div>
                            )}

                            {submissionTab === 'text' && (
                                <div className="space-y-2">
                                    <label className={`text-xs font-black ${muted} uppercase tracking-widest`}>الكود أو النص (Python, JS, etc.)</label>
                                    <textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)}
                                        placeholder="print('Hello, World!')"
                                        className={`w-full p-4 rounded-2xl border-2 font-bold text-sm outline-none focus:border-primary/50 resize-none h-40 font-mono ${inputBg}`} />
                                </div>
                            )}

                            {/* Notes */}
                            <div className="space-y-2">
                                <label className={`text-xs font-black ${muted} uppercase tracking-widest`}>ملاحظات (اختياري)</label>
                                <textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)}
                                    placeholder="اكتب ملاحظاتك هنا..."
                                    className={`w-full p-4 rounded-2xl border-2 font-bold text-sm outline-none focus:border-primary/50 resize-none h-20 ${inputBg}`} />
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={uploading || (submissionTab === 'file' && !uploadFile) || (submissionTab === 'link' && !submissionUrl.trim()) || (submissionTab === 'text' && !submissionText.trim())}
                                className="w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Send size={22} /> إرسال المشروع</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Text Modal */}
            {viewTextModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setViewTextModal(null)}>
                    <div className={`w-full max-w-2xl ${cardBg} rounded-[2rem] border-2 p-8 shadow-2xl relative animate-premium-in`}>
                        <button onClick={() => setViewTextModal(null)} className={`absolute top-4 left-4 p-2 rounded-full ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            <X size={20} />
                        </button>
                        <h3 className={`text-lg font-black ${textMain} mb-4`}>{viewTextModal.title}</h3>
                        <pre className={`p-6 rounded-2xl text-sm font-mono overflow-auto max-h-96 ${isDark ? 'bg-slate-900 text-emerald-400' : 'bg-slate-50 text-slate-800'} border-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            {viewTextModal.text}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
