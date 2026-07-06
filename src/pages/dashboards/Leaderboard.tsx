import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import {
    TrendingUp, Star, Award, ChevronRight,
    Crown, Zap, Users, Search, Trophy, Loader2
} from 'lucide-react';
import api from '../../lib/api';

export default function Leaderboard() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { user: currentUser } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/gamification/leaderboard');
                // Calculate isMe for the frontend UI
                const formatted = res.data.map((player: any) => ({
                    ...player,
                    isMe: currentUser?.id && player.userId === currentUser.id
                }));
                setLeaderboard(formatted);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
                setLeaderboard([]); // Don't use mock data on failure
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [currentUser]);

    const bg = isDark ? 'bg-[#0d1117] text-slate-100' : 'bg-slate-50 text-slate-900';
    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100 shadow-luxury';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';

    const topThree = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className={`min-h-screen ${bg} pb-32 overflow-hidden relative`} dir="rtl">
            {/* Decorative Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[50rem] h-[50rem] bg-amber-500/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
            </div>

            <header className={`${isDark ? 'bg-[#0d1117]/80 border-slate-800' : 'bg-white/80 border-slate-100'} border-b sticky top-0 z-40 backdrop-blur-2xl transition-all duration-500`}>
                <div className="max-w-[1200px] mx-auto px-8 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <button onClick={() => navigate('/student-dashboard')}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:shadow-xl'}`}>
                            <ChevronRight size={28} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-gradient flex items-center gap-4">
                                <TrendingUp className="text-amber-500 animate-bounce-slow" size={36} />
                                أبطال المستقبل
                            </h1>
                            <p className={`text-base font-bold mt-1 ${muted}`}>لوحة الشرف لأذكى المبدعين في سديم ✨</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1000px] mx-auto px-8 py-16 relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6 animate-premium-in">
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center relative">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <div className="absolute inset-0 bg-primary/20 rounded-[2rem] animate-ping" />
                        </div>
                        <p className={`text-2xl font-black ${muted} animate-pulse`}>جاري استدعاء الأبطال...</p>
                    </div>
                ) : (
                    <>
                        {/* Podium Section */}
                        <div className="flex items-end justify-center gap-6 md:gap-12 mb-24 pt-20">
                            {/* Rank 2 */}
                            {topThree[1] && (
                                <div className="flex flex-col items-center group animate-premium-in" style={{ animationDelay: '0.1s' }}>
                                    <div className="relative mb-8 group-hover:-translate-y-4 transition-transform duration-500">
                                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 rounded-[2.5rem] p-1 shadow-2xl rotate-[-5deg] group-hover:rotate-0 transition-all">
                                            <div className="w-full h-full bg-slate-900 rounded-[2.4rem] overflow-hidden flex items-center justify-center border-4 border-slate-300/30">
                                                {topThree[1].avatar ? <img src={topThree[1].avatar} className="w-full h-full object-cover" /> : <span className="text-5xl">👤</span>}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-xl border-4 border-white dark:border-slate-800 text-xl">2</div>
                                    </div>
                                    <div className="text-center mb-6">
                                        <div className={`font-black text-lg mb-1 ${textMain}`}>{topThree[1].name}</div>
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{topThree[1].xp.toLocaleString()} XP</div>
                                    </div>
                                    <div className="w-32 h-40 bg-gradient-to-t from-slate-500/20 to-slate-500/5 rounded-t-[3rem] border-t-4 border-slate-400/20 backdrop-blur-sm shadow-inner" />
                                </div>
                            )}

                            {/* Rank 1 */}
                            {topThree[0] && (
                                <div className="flex flex-col items-center group animate-premium-in">
                                    <div className="relative mb-12 group-hover:-translate-y-6 transition-transform duration-700">
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce-slow">
                                            <Crown className="w-16 h-16 text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                                        </div>
                                        <div className="w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-amber-400 via-yellow-200 to-orange-500 rounded-[3.5rem] p-1.5 shadow-[0_30px_60px_-15px_rgba(245,158,11,0.5)] relative z-10">
                                            <div className="w-full h-full bg-slate-900 rounded-[3.3rem] overflow-hidden flex items-center justify-center border-4 border-amber-300/30">
                                                {topThree[0].avatar ? <img src={topThree[0].avatar} className="w-full h-full object-cover" /> : <span className="text-7xl">🥇</span>}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-amber-400 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black shadow-2xl border-4 border-white dark:border-slate-800 text-3xl z-20">1</div>
                                        {/* Celebration Effect */}
                                        <div className="absolute -inset-10 bg-amber-500/20 rounded-full blur-[60px] animate-pulse pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-center mb-10">
                                        <div className={`font-black text-2xl mb-1 text-gradient`}>{topThree[0].name}</div>
                                        <div className="text-sm font-black text-amber-500 uppercase tracking-[0.2em]">{topThree[0].xp.toLocaleString()} XP</div>
                                    </div>
                                    <div className="w-40 h-60 bg-gradient-to-t from-amber-500/30 to-amber-500/5 rounded-t-[3.5rem] border-t-4 border-amber-400/30 backdrop-blur-md shadow-inner relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-full shimmer-overlay opacity-20" />
                                    </div>
                                </div>
                            )}

                            {/* Rank 3 */}
                            {topThree[2] && (
                                <div className="flex flex-col items-center group animate-premium-in" style={{ animationDelay: '0.2s' }}>
                                    <div className="relative mb-8 group-hover:-translate-y-4 transition-transform duration-500">
                                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-500 via-orange-100 to-amber-800 rounded-[2.5rem] p-1 shadow-2xl rotate-[5deg] group-hover:rotate-0 transition-all">
                                            <div className="w-full h-full bg-slate-900 rounded-[2.4rem] overflow-hidden flex items-center justify-center border-4 border-orange-500/30">
                                                {topThree[2].avatar ? <img src={topThree[2].avatar} className="w-full h-full object-cover" /> : <span className="text-5xl">👤</span>}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-xl border-4 border-white dark:border-slate-800 text-xl">3</div>
                                    </div>
                                    <div className="text-center mb-6">
                                        <div className={`font-black text-lg mb-1 ${textMain}`}>{topThree[2].name}</div>
                                        <div className="text-xs font-black text-orange-400 uppercase tracking-widest">{topThree[2].xp.toLocaleString()} XP</div>
                                    </div>
                                    <div className="w-32 h-32 bg-gradient-to-t from-orange-500/20 to-orange-500/5 rounded-t-[3rem] border-t-4 border-orange-500/20 backdrop-blur-sm shadow-inner" />
                                </div>
                            )}
                        </div>

                        {/* Leaderboard Table */}
                        <div className={`${cardBg} rounded-[3.5rem] border-2 shadow-premium overflow-hidden animate-premium-in`} style={{ animationDelay: '0.4s' }}>
                            <div className="p-10 border-b border-slate-500/10 flex items-center justify-between bg-slate-500/5 backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <Users className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-black ${textMain}`}>باقي المتنافسين</h2>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>إجمالي {leaderboard.length} متعلم مبدع</p>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input type="text" placeholder="ابحث عن بطل..." className={`w-64 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border-2 rounded-2xl pl-6 pr-14 py-3.5 text-sm font-bold outline-none focus:border-primary/50 transition-all placeholder:text-slate-500`} />
                                </div>
                            </div>

                            <div className="divide-y divide-slate-500/5">
                                {rest.map((player) => (
                                    <div key={player.rank} className={`flex items-center p-8 hover:bg-primary/5 transition-all group ${player.isMe ? 'bg-primary/5 border-r-8 border-primary' : ''}`}>
                                        <div className={`w-16 font-black text-2xl ${player.rank <= 3 ? 'text-gradient' : 'text-slate-400 opacity-50'} italic`}>
                                            #{player.rank}
                                        </div>
                                        <div className="relative ml-8">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 p-0.5 group-hover:scale-110 transition-transform">
                                                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[0.9rem] overflow-hidden flex items-center justify-center">
                                                    {player.avatar ? <img src={player.avatar} className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
                                                </div>
                                            </div>
                                            {player.isMe && <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />}
                                        </div>
                                        <div className="flex-1 ml-6">
                                            <div className={`font-black text-xl mb-1 flex items-center gap-3 ${textMain}`}>
                                                {player.name}
                                                {player.isMe && <span className="bg-primary text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg shadow-primary/20">أنا</span>}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={`text-[10px] font-black ${muted} uppercase tracking-widest flex items-center gap-2`}>
                                                    <Star size={12} className="text-amber-500" /> مستوى {player.level}
                                                </div>
                                                <div className="w-1.5 h-1.5 bg-slate-500/20 rounded-full" />
                                                <div className={`text-[10px] font-black ${muted} uppercase tracking-widest flex items-center gap-2`}>
                                                    <Award size={12} className="text-primary" /> {player.rank < 10 ? 'نخبة المبدعين' : 'متعلم نشط'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <Zap size={18} className="text-amber-500 fill-amber-500 shadow-glow" />
                                                <span className="text-2xl font-black text-primary tracking-tighter">{player.xp.toLocaleString()}</span>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2rem]">نقاط XP</div>
                                        </div>
                                    </div>
                                ))}

                                {rest.length === 0 && (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                                            <Trophy size={40} className="text-slate-400" />
                                        </div>
                                        <p className={`font-bold ${muted}`}>هل ستكون أول المنضمين للوحة الشرف؟</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
