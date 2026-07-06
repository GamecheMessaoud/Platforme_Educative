import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    Star, Flame, Target, ChevronRight,
    Award, Zap, Calendar
} from 'lucide-react';
import api from '../../lib/api';

export default function Achievements() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    // Removed unused user
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/gamification/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const bg = isDark ? 'bg-[#0f1117] text-slate-100' : 'bg-slate-50 text-slate-900';
    const cardBg = isDark ? 'bg-slate-800 border-slate-700 shadow-xl' : 'bg-white border-slate-100 shadow-sm';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    const badges = stats?.earned_badges || [
        { id: '1', name: 'المبرمج الواعد', icon: '🚀', description: 'أكملت أول درس لك بنجاح!', date: '2024-03-01' },
        { id: '2', name: 'صديق كودي', icon: '🤖', description: 'تحدثت مع كودي لأول مرة.', date: '2024-03-05' },
        { id: '3', name: 'جامع النقاط', icon: '💰', description: 'جمعت أكثر من 500 نقطة XP.', date: '2024-03-10' },
    ];

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${bg}`}>
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bg} pb-20`} dir="rtl">
            {/* Header */}
            <header className={`${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} border-b sticky top-0 z-30 backdrop-blur-xl`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/student-dashboard')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ChevronRight size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">إنجازاتي</h1>
                            <p className={`text-xs font-bold ${muted}`}>تتبع تقدمك وحطم أرقامك القياسية!</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                {/* Level Progress */}
                <div className={`${cardBg} rounded-[2.5rem] p-8 border-2 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative flex flex-col md:flex-row items-center gap-10">
                        <div className="w-40 h-40 relative flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="80" cy="80" r="70" className={`${isDark ? 'stroke-slate-700' : 'stroke-slate-100'}`} strokeWidth="12" fill="transparent" />
                                <circle cx="80" cy="80" r="70" className="stroke-indigo-500" strokeWidth="12" fill="transparent"
                                    strokeDasharray={440} strokeDashoffset={440 - (440 * (stats?.total_xp % 1000 / 1000))} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-indigo-500">{stats?.current_level || 1}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-right">
                            <h2 className="text-3xl font-black mb-2">طريقك نحو الاحتراف 🏆</h2>
                            <p className={`${muted} font-medium text-lg mb-6`}>لقد حصلت على {stats?.total_xp || 0} نقطة XP حتى الآن. استمر في التألق!</p>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/10">
                                    <Flame className="text-orange-500 mx-auto mb-1" size={20} />
                                    <div className="font-black text-orange-600">7 يوم</div>
                                    <div className="text-[10px] font-bold text-orange-400">سلسلة النشاط</div>
                                </div>
                                <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/10">
                                    <Star className="text-indigo-500 mx-auto mb-1" size={20} />
                                    <div className="font-black text-indigo-600">Top 10</div>
                                    <div className="text-[10px] font-bold text-indigo-400">مرتبتك</div>
                                </div>
                                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/10">
                                    <Zap className="text-emerald-500 mx-auto mb-1" size={20} />
                                    <div className="font-black text-emerald-600">85%</div>
                                    <div className="text-[10px] font-bold text-emerald-400">دقة الحل</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Badges Section */}
                    <div className={`${cardBg} rounded-[2.5rem] p-8 border-2`}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <Award className="text-purple-500" /> أوسمتي والشارات
                            </h2>
                            <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">{badges.length} وسام</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {badges.map((badge: any) => (
                                <div key={badge.id} className={`${isDark ? 'bg-slate-900/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-white hover:shadow-md'} border ${isDark ? 'border-slate-700' : 'border-slate-100'} p-5 rounded-3xl transition-all group`}>
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{badge.icon}</div>
                                    <h3 className="font-black text-sm mb-1">{badge.name}</h3>
                                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{badge.description}</p>
                                    <div className="mt-3 text-[10px] font-bold text-slate-500 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-lg inline-block">{badge.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Missions Section */}
                    <div className={`${cardBg} rounded-[2.5rem] p-8 border-2`}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <Target className="text-emerald-500" /> المهام الحالية
                            </h2>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                <Calendar size={14} /> تحديات الأسبوع
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: 'مبدع سكراتش', desc: 'أضف 5 مشاريع إلى معرضك', progress: 60, reward: 200 },
                                { title: 'الطالب المجتهد', desc: 'أكمل 3 دروس في يوم واحد', progress: 33, reward: 150 },
                                { title: 'خبير البايثون', desc: 'استخدم حلقات التكرار 10 مرات', progress: 90, reward: 300 },
                            ].map((task, i) => (
                                <div key={i} className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/30 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-tight">{task.title}</h3>
                                            <p className="text-[11px] font-bold text-slate-400">{task.desc}</p>
                                        </div>
                                        <div className="bg-amber-100 text-amber-600 px-2 py-1 rounded-lg text-[10px] font-black">+{task.reward} XP</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black text-slate-500">
                                            <span>التقدم</span>
                                            <span>{task.progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${task.progress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
