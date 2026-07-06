import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Star, Crown, ChevronRight, Share2, Medal, Rocket, Flame, BookOpen, Clock, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/api';

export default function PublicProfile() {
    const { id } = useParams();
    const { isDark } = useTheme();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/gamification/profile/${id}`);
                setProfile(res.data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const bgGradient = isDark ? 'from-slate-900 via-indigo-950 to-slate-900' : 'from-slate-50 via-indigo-50 to-white';
    const cardBg = isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-100';
    const textMain = isDark ? 'text-white' : 'text-slate-900';
    const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

    if (loading) {
        return (
            <div className={`min-h-screen bg-gradient-to-b ${bgGradient} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-500/20" />
                    <p className={`font-black ${textMain}`}>جاري تحميل الملف الشخصي...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={`min-h-screen bg-gradient-to-b ${bgGradient} flex flex-col items-center justify-center`}>
                <div className="text-8xl mb-6">😕</div>
                <h2 className={`text-3xl font-black ${textMain} mb-4`}>الملف الشخصي غير موجود</h2>
                <Link to="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform">
                    العودة للصفحة الرئيسية
                </Link>
            </div>
        );
    }

    const levelMilestone = Math.ceil(profile.current_level / 5) * 5 || 5;

    return (
        <div className={`min-h-screen bg-gradient-to-b ${bgGradient} selection:bg-indigo-500/30`}>
            {/* Header/Nav Space */}
            <div className="h-20" />

            {/* Profile Hero Section */}
            <div className="relative pt-20 pb-40 overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-600/5 blur-3xl transform -skew-y-6 scale-150 origin-top-left" />
                <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                    <Link to="/leaderboard" className={`inline-flex items-center gap-2 mb-10 ${textMuted} hover:text-indigo-500 font-bold transition`}>
                        <ChevronRight size={20} /> العودة للمتصدرين
                    </Link>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                        {/* Avatar Badge */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-[40px] opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                            <div className="w-40 h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] shadow-premium relative flex items-center justify-center border-4 border-white dark:border-[#0d1117] rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-[2.5rem]" />
                                ) : (
                                    <span className="text-6xl text-white font-black drop-shadow-md">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                                {/* Level Badge */}
                                <div className="absolute -bottom-4 -right-4 bg-[#0d1117] p-1.5 rounded-2xl shadow-lg border-2 border-slate-700/50 animate-bounce">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1">
                                        <Crown size={12} /> LVL {profile.current_level}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="text-center md:text-right flex-1 pt-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h1 className={`text-4xl md:text-5xl font-black ${textMain} mb-2`}>{profile.name}</h1>
                                    <p className={`text-lg font-bold ${textMuted} flex items-center justify-center md:justify-start gap-2`}>
                                        <Trophy className="text-yellow-500" size={20} />
                                        مبتكر واعد في أكاديمية سديم
                                    </p>
                                </div>
                                <button className="px-6 py-3 bg-indigo-500/10 text-indigo-500 font-black rounded-2xl flex items-center gap-2 hover:bg-indigo-500 hover:text-white transition-all mx-auto md:mx-0">
                                    <Share2 size={18} /> مشاركة البروفايل
                                </button>
                            </div>

                            {/* Stat Pills */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
                                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${cardBg} shadow-sm border`}>
                                    <Star className="text-yellow-400" size={20} />
                                    <div>
                                        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">نقاط الـ XP</div>
                                        <div className={`font-black ${textMain}`}>{profile.total_xp.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${cardBg} shadow-sm border`}>
                                    <Medal className="text-indigo-400" size={20} />
                                    <div>
                                        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">الترتيب العالمي</div>
                                        <div className={`font-black ${textMain}`}>#{profile.rank || '—'}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${cardBg} shadow-sm border`}>
                                    <BookOpen className="text-emerald-400" size={20} />
                                    <div>
                                        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">دروس مكتملة</div>
                                        <div className={`font-black ${textMain}`}>{profile.completed_lessons_count}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-[1200px] mx-auto px-6 -mt-24 relative z-20 pb-32 space-y-12">
                
                {/* 1. Badges Wall */}
                <div className={`${cardBg} rounded-[3rem] p-10 border shadow-luxury-deep relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                    
                    <h3 className={`text-2xl font-black ${textMain} mb-8 flex items-center gap-3 relative z-10`}>
                        <Medal className="text-yellow-500" size={28} /> لوحة الشرف والشارات
                    </h3>
                    
                    {profile.badges.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 relative z-10">
                            {profile.badges.map((badge: any, i: number) => (
                                <div key={i} className={`flex flex-col items-center p-6 rounded-3xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'} border border-transparent hover:border-indigo-500/30 transition-all hover:-translate-y-2 group/badge`}>
                                    <img src={badge.icon_url || 'https://pub-2d7f3db6d45e41988ec6e27926727271.r2.dev/icons/badges/coder.png'} alt={badge.name} className="w-20 h-20 mb-4 drop-shadow-lg group-hover/badge:scale-110 group-hover/badge:rotate-12 transition-transform duration-500" />
                                    <h4 className={`text-sm font-black ${textMain} text-center`}>{badge.name}</h4>
                                    <span className="text-[10px] text-indigo-500 font-black mt-2 bg-indigo-500/10 px-3 py-1 rounded-full">{badge.description?.substring(0, 20)}..</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 relative z-10">
                            <Rocket size={48} className="mx-auto text-slate-700 mb-4 opacity-30" />
                            <p className="text-slate-500 font-bold">لم يكتسب أي شارات بعد. الرحلة في بدايتها!</p>
                        </div>
                    )}
                </div>

                {/* 2. Public Projects Gallery */}
                <div>
                    <h3 className={`text-2xl font-black ${textMain} mb-8 flex items-center gap-3 px-4`}>
                        <Activity className="text-emerald-500" size={28} /> إنجازات ومشاريع
                    </h3>
                    
                    {profile.projects && profile.projects.length > 0 ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {profile.projects.map((proj: any, i: number) => (
                                <Link to="/community" key={i} className={`block ${cardBg} p-6 rounded-[2.5rem] border shadow-sm hover:shadow-luxury hover:-translate-y-2 transition-all group`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${proj.type === 'PROJECT' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'} group-hover:scale-110 transition-transform`}>
                                            {proj.type === 'PROJECT' ? <Rocket size={20} /> : <BookOpen size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">{proj.type === 'PROJECT' ? 'مشروع مجتمعي' : 'سؤال ومناقشة'}</div>
                                            <div className={`text-xs font-bold ${textMuted} flex items-center gap-1`}><Clock size={12} /> {new Date(proj.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <h4 className={`text-lg font-black ${textMain} mb-3 group-hover:text-indigo-500 transition-colors line-clamp-2`}>{proj.title}</h4>
                                    <div className={`text-sm font-bold text-indigo-500 flex items-center gap-2 mt-4`}>
                                        عرض التفاصيل <ChevronRight size={16} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-20 ${cardBg} rounded-[3rem] border shadow-sm`}>
                            <p className="text-slate-500 font-bold">لم يقم بمشاركة أي مشاريع في مجتمع الأكاديمية بعد.</p>
                        </div>
                    )}
                </div>

            </div>
            {/* Replace with real footer if desired, or skip for now */}
        </div>
    );
}
