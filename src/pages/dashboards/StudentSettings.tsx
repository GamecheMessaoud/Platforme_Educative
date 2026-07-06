import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
    User, Mail, Lock, Camera, Bell,
    Shield, Palette, Save, ChevronRight,
    CheckCircle2, AlertCircle
} from 'lucide-react';

export default function StudentSettings() {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { user, setUser } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        first_name: user?.first_name || user?.full_name?.split(' ')[0] || '',
        last_name: user?.last_name || user?.full_name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
    });

    const bg = isDark ? 'bg-[#0d1117] text-slate-100' : 'bg-slate-50 text-slate-900';
    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100 shadow-luxury';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const inputBg = isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200';

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.put('/auth/profile', formData);
            setUser(res.data.user);
            setSuccess('تم حفظ التغييرات بنجاح!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
            setTimeout(() => setError(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            setError('يرجى ملء حقلي كلمة المرور');
            setTimeout(() => setError(''), 4000);
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.put('/auth/password', passwordData);
            setSuccess('تم تغيير كلمة المرور بنجاح!');
            setPasswordData({ currentPassword: '', newPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
            setTimeout(() => setError(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${bg} pb-20 overflow-hidden relative`} dir="rtl">
            {/* Decorative Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
            </div>

            <header className={`${isDark ? 'bg-[#0d1117]/80 border-slate-800' : 'bg-white/80 border-slate-100'} border-b sticky top-0 z-40 backdrop-blur-2xl transition-all duration-500`}>
                <div className="max-w-[1000px] mx-auto px-8 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <button onClick={() => navigate(-1)}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:shadow-xl'}`}>
                            <ChevronRight size={28} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-gradient">إعدادات الحساب</h1>
                            <p className={`text-base font-bold mt-1 ${muted}`}>خصص تجربتك في سديم ✨</p>
                        </div>
                    </div>
                    {success && (
                        <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-500 px-6 py-3 rounded-2xl border border-emerald-500/20 animate-premium-in">
                            <CheckCircle2 size={20} />
                            <span className="font-black text-sm">{success}</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 text-red-500 px-6 py-3 rounded-2xl border border-red-500/20 animate-premium-in">
                            <AlertCircle size={20} />
                            <span className="font-black text-sm">{error}</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-[1000px] mx-auto px-8 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`${cardBg} rounded-[2.5rem] border-2 p-8 shadow-premium animate-premium-in`}>
                        <div className="space-y-2">
                            {[
                                { icon: User, label: 'الملف الشخصي', id: 'profile', active: true },
                                { icon: Shield, label: 'الأمان والخصوصية', id: 'security' },
                                { icon: Bell, label: 'التنبيهات', id: 'notifs' },
                                { icon: Palette, label: 'المظهر', id: 'appearance' },
                            ].map((item) => (
                                <button key={item.id} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm ${item.active ? 'bg-primary text-white shadow-lg shadow-primary/30' : `hover:bg-slate-500/5 ${muted}`}`}>
                                    <item.icon size={20} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardBg} rounded-[2.5rem] border-2 p-8 shadow-premium animate-premium-in`} style={{ animationDelay: '0.1s' }}>
                        <h3 className={`text-sm font-black mb-6 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            <Palette size={18} className="text-primary" /> مظهر المنصة
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                            <span className="text-sm font-bold">الوضع الليلي</span>
                            <button onClick={toggleTheme} className={`w-14 h-8 rounded-full transition-all relative p-1 ${isDark ? 'bg-primary' : 'bg-slate-300'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${isDark ? '-translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-8 space-y-8 animate-premium-in" style={{ animationDelay: '0.2s' }}>
                    <form onSubmit={handleSaveProfile} className={`${cardBg} rounded-[3.5rem] border-2 p-12 shadow-premium space-y-10`}>
                        {/* Profile Photo */}
                        <div className="flex items-center gap-8 pb-10 border-b border-slate-500/10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-purple-600 p-1 shadow-2xl overflow-hidden transition-transform group-hover:scale-105">
                                    <div className="w-full h-full bg-slate-900 rounded-[2.4rem] flex items-center justify-center text-5xl">
                                        {user?.avatar || '👤'}
                                    </div>
                                </div>
                                <button type="button" className="absolute -bottom-2 -right-2 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center text-primary border-2 border-primary/20 hover:scale-110 transition-all">
                                    <Camera size={20} />
                                </button>
                            </div>
                            <div>
                                <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formData.first_name} {formData.last_name}</h2>
                                <p className={`text-sm font-bold ${muted}`}>{user?.email}</p>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className={`text-lg font-black flex items-center gap-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                <User className="text-primary" /> المعلومات الأساسية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">الاسم الأول</label>
                                    <div className="relative">
                                        <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className={`w-full ${inputBg} border-2 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">الاسم الأخير</label>
                                    <div className="relative">
                                        <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className={`w-full ${inputBg} border-2 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">البريد الإلكتروني</label>
                                    <div className="relative">
                                        <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full ${inputBg} border-2 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative bg-primary hover:bg-primary-hover text-white px-12 py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-primary/20 flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        حفظ التغييرات <Save size={24} className="group-hover:translate-x-[-4px] transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Password Change */}
                    <div className={`${cardBg} rounded-[3.5rem] border-2 p-12 shadow-premium space-y-10`}>
                        <div className="space-y-6">
                            <h3 className={`text-lg font-black flex items-center gap-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                <Lock className="text-primary" /> تغيير كلمة المرور
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">كلمة المرور الحالية</label>
                                    <div className="relative">
                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className={`w-full ${inputBg} border-2 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">كلمة المرور الجديدة</label>
                                    <div className="relative">
                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className={`w-full ${inputBg} border-2 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={loading}
                                className="group relative bg-slate-700 hover:bg-slate-600 text-white px-10 py-4 rounded-[2rem] font-black transition-all shadow-xl flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        تغيير كلمة المرور <Lock size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
