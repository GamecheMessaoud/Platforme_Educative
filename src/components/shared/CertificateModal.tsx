import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { X, Download, Award, ShieldCheck, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    courseName: string;
    completedAt: string;
}

export default function CertificateModal({ isOpen, onClose, studentName, courseName, completedAt }: CertificateModalProps) {
    const certRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const { isDark } = useTheme();

    if (!isOpen) return null;

    const handleDownload = async () => {
        if (!certRef.current) return;
        setDownloading(true);

        try {
            const canvas = await html2canvas(certRef.current, {
                scale: 3, // High quality
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            // A4 landscape dimensions: 297 x 210 mm
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`شهادة-${courseName}-${studentName}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className={`relative w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
                        <Award className="text-yellow-500" /> معاينة شهادة الإتمام
                    </h3>
                    <div className="flex gap-4">
                        <button 
                            onClick={handleDownload}
                            disabled={downloading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {downloading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Download size={18} />
                            )}
                            {downloading ? 'جاري التحميل...' : 'تنزيل PDF'}
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Certificate Preview Container */}
                <div className="p-8 bg-slate-800/50 overflow-auto flex justify-center items-center h-[70vh]">
                    {/* CERTIFICATE DOM ELEMENT (What gets converted to PDF) */}
                    <div 
                        ref={certRef}
                        className="relative w-[1122px] h-[793px] bg-white text-slate-900 shrink-0 overflow-hidden shadow-2xl"
                        style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }} // Ensure Arabic fonts load well
                    >
                        {/* Beautiful Background Border / Patterns */}
                        <div className="absolute inset-0 border-[16px] border-indigo-900 m-8 rounded-sm pointer-events-none" />
                        <div className="absolute inset-0 border-[2px] border-amber-500 m-10 rounded-sm pointer-events-none" />
                        
                        {/* Corner Ornaments */}
                        <div className="absolute top-12 right-12 text-indigo-900/10"><ShieldCheck size={120} /></div>
                        <div className="absolute bottom-12 left-12 text-indigo-900/10"><Zap size={120} /></div>

                        {/* Content Wrapper */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-20 pt-28 text-center text-slate-900">
                            
                            {/* Logo Area */}
                            <div className="text-4xl font-black text-indigo-900 mb-6 flex items-center justify-center gap-4">
                                <span className="bg-indigo-600 text-white px-4 py-2 rounded-2xl transform -rotate-3">Sadeem</span>
                                <span className="text-amber-500">سديم</span>
                            </div>

                            <div className="text-2xl font-bold tracking-[0.5em] text-slate-400 uppercase mb-8">
                                CERTIFICATE OF COMPLETION
                            </div>

                            <h1 className="text-5xl font-black text-indigo-950 mb-10 decoration-amber-500 underline underline-offset-8">
                                شهادة إتمام دورة
                            </h1>

                            <p className="text-xl text-slate-500 mb-4 font-bold">تشهد أكاديمية سديم بأن الطالب/ـة</p>
                            
                            <h2 className="text-6xl font-black text-amber-500 mb-8 pb-4 border-b-2 border-slate-200 w-3/4 max-w-2xl px-12">
                                {studentName}
                            </h2>

                            <p className="text-xl text-slate-500 mb-4 font-bold">قد أتم/أتمت بنجاح وتفوق متطلبات مسار الدورة التدريبية:</p>

                            <h3 className="text-4xl font-black text-indigo-800 mb-12">
                                &laquo; {courseName} &raquo;
                            </h3>

                            {/* Signatures & Date Footer */}
                            <div className="w-full flex justify-between items-end px-24 mt-auto">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-indigo-900 signature-font mb-2">Sadeem Team</div>
                                    <div className="border-t-2 border-slate-300 pt-2 text-slate-500 font-bold uppercase text-sm">
                                        إدارة الأكاديمية
                                    </div>
                                </div>
                                <div className="flex flex-col items-center mb-6">
                                    <Award size={80} className="text-amber-500 dropping-shadow-md mb-2" />
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-slate-800 mb-2">{completedAt}</div>
                                    <div className="border-t-2 border-slate-300 pt-2 text-slate-500 font-bold uppercase text-sm">
                                        تاريخ الإصدار
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
