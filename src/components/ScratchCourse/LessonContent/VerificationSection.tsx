import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';
import type { Lesson, VerificationResult } from '../../../types';

interface props {
    lesson: Lesson;
    onVerified: (result: VerificationResult) => void;
    isCompleted: boolean;
}

const VerificationSection: React.FC<props> = ({ lesson, onVerified, isCompleted }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleVerification = () => {
        setIsVerifying(true);
        // Simulate smart verification logic of the Scratch project
        setTimeout(() => {
            setIsVerifying(false);
            onVerified({
                isCorrect: true,
                criteria: [
                    { id: '1', text: 'استخدام الكتل الصحيحة', met: true },
                    { id: '2', text: 'تنفيذ التحدي المطلوب', met: true }
                ],
                feedback: 'عمل رائع! لقد أتممت الدرس بنجاح واستخدمت الكتل بشكل مثالي.',
                reward: lesson.xp
            });
            setIsOpen(false);
        }, 2000);
    };

    if (isCompleted) {
        return (
            <div className="bg-emerald-50 rounded-3xl p-6 mb-8 border border-emerald-200 shadow-sm flex items-center justify-between" dir="rtl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="text-emerald-600 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-900 text-lg">الدرس مكتمل!</h3>
                        <p className="text-emerald-700 font-medium">تم التحقق من الكود وحصلت على {lesson.xp} XP</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl mb-8 border border-slate-200 overflow-hidden shadow-sm" dir="rtl">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <ShieldCheck className="text-indigo-600 w-6 h-6" />
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-slate-800 text-lg">التحقق التلقائي الذكي</h3>
                        <p className="text-slate-500 font-medium text-sm">يقوم الذكاء الاصطناعي بفحص كود سكراتش الخاص بك للتأكد من صحته</p>
                    </div>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <p className="text-slate-600 mb-6 font-medium text-right leading-relaxed">
                        تأكد من تطبيق جميع خطوات التحدي في <a href="#lab-section" className="text-indigo-600 font-bold hover:underline">المختبر التفاعلي</a>.
                        عند الانتهاء، اضغط على زر التحقق وسنقوم بقراءة مساحة العمل الخاصة بك تلقائياً.
                    </p>
                    <button
                        onClick={handleVerification}
                        disabled={isVerifying}
                        className={`w-full py-4 rounded-2xl font-black text-lg text-white transition-all flex items-center justify-center gap-3 relative overflow-hidden ${isVerifying ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:-translate-y-1'
                            }`}
                    >
                        {isVerifying ? (
                            <>
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                جاري تحليل الكود...
                            </>
                        ) : (
                            <>
                                تحقق من الكود 🚀
                            </>
                        )}
                        {/* Shine effect */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VerificationSection;
