import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronRight, BookOpen, PlayCircle, FileText,
    FlaskConical, HelpCircle, CheckCircle2, CheckCircle,
    Menu, Upload, ExternalLink,
    Clock, Send, Eye, AlertCircle, ChevronLeft, Sparkles, Rocket, Zap,
    MessageSquare, Code2, Link
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

interface QcmQuestion {
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correct: 'A' | 'B' | 'C' | 'D';
    explanation: string;
}

interface Lesson {
    id: string;
    title_ar: string;
    title_en?: string;
    content_ar?: string;
    video_url?: string;
    youtube_url?: string;
    lab_url?: string;
    guide_content?: string;
    extra_qcm?: QcmQuestion[];
    lesson_type: string;
    xp_reward: number;
    order_index?: number;
    pdf_url?: string;
}

interface Course {
    id: string;
    title_ar: string;
    lessons: Lesson[];
    category: { name_ar: string; slug: string; icon?: string };
}

interface Submission {
    id: string;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected';
    professorFeedback?: string;
    submittedAt: string;
    fileName: string;
}

// ─── Environment Config per Course Category ───────────────────────────────────
interface EnvConfig {
    label: string;
    emoji: string;
    embedUrl: string;
    color: string;
    note?: string;
}

const CATEGORY_ENVIRONMENTS: Record<string, EnvConfig> = {
    python: {
        label: 'Python – Trinket',
        emoji: '🐍',
        embedUrl: 'https://trinket.io/embed/python3#code=# أهلاً! اكتب كودك هنا\nprint("مرحباً بالعالم!")',
        color: 'from-green-500 to-emerald-600',
        note: 'بيئة بايثون تعمل مباشرة في المتصفح'
    },
    scratch: {
        label: 'Scratch – MIT',
        emoji: '🎮',
        embedUrl: 'https://scratch.mit.edu/projects/editor/?tutorial=getStarted',
        color: 'from-orange-400 to-yellow-500',
        note: 'محرر Scratch الرسمي — تحتاج تسجيل الدخول في Scratch لحفظ العمل'
    },
    pictoblox: {
        label: 'PictoBlox',
        emoji: '🤖',
        embedUrl: 'https://ide.pictoblox.ai/',
        color: 'from-purple-500 to-indigo-600',
        note: 'بيئة PictoBlox لبرمجة الروبوتات بالبلوكات وبايثون'
    },
    arduino: {
        label: 'Arduino – Wokwi',
        emoji: '⚡',
        embedUrl: 'https://wokwi.com/projects/new/arduino-uno',
        color: 'from-blue-500 to-cyan-500',
        note: 'محاكي أردوينو Wokwi — ارسم الدوائر وابرمج مباشرة'
    },
    robotics: {
        label: 'Arduino – Wokwi',
        emoji: '🔧',
        embedUrl: 'https://wokwi.com/projects/new/arduino-uno',
        color: 'from-blue-600 to-indigo-600',
        note: 'محاكي Wokwi للروبوتات والإلكترونيات'
    },
    'app-dev': {
        label: 'MIT App Inventor',
        emoji: '📱',
        embedUrl: 'https://appinventor.mit.edu/olla/',
        color: 'from-pink-500 to-rose-500',
        note: 'بناء تطبيقات أندرويد بدون كود'
    },
    'web-dev': {
        label: 'StackBlitz',
        emoji: '🌐',
        embedUrl: 'https://stackblitz.com/fork/web?file=index.html',
        color: 'from-violet-500 to-purple-600',
        note: 'بيئة HTML/CSS/JS متكاملة في المتصفح'
    },
    ai: {
        label: 'Python – Trinket AI',
        emoji: '🧠',
        embedUrl: 'https://trinket.io/embed/python3#code=# مرحباً بعالم الذكاء الاصطناعي!\nprint("AI Lab")',
        color: 'from-red-500 to-orange-500',
        note: 'بيئة برمجة للذكاء الاصطناعي'
    },
};

const DEFAULT_ENV: EnvConfig = {
    label: 'بيئة البرمجة',
    emoji: '💻',
    embedUrl: 'https://trinket.io/embed/python3',
    color: 'from-slate-500 to-slate-600',
    note: 'بيئة برمجة عامة'
};

function getEnvConfig(categorySlug: string, customLabUrl?: string): EnvConfig & { url: string } {
    const base = CATEGORY_ENVIRONMENTS[categorySlug] || DEFAULT_ENV;
    return { ...base, url: customLabUrl || base.embedUrl };
}

export default function CourseViewer() {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { user } = useAuthStore();

    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'path' | 'lesson'>('path');
    const [activeLessonTab, setActiveLessonTab] = useState<'video' | 'guide' | 'pdf' | 'lab' | 'quiz' | 'submit'>('video');
    const [stats, setStats] = useState<{
        total_xp: number;
        current_streak: number;
        rank: number;
        completed_lessons_count: number;
    } | null>(null);

    // Submission state
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [submissionDesc, setSubmissionDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
    const [loadingSub, setLoadingSub] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // QCM state
    const [qcmStarted, setQcmStarted] = useState(false);
    const [qcmCurrentIdx, setQcmCurrentIdx] = useState(0);
    const [qcmAnswers, setQcmAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
    const [qcmFinished, setQcmFinished] = useState(false);
    const [qcmScore, setQcmScore] = useState(0);

    // Lesson completed celebration
    const [justCompleted, setJustCompleted] = useState(false);

    const hasQcm = activeLesson?.extra_qcm && Array.isArray(activeLesson.extra_qcm) && activeLesson.extra_qcm.length > 0;
    const questions: QcmQuestion[] = hasQcm ? (activeLesson!.extra_qcm as QcmQuestion[]) : [];

    const envConfig = course ? getEnvConfig(course.category?.slug, activeLesson?.lab_url || undefined) : null;

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const [resC, resL, resP] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/lessons/course/${courseId}`),
                    api.get(`/lessons/course/${courseId}/progress`)
                ]);
                const courseData = { ...resC.data, lessons: resL.data };
                setCourse(courseData);
                setCompletedLessons(new Set(resP.data));

                if (resL.data.length > 0) {
                    const firstUncompleted = resL.data.find((l: any) => !resP.data.includes(l.id));
                    setActiveLesson(firstUncompleted || resL.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch course', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
        fetchStats();
    }, [courseId]);

    useEffect(() => {
        if (!activeLesson || !user) return;
        setCurrentSubmission(null);
        setSubmissionFile(null);
        setSubmissionUrl('');
        setSubmissionDesc('');
        setJustCompleted(false);
        resetQcm();

        const fetchSubmission = async () => {
            try {
                setLoadingSub(true);
                const profileRes = await api.get('/auth/me');
                const studentId = profileRes.data.studentProfile?.id;
                if (!studentId) return;
                const res = await api.get(`/submissions/student/${studentId}/lesson/${activeLesson.id}`);
                if (res.data.submission) setCurrentSubmission(res.data.submission);
            } catch (err) {
                console.error('Failed to fetch submission', err);
            } finally {
                setLoadingSub(false);
            }
        };
        fetchSubmission();

        if (activeLesson.youtube_url || activeLesson.video_url) setActiveLessonTab('video');
        else if (activeLesson.guide_content || activeLesson.content_ar) setActiveLessonTab('guide');
        else if (activeLesson.lab_url || course?.category?.slug) setActiveLessonTab('lab');
        else if (hasQcm) setActiveLessonTab('quiz');
        else setActiveLessonTab('submit');
    }, [activeLesson?.id]);

    const resetQcm = () => {
        setQcmStarted(false);
        setQcmCurrentIdx(0);
        setQcmAnswers({});
        setQcmFinished(false);
        setQcmScore(0);
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/gamification/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const handleManualComplete = async () => {
        if (!activeLesson || submitting) return;
        try {
            setSubmitting(true);
            const res = await api.post(`/lessons/${activeLesson.id}/complete`);
            setCompletedLessons(prev => new Set([...prev, activeLesson.id]));
            setJustCompleted(true);
            await fetchStats();
            await useAuthStore.getState().refreshUser();

            // Fire global event so dashboard stats auto-refresh
            window.dispatchEvent(new CustomEvent('lesson-completed', {
                detail: {
                    lessonId: activeLesson.id,
                    xpAwarded: res.data.xpAwarded,
                    leveledUp: res.data.leveledUp,
                    newLevel: res.data.newLevel,
                    newStreak: res.data.newStreak,
                    courseCompleted: res.data.courseCompleted,
                }
            }));

            if (res.data.leveledUp) {
                window.dispatchEvent(new CustomEvent('show-confetti'));
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Failed to complete lesson', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleQcmAnswer = (opt: 'A' | 'B' | 'C' | 'D') => {
        const questions = activeLesson?.extra_qcm || [];
        setQcmAnswers(prev => ({ ...prev, [qcmCurrentIdx]: opt }));
        if (qcmCurrentIdx < questions.length - 1) {
            setTimeout(() => setQcmCurrentIdx(i => i + 1), 500);
        } else {
            const correct = questions.reduce((acc, q, i) => {
                return acc + (({ ...qcmAnswers, [qcmCurrentIdx]: opt }[i] === q.correct) ? 1 : 0);
            }, 0);
            setQcmScore(correct);
            setTimeout(() => setQcmFinished(true), 500);
            if (correct / questions.length >= 0.7) {
                setCompletedLessons(prev => new Set([...prev, activeLesson!.id]));
                api.post(`/lessons/${activeLesson!.id}/complete`).then((res) => {
                    fetchStats();
                    useAuthStore.getState().refreshUser();
                    window.dispatchEvent(new CustomEvent('lesson-completed', {
                        detail: { lessonId: activeLesson!.id, xpAwarded: res.data.xpAwarded, leveledUp: res.data.leveledUp }
                    }));
                    if (res.data.leveledUp) window.dispatchEvent(new CustomEvent('show-confetti'));
                }).catch(err => console.error('Failed to award XP', err));
            }
        }
    };

    const handleSubmitWork = async () => {
        if ((!submissionFile && !submissionUrl) || !activeLesson || !user) return;
        try {
            setSubmitting(true);
            const profileRes = await api.get('/auth/me');
            const studentId = profileRes.data.studentProfile?.id;
            if (!studentId) return;

            const formData = new FormData();
            if (submissionFile) formData.append('file', submissionFile);
            formData.append('lessonId', activeLesson.id);
            formData.append('lessonRefId', String(activeLesson.order_index ?? 1));
            formData.append('courseSlug', course?.category?.slug || 'general');
            formData.append('submissionType', submissionUrl ? 'link' : 'lab-result');
            if (submissionUrl) formData.append('submissionUrl', submissionUrl);
            if (submissionDesc) formData.append('description', submissionDesc);

            const res = await api.post(`/submissions/upload/${studentId}`, formData);
            if (res.data.success) {
                setCurrentSubmission(res.data.submission);
                setSubmissionFile(null);
                setSubmissionUrl('');
                setSubmissionDesc('');
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse" dir="rtl">جاري تحميل المغامرة...</p>
        </div>
    );

    if (!course) return <div className="h-screen flex items-center justify-center text-slate-500">مغامرة غير موجودة</div>;

    const bg = isDark ? 'bg-[#0d1117]' : 'bg-surface';
    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100';
    const sidebarBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const inputBg = isDark ? 'bg-slate-900 border-[#30363d] text-white' : 'bg-slate-50 border-slate-100 text-slate-800';

    const getYoutubeId = (url?: string) => {
        if (!url) return null;
        const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        return m && m[2].length === 11 ? m[2] : null;
    };

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        pending: { label: 'في انتظار المراجعة ⏳', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
        reviewing: { label: 'يتم فحصه الآن 🧐', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Eye },
        approved: { label: 'عمل رائع! تم القبول ✅', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
        rejected: { label: 'يحتاج لبعض التعديل ✏️', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: AlertCircle },
    };

    const getLessonIcon = (lesson: Lesson) => {
        if (lesson.youtube_url || lesson.video_url) return '🎬';
        if (lesson.lab_url) return '🧪';
        const hasQ = lesson.extra_qcm && Array.isArray(lesson.extra_qcm) && lesson.extra_qcm.length > 0;
        if (hasQ) return '🎯';
        return '📖';
    };

    const getXOffset = (index: number) => Math.sin(index * 1.2) * 120;

    const LearningPathSVG = ({ lessons }: { lessons: Lesson[] }) => {
        if (lessons.length < 2) return null;
        const spacing = 128;
        const width = 400;
        const centerX = width / 2;
        let pathD = `M ${centerX + getXOffset(0)} 0`;
        for (let i = 1; i < lessons.length; i++) {
            const x = centerX + getXOffset(i);
            const y = i * spacing;
            const prevX = centerX + getXOffset(i - 1);
            const prevY = (i - 1) * spacing;
            const cp1Y = prevY + spacing / 2;
            const cp2Y = prevY + spacing / 2;
            pathD += ` C ${prevX} ${cp1Y}, ${x} ${cp2Y}, ${x} ${y}`;
        }
        return (
            <svg className="absolute top-16 pointer-events-none overflow-visible" width={width} height={(lessons.length - 1) * spacing}>
                <path d={pathD} fill="none" stroke={isDark ? '#30363d' : '#e2e8f0'} strokeWidth="16" strokeLinecap="round" />
                <path d={pathD} fill="none" stroke={isDark ? '#21262d' : '#f1f5f9'} strokeWidth="8" strokeLinecap="round" />
            </svg>
        );
    };

    return (
        <div className={`h-screen flex flex-col ${bg} transition-colors duration-500`} dir="rtl">
            {/* HEADER */}
            <header className={`${sidebarBg} border-b px-8 py-4 flex items-center justify-between z-50 shrink-0 backdrop-blur-2xl bg-opacity-90 sticky top-0`}>
                <div className="flex items-center gap-6">
                    <button onClick={() => viewMode === 'lesson' ? setViewMode('path') : navigate('/student-dashboard')}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm overflow-hidden active:translate-y-1`}>
                        <ChevronRight size={28} />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{course.category?.icon || '⭐'}</span>
                            <h1 className={`text-xl font-black tracking-tight ${textMain} truncate max-w-[200px]`}>{course.title_ar}</h1>
                        </div>
                        <div className="w-48 h-3 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
                                style={{ width: `${(completedLessons.size / course.lessons.length) * 100}%` }} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-6 bg-slate-100 dark:bg-slate-800/50 px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⭐</span>
                                <span className="text-base font-black text-amber-500">{stats?.total_xp || 0}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">نقاط الإبداع</span>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-300 dark:bg-slate-700" />
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xl animate-pulse">🔥</span>
                                <span className="text-base font-black text-orange-500">{stats?.current_streak || 0}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">أيام التعلم</span>
                        </div>
                    </div>

                    <button onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${sidebarOpen ? 'bg-primary text-white shadow-premium border-primary scale-105' : `${sidebarBg} text-slate-500 hover:border-primary/40`}`}>
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* SIDEBAR */}
                <aside className={`${sidebarBg} border-l transition-all duration-500 overflow-hidden flex flex-col shrink-0 z-40 ${sidebarOpen ? 'w-96' : 'w-0 shadow-none'}`}>
                    <div className={`p-8 border-b ${isDark ? 'border-[#30363d]' : 'border-slate-100'} flex items-center justify-between shrink-0`}>
                        <h3 className={`font-black text-lg ${textMain}`}>🏁 خارطة الطريق</h3>
                        <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">{course.lessons.length} محطات</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {course.lessons.map((lesson, idx) => {
                            const isActive = activeLesson?.id === lesson.id;
                            const isDone = completedLessons.has(lesson.id);
                            const isUnlocked = idx === 0 || completedLessons.has(course.lessons[idx - 1].id);
                            const Icon = getLessonIcon(lesson);
                            return (
                                <button key={lesson.id} disabled={!isUnlocked} onClick={() => isUnlocked && setActiveLesson(lesson)}
                                    className={`w-full p-5 rounded-[2rem] border-2 transition-all flex items-start gap-4 text-right group relative overflow-hidden ${isActive
                                        ? 'bg-gradient-to-br from-primary to-secondary border-primary text-white shadow-xl scale-[1.02]'
                                        : !isUnlocked ? 'opacity-40 grayscale cursor-not-allowed border-dashed' : `${isDark ? 'border-slate-800 bg-[#1c2128]/50 hover:bg-[#1c2128]' : 'border-slate-100 bg-white hover:shadow-lg'}`
                                    }`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all ${isActive ? 'bg-white/20 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        <span className="text-2xl">{!isUnlocked ? '🔒' : isDone && !isActive ? '✅' : Icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className={`text-base font-black truncate leading-tight ${isActive ? 'text-white' : textMain}`}>{idx + 1}. {lesson.title_ar}</div>
                                        <div className={`text-xs mt-1.5 flex items-center gap-2 font-bold ${isActive ? 'text-white/80' : muted}`}>
                                            <Zap size={12} className={isActive ? 'text-white/80' : 'text-primary'} />
                                            <span>+{lesson.xp_reward} XP</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto bg-mesh-bg dark:bg-dark-mesh-bg scroll-smooth">
                    <div className="max-w-5xl mx-auto p-10 md:p-14 space-y-20 pb-40">
                        {viewMode === 'path' ? (
                            <div className="py-20 flex flex-col items-center">
                                <div className="relative mb-24 text-center">
                                    <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-[3rem] shadow-premium relative overflow-hidden group">
                                        <h2 className={`text-5xl font-black text-white mb-2 tracking-tighter`}>{course.category?.icon || '⭐'} {'خطتك اليوم!'}</h2>
                                        <p className="text-white/80 text-xl font-bold">{course.title_ar}</p>
                                    </div>
                                </div>
                                <div className="space-y-32 w-full max-w-lg relative flex flex-col items-center">
                                    <LearningPathSVG lessons={course.lessons} />
                                    {course.lessons.map((lesson, idx) => {
                                        const isDone = completedLessons.has(lesson.id);
                                        const isCurrent = !isDone && (idx === 0 || completedLessons.has(course.lessons[idx - 1].id));
                                        const isLocked = !isDone && !isCurrent;
                                        const emojiIcon = getLessonIcon(lesson);
                                        const xOffset = getXOffset(idx);
                                        return (
                                            <div key={lesson.id} className="relative w-full flex justify-center h-32" style={{ transform: `translateX(${xOffset}px)` }}>
                                                <div className="relative">
                                                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-premium border-2 border-slate-100 dark:border-slate-700 whitespace-nowrap z-40 transition-all ${isLocked ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
                                                        <p className={`font-black text-xs ${textMain} flex items-center gap-2`}>
                                                            <span className="text-secondary">#{idx + 1}</span> {lesson.title_ar}
                                                        </p>
                                                    </div>
                                                    <button disabled={isLocked} onClick={() => { setActiveLesson(lesson); setViewMode('lesson'); }}
                                                        className={`group relative w-24 h-24 rounded-full border-b-[10px] transition-all transform hover:scale-110 active:translate-y-2 active:border-b-[2px] flex items-center justify-center shadow-2xl
                                                            ${isDone ? 'bg-emerald-500 border-emerald-700 text-white' : isCurrent ? 'bg-primary border-blue-600 text-white ring-8 ring-primary/20 animate-pulse-ring' : 'bg-slate-300 border-slate-400 text-slate-500 opacity-60 cursor-not-allowed'}
                                                        `}>
                                                        <span className={`text-4xl relative z-10 transition-transform ${isCurrent ? 'scale-110' : ''}`}>{emojiIcon}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="pt-20 text-center uppercase">
                                        <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center border-4 border-dashed border-primary/20 p-8 shadow-inner overflow-hidden">
                                            <div className="text-[120px] filter drop-shadow-2xl animate-float">🤖</div>
                                        </div>
                                        <h3 className={`text-3xl font-black ${textMain}`}>أنت بطل حقيقي! 🏆</h3>
                                        <p className={`${muted} text-xl font-bold`}>أكمل كل المحطات لتحصل على وسام التميز</p>
                                    </div>
                                </div>
                            </div>
                        ) : activeLesson ? (
                            <>
                                <div className="animate-premium-in space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20">
                                            <Rocket size={16} className="text-secondary" />
                                            <span className="text-[11px] font-black text-secondary tracking-widest uppercase">المحطة #{course.lessons.findIndex(l => l.id === activeLesson.id) + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                                            <Zap size={16} className="text-primary" />
                                            <span className="text-[11px] font-black text-primary tracking-widest uppercase">+{activeLesson.xp_reward} XP</span>
                                        </div>
                                        {envConfig && (
                                            <div className={`flex items-center gap-1.5 bg-gradient-to-r ${envConfig.color} px-4 py-1.5 rounded-full`}>
                                                <Code2 size={14} className="text-white" />
                                                <span className="text-[11px] font-black text-white tracking-widest">{envConfig.emoji} {envConfig.label}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h2 className={`text-5xl md:text-6xl font-black tracking-tight leading-tight ${textMain} drop-shadow-sm`}>{activeLesson.title_ar}</h2>
                                    {completedLessons.has(activeLesson.id) && (
                                        <div className="flex items-center gap-2 text-emerald-500 font-black text-lg bg-emerald-500/5 w-fit px-6 py-2 rounded-2xl border border-emerald-500/10">
                                            <CheckCircle size={24} /> أحسنت! المحطة مكتملة
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 mt-12 bg-slate-100 dark:bg-slate-800/40 p-3 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 w-fit">
                                        {[
                                            { id: 'video', label: 'الدرس (فيديو)', icon: PlayCircle, enabled: !!(activeLesson.youtube_url || activeLesson.video_url) },
                                            { id: 'guide', label: 'الشرح (دليل)', icon: FileText, enabled: !!(activeLesson.guide_content || activeLesson.content_ar) },
                                            { id: 'pdf', label: 'كمرجع (PDF)', icon: FileText, enabled: !!activeLesson.pdf_url },
                                            { id: 'lab', label: 'المختبر (Lab)', icon: FlaskConical, enabled: true },
                                            { id: 'quiz', label: 'التحدي (Quiz)', icon: HelpCircle, enabled: hasQcm },
                                            { id: 'submit', label: 'المهمة (Task)', icon: Send, enabled: true },
                                        ].map(tab => (
                                            <button key={tab.id} disabled={!tab.enabled} onClick={() => setActiveLessonTab(tab.id as any)}
                                                className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] font-black text-lg transition-all duration-300 ${activeLessonTab === tab.id
                                                    ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 scale-105'
                                                    : tab.enabled ? `${textMain} hover:bg-white dark:hover:bg-slate-700 opacity-60 hover:opacity-100` : 'opacity-20 cursor-not-allowed'
                                                }`}>
                                                <tab.icon size={22} /> {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {activeLessonTab === 'video' && (activeLesson.youtube_url || activeLesson.video_url) && (
                                    <section className="space-y-8 animate-premium-in w-full">
                                        <div className="text-center space-y-4">
                                            <h3 className={`font-black text-4xl md:text-5xl ${textMain}`}>🎥 وقت المشاهدة الممتع</h3>
                                            <p className={`text-xl font-bold ${muted}`}>شاهد وانطلق بخيالك في عالم البرمجة</p>
                                        </div>
                                        <div className={`rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl ${cardBg} aspect-video relative w-full`}>
                                            {activeLesson.youtube_url ? (
                                                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYoutubeId(activeLesson.youtube_url)}?rel=0&modestbranding=1&autoplay=0`}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                            ) : (
                                                <video src={activeLesson.video_url} controls className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    </section>
                                )}

                                {activeLessonTab === 'guide' && (activeLesson.content_ar || activeLesson.guide_content) && (
                                    <section className="flex flex-col gap-16 animate-premium-in">
                                        {activeLesson.content_ar && (
                                            <div className={`p-12 md:p-16 rounded-[4rem] border-2 shadow-luxury ${cardBg} relative overflow-hidden w-full`}>
                                                <div className="text-center mb-12">
                                                    <h3 className="text-4xl font-black text-primary mb-2">📖 الحكاية البرمجية</h3>
                                                </div>
                                                <div className={`prose max-w-none font-bold leading-relaxed ${textMain} text-2xl space-y-6 text-center`}
                                                    dangerouslySetInnerHTML={{ __html: activeLesson.content_ar }} />
                                            </div>
                                        )}
                                        {activeLesson.guide_content && (
                                            <div className={`p-12 md:p-16 rounded-[4rem] border-2 shadow-luxury ${cardBg} w-full`}>
                                                <div className="text-center mb-16">
                                                    <h3 className={`font-black text-4xl md:text-5xl ${textMain} mb-4`}>🚀 انطلق خطوة بخطوة</h3>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    {activeLesson.guide_content.split('\n').filter(l => l.trim()).map((line, i) => (
                                                        <div key={i} className={`flex gap-6 items-start p-8 rounded-[3rem] border-2 transition-all ${isDark ? 'bg-slate-900 border-slate-700/50 hover:border-secondary' : 'bg-white border-slate-100 hover:shadow-premium'}`}>
                                                            <span className="w-14 h-14 rounded-3xl bg-secondary text-white flex items-center justify-center shrink-0 text-2xl font-black">{i + 1}</span>
                                                            <p className={`text-xl ${textMain} font-black leading-relaxed pt-3`}>{line}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                )}

                                {activeLessonTab === 'pdf' && activeLesson.pdf_url && (
                                    <section className="space-y-8 animate-premium-in w-full">
                                        <div className="flex items-center justify-between p-6 rounded-[2.5rem] bg-indigo-500 shadow-xl border-b-[6px] border-indigo-700">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                                                    <FileText size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-2xl text-white">دليل المشروع (PDF)</h3>
                                                    <p className="text-white/80 text-sm font-bold">يمكنك قراءة الدليل هنا أو تحميله</p>
                                                </div>
                                            </div>
                                            <a href={activeLesson.pdf_url} target="_blank" rel="noopener noreferrer" download
                                                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg hover:scale-105 active:scale-95">
                                                <Upload size={18} className="rotate-180" /> تحميل الملف
                                            </a>
                                        </div>

                                        <div className={`rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl w-full bg-slate-100 dark:bg-slate-900`}
                                            style={{ height: '80vh', minHeight: '600px' }}>
                                            <iframe
                                                src={`${activeLesson.pdf_url}#toolbar=1&navpanes=0&scrollbar=1`}
                                                className="w-full h-full border-none"
                                                title="PDF Guide"
                                            />
                                        </div>
                                    </section>
                                )}

                                {/* ═══ LAB TAB — Smart Embedded Environment ═══ */}
                                {activeLessonTab === 'lab' && envConfig && (
                                    <section className="space-y-8 animate-premium-in w-full">
                                        {/* Environment Header */}
                                        <div className={`flex items-center justify-between p-6 rounded-[2.5rem] bg-gradient-to-r ${envConfig.color} shadow-xl`}>
                                            <div className="flex items-center gap-4">
                                                <span className="text-5xl">{envConfig.emoji}</span>
                                                <div>
                                                    <h3 className="font-black text-2xl text-white">{envConfig.label}</h3>
                                                    {envConfig.note && <p className="text-white/80 text-sm font-bold">{envConfig.note}</p>}
                                                </div>
                                            </div>
                                            <a href={envConfig.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all border border-white/30">
                                                <ExternalLink size={18} /> فتح في تبويب جديد
                                            </a>
                                        </div>

                                        {/* Embedded IDE */}
                                        <div className={`rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl w-full`}
                                            style={{ height: '75vh', minHeight: '560px' }}>
                                            <iframe
                                                src={envConfig.url}
                                                className="w-full h-full border-none"
                                                allow="clipboard-write; clipboard-read; microphone; camera; accelerometer; gyroscope"
                                                allowFullScreen
                                                title={envConfig.label}
                                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                                            />
                                        </div>
                                    </section>
                                )}

                                {activeLessonTab === 'submit' && (
                                    <div className="space-y-20 animate-premium-in">
                                        <section className="space-y-8">
                                            <div className="text-center space-y-4">
                                                <h3 className={`font-black text-4xl md:text-5xl ${textMain}`}>🏆 أرِنا إبداعك</h3>
                                            </div>
                                            {!loadingSub && currentSubmission && (
                                                <div className={`p-10 rounded-[3.5rem] border-2 ${statusConfig[currentSubmission.status].color}`}>
                                                    <div className="flex items-center justify-between mb-6">
                                                        <span className="font-black text-2xl">{statusConfig[currentSubmission.status].label}</span>
                                                    </div>
                                                    {currentSubmission.professorFeedback && (
                                                        <div className="p-8 rounded-[2.5rem] border-2 shadow-inner bg-white/20">
                                                            <p className="font-black mb-3 flex items-center gap-2">رسالة من أستاذك:</p>
                                                            <p className="text-xl font-bold">{currentSubmission.professorFeedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {!loadingSub && (!currentSubmission || currentSubmission.status === 'rejected') && (
                                                <div className={`p-12 rounded-[4rem] border-2 shadow-luxury ${cardBg}`}>
                                                    {/* File upload */}
                                                    <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed rounded-[3rem] p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
                                                        <input ref={fileInputRef} type="file" className="hidden" onChange={e => setSubmissionFile(e.target.files?.[0] || null)} />
                                                        {submissionFile ? (
                                                            <p className="font-black text-2xl">{submissionFile.name}</p>
                                                        ) : (
                                                            <><Upload size={48} className="mx-auto mb-4 text-slate-400" /><p className="font-black text-xl text-slate-500">اسحب ملف إنجازك هنا</p><p className="text-sm text-slate-400 mt-2">صور، ملفات Scratch (.sb3)، أو أي ملف</p></>
                                                        )}
                                                    </div>

                                                    {/* OR divider */}
                                                    <div className="flex items-center gap-4 my-6">
                                                        <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700" />
                                                        <span className="text-sm font-black text-slate-400">أو أرسل رابطاً</span>
                                                        <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700" />
                                                    </div>

                                                    {/* Link submission */}
                                                    <div className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] border-2 ${inputBg} mb-6`}>
                                                        <Link size={20} className="text-primary shrink-0" />
                                                        <input
                                                            type="url"
                                                            value={submissionUrl}
                                                            onChange={e => setSubmissionUrl(e.target.value)}
                                                            placeholder="مثال: https://scratch.mit.edu/projects/... أو رابط Wokwi"
                                                            className="flex-1 bg-transparent outline-none font-bold text-base"
                                                        />
                                                    </div>

                                                    <textarea value={submissionDesc} onChange={e => setSubmissionDesc(e.target.value)} placeholder="صف لنا روعة عملك..."
                                                        className={`w-full p-8 rounded-[2.5rem] border-2 outline-none h-32 ${inputBg}`} />
                                                    <button onClick={handleSubmitWork} disabled={(!submissionFile && !submissionUrl) || submitting}
                                                        className="mt-8 w-full py-7 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-xl disabled:opacity-40">
                                                        {submitting ? 'جاري الإرسال...' : 'أرسل إنجازي الآن 🚀'}
                                                    </button>
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                )}

                                {activeLessonTab === 'quiz' && (
                                    <div className="space-y-20 animate-premium-in">
                                        {hasQcm && !qcmFinished && (
                                            <section className="space-y-8">
                                                <div className="text-center mb-10">
                                                    <h3 className={`font-black text-4xl ${textMain}`}>🎯 اختبار الأبطال</h3>
                                                </div>
                                                <div className={`p-12 md:p-16 rounded-[4rem] border-2 ${cardBg} shadow-luxury`}>
                                                    <h4 className="text-3xl font-black mb-10">{questions[qcmCurrentIdx].question}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {(['A', 'B', 'C', 'D'] as const).map(opt => (
                                                            <button key={opt} onClick={() => !qcmAnswers[qcmCurrentIdx] && handleQcmAnswer(opt)}
                                                                className={`p-8 rounded-[2.5rem] border-2 text-right font-black ${qcmAnswers[qcmCurrentIdx] === opt ? 'bg-amber-500/10 border-amber-500' : ''}`}>
                                                                {opt}. {questions[qcmCurrentIdx].options[opt]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {qcmFinished && (
                                            <div className="p-16 rounded-[4rem] border-2 text-center shadow-2xl bg-white dark:bg-slate-800">
                                                <h4 className="text-5xl font-black mb-6">{qcmScore / questions.length >= 0.7 ? 'انتصار رائع! 🎉' : 'حاول مرة أخرى! 🤖'}</h4>
                                                <p className="text-xl text-slate-500 font-bold mb-8">{qcmScore} / {questions.length} إجابة صحيحة</p>
                                                <button onClick={resetQcm} className="px-12 py-5 bg-slate-200 rounded-2xl font-black">إعادة التحدي 🔄</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* COMPLETION HUB */}
                                <div className="mt-20 pt-10 border-t-2 border-dashed border-slate-700/10 flex flex-col items-center animate-premium-in">
                                    {!completedLessons.has(activeLesson.id) ? (
                                        <button onClick={handleManualComplete} disabled={submitting}
                                            className="group relative px-20 py-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_auto] hover:bg-[100%_center] text-white rounded-[3rem] font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center gap-4">
                                            {submitting ? 'جارٍ الحفظ...' : <>🎉 لقد أنهيت المحطة! اضغط للحصول على النقاط <CheckCircle size={32} /></>}
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-center gap-8 animate-premium-in">
                                            <div className={`flex items-center gap-5 text-emerald-500 font-black text-3xl px-12 py-6 rounded-[3rem] border-2 border-emerald-500/10 shadow-luxury ${justCompleted ? 'bg-emerald-500/10 animate-pulse' : 'bg-emerald-500/5'}`}>
                                                <CheckCircle size={36} className="text-emerald-500" /> تم إكمال هذه المحطة بنجاح!
                                            </div>
                                            {course.lessons.findIndex(l => l.id === activeLesson.id) < course.lessons.length - 1 && (
                                                <button onClick={() => {
                                                    const idx = course.lessons.findIndex(l => l.id === activeLesson.id);
                                                    setActiveLesson(course.lessons[idx + 1]);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }} className="px-14 py-6 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-105 flex items-center gap-4">
                                                    المحطة التالية <ChevronLeft size={28} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                                <BookOpen size={64} className="text-primary mb-6" />
                                <h3 className={`text-5xl font-black ${textMain} mb-6`}>جاهز لبدء مغامرتك؟ ✨</h3>
                                <p className={`${muted} text-2xl font-bold max-w-lg`}>اختر محطة من القائمة الجانبية لتبدأ رحلتك!</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
