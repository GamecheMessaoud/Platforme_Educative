import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, FlaskConical, TrendingUp,
    Settings, Trophy,
    Flame, ExternalLink, X, Send, Play,
    Rocket, Brain, ChevronLeft, Crown,
    CheckCircle2, AlertCircle, Eye, Clock, MessageSquare,
    PlayCircle, Upload, Star, FileText, ShoppingBag, Globe, Award
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import api, { BASE_URL } from '../../lib/api';
import StudentSettingsTab from '../../components/dashboards/StudentSettingsTab';
import StudentCompetitionsTab from '../../components/dashboards/StudentCompetitionsTab';
import StudentCoursesTab from '../../components/dashboards/StudentCoursesTab';
import StudentSubmissionsTab from '../../components/dashboards/StudentSubmissionsTab';
import StudentLabsTab from '../../components/dashboards/StudentLabsTab';
import StudentStoreTab from '../../components/dashboards/StudentStoreTab';
import StudentLeaderboardTab from '../../components/dashboards/StudentLeaderboardTab';
import MessagesTab from '../../components/dashboards/MessagesTab';
import StudentCommunityTab from '../../components/dashboards/StudentCommunityTab';
import PlacementTest from '../../components/dashboards/PlacementTest';
import VRComputerLab from '../../components/dashboards/VRComputerLab';
import VRArduinoLab from '../../components/dashboards/VRArduinoLab';
import SubscriptionPage from './SubscriptionPage';
import StatsHeader from '../../components/dashboards/StatsHeader';
import AiAssistant from './AiAssistant';
import CertificateModal from '../../components/shared/CertificateModal';

interface ChatMessage { role: 'user' | 'cody'; text: string; }
interface Course {
    id: string; emoji: string; title: string; subtitle: string;
    progress: number; lessonsCount: number; completedLessons: number;
    gradient: string; nextLesson: string;
    imageUrl?: string; difficulty?: string; duration?: number; xpReward?: number;
}

const quickLabs = [
    { id: 'scratch-lab', emoji: '🎮', title: 'مختبر سكراتش', desc: 'ابتكر ألعابك الخاصة', color: 'from-orange-400 to-pink-500', status: 'جديد' },
    { id: 'python-lab', emoji: '🐍', title: 'بيئة بايثون', desc: 'اكتب الكود باحترافية', color: 'from-green-400 to-emerald-500', status: 'نشط' },
    { id: 'arduino-lab', emoji: '⚡', title: 'محاكي أردوينو', desc: 'تجارب إلكترونية ذكية', color: 'from-blue-400 to-indigo-500', status: 'نشط' },
    { id: 'ai-lab', emoji: '🧠', title: 'مختبر الذكاء', desc: 'علم الآلة لتعمل معك', color: 'from-red-400 to-orange-500', status: 'جديد' }
];

const CODY_RESPONSES: Record<string, string> = {
    'كيف أبدأ؟': 'ابدأ من قسم "دوراتي" واختر الدورة المناسبة لمستواك! 🚀',
    'ما هي نقاط XP؟': 'نقاط الخبرة! تكسبها عند إكمال الدروس والتحديات. كلما جمعت أكثر، ارتفع مستواك! ⭐',
    'كيف أحصل على شارة؟': 'أكمل التحديات والمشاريع! كل إنجاز يعطيك شارة خاصة 🏆',
    'مرحبا': 'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟ 😊',
};

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuthStore();
    const { isDark } = useTheme();
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'cody', text: `مرحباً ${user?.full_name?.split(' ')[0] || 'يا بطل'}! 👋 أنا Cody مساعدك الذكي. كيف أقدر أساعدك؟` }
    ]);
    const [activeTab, setActiveTab] = useState('overview');
    const [showPlacement, setShowPlacement] = useState(false);
    const [activeLabId, setActiveLabId] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [studentStats, setStudentStats] = useState<any>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    
    const [certModalOpen, setCertModalOpen] = useState(false);
    const [certData, setCertData] = useState({ studentName: '', courseName: '', completedAt: '' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, subRes, lbRes] = await Promise.all([
                    api.get('/gamification/stats').catch(() => ({ data: null })),
                    api.get('/submissions/student-recent').catch(() => ({ data: [] })),
                    api.get('/gamification/leaderboard').catch(() => ({ data: [] }))
                ]);

                if (statsRes.data) setStudentStats(statsRes.data);
                if (subRes.data) setSubmissions(subRes.data.slice(0, 3));
                if (lbRes.data) setLeaderboard(lbRes.data.slice(0, 5));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        const fetchEnrollments = async () => {
            try {
                setLoadingCourses(true);
                const res = await api.get('/courses/my-enrollments');
                setCourses(res.data);
            } catch (error) {
                console.error('Error fetching enrollments:', error);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchDashboardData();
        fetchEnrollments();
        
        // Show placement test if student hasn't completed it yet
        if (user?.role === 'STUDENT' && user?.studentProfile && !user.studentProfile.placement_completed) {
            setShowPlacement(true);
        }
    }, [user?.id, user?.studentProfile?.total_xp]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('subscription') === 'success') {
            setIsVerifyingPayment(true);
            setVerificationError(null);
            setVerificationSuccess(false);

            let attempts = 0;
            const maxAttempts = 6;

            const interval = setInterval(async () => {
                attempts++;
                try {
                    await refreshUser();
                    const updatedUser = useAuthStore.getState().user;
                    if (updatedUser?.studentProfile?.subscription_status === 'ACTIVE') {
                        setVerificationSuccess(true);
                        setIsVerifyingPayment(false);
                        clearInterval(interval);
                        navigate('/student-dashboard', { replace: true });
                    } else if (attempts >= maxAttempts) {
                        setVerificationError('الاشتراك قيد المعالجة حالياً. سيتم تفعيل حسابك تلقائياً خلال دقائق بمجرد تأكيد البنك. يمكنك تحديث الصفحة لاحقاً.');
                        setIsVerifyingPayment(false);
                        clearInterval(interval);
                        navigate('/student-dashboard', { replace: true });
                    }
                } catch (err) {
                    console.error('Error verifying subscription status:', err);
                    if (attempts >= maxAttempts) {
                        setVerificationError('حدث خطأ أثناء التحقق من الاشتراك. يرجى تحديث الصفحة لاحقاً أو الاتصال بالدعم.');
                        setIsVerifyingPayment(false);
                        clearInterval(interval);
                        navigate('/student-dashboard', { replace: true });
                    }
                }
            }, 2500);

            return () => clearInterval(interval);
        }
    }, [refreshUser, navigate]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = (text?: string) => {
        const q = (text ?? chatInput).trim();
        if (!q) return;
        setChatInput('');
        setMessages(prev => [...prev, { role: 'user', text: q }]);
        setTimeout(() => {
            const answer = CODY_RESPONSES[q] || 'سؤال رائع! دعني أساعدك. هل يمكنك توضيح المزيد؟ 🤔';
            setMessages(prev => [...prev, { role: 'cody', text: answer }]);
        }, 800);
    };

    const student = {
        name: user?.full_name?.split(' ')[0] || user?.first_name || 'طالب',
        fullName: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
        email: user?.email || '',
        initials: (user?.full_name || user?.first_name || 'AB').substring(0, 2).toUpperCase(),
        level: studentStats?.current_level || 1,
        xp: studentStats?.total_xp || 0,
        xpToNext: studentStats?.xp_to_next_level || 1000,
        rank: studentStats?.rank || 0,
        streak: studentStats?.current_streak || 0,
        completedLessons: studentStats?.completed_lessons_count || 0
    };

    const xpPercent = student.xpToNext > 0 ? Math.round((student.xp / student.xpToNext) * 100) : 0;

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        pending: { label: 'انتظار', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
        approved: { label: 'مقبول', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
        rejected: { label: 'تعديل', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: AlertCircle },
        reviewing: { label: 'مراجعة', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Eye },
    };

    const navItems = [
        { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
        { id: 'competitions', label: 'المسابقات', icon: Trophy },
        { id: 'courses', label: 'تصفح الدورات', icon: BookOpen },
        { id: 'submissions', label: 'تسليماتي', icon: FileText },
        { id: 'labs', label: 'المختبرات', icon: FlaskConical },
        { id: 'store', label: 'المتجر', icon: ShoppingBag },
        { id: 'leaderboard', label: 'المتصدرون', icon: TrendingUp },
        { id: 'community', label: 'المجتمع', icon: Globe },
        { id: 'messages', label: 'الرسائل الخاصّة', icon: MessageSquare },
        { id: 'chatcoddy', label: 'ChatCoddy', icon: Brain },
        { id: 'subscription', label: 'الاشتراك VIP', icon: Crown },
        { id: 'settings', label: 'الإعدادات', icon: Settings },
    ];

    const getImageUrl = (url: string | undefined | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return `${BASE_URL}${url}`;
        if (url.startsWith('uploads')) return `${BASE_URL}/${url}`;
        return url;
    };

    return (
        <DashboardLayout
            role="student"
            navItems={navItems as any}
            activeTabId={activeTab}
            onTabChange={(id) => setActiveTab(id)}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={setSidebarOpen}
            headerTitle={navItems.find(n => n.id === activeTab)?.label || 'لوحة التحكم'}
            headerSubtitle={`لقد جمعت ${student.xp.toLocaleString()} نقطة، استمر في العمل الرائع! ✨`}
            headerExtra={
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-orange-500/10 border-2 border-orange-500/20 px-6 py-3 rounded-[1.5rem]">
                        <Flame size={24} className="text-orange-500" />
                        <span className="font-black text-orange-600 text-xl">{student.streak} 🔥</span>
                    </div>
                </div>
            }
            profileWidget={
                <div className="bg-gradient-to-br from-primary via-secondary to-accent rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl animate-premium-in">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-white/30 shadow-inner">
                                {student.initials}
                            </div>
                            <div className="min-w-0">
                                <div className="font-black text-xl truncate">{student.name}</div>
                                <div className="flex items-center gap-2 text-white/70 text-xs font-bold mt-1 bg-white/10 w-fit px-3 py-1 rounded-full">
                                    <Crown size={12} className="text-yellow-300" />
                                    <span>المستوى {student.level}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase text-white/70 mt-4">
                            <span>الإنجاز الكلي</span>
                            <span className="text-white">{student.completedLessons} دروس</span>
                        </div>
                    </div>
                </div>
            }
        >
            {showPlacement && (
                <PlacementTest onComplete={(level) => {
                    setShowPlacement(false);
                    // Refresh stats or show success
                }} />
            )}
            
            {/* VIP PAYWALL OVRERLAY */}
            {user?.role === 'STUDENT' && user?.studentProfile && user.studentProfile.subscription_status !== 'ACTIVE' && activeTab !== 'subscription' ? (
                <div className="max-w-[1400px] mx-auto animate-premium-in space-y-12 relative">
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 backdrop-blur-xl bg-[#0b0f19]/80 rounded-[3rem]">
                        <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-[3rem] p-12 text-center max-w-2xl">
                            <Crown size={80} className="text-yellow-400 mx-auto mb-6" />
                            <h2 className="text-3xl font-black text-white mb-4">حسابك غير مفعل!</h2>
                            <p className="text-lg text-slate-300 font-medium mb-8">
                                للوصول إلى لوحة التحكم والبدء في رحلتك التعليمية المليئة بالمتعة البرمجية، يرجى تفعيل اشتراكك VIP أولاً ومواصلة التعلم مع أبطالنا!
                            </p>
                            <button
                                onClick={() => setActiveTab('subscription')}
                                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-yellow-500/30 text-xl"
                            >
                                <Crown size={24} className="inline-block ml-2" />
                                اشترك الآن
                            </button>
                        </div>
                    </div>
                    {/* Background disabled skeleton to imply locked content */}
                    <div className="opacity-10 pointer-events-none filter grayscale cursor-not-allowed select-none blur-sm">
                        <StatsHeader
                             xp={100} level={1} streak={1} rank={1} completedLessons={0} xpToNext={1000}
                        />
                        <div className="grid xl:grid-cols-3 gap-10 mt-12">
                            <div className="xl:col-span-2 space-y-10">
                                <div className={`${cardBg} rounded-[3.5rem] border-2 p-10 h-[400px]`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-[1400px] mx-auto animate-premium-in space-y-12">
                    {activeTab === 'overview' && (
                        <>
                            {/* Hero Stats */}
                            <StatsHeader 
                                 xp={student.xp}
                             level={student.level}
                             streak={student.streak}
                             rank={student.rank}
                             completedLessons={student.completedLessons}
                             xpToNext={student.xpToNext}
                        />

                        <div className="grid xl:grid-cols-3 gap-10">
                            {/* Main Stream */}
                            <div className="xl:col-span-2 space-y-10">
                                {/* Active Courses */}
                                <div className={`${cardBg} rounded-[3.5rem] border-2 p-10 shadow-luxury`}>
                                    <div className="flex items-center justify-between mb-10">
                                        <h2 className={`text-2xl font-black ${textMain} flex items-center gap-4`}>
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                                <PlayCircle size={24} />
                                            </div>
                                            دوراتي الحالية
                                        </h2>
                                        <Link to="/courses" className="text-primary font-black text-sm flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
                                            استكشاف الكل <ChevronLeft size={18} />
                                        </Link>
                                    </div>

                                    <div className="space-y-6">
                                        {loadingCourses ? (
                                            <div className="py-20 text-center space-y-4">
                                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-xl" />
                                                <p className={`font-black ${muted} animate-pulse`}>جاري تجهيز محطاتك التعليمية...</p>
                                            </div>
                                        ) : courses.length > 0 ? (
                                            courses.map((course: Course) => (
                                                <div key={course.id}
                                                    onClick={() => navigate(`/course-viewer/${course.id}`)}
                                                    className={`group p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer relative overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800 hover:border-primary/50' : 'bg-slate-50 border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-2xl'}`}>
                                                    <div className="flex items-center gap-8 relative z-10">
                                                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden relative ${!getImageUrl(course.imageUrl) ? `bg-gradient-to-br ${course.gradient || 'from-primary to-secondary'}` : ''}`}>
                                                            {getImageUrl(course.imageUrl) ? (
                                                                <img src={getImageUrl(course.imageUrl)!} alt={course.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="relative z-10">{course.emoji || '🚀'}</span>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                                        </div>
                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <h3 className={`text-xl font-black ${textMain} group-hover:text-primary transition-colors`}>{course.title}</h3>
                                                                    <div className="flex gap-2">
                                                                        <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">{course.subtitle}</span>
                                                                        <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">{course.difficulty}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`text-lg font-black ${textMain}`}>{course.progress}%</span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="h-2.5 bg-slate-500/10 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${course.gradient} transition-all duration-1000 shadow-sm`}
                                                                        style={{ width: `${course.progress}%` }}
                                                                    />
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                                                        <span>{course.completedLessons} / {course.lessonsCount} درس</span>
                                                                    </div>
                                                                    
                                                                    {(course.progress === 100 || (course.lessonsCount > 0 && course.completedLessons >= course.lessonsCount)) && (
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setCertData({
                                                                                    studentName: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'طالب متميز',
                                                                                    courseName: course.title,
                                                                                    completedAt: new Date().toLocaleDateString('ar')
                                                                                });
                                                                                setCertModalOpen(true);
                                                                            }}
                                                                            className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 hover:text-emerald-600 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm"
                                                                        >
                                                                            <Award size={14} /> الشهادة
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-500 shadow-xl shadow-primary/40 shrink-0">
                                                            <Play size={24} className="fill-current translate-x-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center border-4 border-dashed rounded-[3rem] border-slate-100 dark:border-slate-800">
                                                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <BookOpen className={`w-12 h-12 opacity-30 ${textMain}`} />
                                                </div>
                                                <h3 className={`text-2xl font-black ${textMain} mb-2`}>ابدأ رحلة التميز</h3>
                                                <p className={`text-base font-bold ${muted} max-w-sm mx-auto`}>لا يوجد لديك دورات حالياً. اكتشف مئات المسارات التعليمية بانتظارك!</p>
                                                <button onClick={() => navigate('/courses')} className="mt-8 px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">تصفح الدورات الآن 🚀</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Submissions */}
                                <div className={`${cardBg} rounded-[3.5rem] border-2 p-10 shadow-luxury`}>
                                    <h2 className={`text-2xl font-black ${textMain} flex items-center gap-4 mb-10 text-violet-500`}>
                                        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                                            <Upload size={24} />
                                        </div>
                                        آخر الإنجازات المرسلة
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {submissions.length > 0 ? (
                                            submissions.map((sub) => (
                                                <div key={sub.id} className={`p-6 rounded-[2.5rem] border-2 transition-all ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl'}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex-1">
                                                            <h4 className={`text-sm font-black ${textMain}`}>{sub.lessonTitle}</h4>
                                                            <p className={`text-[10px] font-bold ${muted}`}>{sub.courseTitle}</p>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black ${statusConfig[sub.status.toLowerCase()]?.color || 'bg-slate-500/10 text-slate-500'}`}>
                                                            {statusConfig[sub.status.toLowerCase()]?.label || sub.status}
                                                        </div>
                                                    </div>
                                                    {sub.professorFeedback && (
                                                        <div className={`p-4 rounded-2xl border-2 ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-black/5'} flex gap-3`}>
                                                            <MessageSquare size={14} className="text-secondary flex-shrink-0" />
                                                            <p className={`text-[10px] font-bold leading-relaxed ${textMain} line-clamp-2`}>{sub.professorFeedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-16 text-center border-2 border-dashed rounded-[3rem] border-violet-500/10">
                                                <p className={`text-sm font-black ${muted}`}>لم ترسل أي أعمال بعد. أبدع وشاركنا أول ملف لك! 🎨</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Side Widgets */}
                            <div className="space-y-10">
                                {/* Fast Labs */}
                                <div className={`${cardBg} rounded-[3.5rem] border-2 p-8 shadow-luxury`}>
                                    <h2 className={`text-xl font-black ${textMain} flex items-center gap-3 mb-8 text-emerald-500`}>
                                        <FlaskConical size={24} /> المحاكيات السريعة
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {quickLabs.map((lab) => (
                                            <Link key={lab.id} to={`/lab/${lab.id}`}
                                                className={`group bg-gradient-to-br ${lab.color} rounded-[2rem] p-6 text-white shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}>
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                                                <div className="flex items-center gap-5 relative z-10">
                                                    <span className="text-4xl group-hover:rotate-12 transition-transform duration-500">{lab.emoji}</span>
                                                    <div>
                                                        <h3 className="font-black text-base mb-0.5">{lab.title}</h3>
                                                        <p className="text-white/70 text-[10px] font-bold">{lab.desc}</p>
                                                    </div>
                                                    <div className="mr-auto w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                        <ExternalLink size={16} />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Leaderboard Small */}
                                <div className={`${cardBg} rounded-[3.5rem] border-2 p-8 shadow-luxury`}>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className={`text-xl font-black ${textMain} flex items-center gap-3 text-amber-500`}>
                                            <TrendingUp size={24} /> الأبطال المتميزون
                                        </h2>
                                        <Link to="/leaderboard" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">الكل</Link>
                                    </div>
                                    <div className="space-y-4">
                                        {leaderboard.length > 0 ? (
                                            leaderboard.map((hero, idx) => (
                                                <div key={hero.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${idx === 0 ? 'bg-amber-500/10 border-amber-500/20 shadow-lg' : `${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl'}`}`}>
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-orange-400 text-white' : `${isDark ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400'}`}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                                                        {hero.avatar ? <img src={hero.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`font-black text-xs ${textMain} truncate w-24`}>{hero.name}</h3>
                                                        <p className={`text-[9px] font-bold ${muted}`}>المستوى {hero.level}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-black text-primary">{hero.xp.toLocaleString()}</div>
                                                        <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">XP</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-4 text-xs text-slate-500">جاري تحميل الأبطال...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Store Promo Widget */}
                                <Link to="/store" className="block">
                                    <div className={`${cardBg} rounded-[3.5rem] border-2 p-8 shadow-luxury group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 group-hover:scale-110 transition-transform duration-500">
                                                    <ShoppingBag size={28} className="text-white" />
                                                </div>
                                                <div>
                                                    <h2 className={`text-lg font-black ${textMain}`}>متجر سديم</h2>
                                                    <p className={`text-[10px] font-black ${muted} uppercase tracking-widest`}>SHOP</p>
                                                </div>
                                            </div>
                                            <p className={`text-sm font-bold ${muted} mb-6 leading-relaxed`}>اكتشف حقائب تعليمية، كتب، وأدوات تقنية لرحلتك 🚀</p>
                                            <div className="flex items-center gap-2 text-amber-500 font-black text-sm group-hover:gap-4 transition-all">
                                                تصفح المتجر <ChevronLeft size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'competitions' && (
                    <StudentCompetitionsTab />
                )}

                {activeTab === 'courses' && (
                    <StudentCoursesTab />
                )}

                {activeTab === 'submissions' && (
                    <StudentSubmissionsTab />
                )}

                {activeTab === 'labs' && (
                    <div className="space-y-12">
                        {activeLabId === '3d-lab' ? (
                            <div className="space-y-8 animate-premium-in">
                                <button onClick={() => setActiveLabId(null)} className="flex items-center gap-2 text-primary font-black hover:translate-x-[-4px] transition-transform">
                                    <ChevronLeft size={20} /> العودة لجميع المختبرات
                                </button>
                                <VRComputerLab />
                            </div>
                        ) : activeLabId === 'arduino-lab' ? (
                            <div className="space-y-8 animate-premium-in">
                                <button onClick={() => setActiveLabId(null)} className="flex items-center gap-2 text-primary font-black hover:translate-x-[-4px] transition-transform">
                                    <ChevronLeft size={20} /> العودة لجميع المختبرات
                                </button>
                                <VRArduinoLab />
                            </div>
                        ) : (
                            <StudentLabsTab onLabSelect={(id: string) => setActiveLabId(id)} />
                        )}
                    </div>
                )}

                {activeTab === 'store' && (
                    <StudentStoreTab />
                )}

                {activeTab === 'leaderboard' && (
                    <StudentLeaderboardTab />
                )}

                {activeTab === 'community' && (
                    <StudentCommunityTab />
                )}

                {activeTab === 'messages' && (
                    <MessagesTab />
                )}

                {activeTab === 'subscription' && (
                    <SubscriptionPage />
                )}

                {activeTab === 'chatcoddy' && (
                    <AiAssistant />
                )}

                {activeTab === 'settings' && (
                    <StudentSettingsTab />
                )}
                </div>
            )}

            {/* ════ CODY CHATBOT ════ */}
            <div className="fixed bottom-10 left-10 z-50">
                {chatOpen && (
                    <div className={`absolute bottom-24 left-0 w-80 sm:w-96 ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} rounded-[3rem] shadow-premium border-4 backdrop-blur-2xl overflow-hidden animate-premium-in`}>
                        <div className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-shimmer p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner"><Brain className="w-6 h-6 text-white" /></div>
                                <div>
                                    <div className="font-black text-white text-base">مساعدك كودي 🤖</div>
                                    <div className="text-white/70 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-glow" />متصل الآن</div>
                                </div>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition text-white"><X size={20} /></button>
                        </div>
                        <div className={`h-[400px] overflow-y-auto p-6 space-y-4 ${isDark ? 'bg-transparent' : 'bg-slate-50/50'}`}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-lg ${msg.role === 'cody' ? 'bg-gradient-to-br from-primary to-secondary text-white' : `${isDark ? 'bg-slate-800' : 'bg-white border-2 border-slate-100'}`}`}>
                                        {msg.role === 'cody' ? '🤖' : '👤'}
                                    </div>
                                    <div className={`max-w-[80%] px-5 py-4 rounded-3xl text-sm font-bold shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : `${isDark ? 'bg-slate-800 text-slate-200 border border-slate-700/50' : 'bg-white border-2 border-slate-100 text-slate-800'} rounded-tl-sm`}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className={`p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['كيف أبدأ؟', 'مكافآت XP؟'].map(q => (
                                    <button key={q} onClick={() => sendMessage(q)} className="text-[10px] font-black bg-primary/5 text-primary px-4 py-2 rounded-xl hover:bg-primary/10 transition uppercase tracking-widest border border-primary/20">{q}</button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="اكتب سؤالك بذكاء..."
                                    className={`flex-1 px-6 py-4 ${isDark ? 'bg-slate-800 text-slate-100 placeholder-slate-500' : 'bg-slate-100 text-slate-800 placeholder-slate-400'} rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-primary/30 transition-all`} />
                                <button onClick={() => sendMessage()} className="w-14 h-14 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center">
                                    <Send size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={() => setActiveTab('chatcoddy')}
                    className="w-20 h-20 bg-gradient-to-br from-primary via-secondary to-primary bg-[length:200%_auto] animate-shimmer rounded-full shadow-luxury-deep flex items-center justify-center hover:scale-110 active:scale-90 transition-all group relative">
                    <img src="/moscot.png" alt="Cody" className="w-12 h-12 object-contain group-hover:rotate-12 transition-transform drop-shadow-lg" />
                    <span className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full text-white text-xs font-black flex items-center justify-center border-4 border-white dark:border-[#0d1117] animate-pulse">AI</span>
                </button>
            </div>

            {isVerifyingPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-2xl bg-[#0b0f19]/90">
                    <div className="bg-slate-900 border border-slate-700/50 shadow-2xl rounded-[3rem] p-12 text-center max-w-lg animate-premium-in">
                        <div className="w-24 h-24 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-xl shadow-yellow-500/10" />
                        <Crown size={48} className="text-yellow-400 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-2xl font-black text-white mb-4">جاري تفعيل اشتراكك VIP...</h2>
                        <p className="text-slate-300 font-medium leading-relaxed">
                            نحن نقوم بالتحقق من نجاح عملية الدفع وتفعيل حسابك بالتعاون مع بوابة الدفع. يرجى الانتظار ثوانٍ قليلة ولا تغلق هذه الصفحة. 🚀
                        </p>
                    </div>
                </div>
            )}

            {verificationError && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-2xl bg-[#0b0f19]/80" dir="rtl">
                    <div className="bg-slate-900 border border-red-500/30 shadow-2xl rounded-[3rem] p-12 text-center max-w-lg relative animate-premium-in">
                        <button onClick={() => setVerificationError(null)} className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 bg-slate-800 rounded-xl transition"><X size={20} /></button>
                        <AlertCircle size={64} className="text-amber-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-white mb-4">حالة الاشتراك</h2>
                        <p className="text-slate-300 font-medium leading-relaxed mb-8">
                            {verificationError}
                        </p>
                        <button onClick={() => setVerificationError(null)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-transform">
                            حسناً، فهمت
                        </button>
                    </div>
                </div>
            )}

            <CertificateModal 
                isOpen={certModalOpen} 
                onClose={() => setCertModalOpen(false)} 
                studentName={certData.studentName} 
                courseName={certData.courseName} 
                completedAt={certData.completedAt} 
            />
        </DashboardLayout>
    );
}
