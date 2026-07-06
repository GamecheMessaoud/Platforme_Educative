import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ChevronRight, Sparkles, Rocket, BookOpen,
    Gamepad2, ShieldCheck, Globe, Code, Brain, Cpu
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

/* ───────────────── Bento Grid Components ───────────────── */

const BentoBox = ({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
    const { isDark } = useTheme();
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
            className={`relative overflow-hidden rounded-[2rem] p-8 ${
                isDark 
                ? 'bg-slate-800/80 border border-slate-700/50 hover:border-slate-600' 
                : 'bg-white/80 border border-indigo-50 hover:border-indigo-100 shadow-xl shadow-indigo-100/20'
            } backdrop-blur-xl transition-colors duration-500 group ${className}`}
        >
            {children}
        </motion.div>
    );
};

/* ───────────────── Main Home Component ───────────────── */

export default function Home() {
    const { isDark } = useTheme();
    const { user, isAuthenticated } = useAuthStore();
    const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
    
    // For Hero Parallax
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        api.get('/courses/public').then(res => {
            setFeaturedCourses(res.data.slice(0, 3)); // Only show top 3 for cleaner layout
        }).catch(console.error);
    }, []);

    const base = isDark ? 'bg-[#080914] text-slate-100' : 'bg-[#faf9fe] text-slate-900';

    const dashboardLink = user?.role === 'STUDENT' ? '/student-dashboard' :
                          user?.role === 'TEACHER' ? '/teacher-dashboard' :
                          (user?.role as string) === 'PARENT' ? '/parent-dashboard' :
                          user?.role === 'ADMIN' ? '/admin-dashboard' : '/courses';

    return (
        <div className={`min-h-screen ${base} flex flex-col font-cairo dir-rtl text-right overflow-x-hidden selection:bg-primary/30`}>
            <Header />

            {/* ══════ HERO — 2-Column Layout (matching screenshot) ══════ */}
            <section ref={heroRef} className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden">

                {/* Ambient background glows */}
                <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] rounded-full blur-[130px] -z-10 bg-purple-400/20" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full blur-[110px] -z-10 bg-pink-400/15" />
                <div className="absolute top-[30%] left-[30%] w-[30vw] h-[30vw] rounded-full blur-[100px] -z-10 bg-indigo-300/10" />

                <div className="max-w-[1280px] mx-auto px-6 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* ── RIGHT COLUMN: Text Content ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col items-end text-right space-y-7 order-1 lg:order-2"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6 }}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border self-end ${isDark ? 'bg-slate-800/60 border-slate-700 text-purple-300' : 'bg-white/70 border-purple-100 text-purple-600 shadow-sm'}`}
                            >
                                <Sparkles size={15} className="text-yellow-500" />
                                مستقبل البرمجة يبدأ من هنا
                            </motion.div>

                            {/* Main Heading */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.8, ease: 'easeOut' }}
                                className="text-[3.2rem] md:text-[4.5rem] lg:text-[5.2rem] font-black leading-[1.08] tracking-tight"
                            >
                                ابن عالمك<br />بلمسة{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#db2777] via-[#a855f7] to-[#7c3aed]">
                                    إبداع وكود
                                </span>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.7 }}
                                className={`text-lg md:text-xl font-semibold leading-relaxed max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                                المنصة التعليمية الأكثر ابتكاراً لتعليم الصغار لغات المستقبل بطريقة تجعلهم يعشقون التحدي.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35, duration: 0.7 }}
                                className="flex flex-row-reverse flex-wrap gap-4 pt-2"
                            >
                                <Link
                                    to={isAuthenticated ? dashboardLink : '/signup'}
                                    className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-l from-[#7c3aed] to-[#a855f7] text-white rounded-2xl font-black text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/30"
                                >
                                    <ChevronRight size={18} />
                                    {isAuthenticated ? 'لوحة القيادة' : 'بدء الرحلة المجانية'}
                                </Link>
                                <Link
                                    to="/courses"
                                    className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base transition-all border ${isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'}`}
                                >
                                    <BookOpen size={18} />
                                    اكتشاف المسارات
                                </Link>
                            </motion.div>

                            {/* Stats Row */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.7 }}
                                className={`flex flex-row-reverse gap-8 pt-4 border-t w-full ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}
                            >
                                {[
                                    { value: '+15', label: 'مسارات' },
                                    { value: '+10k', label: 'طالب متميز' },
                                    { value: '+50', label: 'درس تفاعلي' },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-right">
                                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#7c3aed] to-[#db2777]">{stat.value}</div>
                                        <div className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* ── LEFT COLUMN: Floating Code Editor Graphic ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -40, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                            className="relative flex items-center justify-center order-2 lg:order-1 py-10"
                        >
                            {/* Main Editor Card */}
                            <motion.div
                                animate={{ y: [0, -12, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className={`relative w-full max-w-[420px] rounded-[2.5rem] p-7 ${isDark ? 'bg-slate-800/80 border border-slate-700/60' : 'bg-white/80 border border-slate-100 shadow-2xl shadow-purple-200/40'} backdrop-blur-2xl`}
                            >
                                {/* macOS window dots */}
                                <div className="flex gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>

                                {/* Colorful code lines */}
                                <div className="space-y-3 pr-6">
                                    {[
                                        { color: 'from-violet-400 to-purple-500', w: 'w-[82%]', h: 'h-[14px]' },
                                        { color: 'from-emerald-400 to-teal-500', w: 'w-[62%]', h: 'h-[14px]' },
                                        { color: 'from-sky-400 to-blue-500', w: 'w-[72%]', h: 'h-[14px]' },
                                        { color: 'from-amber-400 to-orange-400', w: 'w-[52%]', h: 'h-[14px]' },
                                        { color: 'from-pink-400 to-rose-500', w: 'w-[67%]', h: 'h-[14px]' },
                                        { color: 'from-violet-300 to-indigo-400', w: 'w-[78%]', h: 'h-[10px]' },
                                        { color: 'from-teal-400 to-cyan-400', w: 'w-[55%]', h: 'h-[10px]' },
                                    ].map((line, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                                            className={`${line.h} ${line.w} rounded-full bg-gradient-to-r ${line.color} opacity-85`}
                                        />
                                    ))}
                                </div>

                                {/* Line numbers on the right */}
                                <div className="absolute right-5 top-[5rem] space-y-[13px]">
                                    {[1,2,3,4,5,6,7].map(n => (
                                        <div key={n} className={`text-[11px] font-mono leading-none ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>{n}</div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Floating Badge — Top Right: XP System */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                                className={`absolute -top-2 -right-2 lg:-right-6 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold shadow-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-purple-100 shadow-purple-100/50'}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg">
                                    ⭐
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>نظام XP</div>
                                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>تعلم واربح الجوائز</div>
                                </div>
                            </motion.div>

                            {/* Floating Badge — Bottom Left: Cody Assistant */}
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                                className={`absolute -bottom-2 -left-2 lg:-left-6 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold shadow-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-pink-100 shadow-pink-100/50'}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-lg">
                                    🤖
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>مساعد Cody</div>
                                    <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>رفيقك في كل سطر كود</div>
                                </div>
                            </motion.div>

                            {/* Decorative rotating rings */}
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute -bottom-8 right-10 w-6 h-6 rounded-full border-2 border-purple-400/30" />
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                                className="absolute -top-8 left-10 w-5 h-5 rounded-full border-2 border-pink-400/30" />
                            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-amber-400/60" />
                            <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-purple-400/50" />
                        </motion.div>

                    </div>
                </div>
            </section>


            {/* ══════ BENTO BOX UI (Features) ══════ */}
            <section className="py-32 relative z-20">
                <div className="max-w-[1200px] mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-20 space-y-4"
                    >
                        <h2 className="text-4xl md:text-5xl font-black">مصمم للابتكار. مبني للإبداع.</h2>
                        <p className={`text-xl font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>كل أداة يحتاجها طفلك ليتحول من مستهلك للتكنولوجيا إلى صانع لها.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Large Bento Box - AI Assistant */}
                        <BentoBox className="md:col-span-2 flex flex-col justify-between" delay={0.1}>
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                            <div className="z-10 w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                                <Brain size={32} />
                            </div>
                            <div className="z-10">
                                <h3 className="text-3xl font-black mb-3">المساعد الذكي (Cody)</h3>
                                <p className={`text-lg font-bold leading-relaxed max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    ذكاء اصطناعي مدمج في كل درس، يفهم كود الطالب ويشرح له الأخطاء خطوة بخطوة وكأنه معلم حقيقي جالس بجانبه.
                                </p>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute left-[-10%] bottom-[-20%] opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Code size={250} />
                            </div>
                        </BentoBox>

                        {/* Standard Bento Box - Gamification */}
                        <BentoBox className="flex flex-col justify-between" delay={0.2}>
                            <div className="z-10 w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-6">
                                <Gamepad2 size={28} />
                            </div>
                            <div className="z-10">
                                <h3 className="text-2xl font-black mb-3">تعلم باللعب</h3>
                                <p className={`font-bold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    نظام نقاط (XP)، شارات إنجاز، ومراحل سرية تجعل التعلم لعبة ممتعة وتنافسية.
                                </p>
                            </div>
                        </BentoBox>

                        {/* Standard Bento Box - Labs */}
                        <BentoBox className="flex flex-col justify-between" delay={0.3}>
                            <div className="z-10 w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                                <Cpu size={28} />
                            </div>
                            <div className="z-10">
                                <h3 className="text-2xl font-black mb-3">مختبرات سحابية</h3>
                                <p className={`font-bold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    برمج وشغل الأكواد فوراً من المتصفح دون الحاجة لتثبيت أي برامج معقدة.
                                </p>
                            </div>
                        </BentoBox>

                        {/* Large Bento Box - Safe Community */}
                        <BentoBox className="md:col-span-2 flex flex-col justify-between" delay={0.4}>
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent pointer-events-none" />
                            <div className="z-10 flex justify-between items-start">
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
                                    <ShieldCheck size={32} />
                                </div>
                                <Globe size={120} className="text-purple-500/5 group-hover:text-purple-500/10 transition-colors duration-500" />
                            </div>
                            <div className="z-10">
                                <h3 className="text-3xl font-black mb-3">مجتمع المبدعين الآمن</h3>
                                <p className={`text-lg font-bold leading-relaxed max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    بيئة اجتماعية مراقبة 100% تتيح للطلاب مشاركة مشاريعهم، وتقييم أعمال أصدقائهم، وتبادل الخبرات بأمان تام.
                                </p>
                            </div>
                        </BentoBox>
                    </div>
                </div>
            </section>

            {/* ══════ MINIMALIST COURSES ══════ */}
            <section className={`py-32 ${isDark ? 'bg-slate-900/50' : 'bg-indigo-50/30'}`}>
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-3"
                        >
                            <h2 className="text-4xl md:text-5xl font-black">رحلات تعلم منتقاة بعناية.</h2>
                            <p className={`text-xl font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>مسارات تغطي أحدث تقنيات العصر لتهيئة قادة المستقبل.</p>
                        </motion.div>
                        <Link to="/courses" className="text-primary font-black flex items-center gap-2 hover:gap-4 transition-all">
                            رؤية كل المسارات <ChevronRight size={20} />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {featuredCourses.length > 0 ? featuredCourses.map((course, i) => (
                            <motion.div 
                                key={course.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.15, duration: 0.6 }}
                            >
                                <Link to={`/course-info/${course.id}`} className="block group">
                                    <div className={`aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg shadow-slate-200/50'}`}>
                                        <img 
                                            src={course.imageUrl} 
                                            alt={course.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                            <span className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-black text-sm w-full text-center flex items-center justify-center gap-2">
                                                بدء المغامرة <ChevronRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 px-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-primary font-black text-sm bg-primary/10 px-3 py-1 rounded-lg">
                                                {course.category?.name || 'تكنولوجيا'}
                                            </span>
                                            <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {course.duration} دقيقة
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black group-hover:text-primary transition-colors">{course.title}</h3>
                                        <p className={`font-bold line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {course.description}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        )) : (
                            <div className="col-span-3 text-center py-10 opacity-50 font-bold">جاري تحميل المسارات...</div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════ CLEAN CTA ══════ */}
            <section className="py-40 relative overflow-hidden">
                <div className={`absolute inset-0 ${isDark ? 'bg-primary/5' : 'bg-primary/5'} -skew-y-3 transform origin-bottom-left`} />
                <div className="max-w-[800px] mx-auto px-6 relative z-10 text-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6">جاهز لإطلاق <br/> إبداعك؟</h2>
                        <p className={`text-2xl font-bold mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {isAuthenticated 
                                ? 'استمر في استكشاف المسارات وحقق المزيد من الإنجازات.'
                                : 'انضم لآلاف الأبطال الذين يصنعون المستقبل من خلال البرمجة والابتكار.'}
                        </p>
                        {isAuthenticated ? (
                            <Link to={dashboardLink} className="inline-flex items-center gap-3 px-12 py-6 bg-primary text-white rounded-full font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30">
                                لوحة القيادة <Rocket size={24} />
                            </Link>
                        ) : (
                            <Link to="/signup" className="inline-flex items-center gap-3 px-12 py-6 bg-primary text-white rounded-full font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30">
                                سجل الآن <Rocket size={24} />
                            </Link>
                        )}
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
