import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, FileArchive, File, Download, Filter, BookOpen, Link2, Code2, ExternalLink } from 'lucide-react';
import { getTeacherSubmissions, reviewSubmission } from '../../services/fileSubmissionService';
import { useTheme } from '../../context/ThemeContext';
import Notification from '../Notification';
import Loading from '../Loading';

interface SubmissionsTabProps {
    courses?: any[];
}

const SubmissionsTab: React.FC<SubmissionsTabProps> = ({ courses = [] }) => {
    const { isDark } = useTheme();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    // States for the review modal
    const [selectedSub, setSelectedSub] = useState<any | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadSubmissions();
    }, [filter, courseFilter]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const statusFilter = filter === 'all' ? undefined : filter;
            const data = await getTeacherSubmissions(courseFilter, statusFilter);
            setSubmissions(data);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تحميل التسليمات');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (status: 'approved' | 'rejected' | 'reviewing') => {
        if (!selectedSub) return;
        try {
            setIsSubmitting(true);
            await reviewSubmission(selectedSub.id, status, feedback);
            setNotification({ message: 'تم تحديث حالة التقييم بنجاح', type: 'success' });
            setSelectedSub(null);
            setFeedback('');
            loadSubmissions();
        } catch (err: any) {
            setNotification({ message: err.message || 'حدث خطأ أثناء التحديث', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && submissions.length === 0) return <Loading />;
    if (error) return <div className="text-red-500 font-bold p-8">{error}</div>;

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('sb3')) return <FileText className="text-amber-500 w-8 h-8" />;
        if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="text-red-500 w-8 h-8" />;
        return <File className="text-indigo-500 w-8 h-8" />;
    };

    const statusMap: any = {
        pending: { label: 'جديد', color: 'bg-amber-100 text-amber-800' },
        reviewing: { label: 'يُراجع', color: 'bg-blue-100 text-blue-800' },
        approved: { label: 'مقبول', color: 'bg-emerald-100 text-emerald-800' },
        rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800' }
    };

    const cardBg = isDark ? 'bg-[#1c2128] border-[#30363d]' : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header / Filters */}
            <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100/50 rounded-xl">
                        <CheckCircle2 className="text-emerald-600 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-black ${textMain}`}>إدارة التسليمات العامة</h2>
                        <p className={`text-sm ${muted} font-medium`}>راجع مشاريع طلابك في جميع المسارات</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Filter className={muted} size={18} />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={`text-sm font-bold border rounded-xl py-2 pl-8 pr-4 outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                    >
                        <option value="all">كل التسليمات</option>
                        <option value="pending">جديد (قيد الانتظار)</option>
                        <option value="reviewing">قيد المراجعة</option>
                        <option value="approved">مقبول</option>
                        <option value="rejected">مرفوض</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <BookOpen className={muted} size={18} />
                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className={`text-sm font-bold border rounded-xl py-2 pl-8 pr-4 outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                    >
                        <option value="all">كل التصنيفات</option>
                        <option value="scratch">سكراتش</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.category.slug}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {submissions.length === 0 ? (
                    <div className={`col-span-full p-12 text-center rounded-3xl border ${cardBg}`}>
                        <div className="text-5xl mb-4 opacity-50">📂</div>
                        <h3 className={`text-xl font-black ${textMain} mb-2`}>لا توجد تسليمات حالياً</h3>
                        <p className={muted}>يبدو أن الطلاب لم يقدموا أي مشاريع مطابقة لهذا الفلتر بعد.</p>
                    </div>
                ) : (
                    submissions.map(sub => (
                        <div key={sub.id} className={`p-6 rounded-3xl border ${cardBg} hover:shadow-lg transition-shadow`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xl text-emerald-600">
                                        {sub.student_name[0]}
                                    </div>
                                    <div>
                                        <h4 className={`font-black ${textMain}`}>{sub.student_name}</h4>
                                        <p className={`text-xs ${muted}`}>الدرس {sub.lessonRefId}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusMap[sub.status].color}`}>
                                    {statusMap[sub.status].label}
                                </span>
                            </div>

                            {/* Submission Content */}
                            <div className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-slate-50 border-slate-100'} border`}>
                                {/* File submission */}
                                {sub.fileUrl && sub.fileName && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(sub.fileType || '')}
                                            <div>
                                                <p className={`font-bold text-sm ${textMain} truncate max-w-[150px] sm:max-w-xs`}>{sub.fileName}</p>
                                                <p className={`text-xs ${muted}`}>{sub.fileSize ? `${(sub.fileSize / 1024 / 1024).toFixed(2)} MB` : ''} • {new Date(sub.submittedAt).toLocaleDateString('ar-DZ')}</p>
                                            </div>
                                        </div>
                                        <a href={`http://localhost:5000${sub.fileUrl}`} download target="_blank" rel="noreferrer"
                                            className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
                                            <Download size={20} />
                                        </a>
                                    </div>
                                )}
                                {/* Link submission */}
                                {sub.submissionUrl && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Link2 className="text-primary" size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm ${textMain}`}>رابط مشروع خارجي</p>
                                            <a href={sub.submissionUrl} target="_blank" rel="noreferrer"
                                                className="text-xs text-primary hover:underline truncate block max-w-[200px]">{sub.submissionUrl}</a>
                                        </div>
                                        <a href={sub.submissionUrl} target="_blank" rel="noreferrer"
                                            className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-primary hover:bg-primary/10 transition-colors">
                                            <ExternalLink size={18} />
                                        </a>
                                    </div>
                                )}
                                {/* Text / Code submission */}
                                {sub.submissionText && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Code2 className="text-indigo-500" size={16} />
                                            <span className={`text-xs font-bold ${muted}`}>كود / نص مُرسل</span>
                                        </div>
                                        <pre className={`text-xs font-mono p-3 rounded-xl overflow-auto max-h-32 ${isDark ? 'bg-slate-900 text-emerald-400' : 'bg-slate-100 text-slate-700'}`}>
                                            {sub.submissionText.slice(0, 300)}{sub.submissionText.length > 300 ? '...' : ''}
                                        </pre>
                                    </div>
                                )}
                                {/* Nothing at all */}
                                {!sub.fileUrl && !sub.submissionUrl && !sub.submissionText && (
                                    <p className={`text-sm ${muted} text-center py-2`}>لا يوجد محتوى مرفق</p>
                                )}
                            </div>

                            {sub.description && (
                                <p className={`text-sm mb-4 p-3 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-indigo-50/50 border-indigo-100 text-slate-600'}`}>
                                    <span className="font-bold opacity-70 ml-1">ملاحظة الطالب:</span> {sub.description}
                                </p>
                            )}

                            <button
                                onClick={() => setSelectedSub(sub)}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${sub.status === 'pending'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                                    : isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                            >
                                {sub.status === 'pending' ? 'تقييم المشروع' : 'تحديث التقييم'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Assessment Modal */}
            {selectedSub && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className={`w-full max-w-lg rounded-[2.5rem] p-8 border ${cardBg} shadow-2xl relative animate-fade-in`}>
                        <button
                            onClick={() => setSelectedSub(null)}
                            className={`absolute top-6 left-6 p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            ✕
                        </button>

                        <h3 className={`text-2xl font-black ${textMain} mb-2`}>تقييم المشروع</h3>
                        <p className={muted}>الطالب: <span className={`font-bold ${textMain}`}>{selectedSub.student_name}</span></p>

                        <div className="mt-8 mb-6">
                            <label className={`block font-bold mb-3 ${textMain}`}>ملاحظات التقييم</label>
                            <textarea
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="اكتب ملاحظاتك للطالب هنا..."
                                className={`w-full p-4 rounded-2xl border resize-none h-32 focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'
                                    }`}
                            />
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => handleReviewSubmit('approved')}
                                disabled={isSubmitting}
                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 size={20} /> الموافقة (مقبول)
                            </button>
                            <button
                                onClick={() => handleReviewSubmit('rejected')}
                                disabled={isSubmitting}
                                className="flex-1 py-4 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-500/20 dark:hover:bg-red-500/30 dark:text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
                            >
                                <XCircle size={20} /> طلب تعديل (مرفوض)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notification && (
                <div className="fixed bottom-6 right-6 z-[110]">
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default SubmissionsTab;
