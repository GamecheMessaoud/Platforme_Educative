import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import {
    User, Mail, Lock, Camera, Save,
    CheckCircle2, AlertCircle, Palette
} from 'lucide-react';

export default function StudentSettingsTab() {
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

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100 shadow-luxury';
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

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUser({ ...user, avatar_url: res.data.avatar_url } as any);
            setSuccess('تم تغيير الصورة بنجاح!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل رفع الصورة');
            setTimeout(() => setError(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-premium-in">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Form */}
                <div className="flex-1">
                    <form onSubmit={handleSaveProfile} className={`${cardBg} rounded-[3rem] border-2 p-10 space-y-8`}>
                        <div className="flex items-center gap-6 pb-8 border-b border-slate-500/10">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-purple-600 p-1 shadow-xl overflow-hidden">
                                    <div className="w-full h-full bg-slate-900 rounded-[1.9rem] flex items-center justify-center text-3xl overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={`http://localhost:3000${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user?.avatar || '👤'
                                        )}
                                    </div>
                                </div>
                                <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center text-primary border-2 border-primary/20 hover:scale-110 transition-all cursor-pointer">
                                    <Camera size={18} />
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </label>
                            </div>
                            <div>
                                <h2 className={`text-xl font-black ${textMain}`}>{formData.first_name} {formData.last_name}</h2>
                                <p className={`text-sm font-bold ${muted}`}>{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">الاسم الأول</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className={`w-full ${inputBg} border-2 rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none focus:border-primary/50 transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">الاسم الأخير</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className={`w-full ${inputBg} border-2 rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none focus:border-primary/50 transition-all`}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full ${inputBg} border-2 rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold outline-none focus:border-primary/50 transition-all`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="flex flex-col gap-2">
                                {success && <div className="text-emerald-500 text-xs font-black flex items-center gap-2"><CheckCircle2 size={14} />{success}</div>}
                                {error && <div className="text-red-500 text-xs font-black flex items-center gap-2"><AlertCircle size={14} />{error}</div>}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> حفظ</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Widgets */}
                <div className="w-full md:w-80 space-y-6">
                    {/* Password Change */}
                    <div className={`${cardBg} rounded-[2.5rem] border-2 p-8 space-y-6`}>
                        <h3 className={`text-base font-black flex items-center gap-3 ${textMain}`}>
                            <Lock size={18} className="text-primary" /> الأمان
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="كلمة المرور الحالية"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary/50`}
                            />
                            <input
                                type="password"
                                placeholder="كلمة المرور الجديدة"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary/50`}
                            />
                            <button
                                onClick={handleChangePassword}
                                disabled={loading}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-black text-xs transition-all shadow-lg disabled:opacity-50"
                            >
                                تغيير كلمة المرور
                            </button>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className={`${cardBg} rounded-[2.5rem] border-2 p-8 space-y-6`}>
                        <h3 className={`text-base font-black flex items-center gap-3 ${textMain}`}>
                            <Palette size={18} className="text-primary" /> المظهر
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                            <span className="text-xs font-bold">الوضع الليلي</span>
                            <button onClick={toggleTheme} className={`w-12 h-7 rounded-full transition-all relative p-1 ${isDark ? 'bg-primary' : 'bg-slate-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${isDark ? '-translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
