import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import DashboardLayout from '../../components/shared/DashboardLayout';
import api from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { Award, BookOpen, Flame, Star, Trophy, Users, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import Loading from '../../components/Loading';

export default function ParentDashboard() {
    const { user } = useAuthStore();
    const { isDark } = useTheme();
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [linkEmail, setLinkEmail] = useState('');
    const [linking, setLinking] = useState(false);
    const [linkMessage, setLinkMessage] = useState('');

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const res = await api.get('/parent/children');
            setChildren(res.data.children);
        } catch (error) {
            console.error('Error fetching children:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkChild = async (e: React.FormEvent) => {
        e.preventDefault();
        setLinking(true);
        setLinkMessage('');
        try {
            await api.post('/parent/link', { studentEmail: linkEmail });
            setLinkMessage('تم ربط حساب طفلك بنجاح ✅');
            setLinkEmail('');
            fetchChildren();
        } catch (error: any) {
            setLinkMessage('❌ ' + (error.response?.data?.message || 'فشل في عملية الربط'));
        } finally {
            setLinking(false);
        }
    };

    if (loading) return <Loading />;

    const surface = isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <DashboardLayout role="parent" navItems={[]}>
            <div className="max-w-7xl mx-auto space-y-8 p-6">
                
                {/* Header Section */}
                <div className={`p-8 rounded-[2.5rem] border-2 bg-gradient-to-br ${isDark ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-indigo-50 to-white border-indigo-100'}`}>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black mb-2">مرحباً بك، {user?.full_name} 👋</h1>
                            <p className={`text-lg font-bold ${muted}`}>لوحة التحكم الخاصة بأولياء الأمور - تابع تقدم أبنائك بشفافية</p>
                        </div>
                        <div className={`p-4 rounded-2xl flex items-center gap-3 ${isDark ? 'bg-slate-700/50' : 'bg-white shadow-xl shadow-indigo-100/50'}`}>
                            <Users size={24} className="text-indigo-500" />
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-widest ${muted}`}>الأبناء المرتبطين</p>
                                <p className="text-xl font-black">{children.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Link Child Form */}
                <div className={`p-6 rounded-3xl border-2 ${surface}`}>
                    <h3 className="text-lg font-black flex items-center gap-2 mb-4">
                        <LinkIcon size={20} className="text-indigo-500" /> ربط حساب طفل جديد
                    </h3>
                    <form onSubmit={handleLinkChild} className="flex gap-4 items-start">
                        <div className="flex-1">
                            <input
                                type="email"
                                value={linkEmail}
                                onChange={(e) => setLinkEmail(e.target.value)}
                                placeholder="أدخل البريد الإلكتروني الخاص بحساب طفلك"
                                className={`w-full px-5 py-3 rounded-2xl border-2 font-bold focus:outline-none focus:ring-4 transition-all ${isDark ? 'bg-slate-900 border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20'}`}
                                required
                            />
                            {linkMessage && (
                                <p className={`mt-2 text-sm font-bold ${linkMessage.includes('✅') ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {linkMessage}
                                </p>
                            )}
                        </div>
                        <button disabled={linking} type="submit" className="px-8 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                            {linking ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} ربط
                        </button>
                    </form>
                </div>

                {/* Children Details & Charts */}
                {children.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Users size={64} className="mx-auto mb-4" />
                        <h2 className="text-2xl font-black">لا يوجد أبناء مرتبطين بعد</h2>
                        <p className="font-bold">استخدم النموذج أعلاه لربط حساب طفلك.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {children.map(child => {
                            // Prepare Chart Data from recent activity
                            const chartData = [...child.recent_activity].reverse().map(act => ({
                                name: act.lesson_name.substring(0, 10) + '...',
                                xp: act.xp_earned,
                            }));

                            return (
                                <div key={child.id} className="space-y-6">
                                    <h2 className="text-2xl font-black flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg">
                                            {child.name.charAt(0)}
                                        </div>
                                        تقدم {child.name}
                                    </h2>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className={`p-6 rounded-3xl border-2 flex items-center gap-4 ${surface}`}>
                                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><Star size={24} /></div>
                                            <div>
                                                <p className={`text-xs font-bold uppercase ${muted}`}>مجموع النقاط</p>
                                                <p className="text-2xl font-black">{child.total_xp}</p>
                                            </div>
                                        </div>
                                        <div className={`p-6 rounded-3xl border-2 flex items-center gap-4 ${surface}`}>
                                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><Trophy size={24} /></div>
                                            <div>
                                                <p className={`text-xs font-bold uppercase ${muted}`}>المستوى الحالي</p>
                                                <p className="text-2xl font-black">{child.current_level}</p>
                                            </div>
                                        </div>
                                        <div className={`p-6 rounded-3xl border-2 flex items-center gap-4 ${surface}`}>
                                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><BookOpen size={24} /></div>
                                            <div>
                                                <p className={`text-xs font-bold uppercase ${muted}`}>دروس مكتملة</p>
                                                <p className="text-2xl font-black">{child.completed_lessons}</p>
                                            </div>
                                        </div>
                                        <div className={`p-6 rounded-3xl border-2 flex items-center gap-4 ${surface}`}>
                                            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500"><Flame size={24} /></div>
                                            <div>
                                                <p className={`text-xs font-bold uppercase ${muted}`}>سلسلة التعلم</p>
                                                <p className="text-2xl font-black">{child.current_streak} أيام</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart & Badges Layout */}
                                    <div className="grid lg:grid-cols-3 gap-6">
                                        
                                        {/* Chart */}
                                        <div className={`lg:col-span-2 p-6 rounded-3xl border-2 ${surface}`}>
                                            <h3 className="text-lg font-black mb-6">نقاط الخبرة في آخر الدروس</h3>
                                            <div className="h-64 w-full" dir="ltr">
                                                {chartData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={chartData}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                                                            <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                                            <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                                            <RechartsTooltip 
                                                                contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                                itemStyle={{ color: '#6366f1', fontWeight: 900 }}
                                                            />
                                                            <Line type="monotone" dataKey="xp" name="نقاط (XP)" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: isDark ? '#1e293b' : '#fff' }} activeDot={{ r: 8 }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center opacity-50 font-bold">لا يوجد نشاط مسجل حتى الآن</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className={`p-6 rounded-3xl border-2 ${surface}`}>
                                            <h3 className="text-lg font-black mb-4">الأوسمة المكتسبة</h3>
                                            {child.badges.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {child.badges.map((b: string, i: number) => (
                                                        <div key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 font-black text-sm flex items-center gap-1">
                                                            <Award size={14} /> {b}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className={`text-center py-10 ${muted} font-bold`}>
                                                    لم يتم اكتساب أوسمة بعد.
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
