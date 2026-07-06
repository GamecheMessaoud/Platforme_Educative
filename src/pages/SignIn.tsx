import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail, Lock, Eye, EyeOff,
    ArrowRight, Loader2, Rocket,
    ShieldCheck, Moon, Sun
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_CLIENT_ID = '42112194462-7mm91okcoiv5eni7o5mder3510fhs25t.apps.googleusercontent.com';

/* ─── 3D Floating decoration ─── */
function Decoration3D({ isDark }: { isDark: boolean }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Big blob top-right */}
            <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full ${isDark ? 'bg-primary/15' : 'bg-primary/8'} blur-[100px] animate-pulse-slow`} />
            {/* Big blob bottom-left */}
            <div className={`absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full ${isDark ? 'bg-secondary/15' : 'bg-secondary/8'} blur-[100px] animate-pulse-slow [animation-delay:2s]`} />

            {/* 3D floating shapes */}
            {[
                { top: '15%', right: '8%', size: 80, emoji: '🚀', delay: '0s' },
                { top: '60%', right: '4%', size: 60, emoji: '⭐', delay: '1.5s' },
                { top: '35%', left: '4%', size: 70, emoji: '🎯', delay: '0.8s' },
                { bottom: '20%', left: '6%', size: 55, emoji: '💡', delay: '2.2s' },
            ].map((item, i) => (
                <div
                    key={i}
                    className={`absolute flex items-center justify-center rounded-[2rem] ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur border shadow-2xl animate-float`}
                    style={{ top: item.top, right: (item as any).right, left: (item as any).left, bottom: (item as any).bottom, width: item.size, height: item.size, fontSize: item.size * 0.42, animationDelay: item.delay }}
                >
                    {item.emoji}
                </div>
            ))}

            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#6366f1" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
}

export default function SignIn() {
    const navigate = useNavigate();
    const { login, socialLogin, isLoading } = useAuthStore();
    const { isDark, toggleTheme } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) { setError('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
        try {
            const user = await login(email, password);
            if (user && user.id) {
                if (user.role === 'ADMIN') navigate('/admin-dashboard');
                else if (user.role === 'TEACHER') navigate('/teacher-dashboard');
                else navigate('/student-dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ غير متوقع');
        }
    };

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        setError(null);
        // Load Google Identity Services
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            (window as any).google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response: any) => {
                    try {
                        // Decode the JWT credential to get user info
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



    const bg = isDark ? 'bg-slate-900 text-slate-100' : 'bg-surface text-foreground';
    const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-border/30';
    const input = isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-primary/60 focus:bg-slate-600'
        : 'bg-surface border-transparent text-foreground placeholder-foreground-muted focus:border-primary/30 focus:bg-white';
    const muted = isDark ? 'text-slate-400' : 'text-foreground-muted';

    return (
        <div className={`min-h-screen ${bg} flex items-center justify-center p-8 font-cairo dir-rtl text-right overflow-hidden relative transition-colors duration-300`}>
            <Decoration3D isDark={isDark} />

            {/* Dark mode toggle */}
            <button
                onClick={toggleTheme}
                className={`fixed top-6 left-6 z-50 p-3 rounded-2xl ${isDark ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-white text-slate-700 hover:bg-slate-100'} shadow-xl border ${isDark ? 'border-slate-600' : 'border-border'} transition-all`}
            >
                {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <div className="max-w-[640px] w-full animate-premium-in relative z-10">
                {/* Header */}
                <div className="text-center mb-14">
                    <Link to="/" className="inline-flex items-center gap-5 group mb-10">
                        <img src="/sadeem.png" alt="Sadeem Logo" className="h-16 w-auto object-contain drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
                        <span className="text-4xl font-black text-gradient animate-gradient py-2">Sadeem | سديم</span>
                    </Link>
                    <h1 className="text-5xl font-black mb-4">مرحباً بعودتك!</h1>
                    <p className={`text-xl ${muted} font-bold`}>سجل دخولك لتواصل رحلاتك البرمجية المشوقة.</p>
                </div>

                {/* Card */}
                <div className={`${card} p-14 rounded-[4rem] shadow-luxury border relative overflow-hidden`}>
                    {/* Shimmer top bar */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

                    {error && (
                        <div className="mb-8 p-5 bg-red-500/10 border-2 border-red-500/30 text-red-400 rounded-[2rem] flex items-center gap-4 font-bold text-lg">
                            <ShieldCheck size={28} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Email */}
                        <div className="space-y-3">
                            <label className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-foreground'} block`}>البريد الإلكتروني</label>
                            <div className="relative group/field">
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within/field:text-primary transition-colors" size={24} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className={`w-full pr-14 pl-5 py-5 ${input} rounded-[2rem] border-[2px] transition-all outline-none font-bold text-lg`}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-3">
                            <label className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-foreground'} block`}>كلمة المرور</label>
                            <div className="relative group/field">
                                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within/field:text-primary transition-colors" size={24} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full pr-14 pl-14 py-5 ${input} rounded-[2rem] border-[2px] transition-all outline-none font-bold text-lg`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-primary transition-colors">
                                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember / Forgot */}
                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-3 cursor-pointer group/check">
                                <div
                                    onClick={() => setRemember(!remember)}
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${remember ? 'bg-primary border-primary' : `border-border ${isDark ? 'bg-slate-700' : 'bg-white'} group-hover/check:border-primary`}`}
                                >
                                    {remember && <div className="w-3 h-3 bg-white rounded-sm" />}
                                </div>
                                <span className={`text-base font-bold ${muted}`}>تذكرني</span>
                            </label>
                            <Link to="/forgot-password" className="text-base font-black text-primary hover:underline underline-offset-4">نسيت كلمة المرور؟</Link>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="w-full py-6 bg-gradient-to-r from-primary to-secondary text-white rounded-[2rem] font-black text-xl shadow-luxury hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70">
                            {isLoading ? <Loader2 size={32} className="animate-spin" /> : (
                                <>تسجيل الدخول للمنصة <ArrowRight size={28} /></>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-10 relative">
                        <div className={`absolute inset-0 flex items-center`}><div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-border/50'}`} /></div>
                        <div className="relative flex justify-center">
                            <span className={`px-6 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-foreground-muted'} font-bold text-base uppercase tracking-widest`}>أو الدخول عبر</span>
                        </div>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || isLoading}
                        className={`w-full flex items-center justify-center gap-4 py-5 ${isDark ? 'bg-slate-700 border-slate-600 hover:border-red-500/50 hover:bg-slate-600' : 'bg-white border-border hover:border-red-300 hover:shadow-premium'} border-2 rounded-[2rem] font-black text-lg transition-all group/btn disabled:opacity-60 disabled:cursor-wait`}>
                        {googleLoading ? (
                            <Loader2 size={24} className="animate-spin text-red-500" />
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        )}
                        <span>{googleLoading ? 'جاري التسجيل...' : 'الدخول عبر Google'}</span>
                    </button>

                    <div className={`mt-8 pt-8 border-t ${isDark ? 'border-slate-700' : 'border-border/50'} text-center`}>
                        <p className={`text-lg font-bold ${muted}`}>
                            ليس لديك حساب؟{' '}
                            <Link to="/signup" className="text-primary font-black hover:underline underline-offset-4">ابدأ رحلتك الآن</Link>
                        </p>
                    </div>


                </div>

                <div className={`mt-8 text-center ${muted} font-bold text-base`}>
                    © {new Date().getFullYear()} Sadeem | سديم — منصة المبدعين العرب
                </div>
            </div>
        </div>
    );
}
