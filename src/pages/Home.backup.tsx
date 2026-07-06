import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronRight, Sparkles, Rocket, BookOpen,
    Gamepad2, ShieldCheck, Globe, Code, Trophy,
    Palette, Brain, Cpu, Clock, Star
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';

/* ───────────────── Floating 3D Particle ───────────────── */
function Particle({ delay = 0, x = 0, size = 8, color = '#6366f1', duration = 8 }) {
    return (
        <div
            className="absolute rounded-full opacity-60 pointer-events-none"
            style={{
                width: size,
                height: size,
                left: `${x}%`,
                bottom: '0%',
                backgroundColor: color,
                animation: `particleDrift ${duration}s ease-out ${delay}s infinite`,
                '--tx': `${(Math.random() - 0.5) * 100}px`,
                '--ty': `-${150 + Math.random() * 200}px`,
            } as React.CSSProperties}
        />
    );
}

/* ───────────────── 3D Floating Badge ───────────────── */
function FloatingBadge({ emoji, label, sublabel, className = '', delay = '0s' }: {
    emoji: string; label: string; sublabel: string; className?: string; delay?: string;
}) {
    const { isDark } = useTheme();
    return (
        <div
            className={`absolute ${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-white/80'} backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-float border ${className}`}
            style={{ animationDelay: delay }}
        >
            <div className={`w-14 h-14 ${isDark ? 'bg-slate-700' : 'bg-white'} rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>{emoji}</div>
            <div>
                <div className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</div>
                <div className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sublabel}</div>
            </div>
        </div>
    );
}

/* ───────────────── 3D Hero Visual ───────────────── */
function HeroVisual() {
    const { isDark } = useTheme();
    return (
        <div className="relative lg:pl-12 group" style={{ perspective: '1200px' }}>
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/20 blur-[120px] rounded-full" />

            {/* 3D Main Card */}
            <div
                className={`relative ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/50'} p-6 rounded-[5rem] shadow-luxury border-2 animate-float-3d`}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className={`${isDark ? 'bg-slate-900' : 'bg-surface'} rounded-[4rem] overflow-hidden aspect-[4/3] flex items-center justify-center border-4 ${isDark ? 'border-slate-700' : 'border-white'}`}>
                    {/* Code animation visual */}
                    <div className="p-8 w-full space-y-4">
                        <div className={`flex items-center gap-2 mb-6`}>
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <div className={`flex-1 h-5 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full mr-3`} />
                        </div>
                        {[
                            { indent: 0, text: 'def create_hero():', color: 'text-purple-400', width: '60%' },
                            { indent: 1, text: '  name = "أنت" 🦸', color: 'text-green-400', width: '50%' },
                            { indent: 1, text: '  skills = ["Python", "Scratch"]', color: 'text-blue-400', width: '75%' },
                            { indent: 1, text: '  xp = 2450  # 🚀', color: 'text-yellow-400', width: '45%' },
                            { indent: 1, text: '  return Hero(name, skills)', color: 'text-pink-400', width: '65%' },
                        ].map((line, i) => (
                            <div key={i} className="flex items-center gap-2" style={{ animationDelay: `${i * 0.2}s` }}>
                                <span className={`text-slate-500 text-xs w-4 font-mono`}>{i + 1}</span>
                                <div
                                    className={`h-5 rounded-full ${line.color} bg-current opacity-70 shimmer-overlay`}
                                    style={{ width: line.width, paddingRight: line.indent * 16 }}
                                />
                            </div>
                        ))}
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-2 h-5 bg-primary rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Badges */}
            <FloatingBadge emoji="⭐" label="نظام XP" sublabel="تعلم واربح الجوائز" className="-top-16 -right-8" delay="0s" />
            <FloatingBadge emoji="🤖" label="مساعد Cody" sublabel="رفيقك في كل سطر كود" className="-bottom-14 -left-8" delay="2s" />

            {/* Orbiting dots */}
            <div className="absolute inset-0 pointer-events-none">
                {[0, 1, 2].map(i => (
                    <div key={i} className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-4 h-4 rounded-full bg-primary/40 border border-primary/60"
                            style={{ animation: `orbitRotate ${6 + i * 2}s linear ${i * 1.5}s infinite` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    const { isDark } = useTheme();
    const base = isDark
        ? 'bg-slate-900 text-slate-100'
        : 'bg-surface text-foreground';

    const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
    
    useEffect(() => {
        api.get('/courses/public').then(res => {
            // Take up to 6 latest published courses
            setFeaturedCourses(res.data.slice(0, 6));
        }).catch(console.error);
    }, []);

    const courseGradients = [
        'from-indigo-500 to-purple-600',
        'from-yellow-500 to-orange-600',
        'from-blue-600 to-indigo-700',
        'from-emerald-500 to-teal-600',
        'from-red-500 to-rose-600',
        'from-cyan-500 to-blue-600'
    ];
    
    // For decorative icons behind the card
    const courseIcons = [Palette, Code, Brain, Cpu, Gamepad2, Globe];

    const particles = Array.from({ length: 12 }, (_, i) => ({
        delay: i * 0.7,
        x: (i * 8) + 4,
        size: 6 + (i % 4) * 4,
        color: ['#6366f1', '#8b5cf6', '#f43f5e', '#f59e0b'][i % 4],
        duration: 6 + (i % 3) * 2,
    }));

    return (
        <div className={`min-h-screen ${base} flex flex-col font-cairo dir-rtl text-right overflow-x-hidden transition-colors duration-300 space-stars-bg`}>
            <Header />

            {/* ══════ HERO ══════ */}
            <header className={`relative pt-[160px] pb-[120px] overflow-hidden ${isDark ? 'dark-mesh-bg' : 'hero-gradient mesh-bg'}`}>
                {/* Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {particles.map((p, i) => <Particle key={i} {...p} />)}
                </div>

                {/* Big ambient blobs */}
                <div className={`absolute top-0 right-0 w-[900px] h-[900px] ${isDark ? 'bg-primary/10' : 'bg-primary/5'} rounded-full -mr-80 -mt-80 animate-pulse-slow -z-10`} />
                <div className={`absolute bottom-0 left-0 w-[700px] h-[700px] ${isDark ? 'bg-secondary/10' : 'bg-secondary/5'} rounded-full -ml-40 -mb-40 animate-pulse-slow [animation-delay:2s] -z-10`} />

                <div className="max-w-[1400px] mx-auto px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-12"
                        >
                            {/* Badge */}
                            <div className={`inline-flex items-center gap-3 px-6 py-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-border/30'} shadow-premium rounded-full text-primary font-black text-sm border`}>
                                <Sparkles size={16} />
                                <span className="tracking-widest uppercase">مستقبل البرمجة يبدأ من هنا</span>
                            </div>

                            {/* Headline */}
                            <div className="space-y-6">
                                <h1 className="text-[4.5rem] md:text-[6.5rem] font-black leading-[1.05] tracking-tight">
                                    ابنِ عالمك بلمسة
                                    <span className="block mt-2 text-gradient animate-gradient py-3">
                                        إبـداع وكـود
                                    </span>
                                </h1>
                                <p className={`text-2xl ${isDark ? 'text-slate-400' : 'text-foreground-muted'} font-bold leading-relaxed max-w-xl`}>
                                    المنصة التعليمية الأكثر ابتكاراً لتعليم الصغار لغات المستقبل بطريقة تجعلهم يعشقون التحدي.
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                <Link to="/signup"
                                    className="px-12 py-7 bg-gradient-to-r from-primary to-secondary text-white rounded-[3rem] font-black text-xl shadow-luxury hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    بدء الرحلة المجانية
                                    <ChevronRight size={28} />
                                </Link>
                                <Link to="/courses"
                                    className={`px-12 py-7 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700' : 'glass text-foreground border-border hover:bg-white'} rounded-[3rem] font-black text-xl border-2 transition-all flex items-center justify-center gap-3`}>
                                    <BookOpen size={28} />
                                    اكتشاف المسارات
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className={`flex items-center gap-12 pt-10 border-t ${isDark ? 'border-slate-700' : 'border-border/50'}`}>
                                {[
                                    { label: 'درس تفاعلي', val: '50+' },
                                    { label: 'طالب متميز', val: '10k+' },
                                    { label: 'مسارات', val: '15+' }
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="text-4xl font-black text-primary">{stat.val}</div>
                                        <div className={`text-base font-bold ${isDark ? 'text-slate-400' : 'text-foreground-muted'}`}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <HeroVisual />
                    </div>
                </div>
            </header>

            {/* ══════ WHY US ══════ */}
            <section className={`py-[140px] ${isDark ? 'bg-slate-900' : 'bg-white'} relative overflow-hidden`}>
                <div className="max-w-[1400px] mx-auto px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center space-y-6 mb-32"
                    >
                        <span className="text-primary font-black uppercase tracking-widest text-sm">مميزات المنصة</span>
                        <h2 className="text-6xl font-black">لماذا منصة سديم (Sadeem) هي الأفضل؟</h2>
                        <p className={`text-2xl ${isDark ? 'text-slate-400' : 'text-foreground-muted'} font-bold max-w-3xl mx-auto leading-relaxed`}>
                            بنينا المنصة لتكون رحلة مغامرة، وليس مجرد دروس جافة.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[
                            { icon: Gamepad2, title: 'تعلم باللعب', desc: 'حولنا البرمجة إلى مهمات وألعاب تزيد من حماس طفلك.', gradient: 'from-indigo-500 to-purple-600' },
                            { icon: Brain, title: 'ذكاء اصطناعي', desc: 'تبسيط أعقد مفاهيم التقنية لعقول الصغار المبدعة.', gradient: 'from-purple-500 to-pink-600' },
                            { icon: ShieldCheck, title: 'بيئة آمنة', desc: 'محتوى تعليمي مراقب 100% ومصمم لتنمية الشخصية.', gradient: 'from-emerald-500 to-teal-600' },
                            { icon: Globe, title: 'مختبرات تفاعلية', desc: 'تطبيق عملي فوري لأي سطر كود دون أي تعقيد تقني.', gradient: 'from-blue-500 to-cyan-600' }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div key={i}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className={`group ${isDark ? 'bg-slate-800 border-slate-700 hover:border-primary/50' : 'bg-surface hover:bg-white hover:shadow-premium border-transparent hover:border-border'} p-10 rounded-[4rem] transition-all duration-500 border-2 card-3d`}
                                >
                                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-8 text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                                        <Icon size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                                    <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-foreground-muted'} font-bold leading-relaxed`}>{item.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════ COURSES ══════ */}
            <section className={`py-[140px] ${isDark ? 'bg-slate-800' : 'bg-surface'} relative overflow-hidden`}>
                <div className="max-w-[1400px] mx-auto px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-32 gap-8">
                        <div className="space-y-4 text-center md:text-right">
                            <span className="text-primary font-black uppercase tracking-widest text-sm">اكتشف مواهبك</span>
                            <h2 className="text-6xl font-black">مسارات تعليمية متميزة</h2>
                        </div>
                        <Link to="/courses"
                            className={`px-10 py-5 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 hover:border-primary' : 'glass border-border text-foreground hover:bg-white hover:border-primary'} border-2 font-black text-xl rounded-[2rem] transition-all flex items-center gap-3`}>
                            كل المسارات
                            <ChevronRight size={24} />
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-16">
                        {featuredCourses.length > 0 ? featuredCourses.map((course, i) => {
                            const grad = courseGradients[i % courseGradients.length];
                            const CIcon = courseIcons[i % courseIcons.length];
                            // Parse level string into simpler form
                            const lvl = course.level === 'مبتدئ' ? 'المستوى الأول' : course.level === 'متوسط' ? 'المستوى المتوسط' : 'المستوى المتقدم';
                            
                            return (
                                <motion.div key={course.id} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className={`group relative bg-gradient-to-br ${grad} p-[3px] rounded-[5rem] shadow-luxury hover:-translate-y-6 transition-all duration-700`}
                                >
                                    <div className={`${isDark ? 'bg-slate-800/90' : 'bg-white/10'} backdrop-blur-md rounded-[4.8rem] p-10 text-white h-full space-y-8 flex flex-col`}>
                                        <div className="flex items-start justify-between">
                                            <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center border border-white/30 overflow-hidden">
                                                <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover rounded-[1.5rem]" />
                                            </div>
                                            <span className="bg-white/20 px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-1 backdrop-blur-sm">
                                                <Star size={14} className="text-yellow-300" /> {lvl}
                                            </span>
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <h3 className="text-3xl font-black">{course.title}</h3>
                                            <p className="text-lg font-bold opacity-90 leading-relaxed line-clamp-3">{course.description}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold border border-white/20">
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                {course.category?.name || 'تصنيف عام'}
                                            </span>
                                            <span className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-bold border border-white/20">
                                                <Clock size={14} />
                                                {course.duration} دقيقة
                                            </span>
                                        </div>
                                        <Link to={`/course-info/${course.id}`}
                                            className="block w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xl text-center hover:scale-105 transition shadow-xl mt-auto relative z-20">
                                            عرض التفاصيل
                                        </Link>
                                    </div>
                                    <div className="absolute right-[-8%] bottom-[-4%] opacity-[0.08] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                        <CIcon size={300} />
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="col-span-3 text-center py-20">
                                <span className={`text-2xl font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>جاري تحميل المسارات الرائعة...</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════ CTA ══════ */}
            <section className={`py-[140px] ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                <div className="max-w-[1400px] mx-auto px-8">
                    <div className="bg-gradient-to-tr from-primary to-secondary p-[3px] rounded-[5rem] shadow-luxury overflow-hidden">
                        <div className="bg-white/10 backdrop-blur-2xl p-20 rounded-[4.8rem] flex flex-col lg:flex-row items-center gap-24 text-white">
                            <div className="lg:w-1/2 space-y-10 text-center lg:text-right">
                                <h2 className="text-[4rem] font-black leading-[1.1]">هل أنت مستعد <br />لتصبح بطلاً؟</h2>
                                <p className="text-2xl font-bold opacity-90 max-w-lg">انضم لتجمع الأبطال، شارك مشاريعك، وحقق مراكز متقدمة في لوحة الشرف.</p>
                                <Link to="/signup"
                                    className="inline-block px-14 py-7 bg-white text-primary rounded-[2.5rem] font-black text-xl shadow-luxury hover:scale-105 transition-all">
                                    سجل الآن - مجاناً
                                </Link>
                            </div>
                            <div className="lg:w-1/2 grid grid-cols-2 gap-8">
                                {[
                                    { label: 'ساعة تدريب', val: '50k', icon: Rocket },
                                    { label: 'مشاريع منفذة', val: '15k', icon: Code },
                                    { label: 'دولة مشاركة', val: '22', icon: Globe },
                                    { label: 'جائزة كبرى', val: '120', icon: Trophy }
                                ].map((stat, i) => {
                                    const SIcon = stat.icon;
                                    return (
                                        <div key={i} className="p-8 glass rounded-[3rem] text-center space-y-3 border border-white/20 hover:scale-105 transition-transform">
                                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                                                <SIcon size={28} />
                                            </div>
                                            <div className="text-4xl font-black">{stat.val}</div>
                                            <div className="text-sm font-bold opacity-80 uppercase tracking-widest">{stat.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
