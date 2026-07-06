import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface props {
    onPrevious: () => void;
    onNext: () => void;
    hasPrevious: boolean;
    hasNext: boolean;
    isNextDisabled: boolean;
}

const NavigationButtons: React.FC<props> = ({
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    isNextDisabled
}) => {
    return (
        <div className="flex items-center justify-between mt-12 mb-8" dir="rtl">
            {hasNext ? (
                <button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className={`flex flex-1 max-w-[200px] items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black transition-all ${isNextDisabled
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:-translate-y-1'
                        }`}
                >
                    الدرس التالي <ArrowLeft size={20} />
                </button>
            ) : (
                <div className="flex-1 max-w-[200px]" />
            )}

            {hasPrevious ? (
                <button
                    onClick={onPrevious}
                    className="flex flex-1 max-w-[200px] items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <ArrowRight size={20} /> السابق
                </button>
            ) : (
                <div className="flex-1 max-w-[200px]" />
            )}
        </div>
    );
};

export default NavigationButtons;
