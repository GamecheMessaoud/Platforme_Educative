import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut, Menu, Moon, Sun, Settings,
    type LucideIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';

/* ═══════════════ ROLE COLOR CONFIGS ═══════════════ */
export type DashboardRole = 'student' | 'teacher' | 'admin';

interface RoleTheme {
    gradient: string;
    gradientFrom: string;
    gradientTo: string;
    accentText: string;
    accentBg: string;
    shadow: string;
    badgeBg: string;
    badgeText: string;
    portalLabel: string;
    portalEmoji: string;
    logoIcon: LucideIcon;
}

const roleThemes: Record<DashboardRole, RoleTheme> = {
    student: {
        gradient: 'from-indigo-500 to-violet-600',
        gradientFrom: 'from-indigo-600',
        gradientTo: 'to-violet-600',
        accentText: 'text-indigo-500',
        accentBg: 'bg-indigo-500',
        shadow: 'shadow-indigo-500/25',
        badgeBg: 'bg-indigo-500/10 border-indigo-500/20',
        badgeText: 'text-indigo-400',
        portalLabel: 'STUDENT CENTER',
        portalEmoji: '🎓',
        logoIcon: Settings, // placeholder, overridden in usage
    },
    teacher: {
        gradient: 'from-emerald-500 to-teal-600',
        gradientFrom: 'from-emerald-600',
        gradientTo: 'to-teal-600',
        accentText: 'text-emerald-500',
        accentBg: 'bg-emerald-500',
        shadow: 'shadow-emerald-500/25',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
        badgeText: 'text-emerald-400',
        portalLabel: 'TEACHER PORTAL',
        portalEmoji: '👨‍🏫',
        logoIcon: Settings,
    },
    admin: {
        gradient: 'from-amber-500 to-orange-600',
        gradientFrom: 'from-amber-600',
        gradientTo: 'to-orange-600',
        accentText: 'text-amber-500',
        accentBg: 'bg-amber-500',
        shadow: 'shadow-amber-500/25',
        badgeBg: 'bg-amber-500/10 border-amber-500/20',
        badgeText: 'text-amber-400',
        portalLabel: 'ADMIN PANEL',
        portalEmoji: '🛡️',
        logoIcon: Settings,
    },
};

/* ═══════════════ NAV ITEM TYPE ═══════════════ */
export interface DashNavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    href?: string;        // link-style nav — navigates to page
    onClick?: () => void; // tab-style nav — switches internal tab
    active?: boolean;
    special?: boolean;
}

/* ═══════════════ PROPS ═══════════════ */
interface DashboardLayoutProps {
    role: DashboardRole;
    navItems: DashNavItem[];
    activeTabId?: string;
    onTabChange?: (id: string) => void;
    headerTitle?: string;
    headerSubtitle?: string;
    headerExtra?: ReactNode;
    logoIcon?: LucideIcon;
    profileWidget?: ReactNode;
    children: ReactNode;
    loading?: boolean;
    contentClassName?: string;
    hideHeader?: boolean;
    sidebarOpen?: boolean;
    onSidebarToggle?: (open: boolean) => void;
}

/* ═══════════════ COMPONENT ═══════════════ */
export default function DashboardLayout({
    role,
    navItems,
    activeTabId,
    onTabChange,
    headerTitle,
    headerSubtitle,
    headerExtra,
    logoIcon: LogoIcon,
    profileWidget,
    children,
    loading,
    contentClassName,
    hideHeader,
    sidebarOpen,
    onSidebarToggle,
}: DashboardLayoutProps) {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
    const isSidebarOpen = sidebarOpen !== undefined ? sidebarOpen : internalSidebarOpen;
    const setSidebarOpen = onSidebarToggle !== undefined ? onSidebarToggle : setInternalSidebarOpen;

    const theme = roleThemes[role];

    const handleLogout = () => {
        logout();
        localStorage.clear();
        navigate('/signin');
    };

    // Styling tokens
    const bg = isDark
        ? 'bg-[#0d1117]'
        : `bg-gradient-to-br from-slate-50 via-${role === 'student' ? 'indigo' : role === 'teacher' ? 'emerald' : 'amber'}-50/30 to-slate-50`;
    const sidebarBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';

    return (
        <div className={`min-h-screen ${bg} flex transition-colors duration-300`} dir="rtl">
            {/* Overlay */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* ════ SIDEBAR ════ */}
            <aside className={`fixed lg:sticky top-0 right-0 h-screen ${sidebarBg} border-l w-80 flex flex-col transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                {/* Logo */}
                <div className={`p-6 border-b ${isDark ? 'border-[#30363d]' : 'border-slate-100'}`}>
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/sadeem.png" alt="Sadeem Logo" className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                        <div>
                            <div className={`font-black text-lg bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>سديم</div>
                            <div className={`text-[10px] ${muted} font-bold tracking-widest`}>{theme.portalLabel}</div>
                        </div>
                    </Link>
                </div>

                {/* Profile Widget (custom per dashboard) */}
                {profileWidget && <div className="p-4">{profileWidget}</div>}

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 overflow-y-auto">
                    <div className="space-y-1">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = item.active || (activeTabId && item.id === activeTabId) || (!activeTabId && item.href && location.pathname === item.href);

                            const handleClick = () => {
                                if (item.onClick) {
                                    item.onClick();
                                } else if (onTabChange) {
                                    onTabChange(item.id);
                                } else if (item.href) {
                                    navigate(item.href);
                                }
                                setSidebarOpen(false);
                            };

                            return (
                                <button key={item.id} onClick={handleClick}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${isActive
                                        ? `bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} text-white shadow-lg ${theme.shadow}`
                                        : item.special
                                            ? `${isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'} hover:shadow-lg`
                                            : `${isDark ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'}`
                                        }`}>
                                    <Icon size={20} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className={`p-4 border-t ${isDark ? 'border-[#30363d]' : 'border-slate-100'} space-y-2`}>
                    <div className="flex gap-2 mb-2">
                        <button
                            onClick={() => onTabChange ? onTabChange('settings') : navigate('/settings')}
                            className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'} font-bold text-sm transition-all`}
                        >
                            <Settings size={18} />الإعدادات
                        </button>
                        <button onClick={toggleTheme} className={`p-2.5 rounded-xl ${isDark ? 'text-yellow-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'} transition-all`}>
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-2xl font-bold text-sm transition-all border border-red-500/20">
                        <LogOut size={18} />تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* ════ MAIN ════ */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative">
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
                        <div className={`w-10 h-10 border-4 ${theme.accentText.replace('text-', 'border-')} border-t-transparent rounded-full animate-spin`} />
                    </div>
                )}

                {/* Header */}
                {!hideHeader && (
                    <header className={`${isDark ? 'bg-[#0d1117]/90 border-[#30363d]' : 'bg-white border-slate-200'} border-b p-4 sticky top-0 z-40 backdrop-blur-xl flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`lg:hidden p-2 ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg`}>
                                <Menu size={24} />
                            </button>
                            <div>
                                <h2 className={`text-xl font-black ${textMain}`}>
                                    {headerTitle || 'لوحة التحكم'}
                                </h2>
                                {headerSubtitle && <p className={`text-xs ${muted} font-medium`}>{headerSubtitle}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <GlobalSearch />
                            <NotificationBell />
                            {headerExtra}
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <div className={contentClassName || "p-8 lg:p-10 flex-1 space-y-10"}>
                    {children}
                </div>
            </main>
        </div>
    );
}
