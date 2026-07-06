import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

export default function FloatingChatbot() {
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();
    const { toggleDrawer, isOpen } = useChatStore();
    const [hovered, setHovered] = useState(false);

    if (!isAuthenticated || isOpen || location.pathname === '/ai-assistant') return null;

    return (
        <div className="fixed bottom-7 right-7 z-[9999] flex flex-col items-center gap-2">
            {/* Hover label */}
            {hovered && (
                <div
                    className="animate-msg-appear bg-slate-900/90 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-xl whitespace-nowrap backdrop-blur-sm"
                    style={{ direction: 'rtl' }}
                >
                    تحدث مع كودي 🤖
                </div>
            )}

            {/* Outer pulse rings */}
            <div className="relative">
                <span className="absolute inset-0 rounded-[1.25rem] bg-violet-500/30 animate-cody-pulse-ring" />
                <span className="absolute inset-0 rounded-[1.25rem] bg-teal-400/20 animate-cody-pulse-ring" style={{ animationDelay: '0.6s' }} />

                {/* Main button */}
                <button
                    id="cody-floating-btn"
                    onClick={(e) => { e.preventDefault(); toggleDrawer(); }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className="relative w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-teal-500 via-violet-600 to-violet-700 text-white shadow-2xl shadow-violet-500/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center overflow-hidden group"
                    title="تحدث مع كودي"
                    aria-label="فتح مساعد كودي"
                >
                    {/* Shimmer overlay */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />

                    {/* Mascot image */}
                    <img
                        src="/moscot.png"
                        alt="Cody"
                        className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 relative z-10"
                    />

                    {/* Online dot */}
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse shadow-sm" />

                    {/* Sparkle */}
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] opacity-70 group-hover:opacity-100 transition-opacity">✨</span>
                </button>
            </div>
        </div>
    );
}
