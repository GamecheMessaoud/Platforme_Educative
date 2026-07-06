import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Star, DollarSign, Calendar } from 'lucide-react';
import { getTeacherAnalytics } from '../../services/teacherService';
import { useTheme } from '../../context/ThemeContext';
import Loading from '../Loading';

const AnalyticsTab: React.FC = () => {
    const { isDark } = useTheme();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const analytics = await getTeacherAnalytics();
                setData(analytics);
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <Loading />;

    const cardBg = isDark ? 'bg-[#1c2128] border-[#30363d]' : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    const stats = [
        { label: 'إجمالي الطلاب', value: data?.totalStudents || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'الدورات النشطة', value: data?.activeCourses || 0, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'متوسط التقييم', value: '4.8', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'الإيرادات المقدرة', value: `$${data?.totalRevenue || 0}`, icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="space-y-8 animate-fade-in" dir="rtl">
            {/* Header */}
            <div className={`p-6 rounded-3xl border ${cardBg} flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100/50 rounded-xl">
                        <BarChart3 className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-black ${textMain}`}>مركز التحليلات</h2>
                        <p className={`text-sm ${muted} font-medium`}>نظرة شاملة على أداء دوراتك وتفاعل الطلاب</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black text-slate-500">
                    <Calendar size={14} /> آخر 30 يوم
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className={`p-6 rounded-3xl border ${cardBg} hover:shadow-lg transition-all`}>
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon size={24} />
                        </div>
                        <div className={`text-2xl font-black ${textMain}`}>{stat.value}</div>
                        <div className={`text-xs font-bold ${muted}`}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Growth Chart */}
                <div className={`p-8 rounded-[2.5rem] border ${cardBg}`}>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className={`font-black ${textMain} flex items-center gap-2`}>
                            <TrendingUp className="text-emerald-500" size={20} /> نمو الطلاب
                        </h3>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+24% هذا الشهر</span>
                    </div>
                    <div className="flex items-end gap-2 h-48">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl relative overflow-hidden"
                                    style={{ height: '100%' }}
                                >
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-700 group-hover:opacity-80"
                                        style={{ height: `${h}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] ${muted} font-bold`}>{['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popularity Card */}
                <div className={`p-8 rounded-[2.5rem] border ${cardBg}`}>
                    <h3 className={`font-black ${textMain} mb-8 flex items-center gap-2`}>
                        <Star className="text-amber-500" size={20} /> الدورات الأكثر تفاعلاً
                    </h3>
                    <div className="space-y-6">
                        {(data?.popularCourses?.length > 0 ? data.popularCourses : [
                            { name: 'Scratch 3.0', count: 450 },
                            { name: 'Python Basics', count: 320 },
                            { name: 'Web Dev', count: 120 },
                        ]).map((course: any, i: number) => {
                            const colors = ['bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];
                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className={textMain}>{course.name}</span>
                                        <span className={muted}>{course.count} طالب</span>
                                    </div>
                                    <div className={`h-2 w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                                        <div
                                            className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000`}
                                            style={{ width: `${Math.min((course.count / (data?.totalStudents || 500)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {data?.popularCourses?.length === 0 && (
                            <div className="text-center py-10 opacity-50 font-bold">لا توجد بيانات دورات بعد.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;
