import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Clock, BookOpen, Star, PlayCircle, ShieldCheck, 
    MonitorPlay, FileQuestion, Gamepad2, Layers, 
    ChevronLeft, Target, Rocket, Award, Lightbulb, User
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/api';

export default function CourseInfo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { isAuthenticated, user } = useAuthStore();
    
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // Fetch public data
                const res = await api.get(`/courses/public/${id}`);
                setCourse(res.data);
            } catch (error) {
                console.error("Failed to load course details:", error);
                navigate('/courses'); // redirect back if missing
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, navigate]);

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }

        if (user?.role !== 'STUDENT') {
            alert("فقط الطلاب يمكنهم الاشتراك في الدورات.");
            return;
        }

        try {
            setEnrolling(true);
            // Try to enroll
            await api.post(`/courses/${id}/enroll`);
            navigate(`/course-viewer/${id}`);
        } catch (error: any) {
            // If already enrolled (400), just go to the viewer
            if (error.response?.status === 400 || error.response?.data?.error?.includes('بالفعل')) {
                navigate(`/course-viewer/${id}`);
            } else {
                alert(error.response?.data?.error || "حدث خطأ أثناء الاشتراك.");
            }
        } finally {
            setEnrolling(false);
        }
    };

    const bgBase = isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
    const cardBg = isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100';
    const textMain = isDark ? 'text-white' : 'text-slate-900';
    const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-xl"></div>
                    <p className={`font-black text-2xl ${textMuted}`}>جاري استحضار الدورة التدريبية...</p>
                </div>
            </div>
        );
    }

    if (!course) return null;

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <MonitorPlay size={20} className="text-blue-500" />;
            case 'QUIZ': return <FileQuestion size={20} className="text-amber-500" />;
            case 'GAME': return <Gamepad2 size={20} className="text-purple-500" />;
            default: return <BookOpen size={20} className="text-emerald-500" />;
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-white'} selection:bg-indigo-500/30 dir-rtl text-right font-cairo`}>
            <Header />
            
            <div className="pt-20" />

            {/* Hero Section */}
            <div className={`relative px-6 py-20 lg:py-32 overflow-hidden ${isDark ? 'dark-mesh-bg' : 'hero-gradient mesh-bg'}`}>
                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-[1200px] mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 animate-premium-in">
                        <Link to="/courses" className={`inline-flex items-center gap-2 ${textMuted} hover:text-indigo-500 font-bold transition-colors shadow-sm bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-max`}>
                            <ChevronLeft size={18} /> العودة للمسارات
                        </Link>
                        
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-5 py-2 rounded-2xl font-black text-sm tracking-widest uppercase">
                                <Award size={18} /> {course.category?.name || 'تصنيف عام'}
                            </div>
                            <h1 className={`text-5xl lg:text-7xl font-black ${textMain} leading-[1.1]`}>
                                {course.title}
                            </h1>
                            <p className={`text-xl font-bold ${textMuted} leading-relaxed max-w-xl`}>
                                {course.description}
                            </p>
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <Star size={24} className="fill-current" />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black tracking-widest uppercase ${textMuted}`}>التقييم</p>
                                    <p className={`font-black text-lg ${textMain}`}>4.9/5.0</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black tracking-widest uppercase ${textMuted}`}>المدة المقدرة</p>
                                    <p className={`font-black text-lg ${textMain}`}>{course.duration} دقيقة</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black tracking-widest uppercase ${textMuted}`}>المستوى</p>
                                    <p className={`font-black text-lg ${textMain}`}>{course.difficulty}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ennroll CTA */}
                        <div className="pt-8">
                            <button 
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-[100%_center] text-white rounded-[2rem] font-black text-xl shadow-luxury hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-20 group-hover/btn:translate-y-0 transition-transform duration-500" />
                                {enrolling ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Rocket size={24} className="relative z-10" /> 
                                        <span className="relative z-10">{isAuthenticated ? 'ابدأ التعلم الآن' : 'سجل لدخول المسار مجاناً'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Course Thumbnail */}
                    <div className="relative animate-premium-in [animation-delay:0.2s]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[4rem] blur-[80px] opacity-40 animate-pulse-slow" />
                        <div className={`relative ${cardBg} p-4 rounded-[4rem] border-2 shadow-2xl`}>
                            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden relative group">
                                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white/50 shadow-2xl hover:scale-110 transition-transform">
                                        <PlayCircle size={48} className="fill-white/80" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className={`py-24 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} bg-transparent relative z-20`}>
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-3 gap-16">
                    
                    {/* Main Course Content */}
                    <div className="lg:col-span-2 space-y-16">
                        
                        {/* Objectives */}
                        {course.learningObjectives && course.learningObjectives.length > 0 && (
                            <div className={`p-10 rounded-[3rem] border shadow-sm relative overflow-hidden ${cardBg}`}>
                                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                                <h3 className={`text-3xl font-black ${textMain} mb-8 flex items-center gap-3 relative z-10`}>
                                    <Target className="text-emerald-500" size={32} /> ماذا ستتعلم في هذا المسار؟
                                </h3>
                                <ul className="grid sm:grid-cols-2 gap-4 relative z-10">
                                    {course.learningObjectives.map((obj: string, i: number) => (
                                        <li key={i} className={`flex items-start gap-4 p-4 rounded-2xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                                            <div className="mt-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm shrink-0">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <span className={`font-bold ${textMuted} leading-relaxed`}>{obj}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Syllabus */}
                        <div className="space-y-8">
                            <h3 className={`text-3xl font-black ${textMain} flex items-center gap-3`}>
                                <BookOpen className="text-indigo-500" size={32} /> المنهج الدراسي
                                <span className="text-sm bg-indigo-500/10 text-indigo-500 px-4 py-1.5 rounded-2xl mr-auto">{course.lessonsCount} دروس</span>
                            </h3>
                            
                            <div className={`rounded-[3rem] border overflow-hidden shadow-sm ${cardBg}`}>
                                {course.lessons.map((lesson: any, i: number) => (
                                    <div key={lesson.id} className={`p-6 flex items-center gap-6 group hover:bg-slate-500/5 transition-colors ${i !== course.lessons.length - 1 ? (isDark ? 'border-b border-slate-700/50' : 'border-b border-slate-100') : ''}`}>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                            {getLessonIcon(lesson.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest text-indigo-500`}>الدرس {lesson.order}</span>
                                            </div>
                                            <h4 className={`text-lg font-black ${textMain} tracking-tight`}>{lesson.title_ar}</h4>
                                        </div>
                                        <div className={`flex items-center gap-2 font-bold text-sm ${textMuted} bg-slate-500/10 px-4 py-2 rounded-2xl`}>
                                            <Clock size={14} /> {lesson.duration || 10} د
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-10">
                        
                        {/* Teacher Profile Widget */}
                        <div className={`p-8 rounded-[3rem] border shadow-sm sticky top-32 ${cardBg}`}>
                            <h3 className={`text-xl font-black ${textMain} mb-8 flex items-center gap-3`}>
                                <User className="text-primary" size={24} /> المدرب المعتمد
                            </h3>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shadow-luxury">
                                    <div className="w-full h-full bg-slate-900 rounded-[2.3rem] overflow-hidden flex items-center justify-center">
                                        {course.teacher.avatar ? (
                                            <img src={course.teacher.avatar} alt={course.teacher.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl text-white font-black">{course.teacher.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className={`text-2xl font-black ${textMain}`}>د. {course.teacher.name}</h4>
                                    <p className={`text-sm font-bold ${textMuted} mt-1`}>خبير تكنولوجيا ذكاء اصطناعي وبرمجة لصغار السن</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Course Facts */}
                        <div className={`p-8 rounded-[3rem] border shadow-sm ${bgBase}`}>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <MonitorPlay size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase text-slate-400">طريقة التعلم</p>
                                        <p className={`font-bold ${textMain}`}>فيديو، ألعاب محاكاة</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                        <Lightbulb size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase text-slate-400">لغة الدورة</p>
                                        <p className={`font-bold ${textMain}`}>عربية (مبسطة لغة الأطفال)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
