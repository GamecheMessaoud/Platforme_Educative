import React, { useState } from 'react';
import { CheckCircle2, Circle, HelpCircle, Trophy } from 'lucide-react';

interface QCMItem {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface props {
    qcmData: QCMItem[] | any;
}

const QcmSection: React.FC<props> = ({ qcmData }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);

    // Normalize data (backend sends it as Json, might be string or object)
    let questions: QCMItem[] = [];
    try {
        questions = Array.isArray(qcmData) ? qcmData : JSON.parse(qcmData || '[]');
    } catch (e) {
        console.error('Error parsing QCM data', e);
    }

    if (questions.length === 0) return null;

    const handleSelect = (qIdx: number, oIdx: number) => {
        if (submitted) return;
        setAnswers({ ...answers, [qIdx]: oIdx });
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) score++;
        });
        return score;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center">
                    <HelpCircle className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black dark:text-white">اختبر معلوماتك</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">أجب على الأسئلة التالية لاختبار فهمك للدرس</p>
                </div>
            </div>

            <div className="space-y-10">
                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-sm text-slate-500 shrink-0">{qIdx + 1}</span>
                            <h4 className="font-bold text-lg dark:text-slate-200">{q.question}</h4>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 mr-11">
                            {q.options.map((option, oIdx) => {
                                const isSelected = answers[qIdx] === oIdx;
                                const isCorrect = q.correctAnswer === oIdx;
                                const showSuccess = submitted && isCorrect;
                                const showError = submitted && isSelected && !isCorrect;

                                return (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleSelect(qIdx, oIdx)}
                                        disabled={submitted}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-right transition-all font-bold text-sm
                                            ${showSuccess ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                                showError ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                                    isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' :
                                                        'bg-slate-50 border-slate-100 hover:border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-300'}
                                        `}
                                    >
                                        {showSuccess ? <CheckCircle2 size={18} /> :
                                            showError ? <Circle size={18} /> :
                                                isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {!submitted ? (
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={() => setSubmitted(true)}
                        disabled={Object.keys(answers).length < questions.length}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        تصحيح الإجابات
                    </button>
                </div>
            ) : (
                <div className="mt-12 p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-3xl border border-yellow-200 dark:border-yellow-900/30 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
                        <Trophy className="text-white" size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-yellow-800 dark:text-yellow-400 mb-2">تهانينا! لقد أكملت الاختبار</h3>
                    <p className="font-bold text-orange-700 dark:text-orange-300">لقد حصلت على {calculateScore()} من {questions.length} إجابات صحيحة</p>
                    <button
                        onClick={() => { setAnswers({}); setSubmitted(false); }}
                        className="mt-6 text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}
        </div>
    );
};

export default QcmSection;
