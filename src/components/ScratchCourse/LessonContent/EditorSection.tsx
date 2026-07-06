import React from 'react';
import { Monitor } from 'lucide-react';

const EditorSection: React.FC = () => {
    return (
        <div className="mb-8" id="lab-section" dir="rtl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <Monitor size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800">المختبر التفاعلي</h3>
                    <p className="text-slate-500 font-medium">طبّق ما تعلمته مباشرة في بيئة سكراتش</p>
                </div>
            </div>

            <div className="bg-slate-100 rounded-3xl p-2 border-2 border-slate-200 h-[600px] overflow-hidden shadow-inner">
                {/* PictoBlox IFRAME for Scratch 3 environment */}
                <iframe
                    src="https://pictoblox.xyz/editor/"
                    className="w-full h-full rounded-2xl bg-white"
                    title="Scratch Editor"
                    allow="microphone; camera; usb"
                />
            </div>
        </div>
    );
};

export default EditorSection;
