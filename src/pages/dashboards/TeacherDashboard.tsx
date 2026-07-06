import { useState, useEffect } from 'react';
import {
    LayoutDashboard, BookOpen, Users, BarChart3,
    ChevronLeft, Star, Search, PlusCircle,
    TrendingUp, FileText, MessageSquare, Settings,
    Trophy
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import SubmissionsTab from '../../components/dashboards/SubmissionsTab';
import CoursesTab from '../../components/dashboards/CoursesTab';
import StudentsTab from '../../components/dashboards/StudentsTab';
import AnalyticsTab from '../../components/dashboards/AnalyticsTab';
import TeacherSettingsTab from '../../components/dashboards/TeacherSettingsTab';
import TeacherCompetitionsTab from '../../components/dashboards/TeacherCompetitionsTab';
import { getTeacherAnalytics, getTeacherStudents } from '../../services/teacherService';
import { getTeacherCourses } from '../../services/courseService';
import MessagesTab from '../../components/dashboards/MessagesTab';
import type { Course } from '../../types';

export default function TeacherDashboard() {
    const { user } = useAuthStore();
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('overview');

    // TEACHER data â€” uses the actual user from auth
    const teacher = {
        name: user?.full_name?.split(' ')[0] || user?.first_name || 'الأستاذ',
        fullName: user?.full_name || `${user?.first_name} ${user?.last_name}`.trim() || 'الأستاذ',
        email: user?.email || 'teacher@demo.com',
        initials: (user?.full_name || user?.first_name || 'TA').substring(0, 2).toUpperCase(),
    };

    const [statsData, setStatsData] = useState<any>(null);
    const [recentStudents, setRecentStudents] = useState<any[]>([]);
    const [dbCourses, setDbCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analytics, students, coursesData] = await Promise.all([
                    getTeacherAnalytics(),
                    getTeacherStudents(),
                    getTeacherCourses()
                ]);
                setStatsData(analytics);
                setRecentStudents(students);
                setDbCourses(coursesData);
            } catch (error) {
                console.error('Error fetching teacher data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { title: 'إجمالي الطلاب', value: statsData?.totalStudents || '0', icon: Users, gradient: 'from-emerald-500 to-teal-600', trend: '+12%', up: true },
        { title: 'الدورات النشطة', value: statsData?.activeCourses || '0', icon: BookOpen, gradient: 'from-teal-500 to-cyan-600', trend: '+2', up: true },
        { title: 'التقييم العام', value: statsData?.averageRating?.toFixed(1) || '4.8', icon: Star, gradient: 'from-amber-500 to-orange-600', trend: '+0.1', up: true },
        { title: 'إجمالي الإيرادات', value: statsData?.totalRevenue ? `$${statsData.totalRevenue}` : '$0', icon: TrendingUp, gradient: 'from-green-500 to-emerald-600', trend: '+15%', up: true }
    ];


    const cardBg = isDark ? 'bg-[#1c2128] border-[#30363d]' : 'bg-white border-slate-200';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'لوحة القيادة' },
        { id: 'courses', icon: BookOpen, label: 'الدورات' },
        { id: 'students', icon: Users, label: 'الطلاب' },
        { id: 'submissions', icon: FileText, label: 'إدارة التسليمات' },
        { id: 'competitions', icon: Trophy, label: 'المسابقات' },
        { id: 'analytics', icon: BarChart3, label: 'التحليلات' },
        { id: 'messages', icon: MessageSquare, label: 'الرسائل' },
        { id: 'settings', icon: Settings, label: 'الإعدادات' },
    ];

    return (
        <DashboardLayout
            role="teacher"
            navItems={navItems as any}
            activeTabId={activeTab}
            onTabChange={(id) => setActiveTab(id)}
            loading={loading}
            headerTitle={navItems.find(n => n.id === activeTab)?.label || 'لوحة القيادة'}
            headerSubtitle={`مرحباً، ${teacher.name}! 👋`}
            headerExtra={
                <>
                    <div className="relative hidden sm:block">
                        <input type="text" placeholder="بحث عن طالب أو دورة..." className={`pl-10 pr-4 py-2 ${isDark ? 'bg-slate-700 text-slate-200 placeholder-slate-400 border-slate-600' : 'bg-slate-100 border-transparent'} border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 w-56`} />
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} size={16} />
                    </div>
                    <button onClick={() => setActiveTab('courses')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition">
                        <PlusCircle size={18} />دورة جديدة
                    </button>
                </>
            }
            profileWidget={
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-white/30 shadow-inner">
                                {teacher.initials}
                            </div>
                            <div>
                                <div className="font-black text-lg">{teacher.fullName}</div>
                                <div className="text-emerald-200 text-xs font-bold truncate max-w-[150px]">{teacher.email}</div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Star size={12} className="text-yellow-300" fill="currentColor" />
                                    <span className="text-sm font-bold">4.8 تقييم عام</span>
                                </div>
                            </div>
                        </div>
                        {/* Quick stats removed as requested */}
                    </div>
                </div>
            }
        >
            <div className="p-8 lg:p-10 flex-1 space-y-10">
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className={`group relative bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700/50 shadow-premium hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
                                        {/* Decorative Background Blob */}
                                        <div className={`absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
                                        
                                        <div className="flex flex-col h-full relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:rotate-6 transition-transform duration-500`}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black ${stat.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'} border border-current/10`}>
                                                    <TrendingUp size={12} className={stat.up ? '' : 'rotate-180'} />
                                                    {stat.trend}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-1 mt-auto">
                                                <div className={`text-4xl font-black ${textMain} tracking-tighter`}>{stat.value}</div>
                                                <div className={`text-sm font-bold ${muted} uppercase tracking-widest`}>{stat.title}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid lg:grid-cols-5 gap-8">
                            {/* Courses - 3/5 */}
                            <div className={`lg:col-span-3 ${cardBg} border rounded-[2.5rem] overflow-hidden`}>
                                <div className={`p-7 border-b ${isDark ? 'border-[#30363d]' : 'border-slate-100'} flex items-center justify-between`}>
                                    <h3 className={`text-lg font-black ${textMain}`}>دوراتي</h3>
                                    <button onClick={() => setActiveTab('courses')} className="text-emerald-500 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                        عرض الكل <ChevronLeft size={16} />
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {dbCourses.slice(0, 4).map(course => (
                                        <div key={course.id} className={`p-5 flex items-center gap-4 ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} transition-colors`}>
                                            <div className="text-2xl">
                                                {course.category.toLowerCase().includes('scratch') ? '🎨' :
                                                    course.category.toLowerCase().includes('python') ? '🐍' : '📚'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-black text-sm ${textMain}`}>{course.title}</div>
                                                <div className={`text-xs ${muted} flex items-center gap-3 mt-1`}>
                                                    <span><Users size={11} className="inline mr-1" />{course.studentsCount || 0} طالب</span>
                                                    {course.rating > 0 && <span><Star size={11} className="inline text-yellow-500 mr-1" />{course.rating}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${course.status === 'published' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                    {course.status === 'published' ? '✅ منشور' : '✏️ مسودة'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {dbCourses.length === 0 && (
                                        <div className="p-10 text-center text-slate-500 font-bold">لا توجد دورات حالياً.</div>
                                    )}
                                </div>
                            </div>

                            {/* Students performance - 2/5 */}
                            <div className={`lg:col-span-2 ${cardBg} border rounded-[2.5rem] p-7`}>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className={`text-base font-black ${textMain}`}>أداء الطلاب</h3>
                                    <button onClick={() => setActiveTab('students')} className="text-emerald-500 font-bold text-xs">عرض الكل</button>
                                </div>
                                <div className="space-y-4">
                                    {recentStudents.map((student, i) => (
                                        <div key={i} className={`flex items-center gap-3 p-3 ${isDark ? 'bg-slate-700/40 rounded-2xl' : 'bg-slate-50 rounded-2xl'}`}>
                                            <span className="text-xl">{student.avatar}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-black text-xs ${textMain}`}>{student.name}</div>
                                                <div className={`text-[10px] ${muted}`}>{student.course}</div>
                                                <div className="mt-1.5">
                                                    <div className={`h-1.5 ${isDark ? 'bg-slate-600' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${student.progress}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-emerald-500">{student.progress}%</div>
                                                <div className={`text-[10px] ${muted}`}>{student.xp} XP</div>
                                                <div className={`w-2 h-2 rounded-full mt-1 mr-auto ${student.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`${cardBg} border rounded-[2.5rem] p-8`}>
                            <h3 className={`text-lg font-black ${textMain} mb-6 flex items-center gap-2`}>
                                <BarChart3 className="text-emerald-500" size={24} />التحليلات الشهرية للإيرادات
                            </h3>
                            <div className="h-64 w-full" dir="ltr">
                                {statsData?.revenueHistory && statsData.revenueHistory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statsData.revenueHistory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                                            <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ color: '#10b981', fontWeight: 900 }}
                                                cursor={{fill: isDark ? '#334155' : '#f1f5f9'}}
                                            />
                                            <Bar dataKey="revenue" name="الإيرادات ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center opacity-50 font-bold">جاري تحميل البيانات...</div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'submissions' && (
                    <div className="animate-fade-in">
                        <SubmissionsTab courses={dbCourses} />
                    </div>
                )}

                {activeTab === 'courses' && (
                    <CoursesTab />
                )}

                {activeTab === 'students' && (
                    <StudentsTab />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsTab />
                )}

                {activeTab === 'settings' && (
                    <TeacherSettingsTab />
                )}

                {activeTab === 'competitions' && (
                    <div className="animate-fade-in">
                        <TeacherCompetitionsTab />
                    </div>
                )}

                {activeTab === 'messages' && (
                    <MessagesTab />
                )}

                {activeTab !== 'overview' && activeTab !== 'submissions' && activeTab !== 'courses' && activeTab !== 'students' && activeTab !== 'analytics' && activeTab !== 'settings' && activeTab !== 'messages' && activeTab !== 'competitions' && (
                    <div className={`${cardBg} border rounded-[2.5rem] p-16 text-center animate-fade-in`}>
                        <div className={`w-24 h-24 ${isDark ? 'bg-slate-700' : 'bg-emerald-50'} rounded-full flex items-center justify-center mx-auto mb-6 text-5xl`}>ðŸ—ï¸</div>
                        <h3 className={`text-2xl font-black ${textMain} mb-3`}>قريباً!</h3>
                        <p className={`${muted} max-w-md mx-auto font-bold`}>
                            جاري تطوير هذا القسم لتقديم تجربة معلم استثنائية.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
