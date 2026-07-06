import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    Search, BookOpen, Star, PlayCircle,
    Sparkles, Clock, Target, Trophy, Filter, Rocket
} from 'lucide-react';
import api, { BASE_URL } from '../../lib/api';
import StatsHeader from './StatsHeader';

interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    imageUrl: string;
    duration: number;
    xpReward: number;
    category: { name: string; slug: string };
    isEnrolled: boolean;
    teacher: { full_name: string; avatar?: string };
}

export default function StudentCoursesTab() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/courses');
                setCourses(res.data);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleEnroll = async (courseId: string) => {
        try {
            await api.post(`/courses/${courseId}/enroll`);
            setCourses(courses.map(c => c.id === courseId ? { ...c, isEnrolled: true } : c));
        } catch (error: any) {
            console.error("Failed to enroll:", error);
            alert(error.response?.data?.error || "فشل التسجيل في الدورة. حاول مرة أخرى.");
        }
    };

    const handleContinue = (course: Course) => {
        navigate(`/course-viewer/${course.id}`);
    };

    const filteredCourses = courses.filter(c => {
        const matchesSearch = (c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filter === 'all' || c.category.slug === filter;
        return matchesSearch && matchesFilter;
    });

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100';

    const categories = [
        { id: 'all', label: 'الكل', icon: Sparkles },
        { id: 'scratch', label: 'سكراتش', icon: BookOpen },
        { id: 'python', label: 'بايثون', icon: Target },
        { id: 'ai', label: 'ذكاء اصطناعي', icon: Trophy },
        { id: 'robotics', label: 'روبوتات', icon: Filter },
    ];

    const getImageUrl = (url: string | undefined | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return `${BASE_URL}${url}`;
        if (url.startsWith('uploads')) return `${BASE_URL}/${url}`;
        return url;
    };

    return (
        <div className="space-y-12 animate-premium-in" dir="rtl">
            <StatsHeader />
            
            {/* ══════ CATEGORIES ══════ */}
            <div className="flex flex-wrap items-center gap-4">
                {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-7 py-3.5 rounded-2xl font-black text-base transition-all flex items-center gap-3 border-2 active:scale-95 ${filter === cat.id
                                ? 'bg-primary border-primary text-white shadow-premium'
                                : `${isDark ? 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700' : 'border-slate-100 bg-white text-slate-500 hover:shadow-lg'}`
                                }`}
                        >
                            <Icon size={20} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* ══════ SEARCH ══════ */}
            <div className="relative max-w-4xl group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-[3rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
                <div className={`relative flex items-center rounded-[2.5rem] border-2 shadow-luxury transition-all ${isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white/90 border-slate-100'}`}>
                    <Search className={`absolute right-8 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} size={28} />
                    <input
                        type="text"
                        placeholder="ابحث عن دورة سحرية، مهارة جديدة، أو موضوع ممتع..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-20 py-7 rounded-[2.5rem] bg-transparent outline-none font-black text-xl placeholder-slate-400 focus:ring-0"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-8">
                    <div className="relative scale-150">
                        <div className="w-24 h-24 border-8 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
                    </div>
                    <p className="font-black text-3xl animate-pulse text-slate-500 tracking-tight">جاري تجهيز مغامرتك القادمة...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {filteredCourses.map((course, idx) => (
                        <div key={course.id}
                            className={`group relative ${cardBg} rounded-[4rem] border-2 overflow-hidden hover:-translate-y-6 transition-all duration-700 shadow-luxury flex flex-col hover:border-primary/30 opacity-0 animate-premium-in`}
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            {/* Course Visual */}
                            <div className="h-80 relative overflow-hidden bg-slate-100">
                                <div className="absolute inset-0 z-10 shimmer-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <img src={getImageUrl(course.imageUrl) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-all duration-700" />

                                {/* Badges */}
                                <div className="absolute top-8 right-8 flex flex-col gap-3">
                                    <div className="bg-primary/90 backdrop-blur-xl border-2 border-white/20 text-white px-6 py-3 rounded-2xl text-[11px] font-black shadow-2xl uppercase tracking-widest">
                                        {course.category?.name || 'عام'}
                                    </div>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white z-20">
                                    <div className="flex items-center gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-3xl rounded-[1.25rem] border-2 border-white/10 shadow-lg group-hover:border-primary/50 transition-colors">
                                        <Star size={18} className="text-yellow-400 fill-current" />
                                        <span className="text-base font-black">4.8</span>
                                    </div>
                                    <div className="flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-3xl rounded-[1.25rem] border-2 border-white/10 shadow-lg group-hover:border-secondary/50 transition-colors">
                                        <Clock size={18} className="text-emerald-400" />
                                        <span className="text-base font-black">{course.duration} دقيقة</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Content */}
                            <div className="p-10 flex-1 flex flex-col space-y-8 relative">
                                {/* Decorative Element */}
                                <div className="absolute -top-6 right-10 w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-premium border-2 border-primary/20 flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500 z-30">
                                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <Rocket size={18} />
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] uppercase tracking-[0.2em] font-black px-5 py-2 rounded-2xl border-2 shadow-sm ${course.level === 'متقدم' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                course.level === 'متوسط' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                }`}>
                                                {course.level}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border-2 border-primary/10">
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse-ring shadow-glow" />
                                            <span className="text-primary font-black text-lg tracking-tight">+{course.xpReward} XP</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black leading-tight group-hover:text-primary transition-colors duration-500 tracking-tighter">{course.title}</h3>
                                    <p className={`text-base font-bold line-clamp-2 leading-relaxed h-[3rem] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {course.description}
                                    </p>
                                </div>

                                {/* Teacher Info */}
                                <div className={`p-6 rounded-[2.5rem] border-2 transition-all duration-500 group-hover:scale-[1.02] ${isDark ? 'bg-slate-900/50 border-slate-800 group-hover:border-primary/30' : 'bg-slate-50 border-slate-100 hover:bg-white'} flex items-center gap-5 shadow-inner`}>
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary via-secondary to-accent p-0.5 shadow-premium animate-pulse-slow">
                                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[1.4rem] overflow-hidden flex items-center justify-center">
                                            {getImageUrl(course.teacher?.avatar) ? (
                                                <img src={getImageUrl(course.teacher.avatar)!} alt={course.teacher.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-black text-gradient">{(course.teacher?.full_name || 'أ').charAt(0)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>المدرب المعتمد</p>
                                        <p className="font-black text-lg">أ/ {course.teacher?.full_name || 'أستاذ خبير'}</p>
                                    </div>
                                </div>

                                <div className="pt-6 mt-auto">
                                    {course.isEnrolled ? (
                                        <button
                                            onClick={() => handleContinue(course)}
                                            className="w-full h-20 flex items-center justify-center gap-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_auto] hover:bg-[100%_center] text-white hover:scale-[1.05] active:scale-[0.95] rounded-[2.5rem] font-black text-2xl transition-all duration-700 shadow-2xl shadow-emerald-500/40 relative overflow-hidden group/btn"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-20 group-hover/btn:translate-y-0 transition-transform duration-500" />
                                            <PlayCircle size={32} className="relative z-10" /> <span className="relative z-10">استئناف التعلم</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/course-info/${course.id}`)}
                                            className="w-full h-20 flex items-center justify-center gap-4 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] hover:bg-[100%_center] text-white hover:scale-[1.05] active:scale-[0.95] rounded-[2.5rem] font-black text-2xl transition-all duration-700 shadow-2xl shadow-primary/40 relative overflow-hidden group/btn"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-20 group-hover/btn:translate-y-0 transition-transform duration-500" />
                                            <BookOpen size={32} className="relative z-10" /> <span className="relative z-10">عرض التفاصيل</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredCourses.length === 0 && (
                <div className={`${cardBg} rounded-[4rem] border-2 border-dashed p-40 text-center space-y-10 animate-premium-in`}>
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <BookOpen className="text-primary" size={64} />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-5xl font-black tracking-tight text-gradient">لم نعثر على هذا المسار بعد</h3>
                        <p className={`text-2xl font-bold max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            جرب البحث عن كلمات سحرية أخرى أو تصفح باقي التصنيفات المميزة التي بانتظارك.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
