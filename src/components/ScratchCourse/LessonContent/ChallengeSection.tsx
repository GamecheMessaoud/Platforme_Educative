import React, { useState } from 'react';
import { Target, HelpCircle } from 'lucide-react';

interface props {
    challenge: string;
    hints?: string[];
}

const ChallengeSection: React.FC<props> = ({ challenge, hints }) => {
    const [showHints, setShowHints] = useState(false);

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 mb-8 border border-amber-200 shadow-sm relative overflow-hidden" dir="rtl">
            <div className="absolute -top-10 -right-10 text-amber-500/10 text-9xl">🏆</div>

            <div className="relative z-10 text-right">
                <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center justify-start gap-2">
                    <Target className="text-amber-600" /> التحدي
                </h3>

                <p className="text-lg text-amber-800 font-bold mb-6 bg-white/50 p-6 rounded-2xl border border-amber-100">
                    {challenge}
                </p>

                {hints && hints.length > 0 && (
                    <div className="mt-6 flex justify-start">
                        <button
                            onClick={() => setShowHints(!showHints)}
                            className="flex items-center gap-2 text-amber-700 font-bold hover:bg-amber-200/50 px-4 py-2 rounded-xl transition-colors"
                        >
                            <HelpCircle size={20} />
                            {showHints ? 'إخفاء التلميحات' : 'إظهار التلميحات'}
                        </button>
                    </div>
                )}

                {showHints && hints && (
                    <div className="mt-4 space-y-2 animate-fade-in text-right">
                        {hints.map((hint, index) => (
                            <div key={index} className="bg-orange-100/50 p-4 rounded-xl border border-orange-200 text-amber-900 flex items-start gap-3">
                                <span className="font-black text-amber-500">{index + 1}.</span>
                                <span className="font-medium">{hint}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengeSection;
