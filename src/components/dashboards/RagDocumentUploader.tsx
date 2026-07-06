import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Loader2, Trash2, BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface UploadedDoc { name: string; status: 'success' | 'error'; message?: string; }

export default function RagDocumentUploader() {
    const { isDark } = useTheme();
    const [uploading, setUploading] = useState(false);
    const [docs, setDocs] = useState<UploadedDoc[]>([]);
    const [statsLoading, setStatsLoading] = useState(false);
    const [ragStats, setRagStats] = useState<any>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const RAG_BASE = 'http://localhost:8000';

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const results: UploadedDoc[] = [];

        for (const file of Array.from(files)) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const token = localStorage.getItem('sadeem_access_token');
                const res = await fetch(`http://localhost:5000/api/ai/rag/upload`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    results.push({ name: file.name, status: 'success', message: 'تم حفظه في قاعدة المعرفة ✅' });
                } else {
                    results.push({ name: file.name, status: 'error', message: 'فشل الرفع — تأكد من تشغيل RAG' });
                }
            } catch {
                results.push({ name: file.name, status: 'error', message: 'فشل الاتصال بالخادم الداخلي' });
            }
        }

        setDocs(prev => [...prev, ...results]);
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await fetch(`${RAG_BASE}/stats`);
            const data = await res.json();
            setRagStats(data);
        } catch {
            setRagStats({ error: 'RAG غير متصل على port 8000' });
        } finally {
            setStatsLoading(false);
        }
    };

    const clearAll = async () => {
        try {
            await fetch(`${RAG_BASE}/clear`, { method: 'DELETE' });
            setDocs([]);
            setRagStats(null);
        } catch { /* ignore */ }
    };

    const bg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
    const surface = isDark ? 'bg-slate-800' : 'bg-slate-50';

    return (
        <div className={`rounded-[2.5rem] border-2 p-8 space-y-8 ${bg}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <BookOpen size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black">قاعدة معرفة كودي (RAG)</h2>
                        <p className="text-xs font-bold text-slate-400">ارفع ملفات PDF/Docx لتغذية المساعد الذكي</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchStats} disabled={statsLoading}
                        className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 font-black text-xs hover:bg-indigo-500/20 transition flex items-center gap-2">
                        {statsLoading ? <Loader2 size={14} className="animate-spin" /> : '📊'} إحصائيات
                    </button>
                    <button onClick={clearAll}
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-black text-xs hover:bg-red-500/20 transition flex items-center gap-2">
                        <Trash2 size={14} /> مسح الكل
                    </button>
                </div>
            </div>

            {/* RAG Stats */}
            {ragStats && (
                <div className={`${surface} rounded-2xl p-4 text-xs font-mono`}>
                    {ragStats.error ? (
                        <span className="text-red-400">{ragStats.error}</span>
                    ) : (
                        <span className="text-emerald-400">
                            📦 المستندات في ChromaDB: <strong>{ragStats.document_count ?? ragStats.count ?? JSON.stringify(ragStats)}</strong>
                        </span>
                    )}
                </div>
            )}

            {/* Upload Zone */}
            <label className={`block border-2 border-dashed ${isDark ? 'border-slate-700 hover:border-emerald-500/50' : 'border-slate-200 hover:border-emerald-400'} rounded-2xl p-10 text-center cursor-pointer transition-all group`}>
                <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    onChange={handleFileUpload}
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={40} className="animate-spin text-emerald-500" />
                        <p className="font-black text-slate-400">جاري الرفع إلى قاعدة المعرفة...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 group-hover:scale-105 transition-transform">
                        <Upload size={40} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        <div>
                            <p className="font-black text-slate-500">اسحب الملفات هنا أو انقر للاختيار</p>
                            <p className="text-xs text-slate-400 mt-1">PDF ، DOCX ، TXT ، MD — حجم أقصى 50MB</p>
                        </div>
                    </div>
                )}
            </label>

            {/* Uploaded Docs List */}
            {docs.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">سجل الرفع</p>
                    {docs.map((doc, i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${surface}`}>
                            <FileText size={18} className="text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm truncate">{doc.name}</p>
                                <p className={`text-[11px] font-bold ${doc.status === 'success' ? 'text-emerald-500' : 'text-red-400'}`}>
                                    {doc.message}
                                </p>
                            </div>
                            {doc.status === 'success'
                                ? <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                                : <AlertCircle size={20} className="text-red-400 shrink-0" />
                            }
                        </div>
                    ))}
                </div>
            )}

            {/* Instruction */}
            <div className={`${surface} rounded-2xl p-5 text-xs font-bold text-slate-400 space-y-2 leading-relaxed`}>
                <p className="font-black text-slate-300">🚀 كيف يعمل؟</p>
                <p>1. ارفع ملفات PDF أو DOCX الخاصة بمناهجك.</p>
                <p>2. سيتم تقطيعها وتحويلها إلى vectors في ChromaDB.</p>
                <p>3. عندما يسأل طالب في وضع "خبير المسارات"، سيبحث كودي في هذه الملفات.</p>
                <p className="text-amber-400">⚠️ يجب تشغيل RAG_CHAT_BOT على port 8000 لعمل هذه الميزة.</p>
            </div>
        </div>
    );
}
