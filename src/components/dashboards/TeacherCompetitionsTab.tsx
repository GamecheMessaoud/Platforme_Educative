import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../lib/api';
import {
    Trophy, Plus, Users,
    Trash2, Edit,
    Star, X, BarChart2
} from 'lucide-react';
import CompetitionLeaderboardModal from './CompetitionLeaderboardModal';

export default function TeacherCompetitionsTab() {
    const { isDark } = useTheme();
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingComp, setEditingComp] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [leaderboardComp, setLeaderboardComp] = useState<{ id: string; title: string } | null>(null);

    const [formData, setFormData] = useState({
        title_ar: '',
        title_en: '',
        description_ar: '',
        description_en: '',
        start_date: '',
        end_date: '',
        xp_reward: '500',
        image_url: '',
        status: 'UPCOMING'
    });

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const fetchCompetitions = async () => {
        try {
            const res = await api.get('/competitions');
            setCompetitions(res.data);
        } catch (error) {
            console.error('Error fetching competitions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingComp) {
                await api.put(`/competitions/${editingComp.id}`, formData);
            } else {
                await api.post('/competitions', formData);
            }
            setModalOpen(false);
            setEditingComp(null);
            resetForm();
            fetchCompetitions();
        } catch (error) {
            console.error('Error saving competition:', error);
            alert('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه المسابقة؟')) return;
        try {
            await api.delete(`/competitions/${id}`);
            fetchCompetitions();
        } catch (error) {
            alert('فشل الحذف');
        }
    };

    const resetForm = () => {
        setFormData({
            title_ar: '',
            title_en: '',
            description_ar: '',
            description_en: '',
            start_date: '',
            end_date: '',
            xp_reward: '500',
            image_url: '',
            status: 'UPCOMING'
        });
    };

    const openEdit = (comp: any) => {
        setEditingComp(comp);
        setFormData({
            title_ar: comp.title_ar,
            title_en: comp.title_en || '',
            description_ar: comp.description_ar || '',
            description_en: comp.description_en || '',
            start_date: comp.start_date.split('T')[0],
            end_date: comp.end_date.split('T')[0],
            xp_reward: String(comp.xp_reward),
            image_url: comp.image_url || '',
            status: comp.status
        });
        setModalOpen(true);
    };

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100 shadow-luxury';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const inputBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';

    return (
        <div className="space-y-10 animate-premium-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-500/10">
                <div>
                    <h2 className={`text-2xl font-black ${textMain} flex items-center gap-4`}>
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                            <Trophy size={24} />
                        </div>
                        إدارة المسابقات
                    </h2>
                    <p className={`text-sm font-bold mt-1 ${muted}`}>أنشئ تحديات جديدة وحفز طلابك للإبداع 🚀</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingComp(null); setModalOpen(true); }}
                    className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-[1.5rem] font-black shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all text-sm"
                >
                    <Plus size={20} /> مسابقة جديدة
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {competitions.map((comp) => (
                        <div key={comp.id} className={`${cardBg} border-2 rounded-[2.5rem] overflow-hidden flex flex-col group transition-all duration-500`}>
                            <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                                {comp.image_url ? (
                                    <img src={comp.image_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🏆</div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border backdrop-blur-md ${comp.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                                        comp.status === 'FINISHED' ? 'bg-slate-500/20 text-slate-500 border-slate-500/30' :
                                            'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                        }`}>
                                        {comp.status === 'ACTIVE' ? 'نشطة' : comp.status === 'FINISHED' ? 'منتهية' : 'قادمة'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col space-y-4">
                                <h3 className={`font-black text-lg ${textMain}`}>{comp.title_ar}</h3>
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className={`${muted} flex items-center gap-1.5`}><Users size={12} /> {comp._count?.participants || 0} مشارك</span>
                                    <span className="text-amber-500 flex items-center gap-1.5"><Star size={12} fill="currentColor" /> {comp.xp_reward} XP</span>
                                </div>
                                <div className="pt-4 flex items-center gap-2 mt-auto">
                                    <button
                                        onClick={() => setLeaderboardComp({ id: comp.id, title: comp.title_ar })}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-xl font-bold text-xs transition-all border border-amber-500/10"
                                    >
                                        <BarChart2 size={14} /> الترتيب
                                    </button>
                                    <button onClick={() => openEdit(comp)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 rounded-xl font-bold text-xs transition-all">
                                        <Edit size={14} /> تعديل
                                    </button>
                                    <button onClick={() => handleDelete(comp.id)} className="w-11 h-11 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/10">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className={`${isDark ? 'bg-[#161b22]' : 'bg-white'} w-full max-w-[700px] rounded-[3rem] border-2 ${isDark ? 'border-slate-800' : 'border-slate-100'} shadow-premium overflow-hidden animate-premium-in`}>
                        <div className="p-8 border-b border-slate-500/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
                            <h3 className={`text-xl font-black ${textMain}`}>{editingComp ? 'تعديل المسابقة' : 'إنشاء مسابقة جديدة'}</h3>
                            <button onClick={() => setModalOpen(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-all`}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">العنوان (بالعربية)</label>
                                    <input required type="text" value={formData.title_ar} onChange={e => setFormData({ ...formData, title_ar: e.target.value })} className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-500/50 transition-all`} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">رابط الصورة (اختياري)</label>
                                    <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-500/50 transition-all`} />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">الوصف (بالعربية)</label>
                                    <textarea required rows={3} value={formData.description_ar} onChange={e => setFormData({ ...formData, description_ar: e.target.value })} className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-500/50 transition-all resize-none`} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">تاريخ البدء</label>
                                    <input required type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-500/50 transition-all`} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">تاريخ الانتهاء</label>
                                    <input required type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-500/50 transition-all`} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">مكافأة XP</label>
                                    <input required type="number" value={formData.xp_reward} onChange={e => setFormData({ ...formData, xp_reward: e.target.value })} className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-500/50 transition-all`} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">الحالة</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={`w-full ${inputBg} border-2 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-amber-500/50 transition-all`}>
                                        <option value="UPCOMING">قادمة</option>
                                        <option value="ACTIVE">نشطة</option>
                                        <option value="FINISHED">منتهية</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                        <div className="p-8 border-t border-slate-500/10 flex justify-end gap-4 bg-slate-500/5">
                            <button type="button" onClick={() => setModalOpen(false)} className={`px-8 py-3.5 rounded-2xl font-black text-sm ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'} transition-all`}>إلغاء</button>
                            <button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-3">
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'حفظ المسابقة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Modal */}
            {leaderboardComp && (
                <CompetitionLeaderboardModal
                    competitionId={leaderboardComp.id}
                    competitionTitle={leaderboardComp.title}
                    onClose={() => setLeaderboardComp(null)}
                />
            )}
        </div>
    );
}
