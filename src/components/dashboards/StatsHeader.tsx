import React from 'react';
import { Flame, Trophy, Star, BookOpen, Crown, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useStudentStats } from '../../hooks/useStudentStats';

interface StatsHeaderProps {
    xp?: number;
    level?: number;
    streak?: number;
    rank?: number;
    completedLessons?: number;
    xpToNext?: number;
}

export default function StatsHeader(props: StatsHeaderProps) {
    const { isDark } = useTheme();
    const { stats: studentStats, loading } = useStudentStats();
    
    // Use props if provided, otherwise fallback to hook results
    const xp = props.xp ?? studentStats?.total_xp ?? 0;
    const level = props.level ?? studentStats?.current_level ?? 1;
    const streak = props.streak ?? studentStats?.current_streak ?? 0;
    const rank = props.rank ?? studentStats?.rank ?? 0;
    const completedLessons = props.completedLessons ?? studentStats?.completed_lessons_count ?? 0;
    const xpToNext = props.xpToNext ?? studentStats?.xp_to_next_level ?? 1000;

    const xpPercent = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 0;

    if (loading && !props.xp) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-pulse">
                <Loader2 size={32} className="animate-spin text-primary mb-4" />
                <p className="font-black text-slate-400">جاري تحميل إحصائياتك الأسطورية...</p>
            </div>
        );
    }
    
    const statsData = [
        { label: 'نقاط الإبداع', value: xp.toLocaleString(), icon: <Star className="text-yellow-400" />, color: 'from-primary to-indigo-600', unit: 'XP' },
        { label: 'الدروس المكتملة', value: String(completedLessons), icon: <BookOpen className="text-blue-400" />, color: 'from-blue-500 to-cyan-500', unit: 'درس' },
        { label: 'أيام التعلم', value: String(streak), icon: <Flame className="text-orange-500" />, color: 'from-orange-500 to-amber-500', unit: 'يوم' },
        { label: 'ترتيبك الحالي', value: rank ? `#${rank}` : '-', icon: <Trophy className="text-purple-400" />, color: 'from-violet-600 to-purple-600', unit: 'مركز' },
    ];

    return (
        <div className="space-y-8 animate-premium-in">
            {/* Main Progress Card */}
            <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-[3rem] p-8 text-white shadow-luxury relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border-2 border-white/30 animate-float">
                            🚀
                        </div>
                        <div>
                            <h2 className="text-3xl font-black mb-2">أنت تبلي بلاءً حسناً! 🌟</h2>
                            <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-1.5 rounded-full border border-white/20">
                                <Crown size={16} className="text-yellow-300" />
                                <span className="text-sm font-black tracking-wide">المستوى {level}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 max-w-md w-full">
                        <div className="flex justify-between text-[11px] font-black tracking-[0.2em] uppercase mb-3 text-white/80">
                            <span>التقدم للمستوى التالي</span>
                            <span>{xp.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
                        </div>
                        <div className="h-4 bg-black/20 rounded-full p-1 shadow-inner relative overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transition-all duration-1000 animate-shimmer relative"
                                style={{ width: `${xpPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-progress-stripes" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, idx) => (
                    <div key={idx} className={`bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700/50 shadow-premium hover:-translate-y-2 transition-all duration-300 group`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                {stat.icon}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.unit}</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                        <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
