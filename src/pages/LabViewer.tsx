import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, Maximize2, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { useState } from 'react';

const labMappings: Record<string, { title: string; url: string; fallbackUrl?: string }> = {
    'scratch-lab': {
        title: 'Scratch 3.0 Lab (PictoBlox)',
        url: 'https://pictoblox.ai/',
    },
    'python-lab': {
        title: 'Python IDE',
        url: 'https://trinket.io/embed/python3',
    },
    'arduino-lab': {
        title: 'Arduino Simulator (Wokwi)',
        url: 'https://wokwi.com/projects/new/arduino-uno',
    },
    '3d-lab': {
        title: '3D Design',
        url: 'https://www.blockscad3d.com/editor/',
        fallbackUrl: 'https://app.tinkercad.com/'
    },
    'mobile-lab': {
        title: 'App Inventor',
        url: 'https://ai2.appinventor.mit.edu/',
    },
    'ai-lab': {
        title: 'AI Lab (PictoBlox)',
        url: 'https://ide.pictoblox.ai/',
    }
};

// Labs known to block iframes via X-Frame-Options — show launch screen instead
const BLOCKED_LABS = ['mobile-lab'];

export default function LabViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const lab = labMappings[id || ''] || labMappings['scratch-lab'];
    const isBlocked = BLOCKED_LABS.includes(id || '');

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const bg = isDark ? 'bg-[#0f1117] text-slate-100' : 'bg-slate-50 text-slate-900';
    const headerBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

    const labIcons: Record<string, string> = {
        'scratch-lab': '🎮',
        'python-lab': '🐍',
        'arduino-lab': '🔌',
        '3d-lab': '🧊',
        'mobile-lab': '📱',
        'ai-lab': '🤖',
    };
    const labIcon = labIcons[id || ''] || '🧪';

    return (
        <div className={`flex flex-col h-screen w-screen ${bg} overflow-hidden`} dir="rtl">
            {/* Header Toolbar */}
            {!isFullscreen && (
                <div className={`flex items-center justify-between px-6 py-3 border-b ${headerBg} shadow-sm z-10 shrink-0`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/student-dashboard')}
                            className={`p-2 rounded-xl transition-colors flex items-center gap-2 ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            <ArrowRight size={20} />
                            <span className="font-bold text-sm hidden sm:inline">العودة للوحة القيادة</span>
                        </button>
                        <div className="h-6 w-px bg-slate-500/30"></div>
                        <h1 className="font-black text-lg flex items-center gap-2">
                            <span className="text-indigo-500">{labIcon}</span>
                            {lab.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={lab.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs font-bold ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                            title="فتح في نافذة جديدة"
                        >
                            <ExternalLink size={18} />
                            <span className="hidden sm:inline">فتح خارجي</span>
                        </a>
                        {!isBlocked && (
                            <button
                                onClick={toggleFullscreen}
                                className={`p-2 rounded-xl transition-colors flex items-center justify-center ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                                title="ملء الشاشة"
                            >
                                <Maximize2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* BLOCKED LAB: Premium launch screen */}
            {isBlocked ? (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className={`w-full max-w-lg rounded-[2.5rem] p-8 flex flex-col items-center gap-6 text-center shadow-2xl border ${
                        isDark ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-100'
                    }`}>
                        {/* Icon */}
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 text-5xl">
                            {labIcon}
                        </div>

                        {/* Title */}
                        <div>
                            <h2 className="font-black text-2xl mb-2">{lab.title}</h2>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                هذا المختبر يفتح في نافذة مستقلة للحصول على أفضل تجربة
                            </p>
                        </div>

                        {/* Info box */}
                        <div className={`w-full p-4 rounded-2xl text-right flex gap-3 items-start ${
                            isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-100'
                        }`}>
                            <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-black text-amber-500 text-xs mb-1">لماذا لا يفتح هنا؟</div>
                                <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    MIT App Inventor يمنع العرض داخل المواقع الأخرى لأسباب أمنية. انقر الزر أدناه لفتحه في تبويب جديد.
                                </p>
                            </div>
                        </div>

                        {/* Cody Tip */}
                        <div className={`w-full p-4 rounded-2xl text-right flex gap-3 items-start ${
                            isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'
                        }`}>
                            <Sparkles size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-black text-indigo-500 text-xs mb-1">نصيحة Cody 💡</div>
                                <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    لربط تطبيقك بموقع سديم، استخدم مكون <strong>WebViewer</strong> داخل App Inventor وضع رابط الموقع فيه!
                                </p>
                            </div>
                        </div>

                        {/* Launch button */}
                        <a
                            href={lab.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-base text-center transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <ExternalLink size={20} />
                            فتح MIT App Inventor 🚀
                        </a>

                        <button
                            onClick={() => navigate('/student-dashboard')}
                            className={`text-sm font-bold ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                        >
                            العودة للوحة القيادة
                        </button>
                    </div>
                </div>
            ) : (
                /* NORMAL LAB: iframe */
                <div className="flex-1 w-full h-full relative bg-white dark:bg-black">
                    {/* Loader — hidden once iframe loads */}
                    {!iframeLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center animate-pulse pointer-events-none z-10">
                            <div className="text-center">
                                <div className="text-4xl mb-4">{labIcon}</div>
                                <div className="font-bold text-slate-500">جاري تحميل المختبر...</div>
                            </div>
                        </div>
                    )}
                    <iframe
                        src={lab.url}
                        className="w-full h-full border-none relative z-0"
                        title={lab.title}
                        allow="camera; microphone; fullscreen; display-capture; autoplay; serial; usb"
                        allowFullScreen
                        onLoad={() => setIframeLoaded(true)}
                    ></iframe>
                </div>
            )}

            {/* Floating exit fullscreen button */}
            {isFullscreen && (
                <button
                    onClick={toggleFullscreen}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-110 border border-slate-700 transition"
                    title="الخروج من وضع ملء الشاشة"
                >
                    <Maximize2 size={24} />
                </button>
            )}
        </div>
    );
}
