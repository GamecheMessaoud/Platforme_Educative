import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Menu, X, ChevronDown, BookOpen, Cpu,
    Globe, Rocket, Bell, LogOut, User,
    Zap, Layers, Code2, Moon, Sun, Sparkles, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';

const navLinks = [
    {
        label: 'المسارات',
        href: '/courses',
        icon: <BookOpen size={16} />,
        dropdown: [
            { label: 'Scratch 3.0', href: '/courses/scratch', icon: '🎨', desc: 'تعلم البرمجة بالمكعبات' },
            { label: 'Python للأبطال', href: '/courses/python', icon: '🐍', desc: 'لغة المحترفين بأسلوب ممتع' },
            { label: 'الروبوتات & Arduino', href: '/courses/arduino', icon: '🤖', desc: 'صنع أجهزة حقيقية' },
            { label: 'تطوير التطبيقات', href: '/courses/mobile', icon: '📱', desc: 'تطبيقات الجوال للصغار' },
            { label: 'الطباعة ثلاثية الأبعاد', href: '/courses/3d-printing', icon: '🖨️', desc: 'صنع أشياء من الهواء' },
        ]
    },
    { label: 'المختبر الافتراضي', href: '/labs', icon: <Cpu size={16} /> },
    { label: 'المتجر', href: '/store', icon: <Layers size={16} /> },
    { label: 'المجتمع', href: '/community', icon: <Globe size={16} /> },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, isAuthenticated, logout } = useAuthStore();
    const { isDark, toggleTheme } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
        setActiveDropdown(null);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? isDark
                        ? 'bg-slate-900/95 backdrop-blur-2xl shadow-lg shadow-slate-900/50 border-b border-slate-800'
                        : 'bg-white/95 backdrop-blur-2xl shadow-lg shadow-indigo-100/50 border-b border-indigo-100/50'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-screen-2xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo and Back Button */}
                        <div className="flex items-center gap-4">
                            {location.pathname !== '/' && (
                                <button 
                                    onClick={() => navigate(-1)} 
                                    className={`p-2.5 rounded-2xl transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                    title="رجوع"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            )}
                            <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-opacity">
                                <img src="/sadeem.png" alt="Sadeem Logo" className="h-12 w-auto object-contain drop-shadow-md" />
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-4">
                            {navLinks.map((link) => (
                                <div key={link.label} className="relative"
                                    onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    {link.dropdown ? (
                                        <button className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-200 ${isDark ? 'text-slate-300 hover:bg-slate-700/60 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'}`}>
                                            {link.icon}
                                            {link.label}
                                            <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                                        </button>
                                    ) : (
                                        <Link to={link.href!} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-200 ${isDark ? 'text-slate-300 hover:bg-slate-700/60 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'}`}>
                                            {link.icon}
                                            {link.label}
                                        </Link>
                                    )}

                                    {/* Dropdown */}
                                    {link.dropdown && activeDropdown === link.label && (
                                        <div className={`absolute top-full right-0 mt-2 w-72 ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-900/60' : 'bg-white border-indigo-50 shadow-indigo-100/60'} rounded-3xl shadow-2xl border p-3 z-50`}>
                                            {link.dropdown.map((item) => (
                                                <Link key={item.href} to={item.href}
                                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-colors group ${isDark ? 'hover:bg-slate-700' : 'hover:bg-indigo-50'}`}
                                                >
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <div>
                                                        <div className={`font-black group-hover:text-indigo-500 transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.label}</div>
                                                        <div className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.desc}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Auth Buttons */}
                        <div className="hidden lg:flex items-center gap-4">
                            {/* Dark mode toggle */}
                            <button onClick={toggleTheme} className={`p-2.5 rounded-2xl ${isDark ? 'bg-slate-700/60 text-yellow-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'} transition-all`}>
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowNotifications(!showNotifications)}
                                            className="relative p-2.5 rounded-2xl hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition"
                                        >
                                            <Bell size={20} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>
                                        
                                        {/* Notifications Dropdown */}
                                        {showNotifications && (
                                            <div className={`absolute top-full left-0 mt-3 w-80 max-h-[400px] overflow-y-auto ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-900/60' : 'bg-white border-indigo-50 shadow-indigo-100/60'} rounded-3xl shadow-2xl border flex flex-col z-50`}>
                                                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-inherit z-10">
                                                    <h3 className="font-black">الإشعارات</h3>
                                                    {unreadCount > 0 && (
                                                        <button 
                                                            onClick={() => markAllAsRead()} 
                                                            className="text-xs text-indigo-500 font-bold hover:text-indigo-700"
                                                        >
                                                            تحديد الكل كمقروء
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="divide-y p-2">
                                                    {notifications.length > 0 ? notifications.map((n) => (
                                                        <div 
                                                            key={n.id} 
                                                            onClick={() => {
                                                                if (!n.is_read) markAsRead(n.id);
                                                                if (n.link) navigate(n.link);
                                                                setShowNotifications(false);
                                                            }}
                                                            className={`p-3 rounded-2xl cursor-pointer transition-colors ${!n.is_read ? (isDark ? 'bg-indigo-900/20' : 'bg-indigo-50') : 'hover:bg-black/5'} flex gap-3 items-start`}
                                                        >
                                                            <div className="text-2xl mt-1">{n.icon || '🔔'}</div>
                                                            <div>
                                                                <div className={`font-bold text-sm ${!n.is_read ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{n.title_ar}</div>
                                                                <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.body_ar}</div>
                                                                <div className="text-[10px] text-slate-400 mt-2">{new Date(n.created_at).toLocaleDateString('ar-SA')}</div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="p-6 text-center text-slate-500 font-bold">لا توجد إشعارات جديدة</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center bg-indigo-50 pl-2 pr-1 py-1 rounded-2xl border border-indigo-100">
                                        <Link 
                                            to={user.role === 'STUDENT' ? '/student-dashboard' :
                                                user.role === 'TEACHER' ? '/teacher-dashboard' :
                                                user.role === 'PARENT' ? '/parent-dashboard' :
                                                user.role === 'ADMIN' ? '/admin-dashboard' : '/'} 
                                            className="flex items-center gap-3 px-3 py-1 hover:bg-indigo-100/50 rounded-xl transition-colors cursor-pointer group"
                                        >
                                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                                <User size={16} className="text-white" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-slate-800 group-hover:text-indigo-700 transition-colors">{user.full_name?.split(' ')[0] ?? user.first_name ?? ''}</div>
                                                <div className="text-[10px] text-indigo-500 font-bold flex items-center gap-1">
                                                    <Rocket size={9} /> {user.xp ?? 0} XP
                                                </div>
                                            </div>
                                        </Link>
                                        <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-400 transition ml-1" title="تسجيل الخروج">
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link to="/signin"
                                        className="px-6 py-2.5 text-slate-700 font-black text-sm rounded-2xl hover:bg-slate-100 transition duration-200"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link to="/signup"
                                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-300/40 hover:shadow-indigo-400/60 hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <Code2 size={15} />
                                        انضم مجاناً
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2.5 rounded-2xl hover:bg-indigo-50 text-slate-700 transition"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={`lg:hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-t shadow-2xl`}>
                        <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-2">
                            {navLinks.map((link) => (
                                <div key={link.label}>
                                    {link.dropdown ? (
                                        <div>
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === link.label ? null : link.label)}
                                                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-slate-700 font-black hover:bg-indigo-50 hover:text-indigo-700 transition"
                                            >
                                                <span className="flex items-center gap-2">{link.icon}{link.label}</span>
                                                <ChevronDown size={16} className={`transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                                            </button>
                                            {activeDropdown === link.label && (
                                                <div className="mr-4 mt-1 space-y-1">
                                                    {link.dropdown.map((item) => (
                                                        <Link key={item.href} to={item.href}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-indigo-50 text-slate-600 font-bold"
                                                        >
                                                            <span className="text-lg">{item.icon}</span> {item.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link to={link.href!}
                                            className="flex items-center gap-2 px-5 py-4 rounded-2xl text-slate-700 font-black hover:bg-indigo-50 hover:text-indigo-700 transition"
                                        >
                                            {link.icon} {link.label}
                                        </Link>
                                    )}
                                </div>
                            ))}

                            <div className="border-t border-slate-100 pt-4 space-y-3">
                                {isAuthenticated ? (
                                    <button onClick={handleLogout} className="w-full py-4 text-red-600 font-black rounded-2xl hover:bg-red-50 transition flex items-center justify-center gap-2">
                                        <LogOut size={18} /> تسجيل الخروج
                                    </button>
                                ) : (
                                    <>
                                        <Link to="/signin" className="block w-full text-center py-4 border-2 border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition">
                                            تسجيل الدخول
                                        </Link>
                                        <Link to="/signup" className="block w-full text-center py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-300/40 transition">
                                            انضم مجاناً 🚀
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
