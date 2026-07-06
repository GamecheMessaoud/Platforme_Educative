import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../lib/api';
import { Trophy, Calendar, Users, ChevronLeft, Star, Layout, CheckCircle2, BarChart2 } from 'lucide-react';
import CompetitionLeaderboardModal from './CompetitionLeaderboardModal';

export default function StudentCompetitionsTab() {
    const { isDark } = useTheme();
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState<string | null>(null);
    const [leaderboardComp, setLeaderboardComp] = useState<{ id: string; title: string } | null>(null);

    useEffect(() => {
        const fetchCompetitions = async () => {
            try {
                const res = await api.get('/competitions');
                setCompetitions(res.data);
            } catch (error) {
                console.error('Error fetching competitions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompetitions();
    }, []);

    const handleJoin = async (id: string) => {
        setJoining(id);
        try {
            await api.post(`/competitions/${id}/join`);
            // Refresh local state to show as joined
            setCompetitions(prev => prev.map(c => c.id === id ? { ...c, isJoined: true, _count: { participants: (c._count?.participants || 0) + 1 } } : c));
        } catch (error: any) {
            alert(error.response?.data?.message || 'فشل الانضمام للمسابقة');
        } finally {
            setJoining(null);
        }
    };

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100 shadow-luxury';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className={`font-black ${muted}`}>جاري استكشاف التحديات القادمة...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-premium-in">
            {/* Header Hero */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-amber-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-5xl border-2 border-white/30 shadow-inner">
                        🏆
                    </div>
                    <div className="text-center md:text-right">
                        <h1 className="text-3xl font-black mb-2">المسابقات البرمجية</h1>
                        <p className="text-amber-100 font-bold max-w-xl">تحدَّ نفسك، نافس زملائك، واصعد نحو القمة في عالم البرمجة والإبداع! ✨</p>
                    </div>
                </div>
            </div>

            {/* Competitions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {competitions.map((comp) => {
                    const isUpcoming = comp.status === 'UPCOMING';
                    const isActive = comp.status === 'ACTIVE';
                    const isFinished = comp.status === 'FINISHED';

                    return (
                        <div key={comp.id} className={`${cardBg} border-2 rounded-[2.5rem] p-6 flex flex-col hover:-translate-y-2 transition-all duration-300 group`}>
                            <div className="relative h-48 rounded-[2rem] overflow-hidden mb-6">
                                <img src={comp.image_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                    alt={comp.title_ar}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg`}>
                                        {isActive ? '🔥 نشطة الآن' : isUpcoming ? '⏳ قادمة' : '🏁 انتهت'}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 right-4 left-4 flex justify-between items-center text-white">
                                    <div className="flex items-center gap-2 font-black text-sm">
                                        <Star size={16} className="text-amber-400" fill="currentColor" />
                                        +{comp.xp_reward} XP
                                    </div>
                                    <div className="flex items-center gap-2 font-black text-[10px] bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                                        <Users size={12} />
                                        {comp._count?.participants || 0} مشارك
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <h3 className={`text-xl font-black ${textMain} leading-tight`}>{comp.title_ar}</h3>
                                <p className={`text-sm font-bold ${muted} line-clamp-2`}>{comp.description_ar}</p>

                                <div className="flex items-center gap-4 py-2 border-y border-slate-500/10">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-primary" />
                                        <span className={`text-[10px] font-black ${muted}`}>تنتهي: {new Date(comp.end_date).toLocaleDateString('ar')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy size={14} className="text-amber-500" />
                                        <span className={`text-[10px] font-black ${muted}`}>تحدي أسبوعي</span>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2">
                                    {comp.isJoined ? (
                                        <>
                                            <div className="w-full bg-emerald-500/10 text-emerald-600 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-emerald-500/20 shadow-inner">
                                                <CheckCircle2 size={18} /> أنت مشارك بالفعل
                                            </div>
                                            <button
                                                onClick={() => setLeaderboardComp({ id: comp.id, title: comp.title_ar })}
                                                className="w-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-amber-500/20 transition-all"
                                            >
                                                <BarChart2 size={18} /> عرض الترتيب
                                            </button>
                                        </>
                                    ) : isFinished ? (
                                        <>
                                            <button disabled className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 py-3 rounded-2xl font-black text-sm cursor-not-allowed">
                                                انتهت المسابقة
                                            </button>
                                            <button
                                                onClick={() => setLeaderboardComp({ id: comp.id, title: comp.title_ar })}
                                                className="w-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-amber-500/20 transition-all"
                                            >
                                                <BarChart2 size={18} /> عرض النتائج النهائية
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(comp.id)}
                                            disabled={joining === comp.id}
                                            className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                        >
                                            {joining === comp.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>انضم للتحدي الآن <ChevronLeft size={18} /></>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {competitions.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-500/5 rounded-[3rem] border-2 border-dashed border-slate-500/20">
                        <Layout size={48} className="mx-auto mb-4 text-slate-400" />
                        <h3 className={`text-xl font-black ${textMain}`}>لا توجد مسابقات حالياً</h3>
                        <p className={`font-bold ${muted}`}>ترقبوا المسابقات قريباً! سيتم الإعلان عنها هنا. 🔔</p>
                    </div>
                )}
            </div>
        </div>
    );
}
