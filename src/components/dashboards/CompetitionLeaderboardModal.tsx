import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../lib/api';
import { X, Trophy, Medal, Users, Star, Crown } from 'lucide-react';

interface Props {
    competitionId: string;
    competitionTitle: string;
    onClose: () => void;
}

export default function CompetitionLeaderboardModal({ competitionId, competitionTitle, onClose }: Props) {
    const { isDark } = useTheme();
    const [competition, setCompetition] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/competitions/${competitionId}`);
                setCompetition(res.data);
            } catch (error) {
                console.error('Error fetching competition leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [competitionId]);

    const participants = competition?.participants || [];

    const medalConfig = [
        { color: 'from-amber-400 to-yellow-500', border: 'border-amber-400', text: 'text-amber-400', shadow: 'shadow-amber-500/40', emoji: '🥇', label: 'المركز الأول' },
        { color: 'from-slate-300 to-slate-400', border: 'border-slate-300', text: 'text-slate-300', shadow: 'shadow-slate-400/30', emoji: '🥈', label: 'المركز الثاني' },
        { color: 'from-orange-400 to-amber-600', border: 'border-orange-400', text: 'text-orange-400', shadow: 'shadow-orange-500/30', emoji: '🥉', label: 'المركز الثالث' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={`${isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-slate-200'} w-full max-w-2xl max-h-[90vh] rounded-[3rem] border-2 shadow-2xl overflow-hidden flex flex-col animate-[var(--animation-premium-in)]`}>

                {/* Header */}
                <div className="relative p-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-inner">
                                <Trophy size={28} />
                            </div>
                            <div>
                                <div className="text-amber-200 text-xs font-black uppercase tracking-widest mb-1">ترتيب المسابقة</div>
                                <h2 className="text-2xl font-black leading-tight">{competitionTitle}</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Stats bar */}
                    {competition && (
                        <div className="relative z-10 flex items-center gap-6 mt-6 pt-6 border-t border-white/20 text-sm font-black">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-amber-200" />
                                <span>{participants.length} مشارك</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star size={16} className="text-amber-200" fill="currentColor" />
                                <span>+{competition.xp_reward} XP للفائز</span>
                            </div>
                            <div className={`mr-auto px-4 py-1.5 rounded-full text-[10px] font-black border border-white/30 backdrop-blur-md ${competition.status === 'ACTIVE' ? 'bg-emerald-500/30' : competition.status === 'FINISHED' ? 'bg-slate-500/30' : 'bg-blue-500/30'}`}>
                                {competition.status === 'ACTIVE' ? '🔥 نشطة الآن' : competition.status === 'FINISHED' ? '🏁 انتهت' : '⏳ قادمة'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <p className={`font-black text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>جاري تحميل الترتيب...</p>
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className={`text-xl font-black ${isDark ? 'text-slate-200' : 'text-slate-800'} mb-2`}>لا يوجد مشاركون بعد</h3>
                            <p className={`font-bold text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>كن أول من ينضم إلى هذه المسابقة!</p>
                        </div>
                    ) : (
                        <>
                            {/* Top 3 podium */}
                            {participants.length >= 1 && (
                                <div className="flex items-end justify-center gap-4 pb-8 pt-4">
                                    {/* 2nd place (left) */}
                                    {participants[1] && (
                                        <div className="flex flex-col items-center gap-3 flex-1">
                                            <div className={`w-16 h-16 rounded-full border-4 ${medalConfig[1].border} overflow-hidden bg-slate-300 shadow-lg ${medalConfig[1].shadow} relative`}>
                                                {participants[1].student?.user?.avatar_url ? (
                                                    <img src={participants[1].student.user.avatar_url} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-600">
                                                        {(participants[1].student?.user?.first_name || '?')[0]}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl">🥈</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`font-black text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'} truncate max-w-[80px]`}>
                                                    {participants[1].student?.user?.first_name} {participants[1].student?.user?.last_name}
                                                </div>
                                                <div className={`text-[10px] font-black ${medalConfig[1].text}`}>{participants[1].score || 0} نقطة</div>
                                            </div>
                                            <div className={`w-full bg-gradient-to-t ${medalConfig[1].color} rounded-t-2xl h-16 flex items-center justify-center text-white font-black`}>2</div>
                                        </div>
                                    )}
                                    {/* 1st place (center - tallest) */}
                                    <div className="flex flex-col items-center gap-3 flex-1">
                                        <div className="relative">
                                            <Crown size={24} className="text-amber-400 mx-auto mb-1 animate-bounce" />
                                            <div className={`w-20 h-20 rounded-full border-4 ${medalConfig[0].border} overflow-hidden bg-amber-100 shadow-xl ${medalConfig[0].shadow} relative`}>
                                                {participants[0].student?.user?.avatar_url ? (
                                                    <img src={participants[0].student.user.avatar_url} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-amber-700">
                                                        {(participants[0].student?.user?.first_name || '?')[0]}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">🥇</div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`font-black text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'} truncate max-w-[80px]`}>
                                                {participants[0].student?.user?.first_name} {participants[0].student?.user?.last_name}
                                            </div>
                                            <div className={`text-xs font-black ${medalConfig[0].text}`}>{participants[0].score || 0} نقطة</div>
                                        </div>
                                        <div className={`w-full bg-gradient-to-t ${medalConfig[0].color} rounded-t-2xl h-24 flex items-center justify-center text-white font-black text-xl`}>1</div>
                                    </div>
                                    {/* 3rd place (right) */}
                                    {participants[2] && (
                                        <div className="flex flex-col items-center gap-3 flex-1">
                                            <div className={`w-16 h-16 rounded-full border-4 ${medalConfig[2].border} overflow-hidden bg-orange-100 shadow-lg ${medalConfig[2].shadow} relative`}>
                                                {participants[2].student?.user?.avatar_url ? (
                                                    <img src={participants[2].student.user.avatar_url} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-orange-700">
                                                        {(participants[2].student?.user?.first_name || '?')[0]}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl">🥉</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`font-black text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'} truncate max-w-[80px]`}>
                                                    {participants[2].student?.user?.first_name} {participants[2].student?.user?.last_name}
                                                </div>
                                                <div className={`text-[10px] font-black ${medalConfig[2].text}`}>{participants[2].score || 0} نقطة</div>
                                            </div>
                                            <div className={`w-full bg-gradient-to-t ${medalConfig[2].color} rounded-t-2xl h-10 flex items-center justify-center text-white font-black`}>3</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Full ranked list */}
                            <div className={`rounded-[2rem] overflow-hidden border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div className={`px-6 py-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} flex items-center justify-between`}>
                                    <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ترتيب المشاركين</span>
                                    <span className={`text-xs font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{participants.length} مشارك</span>
                                </div>
                                <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {participants.map((p: any, i: number) => (
                                        <div key={p.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} ${i < 3 ? (isDark ? 'bg-amber-500/5' : 'bg-amber-50/50') : ''}`}>
                                            {/* Rank badge */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30' : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg' : i === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-500/30' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                {i + 1}
                                            </div>
                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 ${i === 0 ? 'border-amber-400' : i === 1 ? 'border-slate-400' : i === 2 ? 'border-orange-400' : isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                                {p.student?.user?.avatar_url ? (
                                                    <img src={p.student.user.avatar_url} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center text-lg font-black ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                        {(p.student?.user?.first_name || '?')[0]}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Name */}
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-black text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                                    {p.student?.user?.first_name} {p.student?.user?.last_name}
                                                </div>
                                                <div className={`text-[10px] font-bold truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    انضم في {new Date(p.joined_at || p.created_at).toLocaleDateString('ar')}
                                                </div>
                                            </div>
                                            {/* Score */}
                                            <div className="text-right shrink-0">
                                                <div className={`font-black text-base ${i < 3 ? 'text-amber-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {(p.score || 0).toLocaleString()}
                                                </div>
                                                <div className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>نقطة</div>
                                            </div>
                                            {/* Medal emoji for top 3 */}
                                            {i < 3 && (
                                                <div className="text-2xl shrink-0 w-8 text-center">{medalConfig[i].emoji}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} shrink-0`}>
                    <button
                        onClick={onClose}
                        className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}
