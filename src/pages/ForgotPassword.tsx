import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail, ArrowRight, Send, CheckCircle,
    Lock, Eye, EyeOff, Sparkles, Shield,
    Moon, Sun, KeyRound, RefreshCw, Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';

export default function ForgotPassword() {
    const { isDark, toggleTheme } = useTheme();
    const [step, setStep] = useState<'email' | 'sent' | 'reset' | 'done'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ── Step 1: Send OTP email ────────────────────────────────────────────────
    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim()) return setError('يرجى إدخال البريد الإلكتروني');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('البريد الإلكتروني غير صحيح');
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setStep('sent');
        } catch {
            setError('حدث خطأ، يرجى المحاولة مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    // ── OTP Input handling ────────────────────────────────────────────────────
    const handleCodeChange = (i: number, val: string) => {
        if (!/^[0-9]*$/.test(val)) return;
        const updated = [...code];
        updated[i] = val.slice(-1);
        setCode(updated);
        if (val && i < 5) {
            const next = document.getElementById(`otp-${i + 1}`);
            if (next) (next as HTMLInputElement).focus();
        }
    };

    const handleCodeKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[i] && i > 0) {
            const prev = document.getElementById(`otp-${i - 1}`);
            if (prev) (prev as HTMLInputElement).focus();
        }
    };

    // ── Step 2: Verify OTP → get reset_token ─────────────────────────────────
    const handleVerifyCode = async () => {
        const otp = code.join('');
        if (otp.length < 6) return setError('يرجى إدخال الكود المكون من 6 أرقام');
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setResetToken(data.reset_token);
            setStep('reset');
        } catch (err: any) {
            setError(err.response?.data?.message || 'الرمز غير صحيح أو انتهت صلاحيته');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Set new password ──────────────────────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPass.length < 8) return setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        if (newPass !== confirmPass) return setError('كلمتا المرور غير متطابقتين');
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, token: resetToken, password: newPass });
            setStep('done');
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء إعادة التعيين');
        } finally {
            setLoading(false);
        }
    };

    const strength = newPass.length < 6
        ? { label: 'ضعيفة', color: 'bg-red-500', width: '33%', textColor: 'text-red-400' }
        : newPass.length < 10
            ? { label: 'متوسطة', color: 'bg-yellow-500', width: '66%', textColor: 'text-yellow-400' }
            : { label: 'قوية', color: 'bg-emerald-500', width: '100%', textColor: 'text-emerald-400' };

    const bg = isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30';
    const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';
    const inputCls = isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-primary/60'
        : 'bg-slate-50 border-transparent focus:border-indigo-200 focus:bg-white text-slate-800';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    const stepConfig = {
        email: { icon: '🔑', title: 'نسيت كلمة المرور؟', sub: 'أدخل بريدك وسنرسل لك رمز التحقق' },
        sent: { icon: '📧', title: 'تحقق من بريدك!', sub: `أرسلنا رمزاً مكوناً من 6 أرقام إلى ${email}` },
        reset: { icon: '🔐', title: 'كلمة مرور جديدة', sub: 'اختر كلمة مرور قوية وآمنة لحسابك' },
        done: { icon: '✅', title: 'تم بنجاح!', sub: 'تم تغيير كلمة مرورك، يمكنك الدخول الآن.' },
    };
    const cfg = stepConfig[step];

    return (
        <div className={`min-h-screen ${bg} flex items-center justify-center p-6 font-cairo dir-rtl transition-colors duration-300 relative`}>
            <div className={`absolute -top-32 -right-32 w-[400px] h-[400px] ${isDark ? 'bg-primary/10' : 'bg-primary/5'} rounded-full blur-[80px] pointer-events-none`} />
            <div className={`absolute -bottom-32 -left-32 w-[350px] h-[350px] ${isDark ? 'bg-secondary/10' : 'bg-secondary/5'} rounded-full blur-[80px] pointer-events-none`} />

            {[{ emoji: '🔒', top: '10%', right: '5%', size: 64, delay: '0s' }, { emoji: '✨', bottom: '15%', left: '5%', size: 56, delay: '1.5s' }, { emoji: '🛡️', top: '50%', right: '3%', size: 52, delay: '0.8s' }].map((d, i) => (
                <div key={i} className={`absolute ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/50'} backdrop-blur border rounded-2xl flex items-center justify-center shadow-lg animate-float pointer-events-none`}
                    style={{ top: d.top, right: (d as any).right, left: (d as any).left, bottom: (d as any).bottom, width: d.size, height: d.size, fontSize: d.size * 0.45, animationDelay: d.delay }}>
                    {d.emoji}
                </div>
            ))}

            <button onClick={toggleTheme}
                className={`fixed top-6 left-6 z-50 p-3 rounded-2xl ${isDark ? 'bg-slate-700 text-yellow-400' : 'bg-white text-slate-700'} shadow-xl border ${isDark ? 'border-slate-600' : 'border-slate-200'} transition-all`}>
                {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <div className="absolute top-6 right-6">
                <Link to="/signin"
                    className={`flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} border px-5 py-3 rounded-2xl shadow-sm transition-all group`}>
                    <ArrowRight size={18} className="text-indigo-500" />
                    <span className="font-black text-sm">تسجيل الدخول</span>
                </Link>
            </div>

            <div className="w-full max-w-lg animate-premium-in relative z-10">
                <div className={`${card} rounded-[3.5rem] shadow-luxury p-12 border relative overflow-hidden`}>
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/sadeem.png" alt="Sadeem Logo" className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                            <div>
                                <div className="font-black text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Sadeem</div>
                                <div className={`text-[10px] ${muted} font-black tracking-[0.25em] uppercase`}>سديم</div>
                            </div>
                        </Link>
                    </div>

                    {/* Step icon & title */}
                    <div className="text-center mb-8">
                        <div className={`w-24 h-24 ${isDark ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-100 to-purple-100'} rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border`}>
                            <span className="text-5xl">{cfg.icon}</span>
                        </div>
                        <h2 className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'} mb-3`}>{cfg.title}</h2>
                        <p className={`${muted} font-bold leading-relaxed text-sm`}>{cfg.sub}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 text-red-400 rounded-2xl font-black text-sm text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* ── STEP: Email ─────────────────────────────────────────────── */}
                    {step === 'email' && (
                        <>
                            <form onSubmit={handleSendEmail} className="space-y-5">
                                <div className="space-y-2">
                                    <label className={`${isDark ? 'text-slate-200' : 'text-slate-800'} font-black block text-sm`}>البريد الإلكتروني</label>
                                    <div className="relative group">
                                        <Mail size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 ${muted} group-focus-within:text-indigo-500 transition-colors`} />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                            placeholder="example@mail.com"
                                            className={`w-full pr-12 pl-4 py-4 ${inputCls} border-2 rounded-2xl outline-none font-bold input-ltr transition-all`} />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl font-black text-lg shadow-luxury hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-3 group">
                                    {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الإرسال...</> : <><Send size={20} className="group-hover:-translate-x-1 transition-transform" />إرسال رمز التحقق</>}
                                </button>
                            </form>
                            <div className={`mt-8 p-5 ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'} rounded-3xl border space-y-3`}>
                                {[
                                    { icon: Shield, color: 'text-emerald-500', text: 'بياناتك محمية ومشفرة بالكامل' },
                                    { icon: Sparkles, color: 'text-indigo-500', text: 'سيصلك الرمز خلال دقيقة واحدة' },
                                ].map((item, i) => {
                                    const IIcon = item.icon;
                                    return (
                                        <div key={i} className={`flex items-center gap-3 ${muted} font-bold text-sm`}>
                                            <IIcon size={16} className={item.color + ' flex-shrink-0'} />
                                            {item.text}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* ── STEP: OTP verification ─────────────────────────────────── */}
                    {step === 'sent' && (
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-8" dir="ltr">
                                {code.map((digit, i) => (
                                    <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                                        onChange={e => handleCodeChange(i, e.target.value)}
                                        onKeyDown={e => handleCodeKeyDown(i, e)}
                                        className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all ${digit
                                            ? 'border-indigo-400 bg-indigo-500/10 text-indigo-600'
                                            : `${isDark ? 'border-slate-600 bg-slate-700 text-slate-100 focus:border-indigo-400 focus:bg-slate-600' : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-300 focus:bg-white'}`
                                            }`} />
                                ))}
                            </div>
                            <button onClick={handleVerifyCode} disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl font-black text-lg shadow-luxury hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-60">
                                {loading ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} />}
                                {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
                            </button>
                            <p className={`${muted} font-bold text-sm`}>
                                لم يصلك الرمز؟{' '}
                                <button onClick={() => { setStep('email'); setCode(['', '', '', '', '', '']); }} className="text-indigo-600 font-black hover:underline underline-offset-4 inline-flex items-center gap-1">
                                    <RefreshCw size={14} />أعد الإرسال
                                </button>
                            </p>
                        </div>
                    )}

                    {/* ── STEP: New password ─────────────────────────────────────── */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className={`${isDark ? 'text-slate-200' : 'text-slate-800'} font-black block text-sm`}>كلمة السر الجديدة</label>
                                <div className="relative group">
                                    <Lock size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 ${muted} group-focus-within:text-indigo-500 transition-colors`} />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted} hover:text-indigo-500 transition-colors z-10`}>
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                                        placeholder="8 أحرف على الأقل"
                                        className={`w-full pr-12 pl-12 py-4 ${inputCls} border-2 rounded-2xl outline-none font-bold input-ltr transition-all`} />
                                </div>
                                {newPass.length > 0 && (
                                    <div className="flex items-center gap-2 px-1">
                                        <div className={`flex-1 h-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                                            <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                                        </div>
                                        <span className={`text-xs font-bold ${strength.textColor}`}>{strength.label}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className={`${isDark ? 'text-slate-200' : 'text-slate-800'} font-black block text-sm`}>تأكيد كلمة السر</label>
                                <div className="relative group">
                                    <Lock size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 ${muted} group-focus-within:text-indigo-500 transition-colors`} />
                                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full pr-12 pl-4 py-4 ${inputCls} border-2 rounded-2xl outline-none font-bold input-ltr transition-all ${confirmPass && confirmPass !== newPass ? 'border-red-300' : confirmPass && confirmPass === newPass ? 'border-emerald-300' : ''}`} />
                                    {confirmPass && confirmPass === newPass && (
                                        <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    )}
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl font-black text-lg shadow-luxury hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60">
                                {loading ? <Loader2 size={22} className="animate-spin" /> : <KeyRound size={22} />}
                                {loading ? 'جاري الحفظ...' : 'تأكيد كلمة المرور الجديدة ✅'}
                            </button>
                        </form>
                    )}

                    {/* ── STEP: Done ─────────────────────────────────────────────── */}
                    {step === 'done' && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center border-2 border-emerald-500/30">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <p className={`${muted} font-bold`}>يمكنك الآن تسجيل الدخول بكلمة مرورك الجديدة.</p>
                            <Link to="/signin"
                                className="block w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl font-black text-lg text-center shadow-luxury hover:-translate-y-0.5 transition-all">
                                الذهاب لتسجيل الدخول 🚀
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
