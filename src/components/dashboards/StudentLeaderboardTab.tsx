import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../lib/api';
import {
    Trophy, Crown,
    Medal as MedalIcon,
    Flame, Target
} from 'lucide-react';
import StatsHeader from './StatsHeader';

export default function StudentLeaderboardTab() {
    const { isDark } = useTheme();
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('all-time'); // 'weekly', 'monthly', 'all-time'

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const res = await api.get('/gamification/leaderboard');
            setPlayers(res.data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100 shadow-luxury';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="text-yellow-400" size={32} />;
            case 1: return <MedalIcon className="text-slate-300" size={28} />;
            case 2: return <MedalIcon className="text-orange-400" size={28} />;
            default: return null;
        }
    };

    const getPlayerBg = (index: number) => {
        if (index === 0) return isDark ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-yellow-50 border-yellow-200';
        if (index === 1) return isDark ? 'bg-slate-400/5 border-slate-400/20' : 'bg-slate-50 border-slate-200';
        if (index === 2) return isDark ? 'bg-orange-400/5 border-orange-400/20' : 'bg-orange-50 border-orange-200';
        return isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50';
    };

    return (
        <div className="space-y-12 animate-premium-in" dir="rtl">
            <StatsHeader />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gradient flex items-center gap-4">
                        <Trophy className="text-amber-500" size={36} />
                        أبطال المنصة
                    </h2>
                    <p className={`text-base font-bold mt-1 ${muted}`}>كُن من بين النخبة واستعرض مهاراتك أمام الجميع 🌟</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-500/10 p-1.5 rounded-2xl border border-slate-500/10 backdrop-blur-xl">
                    {['weekly', 'monthly', 'all-time'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all uppercase tracking-widest ${timeframe === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : `text-slate-500 hover:text-primary`}`}
                        >
                            {t === 'weekly' ? 'أسبوعي' : t === 'monthly' ? 'شهري' : 'الكل'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
                {players.length > 0 && [1, 0, 2].map((podiumIdx) => {
                    const p = players[podiumIdx];
                    if (!p) return <div key={podiumIdx} className="hidden md:block h-64" />;

                    return (
                        <div key={p.id} className={`relative flex flex-col items-center p-10 rounded-[3rem] border-2 shadow-2xl transition-all hover:scale-105 ${podiumIdx === 0 ? 'bg-gradient-to-br from-amber-400/10 to-orange-500/10 border-amber-400/30 md:h-[420px]' : 'bg-white/5 border-white/5 md:h-[360px]'} ${isDark ? '' : 'bg-white'}`}>
                            {podiumIdx === 0 && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce-slow">
                                    <Crown size={60} className="text-yellow-400 drop-shadow-glow" />
                                </div>
                            )}

                            <div className="relative mb-6">
                                <div className={`w-32 h-32 rounded-full border-4 shadow-2xl flex items-center justify-center text-5xl overflow-hidden ${podiumIdx === 0 ? 'border-amber-400' : podiumIdx === 1 ? 'border-slate-300' : 'border-orange-400'}`}>
                                    {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" /> : '👤'}
                                </div>
                                <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl ${podiumIdx === 0 ? 'bg-amber-400 text-amber-950' : podiumIdx === 1 ? 'bg-slate-300 text-slate-700' : 'bg-orange-400 text-white'}`}>
                                    {podiumIdx + 1}
                                </div>
                                <div className="absolute -top-2 -left-2">
                                    {getRankIcon(podiumIdx)}
                                </div>
                            </div>

                            <div className="text-center space-y-2 mb-8">
                                <h3 className={`text-2xl font-black ${textMain}`}>{p.name}</h3>
                                <div className="flex items-center gap-2 justify-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">Level {p.level}</span>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col items-center">
                                <div className={`text-4xl font-black ${podiumIdx === 0 ? 'text-amber-500' : 'text-primary'}`}>{p.xp.toLocaleString()}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">نقطة XP</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Rankings List */}
            {players.length > 3 && (
                <div className={`${cardBg} rounded-[3.5rem] border-2 shadow-premium overflow-hidden`}>
                    <div className="p-8 border-b border-slate-500/5 flex items-center justify-between bg-slate-500/5 backdrop-blur-xl">
                        <h2 className={`text-xl font-black ${textMain}`}>قائمة المتصدرين</h2>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
                            <span>المستوى</span>
                            <span className="w-24 text-center">النقاط</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-500/5">
                        {loading ? (
                            <div className="p-20 text-center animate-pulse">
                                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="font-bold text-slate-500">جاري تحميل الأبطال...</p>
                            </div>
                        ) : players.slice(3).map((player, idx) => (
                            <div key={player.id} className={`p-8 transition-all flex items-center group ${getPlayerBg(idx + 3)}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg mr-4 ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400'}`}>
                                    {idx + 4}
                                </div>

                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md mx-6 bg-white shrink-0">
                                    {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>}
                                </div>

                                <div className="flex-1">
                                    <h3 className={`font-black text-lg ${textMain} group-hover:text-primary transition-colors`}>{player.name}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500">
                                            <Flame size={12} className="fill-current" /> {player.streak || 0} يوم متواصل
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500">
                                            <Target size={12} /> {player.completedLessons || 0} درس مكتمل
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex items-center gap-12">
                                    <span className={`text-sm font-black w-16 text-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'} py-2 rounded-xl`}>{player.level}</span>
                                    <div className="w-24 text-center">
                                        <div className="text-xl font-black text-primary">{player.xp.toLocaleString()}</div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">XP</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && players.length === 0 && (
                <div className="p-20 text-center border-4 border-dashed rounded-[3rem] border-slate-500/10">
                    <p className={`text-xl font-black ${muted}`}>لا يوجد بيانات للمتصدرين حالياً.</p>
                </div>
            )}
        </div>
    );
}
