import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Mail, Lock, BookOpen,
    ArrowRight, ArrowLeft, Loader2,
    Rocket, ShieldCheck, Gamepad2,
    Zap, CheckCircle2, Moon, Sun, Star
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_CLIENT_ID = '42112194462-7mm91okcoiv5eni7o5mder3510fhs25t.apps.googleusercontent.com';

type Role = 'STUDENT' | 'TEACHER';

/* ─── Animated background steps 3D ─── */
function SignUpBg({ isDark }: { isDark: boolean }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-60 right-0 w-[600px] h-[600px] ${isDark ? 'bg-primary/12' : 'bg-primary/6'} rounded-full blur-[120px] animate-pulse-slow`} />
            <div className={`absolute -bottom-48 -left-20 w-[500px] h-[500px] ${isDark ? 'bg-secondary/12' : 'bg-secondary/6'} rounded-full blur-[120px] animate-pulse-slow [animation-delay:3s]`} />
            {/* Geometric shapes */}
            {[
                { top: '8%', right: '5%', w: 80, rotate: 15, color: isDark ? 'border-primary/20' : 'border-primary/10', delay: '0s' },
                { top: '55%', left: '3%', w: 60, rotate: -20, color: isDark ? 'border-secondary/20' : 'border-secondary/10', delay: '1.2s' },
                { bottom: '12%', right: '6%', w: 70, rotate: 30, color: isDark ? 'border-accent/20' : 'border-accent/10', delay: '2s' },
            ].map((s, i) => (
                <div key={i} className={`absolute border-4 ${s.color} rounded-3xl animate-float`}
                    style={{ top: s.top, right: (s as any).right, left: (s as any).left, bottom: (s as any).bottom, width: s.w, height: s.w, transform: `rotate(${s.rotate}deg)`, animationDelay: s.delay }} />
            ))}
        </div>
    );
}

export default function SignUp() {
    const navigate = useNavigate();
    const { register, socialLogin, isLoading } = useAuthStore();
    const { isDark, toggleTheme } = useTheme();

    const [step, setStep] = useState(1);
    const [role, setRole] = useState<Role>('STUDENT');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        setError(null);
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            (window as any).google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response: any) => {
                    try {
                        const payload = JSON.parse(atob(response.credential.split('.')[1]));
                        await socialLogin('google', payload.email, `${payload.given_name} ${payload.family_name}`);
                        navigate('/student-dashboard');
                    } catch (err: any) {
                        setError(err.message || 'فشل تسجيل الدخول عبر Google');
                    } finally {
                        setGoogleLoading(false);
                    }
                },
            });
            (window as any).google.accounts.id.prompt();
        };
        script.onerror = () => {
            setError('فشل تحميل Google Login');
            setGoogleLoading(false);
        };
        document.head.appendChild(script);
    };

    const handleNext = () => {
        if (step === 2) {
            if (!formData.name || !formData.email || !formData.password) { setError('يرجى إكمال جميع الحقول'); return; }
            if (formData.password !== formData.confirmPassword) { setError('كلمات المرور غير متطابقة'); return; }
        }
        setError(null);
        setStep(s => s + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const user = await register({
                full_name: formData.name,
                email: formData.email,
                password: formData.password,
                role, // Already uppercase: 'STUDENT' | 'TEACHER'
            });
            if (user && user.id) {
                if (user.role === 'TEACHER') navigate('/teacher-dashboard');
                else navigate('/student-dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إنشاء حسابك');
        }
    };

    const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-surface text-foreground';
    const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-border/30';
    const input = isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-primary/60'
        : 'bg-surface border-transparent focus:border-primary/30 focus:bg-white';
    const muted = isDark ? 'text-slate-400' : 'text-foreground-muted';

    const roleCards = [
        {
            id: 'STUDENT' as Role,
            title: 'البطل (طالب)',
            desc: 'تعلم البرمجة، اجمع نقاط XP، ونافس الأصدقاء.',
            icon: Gamepad2,
            gradient: 'from-indigo-500 to-purple-600',
            emoji: '🎓',
            perks: ['دروس تفاعلية', 'شارات إنجاز', 'مختبرات سحابية'],
        },
        {
            id: 'TEACHER' as Role,
            title: 'المرشد (معلم)',
            desc: 'اصنع دوراتك الخاصة وقد الجيل القادم للنجاح.',
            icon: BookOpen,
            gradient: 'from-emerald-500 to-teal-600',
            emoji: '👨‍🏫',
            perks: ['إنشاء دورات', 'تتبع الطلاب', 'تحليلات متقدمة'],
        },
        {
            id: 'PARENT' as Role,
            title: 'ولي الأمر',
            desc: 'تابع تطور طفلك وادعمه في رحلته التعليمية.',
            icon: User,
            gradient: 'from-orange-500 to-red-600',
            emoji: '👨‍👩‍👧',
            perks: ['تقارير الأداء', 'متابعة المهام', 'رسائل المعلمين'],
        },
    ];

    return (
        <div className={`min-h-screen ${bg} flex items-center justify-center p-8 font-cairo dir-rtl text-right overflow-x-hidden relative transition-colors duration-300`}>
            <SignUpBg isDark={isDark} />

            {/* Dark mode toggle */}
            <button onClick={toggleTheme}
                className={`fixed top-6 left-6 z-50 p-3 rounded-2xl ${isDark ? 'bg-slate-700 text-yellow-400' : 'bg-white text-slate-700'} shadow-xl border ${isDark ? 'border-slate-600' : 'border-border'} transition-all`}>
                {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <div className="max-w-[860px] w-full animate-premium-in relative z-10">
                {/* Branding */}
                <div className="text-center mb-12">
                    <Link to="/" className="inline-flex items-center gap-5 group mb-8">
                        <img src="/sadeem.png" alt="Sadeem Logo" className="h-16 w-auto object-contain drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all" />
                        <span className="text-4xl font-black text-gradient animate-gradient py-2">Sadeem | سديم</span>
                    </Link>
                    <h1 className="text-5xl font-black mb-3">ابدأ رحلة التميز</h1>
                    <p className={`text-xl ${muted} font-bold`}>صمم مستقبلك مع أفضل مبرمجي العالم الصغار.</p>
                </div>

                {/* Progress Stepper */}
                <div className="mb-12 px-8 relative">
                    <div className={`absolute top-1/2 left-0 w-full h-2 ${isDark ? 'bg-slate-700' : 'bg-border'} -translate-y-1/2 rounded-full`} />
                    <div className="absolute top-1/2 right-0 h-2 bg-gradient-to-l from-primary to-secondary -translate-y-1/2 transition-all duration-700 rounded-full shadow-premium"
                        style={{ width: `${(step - 1) * 50}%` }} />
                    <div className="flex justify-between items-center relative z-10">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex flex-col items-center gap-3">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg transition-all duration-500 border-4 ${step >= s ? 'bg-white text-primary border-primary shadow-primary/20' : `${isDark ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-surface text-foreground-muted border-border'}`}`}>
                                    {step > s ? <CheckCircle2 size={32} /> : s}
                                </div>
                                <span className={`text-sm font-black ${step >= s ? 'text-primary' : muted}`}>
                                    {s === 1 ? 'اختر دورك' : s === 2 ? 'بياناتك' : 'تأكيد'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Card */}
                <div className={`${card} p-16 rounded-[5rem] shadow-luxury border relative overflow-hidden`}>
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

                    {error && (
                        <div className="mb-8 p-5 bg-red-500/10 border-2 border-red-500/30 text-red-400 rounded-[2rem] flex items-center gap-4 font-bold text-lg">
                            <ShieldCheck size={28} />
                            {error}
                        </div>
                    )}

                    {/* STEP 1: Role Selection */}
                    {step === 1 && (
                        <div className="space-y-12 animate-premium-in">
                            <div className="text-center space-y-3">
                                <h2 className="text-3xl font-black">من أنت في عالم سديم؟</h2>
                                <p className={`text-lg ${muted} font-bold`}>كل دور يحمل مفاجآت ومسارات خاصة جداً.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                {roleCards.map(r => {
                                    const RIcon = r.icon;
                                    const isSelected = role === r.id;
                                    return (
                                        <button key={r.id} onClick={() => setRole(r.id)}
                                            className={`p-8 rounded-[3rem] border-[3px] transition-all text-right group relative overflow-hidden ${isSelected
                                                ? `border-transparent bg-gradient-to-br ${r.gradient} text-white shadow-luxury scale-105`
                                                : `${isDark ? 'border-slate-600 bg-slate-700/50 hover:border-slate-500' : 'border-transparent bg-surface hover:bg-white hover:border-border hover:shadow-premium'} hover:scale-102`}`}>
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all ${isSelected ? 'bg-white/20 border border-white/30' : `${isDark ? 'bg-slate-600' : 'bg-white'} group-hover:rotate-6`}`}>
                                                <RIcon size={32} className={isSelected ? 'text-white' : 'text-primary'} />
                                            </div>
                                            <div className="text-4xl mb-4">{r.emoji}</div>
                                            <h3 className="text-xl font-black mb-2">{r.title}</h3>
                                            <p className={`text-sm font-bold leading-relaxed mb-4 ${isSelected ? 'text-white/90' : muted}`}>{r.desc}</p>
                                            <div className="space-y-1">
                                                {r.perks.map(perk => (
                                                    <div key={perk} className={`flex items-center gap-2 text-xs font-bold ${isSelected ? 'text-white/80' : 'text-primary'}`}>
                                                        <Star size={10} className={isSelected ? 'text-yellow-300' : ''} fill="currentColor" />
                                                        {perk}
                                                    </div>
                                                ))}
                                            </div>
                                            {isSelected && <div className="absolute top-4 left-4"><CheckCircle2 size={24} className="text-white" /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={handleNext}
                                className="w-full py-7 bg-gradient-to-r from-primary to-secondary text-white rounded-[2.5rem] font-black text-2xl shadow-luxury hover:-translate-y-1 transition-all flex items-center justify-center gap-5">
                                الخطوة التالية
                                <ArrowLeft size={32} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Form */}
                    {step === 2 && (
                        <div className="space-y-10 animate-premium-in">
                            <div className="text-center space-y-3">
                                <h2 className="text-3xl font-black">معلومات ملفك الشخصي</h2>
                                <p className={`text-lg ${muted} font-bold`}>لنبدأ ببناء هويتك الرقمية كأحد أبطالنا.</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-foreground'} block`}>الاسم</label>
                                    <div className="relative group/field">
                                        <User className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within/field:text-primary transition-colors" size={22} />
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full pr-14 pl-5 py-5 ${input} rounded-[2rem] border-[2px] transition-all outline-none font-bold text-lg`}
                                            placeholder="كيف نلقبك يا بطل؟" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-foreground'} block`}>البريد الإلكتروني</label>
                                    <div className="relative group/field">
                                        <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within/field:text-primary transition-colors" size={22} />
                                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full pr-14 pl-5 py-5 ${input} rounded-[2rem] border-[2px] transition-all outline-none font-bold text-lg`}
                                            placeholder="name@future.com" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-foreground'} block`}>كلمة المرور</label>
                                        <div className="relative group/field">
                                            <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within/field:text-primary transition-colors" size={22} />
                                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full pr-14 pl-5 py-5 ${input} rounded-[2rem] border-[2px] transition-all outline-none font-bold text-lg`}
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-foreground'} block`}>تأكيد كلمة المرور</label>
                                        <div className="relative group/field">
                                            <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within/field:text-primary transition-colors" size={22} />
                                            <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className={`w-full pr-14 pl-5 py-5 ${input} rounded-[2rem] border-[2px] transition-all outline-none font-bold text-lg`}
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-6 pt-4">
                                <button onClick={() => setStep(1)} className={`w-[35%] py-6 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'glass text-foreground'} rounded-[2rem] font-black text-xl border hover:opacity-80 transition-all flex items-center justify-center gap-3`}>
                                    <ArrowRight size={26} /> تراجع
                                </button>
                                <button onClick={handleNext} className="w-[65%] py-6 bg-primary text-white rounded-[2rem] font-black text-xl shadow-luxury hover:-translate-y-1 transition-all flex items-center justify-center gap-4">
                                    محطة التأكيد <ArrowLeft size={28} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Confirm */}
                    {step === 3 && (
                        <div className="space-y-10 animate-premium-in">
                            <div className="text-center space-y-5">
                                <div className={`w-28 h-28 ${isDark ? 'bg-primary/20' : 'bg-primary/10'} rounded-full mx-auto flex items-center justify-center shadow-luxury`}>
                                    <Zap size={50} className="text-primary animate-float" />
                                </div>
                                <h2 className="text-[3rem] font-black leading-tight">جاهز للانطلاق؟</h2>
                                <p className={`text-xl ${muted} font-bold`}>بضغطة واحدة، ستفتح لك أبواب عالم المبدعين.</p>
                            </div>

                            {/* Summary card */}
                            <div className={`p-10 rounded-[4rem] grid sm:grid-cols-2 gap-8 border-2 border-dashed ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-surface/50 border-border/50'}`}>
                                {[
                                    { label: 'الدور المختار', val: role === 'STUDENT' ? '🎓 طالب بطل' : '👨‍🏫 مرشد خبير', color: role === 'STUDENT' ? 'text-indigo-400' : 'text-emerald-400' },
                                    { label: 'الاسم', val: formData.name, color: 'text-primary' },
                                    { label: 'البريد الإلكتروني', val: formData.email, color: 'text-secondary' },
                                ].map(item => (
                                    <div key={item.label} className="space-y-2">
                                        <span className={`text-sm font-bold ${muted}`}>{item.label}:</span>
                                        <div className={`text-xl font-black ${item.color} break-all`}>{item.val}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-6">
                                <button onClick={() => setStep(2)} className={`w-[35%] py-6 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'glass text-foreground'} rounded-[2rem] font-black text-xl border hover:opacity-80 transition-all flex items-center justify-center gap-3`}>
                                    <ArrowRight size={26} /> تراجع
                                </button>
                                <button onClick={handleSubmit} disabled={isLoading}
                                    className="w-[65%] py-6 bg-gradient-to-r from-primary to-secondary text-white rounded-[2rem] font-black text-2xl shadow-luxury hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-70">
                                    {isLoading ? <Loader2 size={36} className="animate-spin" /> : <>تأكيد الانضمام للأبطال 🚀</>}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={`mt-12 pt-8 border-t ${isDark ? 'border-slate-700' : 'border-border/50'} text-center space-y-6`}>

                        {/* Google Quick SignUp */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-border/50'}`} /></div>
                            <div className="relative flex justify-center">
                                <span className={`px-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-foreground-muted'} font-bold text-sm`}>أو سجّل بسرعة</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || isLoading}
                            className={`w-full flex items-center justify-center gap-3 py-4 ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-border hover:shadow-md'} border-2 rounded-[2rem] font-black text-lg transition-all disabled:opacity-60 disabled:cursor-wait`}>
                            {googleLoading ? (
                                <Loader2 size={22} className="animate-spin text-red-500" />
                            ) : (
                                <svg width="22" height="22" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            <span className={isDark ? 'text-slate-100' : 'text-slate-700'}>{googleLoading ? 'جاري...' : 'إنشاء حساب بواسطة Google'}</span>
                        </button>

                        <p className={`text-lg font-bold ${muted}`}>
                            هل أنت بطل مسجل من قبل؟{' '}
                            <Link to="/signin" className="text-primary font-black hover:underline underline-offset-4">سجل دخولك هنا</Link>
                        </p>
                    </div>
                </div>

                <div className={`mt-8 text-center ${muted} font-bold text-base`}>
                    بمتابعتك فأنت توافق على <span className="underline cursor-pointer hover:text-primary transition-colors">شروط الأبطال</span> و<span className="underline cursor-pointer hover:text-primary transition-colors">سياسة الخصوصية</span> لدينا.
                </div>
            </div>
        </div>
    );
}
