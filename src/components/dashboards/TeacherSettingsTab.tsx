import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
    User, Mail, Lock, Camera, Save,
    CheckCircle2, AlertCircle
} from 'lucide-react';

export default function TeacherSettingsTab() {
    const { isDark } = useTheme();
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

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100 shadow-sm';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const inputBg = isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';

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

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h3 className={`text-2xl font-black ${textMain}`}>إعدادات الحساب</h3>
                <div className="flex items-center gap-4">
                    {success && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/20 animate-premium-in">
                            <CheckCircle2 size={16} />
                            <span className="font-bold text-xs">{success}</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl border border-red-500/20 animate-premium-in">
                            <AlertCircle size={16} />
                            <span className="font-bold text-xs">{error}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Profile Form */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleSaveProfile} className={`${cardBg} rounded-[2.5rem] border p-8 space-y-8`}>
                        <div className="flex items-center gap-6 pb-6 border-b border-slate-500/10">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg overflow-hidden">
                                    <div className="w-full h-full bg-slate-900 rounded-[0.9rem] flex items-center justify-center text-3xl">
                                        {user?.avatar || '👤'}
                                    </div>
                                </div>
                                <button type="button" className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex items-center justify-center text-emerald-600 border border-emerald-500/20 hover:scale-110 transition-all">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div>
                                <h4 className={`text-lg font-black ${textMain}`}>{formData.first_name} {formData.last_name}</h4>
                                <p className={`text-sm font-bold ${muted}`}>{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-wider">الاسم الأول</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className={`w-full ${inputBg} border rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-wider">الاسم الأخير</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className={`w-full ${inputBg} border rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-wider">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full ${inputBg} border rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        حفظ التغييرات <Save size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Form */}
                <div className="lg:col-span-5">
                    <form onSubmit={handleChangePassword} className={`${cardBg} rounded-[2.5rem] border p-8 space-y-8`}>
                        <h4 className={`text-lg font-black flex items-center gap-3 ${textMain}`}>
                            <Lock className="text-emerald-500" size={20} /> تغيير كلمة المرور
                        </h4>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-wider">كلمة المرور الحالية</label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className={`w-full ${inputBg} border rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-wider">كلمة المرور الجديدة</label>
                                <div className="relative">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className={`w-full ${inputBg} border rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        تحديث كلمة المرور <Lock size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
