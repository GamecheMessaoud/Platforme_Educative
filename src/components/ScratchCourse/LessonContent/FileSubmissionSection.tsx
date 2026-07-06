import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, FileText, FileArchive, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useFileSubmission } from '../../../hooks/useFileSubmission';
import type { FileSubmission } from '../../../types/submission';

interface props {
    lessonId: string;
}

const FileSubmissionSection: React.FC<props> = ({ lessonId }) => {
    const { user } = useAuthStore();
    const { uploadFile, getSubmissions, error } = useFileSubmission();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [submissions, setSubmissions] = useState<FileSubmission[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (user?.id) {
            loadSubmissions();
        }
    }, [lessonId, user?.id]);

    const loadSubmissions = async () => {
        if (!user?.id) return;
        try {
            const result = await getSubmissions(lessonId, user.id);
            setSubmissions(result);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !user?.id) return;

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('lessonRefId', lessonId.toString());
            formData.append('courseSlug', 'scratch');
            if (description) {
                formData.append('description', description);
            }

            await uploadFile(formData, user.id);
            setSuccessMsg('تم إرسال الملف بنجاح! سيتم مراجعته من قبل المعلم.');

            // Clear form
            setSelectedFile(null);
            setDescription('');
            if (fileInputRef.current) fileInputRef.current.value = '';

            // Reload list
            loadSubmissions();

            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusMap = {
        pending: { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-800 border-amber-200' },
        reviewing: { label: 'جاري المراجعة', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        approved: { label: 'موافق عليه ✅', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        rejected: { label: 'بحاجة لتعديل ❌', color: 'bg-red-100 text-red-800 border-red-200' }
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('sb3')) return <FileText className="text-amber-500" />;
        if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="text-red-500" />;
        return <File className="text-indigo-500" />;
    };

    return (
        <div className="bg-white rounded-3xl p-8 mb-8 border border-slate-200 shadow-sm font-sans" dir="rtl">

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                    <Upload size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800">تسليم المشروع النهائي</h3>
                    <p className="text-slate-500 font-medium">ارفع ملف مشروع السكراتش (.sb3) ليقيمه معلمك</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {successMsg && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 size={20} />
                    <span className="font-bold">{successMsg}</span>
                </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="mb-4">
                    <label className="block text-slate-700 font-bold mb-2">اختر ملف المشروع <span className="text-red-500">*</span></label>
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${selectedFile ? 'border-purple-400 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-100'
                        }`}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".sb3,.zip,.rar"
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
                            {selectedFile ? (
                                <>
                                    {getFileIcon(selectedFile.name)}
                                    <span className="font-bold text-slate-800">{selectedFile.name}</span>
                                    <span className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400">
                                        <Upload size={32} />
                                    </div>
                                    <span className="font-bold text-slate-600">اضغط لاختيار ملف أو اسحب الملف هنا</span>
                                    <span className="text-sm text-slate-400">الأنواع المقبولة: .sb3, .zip (الحد الأقصى 50MB)</span>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-slate-700 font-bold mb-2">ملاحظات للمعلم (اختياري)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-slate-700 resize-none h-24"
                        placeholder="اكتب أي ملاحظة أو رسالة للمعلم..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={!selectedFile || isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${!selectedFile || isSubmitting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-l from-purple-600 to-indigo-600 hover:shadow-lg hover:-translate-y-1'
                        }`}
                >
                    {isSubmitting ? 'جاري الرفع...' : 'تسليم المشروع 🚀'}
                </button>
            </form>

            {/* Submissions List */}
            {submissions.length > 0 && (
                <div>
                    <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 text-lg">التسليمات السابقة لهذا الدرس</h4>
                    <div className="space-y-4">
                        {submissions.map((sub) => (
                            <div key={sub.id} className="bg-white border text-right border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(sub.fileType)}
                                        <div>
                                            <h5 className="font-bold text-slate-800">{sub.fileName}</h5>
                                            <p className="text-xs text-slate-500">
                                                {sub.submittedAt.toLocaleDateString('ar-TN')} • {sub.submittedAt.toLocaleTimeString('ar-TN')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusMap[sub.status].color}`}>
                                        {statusMap[sub.status].label}
                                    </span>
                                </div>

                                {sub.description && (
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg mt-3 border border-slate-100">
                                        <span className="font-bold text-slate-500 block mb-1">رسالتك:</span>
                                        {sub.description}
                                    </p>
                                )}

                                {sub.professorFeedback && (
                                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                        <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2">
                                            <MessageSquare size={16} /> تقييم المعلم:
                                        </div>
                                        <p className="text-sm font-medium text-indigo-900 leading-relaxed">
                                            {sub.professorFeedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileSubmissionSection;
