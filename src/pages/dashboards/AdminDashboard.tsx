import { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard, Users, BookOpen, CreditCard, FileText,
    Settings, Shield, Activity, ShoppingBag,
    UserPlus, Package, ShoppingCart, Plus, Edit2, Trash2, X, Check, DollarSign, Star, UserX, UserCheck,
    MapPin, Truck, MessageSquare, Heart, MessageCircle, Crown, CheckCircle, XCircle, AlertTriangle, ArrowRight,
    Search, Calendar, Filter
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../lib/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { getAdminStats, getAdminUsers, getAdminPayments, getAdminSettings, updateAdminSetting, toggleUserStatus, getAdminReports, updateAdminUser, deleteAdminUser, activateStudentVip, getAdminSubscriptions, approveAdminSubscription } from '../../services/adminService';
import {
    getStoreCategories, createStoreCategory, updateStoreCategory, deleteStoreCategory,
    getStoreProducts, createProduct, updateProduct, deleteProduct,
    getAdminOrders, updateOrderStatus,
    getDeliveryTariffs, upsertDeliveryTariff, deleteDeliveryTariff
} from '../../services/storeService';
import Loading from '../../components/Loading';
import RagDocumentUploader from '../../components/dashboards/RagDocumentUploader';

const slugify = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export default function AdminDashboard() {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('overview');

    // Data state
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [reports, setReports] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [settings, setSettings] = useState<any[]>([]);
    const [deliveryTariffs, setDeliveryTariffs] = useState<any[]>([]);

    // Modal states
    const [categoryModal, setCategoryModal] = useState<any>(null);
    const [deliveryModal, setDeliveryModal] = useState<any>(null); 
    const [storeSubView, setStoreSubView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [userModal, setUserModal] = useState<any>(null); 
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Community Management State
    const [communityPosts, setCommunityPosts] = useState<any[]>([]);
    const [communityLoading, setCommunityLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'overview') {
                const data = await getAdminStats();
                setStats(data);
            } else if (activeTab === 'users') {
                const data = await getAdminUsers();
                setUsers(data);
            } else if (activeTab === 'reports') {
                const data = await getAdminReports();
                setReports(data);
            } else if (activeTab === 'store') {
                const [p, c, o, t] = await Promise.all([
                    getStoreProducts(),
                    getStoreCategories(),
                    getAdminOrders(),
                    getDeliveryTariffs()
                ]);
                setProducts(p);
                setCategories(c);
                setOrders(o);
                setDeliveryTariffs(t);
            } else if (activeTab === 'payments') {
                const [pData, sData] = await Promise.all([
                    getAdminPayments().catch(() => []),
                    getAdminSubscriptions().catch(() => [])
                ]);
                setPayments(pData);
                setSubscriptions(sData);
            } else if (activeTab === 'settings') {
                const data = await getAdminSettings();
                setSettings(data);
            } else if (activeTab === 'community') {
                loadCommunityPosts();
            }
        } catch (_error) {
            console.error('Error loading admin data:', _error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        try {
            if (storeSubView === 'add') {
                await createProduct(data);
            } else {
                await updateProduct(editingProduct.id, data);
            }
            setStoreSubView('list');
            setEditingProduct(null);
            loadData();
        } catch (_error) {
            alert('Error saving product');
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        try {
            if (categoryModal.mode === 'create') {
                await createStoreCategory(data);
            } else {
                await updateStoreCategory(categoryModal.data.id, data);
            }
            setCategoryModal(null);
            loadData();
        } catch (error: any) {
            console.error('Error saving category:', error);
            alert(`Error saving category: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            await deleteProduct(id);
            loadData();
        }
    };

    const handleUpdateOrderStatus = async (id: string, status: string) => {
        try {
            await updateOrderStatus(id, status);
            loadData();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleToggleUserStatus = async (id: string) => {
        if (confirm('تغيير حالة المستخدم؟')) {
            await toggleUserStatus(id);
            loadData();
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) {
            await deleteAdminUser(id);
            loadData();
        }
    };

    const handleApproveSubscription = async (id: string) => {
        try {
            await approveAdminSubscription(id);
            loadData();
        } catch (error) {
            console.error('Error approving subscription:', error);
        }
    };

    const handleUpdateSetting = async (key: string, value: string) => {
        try {
            await updateAdminSetting(key, value);
            loadData();
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    };

    const handleDeleteCommunityPost = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
        try {
            await api.delete(`/community/posts/${id}`);
            loadData();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        try {
            if (userModal.mode === 'edit') {
                await updateAdminUser(userModal.data.id, data);
            }
            setUserModal(null);
            loadData();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const loadCommunityPosts = async () => {
        try {
            setCommunityLoading(true);
            const res = await api.get('/community/posts');
            setCommunityPosts(res.data);
        } catch (error) {
            console.error('Error loading community posts:', error);
        } finally {
            setCommunityLoading(false);
        }
    };

    const handleDeliverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        try {
            await upsertDeliveryTariff(data);
            setDeliveryModal(null);
            loadData();
        } catch (error) {
            console.error('Error saving delivery tariff:', error);
            alert('Error saving delivery tariff');
        }
    };

    const handleDeleteDelivery = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف تسعيرة الشحن هذه؟')) return;
        try {
            await deleteDeliveryTariff(id);
            loadData();
        } catch (error) {
            console.error('Error deleting delivery tariff:', error);
        }
    };

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-slate-800 border-slate-700';

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'لوحة القيادة', badge: null },
        { id: 'users', icon: Users, label: 'المستخدمون', badge: null },
        { id: 'store', icon: ShoppingBag, label: 'إدارة المتجر', badge: orders.filter(o => o.status === 'PENDING').length || undefined },
        { id: 'payments', icon: CreditCard, label: 'المدفوعات', badge: null },
        { id: 'reports', icon: FileText, label: 'التقارير', badge: null },
        { id: 'community', icon: MessageSquare, label: 'إدارة المجتمع', badge: null },
        { id: 'settings', icon: Settings, label: 'الإعدادات', badge: null },
    ];

    return (
        <DashboardLayout
            role="admin"
            navItems={navItems as any}
            activeTabId={activeTab}
            onTabChange={setActiveTab}
            headerTitle={navItems.find(n => n.id === activeTab)?.label || 'لوحة القيادة'}
            profileWidget={
                <div className="p-4">
                    <div className="bg-gradient-to-br from-red-600 to-orange-700 rounded-3xl p-5 text-white relative flex flex-col items-center text-center overflow-hidden">
                        <Shield className="w-12 h-12 mb-2 text-red-200" />
                        <div className="font-black text-lg">إدارة المنصة</div>
                        <div className="text-red-200 text-xs font-bold w-full truncate">ADMIN PANEL</div>
                    </div>
                </div>
            }
        >
            <div className="p-8 lg:p-10 flex-1 space-y-10">
                {loading ? (
                    <div className="py-20 flex justify-center"><Loading /></div>
                ) : (
                    <>
                        {/* Premium Stats Grid */}
                        {activeTab === 'overview' && stats && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[
                                        { label: 'إجمالي الطلاب', val: stats.totalStudents || 0, icon: Users, color: 'from-blue-500 to-indigo-600' },
                                        { label: 'المعلمون النشطون', val: stats.totalTeachers || 0, icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
                                        { label: 'الإيرادات الإجمالية', val: stats.totalRevenue ? `${stats.totalRevenue.toLocaleString()} دج` : '0 دج', icon: DollarSign, color: 'from-amber-500 to-orange-600' },
                                        { label: 'الطلبات المعلقة', val: orders.filter(o => o.status === 'PENDING').length || 0, icon: ShoppingBag, color: 'from-purple-500 to-pink-600' }
                                    ].map((s, i) => (
                                        <div key={i} className={`group relative bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700/50 shadow-premium hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
                                            <div className={`absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-br ${s.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
                                            <div className="flex flex-col h-full relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className={`w-14 h-14 bg-gradient-to-br ${s.color} rounded-[1.25rem] flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                                                        <s.icon size={24} />
                                                    </div>
                                                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black border border-emerald-500/10">
                                                        LIVE
                                                    </div>
                                                </div>
                                                <div className="space-y-1 mt-auto">
                                                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{s.val}</div>
                                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Chart 1: Revenue (Bar Chart) */}
                                    <div className={`${cardBg} border rounded-[2.5rem] p-8`}>
                                        <h3 className={`text-lg font-black text-white mb-6 flex items-center gap-2`}>
                                            <Activity className="text-blue-500" size={24} />التحليلات الشهرية للإيرادات
                                        </h3>
                                        <div className="h-64 w-full" dir="ltr">
                                            {stats?.chartData && stats.chartData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stats.chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                                                        <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                                        <RechartsTooltip 
                                                            contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                            itemStyle={{ color: '#3b82f6', fontWeight: 900 }}
                                                            cursor={{fill: isDark ? '#334155' : '#f1f5f9'}}
                                                        />
                                                        <Bar dataKey="revenue" name="الإيرادات (دج)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center opacity-50 font-bold">جاري تحميل البيانات...</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chart 2: User Growth (Area Chart) */}
                                    <div className={`${cardBg} border rounded-[2.5rem] p-8`}>
                                        <h3 className={`text-lg font-black text-white mb-6 flex items-center gap-2`}>
                                            <Users className="text-emerald-500" size={24} />نمو المستخدمين النشطين
                                        </h3>
                                        <div className="h-64 w-full" dir="ltr">
                                            {stats?.chartData && stats.chartData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={stats.chartData}>
                                                        <defs>
                                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                                                        <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                                                        <RechartsTooltip 
                                                            contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                            itemStyle={{ color: '#10b981', fontWeight: 900 }}
                                                        />
                                                        <Area type="monotone" dataKey="users" name="المستخدمون" stroke="#10b981" fillOpacity={1} fill="url(#colorUsers)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center opacity-50 font-bold">جاري تحميل البيانات...</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chart 3: Platform Demographics (Pie Chart) */}
                                    <div className={`${cardBg} border rounded-[2.5rem] p-8 lg:col-span-2`}>
                                        <h3 className={`text-lg font-black text-white mb-6 flex items-center gap-2`}>
                                            <Activity className="text-amber-500" size={24} />توزيع المستخدمين والدورات
                                        </h3>
                                        <div className="h-72 w-full flex flex-col md:flex-row items-center justify-center" dir="ltr">
                                            {stats ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={[
                                                                { name: 'طلاب', value: stats.students || 0 },
                                                                { name: 'معلمون', value: stats.teachers || 0 },
                                                                { name: 'دورات', value: stats.courses || 0 }
                                                            ]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                        >
                                                            <Cell fill="#3b82f6" />
                                                            <Cell fill="#10b981" />
                                                            <Cell fill="#f59e0b" />
                                                        </Pie>
                                                        <RechartsTooltip 
                                                            contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                            itemStyle={{ color: isDark ? '#fff' : '#000', fontWeight: 900 }}
                                                        />
                                                        <Legend verticalAlign="bottom" height={36}/>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center opacity-50 font-bold">جاري تحميل البيانات...</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'store' && (
                            <div className="space-y-12">
                                {/* 1. Categories Management */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-black text-white flex items-center gap-2"><ShoppingCart className="text-amber-400" /> التصنيفات</h3>
                                        <button onClick={() => setCategoryModal({ mode: 'create' })} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm">
                                            <Plus size={18} /> إضافة تصنيف
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {categories.map(cat => (
                                            <div key={cat.id} className={`${cardBg} p-5 rounded-2xl border flex items-center justify-between`}>
                                                <div>
                                                    <div className="text-white font-bold">{cat.name_ar}</div>
                                                    <div className="text-slate-500 text-[10px]">{cat._count.products} منتج</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setCategoryModal({ mode: 'edit', data: cat })} className="p-2 text-slate-400 hover:text-white"><Edit2 size={14} /></button>
                                                    <button onClick={async () => { if (confirm('حذف؟')) { await deleteStoreCategory(cat.id); loadData(); } }} className="p-2 text-red-400 hover:text-red-500"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* 2. Products Management */}
                                <section className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-slate-800">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white">إدارة المنتجات</h3>
                                                <p className="text-slate-500 text-xs font-bold mt-1">تعديل وإضافة منتجات المتجر</p>
                                            </div>
                                        </div>
                                        {storeSubView === 'list' ? (
                                            <button
                                                onClick={() => setStoreSubView('add')}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-blue-500/20"
                                            >
                                                <Plus size={18} /> إضافة منتج جديد
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { setStoreSubView('list'); setEditingProduct(null); }}
                                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm transition"
                                            >
                                                العودة للقائمة
                                            </button>
                                        )}
                                    </div>

                                    {storeSubView === 'list' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {products.map(p => (
                                                <div key={p.id} className={`${cardBg} rounded-3xl border border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all`}>
                                                    <div className="aspect-square bg-slate-800 relative">
                                                        <img src={p.image_url || 'https://placehold.co/400x400/1e293b/white?text=📦'} alt={p.name_ar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        <div className="absolute top-4 right-4 flex gap-2">
                                                            <button
                                                                onClick={() => { setEditingProduct(p); setStoreSubView('edit'); }}
                                                                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-blue-500 transition"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(p.id)}
                                                                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <div className="text-xs text-blue-400 font-black mb-2 uppercase">{p.category?.name_ar}</div>
                                                        <h4 className="text-lg font-black text-white mb-4 line-clamp-1">{p.name_ar}</h4>
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xl font-black text-amber-500">{Math.round(p.price).toLocaleString()} دج</div>
                                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black ${p.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                                {p.stock > 0 ? `متوفر: ${p.stock}` : 'نفذت الكمية'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {products.length === 0 && (
                                                <div className="col-span-full py-20 text-center bg-slate-800/20 rounded-[2.5rem] border border-dashed border-slate-700">
                                                    <Package size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                                                    <p className="text-slate-500 font-bold">لا يوجد منتجات حالياً. ابدأ بإضافة أول منتج!</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`${cardBg} p-8 rounded-[2.5rem] border border-white/5 animate-in slide-in-from-bottom-4 duration-500`}>
                                            <div className="mb-8">
                                                <h4 className="text-2xl font-black text-white">{storeSubView === 'add' ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h4>
                                                <p className="text-slate-500 text-sm font-bold mt-1">املأ البيانات التالية لإدارة المنتج في المتجر</p>
                                            </div>
                                            <form onSubmit={handleProductSubmit} className="space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                                        <label className="text-slate-400 text-xs font-black uppercase tracking-wider block">اسم المنتج</label>
                                                        <input name="name_ar" defaultValue={editingProduct?.name_ar} required className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="مثال: طقم أدوات إلكترونية" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-slate-400 text-xs font-black uppercase tracking-wider block">التصنيف</label>
                                                        <select name="category_id" defaultValue={editingProduct?.category_id} required className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold">
                                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-slate-400 text-xs font-black uppercase tracking-wider block">السعر (دج)</label>
                                                        <input name="price" type="number" step="1" defaultValue={editingProduct?.price} required className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-black text-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-slate-400 text-xs font-black uppercase tracking-wider block">المخزون المتوفر</label>
                                                        <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" />
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                                                        <label className="text-slate-400 text-xs font-black uppercase tracking-wider block">رابط صورة المنتج</label>
                                                        <input name="image_url" defaultValue={editingProduct?.image_url} placeholder="https://..." className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" />
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                                                        <label className="text-slate-400 text-xs font-black uppercase tracking-wider block">وصف المنتج</label>
                                                        <textarea name="description" defaultValue={editingProduct?.description} className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 font-medium" placeholder="اكتب تفاصيل المنتج هنا..." />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 pt-4">
                                                    <button type="submit" className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95">حفظ المنتج</button>
                                                    <button type="button" onClick={() => { setStoreSubView('list'); setEditingProduct(null); }} className="px-10 py-5 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all">إلغاء</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </section>

                                {/* 3. Delivery Management */}
                                <section className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-slate-800">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                                                <Truck size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white">إدارة تكاليف التوصيل</h3>
                                                <p className="text-slate-500 text-xs font-bold mt-1">تحديد سعر الشحن لكل ولاية (Laivrason tarif)</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDeliveryModal({ mode: 'create' })}
                                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-amber-500/20"
                                        >
                                            <Plus size={18} /> إضافة تسعيرة ولاية
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {deliveryTariffs.map(t => (
                                            <div key={t.id} className={`${cardBg} p-6 rounded-3xl border border-white/5 hover:border-amber-500/30 transition group`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                                                            {t.wilaya_num}
                                                        </div>
                                                        <div className="text-white font-black">{t.wilaya_ar}</div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                        <button onClick={() => setDeliveryModal({ mode: 'edit', data: t })} className="p-2 text-slate-400 hover:text-white"><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDeleteDelivery(t.id)} className="p-2 text-red-400 hover:text-red-500"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between">
                                                    <div className="text-2xl font-black text-amber-500">{t.fee.toLocaleString()} <span className="text-xs text-slate-500 font-bold">دج</span></div>
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black ${t.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                        {t.is_active ? 'نشط' : 'معطل'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {deliveryTariffs.length === 0 && (
                                            <div className="col-span-full py-12 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                                                <MapPin size={40} className="mx-auto text-slate-700 mb-4 opacity-20" />
                                                <p className="text-slate-500 font-bold">لم يتم ضبط أي تكاليف توصيل بعد. سيتم استخدام السعر الافتراضي (600 دج).</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* 4. Orders Management */}
                                <section>
                                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><ShoppingCart className="text-emerald-400" /> طلبات الشراء</h3>
                                    <div className={`${cardBg} rounded-[2.5rem] border overflow-hidden`}>
                                        <table className="w-full text-right text-sm">
                                            <thead className="bg-slate-900 text-slate-400">
                                                <tr>
                                                    <th className="p-6">الطلب</th>
                                                    <th className="p-6">الطالب</th>
                                                    <th className="p-6">المبلغ</th>
                                                    <th className="p-6">الدفع</th>
                                                    <th className="p-6">الحالة</th>
                                                    <th className="p-6">الإجراء</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {orders.map(order => (
                                                    <tr key={order.id} className="hover:bg-slate-800/30">
                                                        <td className="p-6">
                                                            <div className="text-white font-bold">#{order.id.slice(0, 8)}</div>
                                                            <div className="text-slate-500 text-[10px]">{new Date(order.created_at).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="text-white font-bold">{order.full_name || `${order.student.user.first_name} ${order.student.user.last_name}`}</div>
                                                            <div className="text-slate-500 text-[10px]">{order.phone_number}</div>
                                                            <div className="text-blue-400 text-[10px] font-bold mt-1">{order.wilaya} - {order.baladia}</div>
                                                        </td>
                                                        <td className="p-6 text-emerald-400 font-black">{order.total_amount.toLocaleString()} دج</td>
                                                        <td className="p-6">
                                                            <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-400">
                                                                {order.payment_type === 'COD' ? 'الدفع عند الاستلام' : 'Baridimob'}
                                                            </span>
                                                        </td>
                                                        <td className="p-6">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                                className="bg-slate-900 border border-slate-700 text-white p-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                                            >
                                                                <option value="PENDING">قيد الانتظار</option>
                                                                <option value="PROCESSING">قيد المعالجة</option>
                                                                <option value="SHIPPED">تم الشحن</option>
                                                                <option value="COMPLETED">مكتمل</option>
                                                                <option value="CANCELLED">ملغي</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-6 text-center">
                                                            <div className="flex items-center gap-2 justify-center">
                                                                <button
                                                                    onClick={() => setSelectedOrder(order)}
                                                                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
                                                                    title="عرض التفاصيل"
                                                                >
                                                                    <FileText size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-white flex items-center gap-2"><Users className="text-blue-400" /> إدارة المستخدمين</h3>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm">
                                        <UserPlus size={18} /> إضافة مستخدم
                                    </button>
                                </div>
                                <div className={`${cardBg} rounded-[2.5rem] border overflow-hidden`}>
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-slate-900 text-slate-400">
                                            <tr>
                                                <th className="p-6">المستخدم</th>
                                                <th className="p-6">البريد الإلكتروني</th>
                                                <th className="p-6">الدور</th>
                                                <th className="p-6">الحالة</th>
                                                <th className="p-6">تاريخ الانضمام</th>
                                                <th className="p-6">الإجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {users.map(u => (
                                                <tr key={u.id} className="hover:bg-slate-800/30">
                                                    <td className="p-6 font-bold text-white">{u.first_name} {u.last_name}</td>
                                                    <td className="p-6 text-slate-400">{u.email}</td>
                                                    <td className="p-6">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : u.role === 'TEACHER' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`flex items-center gap-1 ${u.is_active ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                            <Check size={12} /> {u.is_active ? 'نشط' : 'غير نشط'}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td className="p-6">
                                                        <div className="flex gap-2">
                                                            {u.role === 'STUDENT' && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm('تفعيل حساب VIP مجاني لمدة سنة لهذا الطالب؟')) {
                                                                            try {
                                                                                await activateStudentVip(u.id);
                                                                                loadData();
                                                                                alert('تم التفعيل بنجاح');
                                                                            } catch (e) {
                                                                                alert('فشل التفعيل');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white"
                                                                    title="منح اشتراك VIP"
                                                                >
                                                                    <Crown size={16} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleToggleUserStatus(u.id)}
                                                                className={`p-2 rounded-lg transition ${u.is_active ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                                                                title={u.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                                            >
                                                                {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => setUserModal({ mode: 'edit', data: u })}
                                                                className="p-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600"
                                                                title="تعديل المستخدم"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                                                                title="حذف المستخدم"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="space-y-10">
                                {/* SECTION 1: PENDING VIP SUBSCRIPTIONS */}
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                                        <Crown className="text-yellow-400" /> طلبات اشتراكات VIP المعلقة
                                    </h3>
                                    <div className={`${cardBg} rounded-[2.5rem] border overflow-hidden`}>
                                        <table className="w-full text-right text-sm">
                                            <thead className="bg-slate-900 text-slate-400">
                                                <tr>
                                                    <th className="p-6">معرف الطلب</th>
                                                    <th className="p-6">الطالب</th>
                                                    <th className="p-6">البريد الإلكتروني</th>
                                                    <th className="p-6">الخطة</th>
                                                    <th className="p-6">المبلغ المقدر</th>
                                                    <th className="p-6">تاريخ الطلب</th>
                                                    <th className="p-6 text-center">الإجراء</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {subscriptions.filter(s => s.status === 'PENDING').length > 0 ? (
                                                    subscriptions.filter(s => s.status === 'PENDING').map(sub => (
                                                        <tr key={sub.id} className="hover:bg-slate-800/30">
                                                            <td className="p-6 font-bold text-white">#{sub.id.slice(0, 8)}</td>
                                                            <td className="p-6 text-slate-200">
                                                                {sub.student?.user?.first_name} {sub.student?.user?.last_name}
                                                            </td>
                                                            <td className="p-6 text-slate-400">{sub.student?.user?.email}</td>
                                                            <td className="p-6">
                                                                <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                                    {sub.plan_type === 'YEARLY' ? 'VIP سنوي' : 'VIP شهري'}
                                                                </span>
                                                            </td>
                                                            <td className="p-6 text-emerald-400 font-black">
                                                                {sub.plan_type === 'YEARLY' ? '15,000 دج' : '1,500 دج'}
                                                            </td>
                                                            <td className="p-6 text-slate-500">
                                                                {new Date(sub.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-6 text-center">
                                                                <button
                                                                    onClick={() => handleApproveSubscription(sub.id)}
                                                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5 mx-auto"
                                                                >
                                                                    <Check size={14} /> تفعيل يدوي
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="p-12 text-center text-slate-500 font-bold">
                                                            لا توجد طلبات اشتراك VIP معلقة حالياً
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* SECTION 2: SUCCESSFUL PAYMENTS */}
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                                        <CreditCard className="text-emerald-400" /> سجل المعاملات المالية الناجحة
                                    </h3>
                                    <div className={`${cardBg} rounded-[2.5rem] border overflow-hidden`}>
                                        <table className="w-full text-right text-sm">
                                            <thead className="bg-slate-900 text-slate-400">
                                                <tr>
                                                    <th className="p-6">المعرف</th>
                                                    <th className="p-6">الطالب</th>
                                                    <th className="p-6">المبلغ</th>
                                                    <th className="p-6">النوع</th>
                                                    <th className="p-6">الحالة</th>
                                                    <th className="p-6">طريقة الدفع</th>
                                                    <th className="p-6">التاريخ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {payments.length > 0 ? (
                                                    payments.map(calc => (
                                                        <tr key={calc.id} className="hover:bg-slate-800/30">
                                                            <td className="p-6 font-bold text-white">#{calc.id.slice(0, 8)}</td>
                                                            <td className="p-6">
                                                                <div className="text-slate-200">
                                                                    {calc.student?.user?.first_name} {calc.student?.user?.last_name}
                                                                </div>
                                                                <div className="text-slate-500 text-[10px]">{calc.student?.user?.email}</div>
                                                            </td>
                                                            <td className="p-6 text-emerald-400 font-black">
                                                                {Math.round(calc.amount).toLocaleString()} دج
                                                            </td>
                                                            <td className="p-6">
                                                                {calc.subscription_id ? (
                                                                    <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/10 text-amber-500 flex items-center gap-1.5 w-fit border border-amber-500/20 shadow-sm">
                                                                        <Crown size={14} /> اشتراك VIP
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-blue-500/10 text-blue-400 flex items-center gap-1.5 w-fit border border-blue-500/20 shadow-sm">
                                                                        <ShoppingBag size={14} /> متجر الأكاديمية
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-6">
                                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black border border-emerald-500/20">
                                                                    {calc.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-6 text-slate-300 font-medium">
                                                                {calc.payment_method === 'MANUAL_APPROVAL' ? 'موافقة المدير' : calc.payment_method || 'Chargily'}
                                                            </td>
                                                            <td className="p-6 text-slate-500">
                                                                {new Date(calc.created_at).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="p-20 text-center text-slate-500 font-bold">
                                                            لا توجد عمليات دفع مسجلة حالياً
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reports' && reports && (
                            <div className="space-y-12 animate-premium-in">
                                <h3 className="text-2xl font-black text-white flex items-center gap-2"><FileText className="text-amber-400" /> تقارير المنصة</h3>

                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Monthly Revenue Chart */}
                                    <div className={`${cardBg} p-8 rounded-[2.5rem] border shadow-luxury`}>
                                        <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2"><DollarSign className="text-emerald-400" /> الإيرادات الشهرية (دج)</h4>
                                        <div className="h-64 flex items-end gap-3 w-full border-b border-slate-700 pb-2 relative">
                                            {reports.monthlyRevenue.map((item: any, i: number) => {
                                                const maxRev = Math.max(...reports.monthlyRevenue.map((r: any) => r.amount)) || 1;
                                                const height = `${(item.amount / maxRev) * 100}%`;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                        <div className="w-full bg-emerald-500/20 hover:bg-emerald-500/50 rounded-t-xl transition-all relative" style={{ height }}>
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                {item.amount.toLocaleString()} دج
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{item.month}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Monthly Users Chart */}
                                    <div className={`${cardBg} p-8 rounded-[2.5rem] border shadow-luxury`}>
                                        <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2"><Users className="text-blue-400" /> اشتراكات المستخدمين</h4>
                                        <div className="h-64 flex items-end gap-3 w-full border-b border-slate-700 pb-2 relative">
                                            {reports.monthlyUsers.map((item: any, i: number) => {
                                                const maxUsers = Math.max(...reports.monthlyUsers.map((r: any) => r.count)) || 1;
                                                const height = `${(item.count / maxUsers) * 100}%`;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                        <div className="w-full bg-blue-500/20 hover:bg-blue-500/50 rounded-t-xl transition-all relative" style={{ height }}>
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                {item.count} مستخدم
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{item.month}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Enrollments by Category */}
                                    <div className={`${cardBg} p-8 rounded-[2.5rem] border shadow-luxury`}>
                                        <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2"><BookOpen className="text-purple-400" /> التسجيلات حسب التصنيف</h4>
                                        <div className="space-y-4">
                                            {reports.enrollmentsByCategory.map((cat: any, i: number) => {
                                                const totalEnrolls = reports.enrollmentsByCategory.reduce((sum: number, c: any) => sum + c.count, 0) || 1;
                                                const pct = (cat.count / totalEnrolls) * 100;
                                                return (
                                                    <div key={i} className="space-y-2">
                                                        <div className="flex justify-between text-sm font-bold text-slate-300">
                                                            <span>{cat.name}</span>
                                                            <span className="text-slate-400">{cat.count}ط ({pct.toFixed(1)}%)</span>
                                                        </div>
                                                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(pct, 2)}%` }} />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {reports.enrollmentsByCategory.length === 0 && (
                                                <div className="text-center text-slate-500 py-10">لا توجد تسجيلات بعد</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Top Courses */}
                                    <div className={`${cardBg} p-8 rounded-[2.5rem] border shadow-luxury`}>
                                        <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2"><Star className="text-amber-400" /> أكثر الدورات إقبالاً</h4>
                                        <div className="space-y-4">
                                            {reports.topCourses.map((course: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl hover:bg-slate-800/50 transition border border-transparent hover:border-slate-700">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">{i + 1}</div>
                                                        <div>
                                                            <div className="text-white font-black text-sm">{course.name}</div>
                                                            <div className="text-slate-500 text-[10px]">{course.category}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-emerald-400 font-black flex items-center gap-1">
                                                        <Users size={14} /> {course.enrollments}
                                                    </div>
                                                </div>
                                            ))}
                                            {reports.topCourses.length === 0 && (
                                                <div className="text-center text-slate-500 py-10">لا توجد دورات بعد</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-4xl space-y-8">
                                <h3 className="text-2xl font-black text-white flex items-center gap-2"><Settings className="text-slate-400" /> إعدادات المنصة</h3>

                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className={`${cardBg} rounded-[2.5rem] border p-8 space-y-8`}>
                                        <h4 className="text-white font-black text-lg mb-4">الإعدادات العامة</h4>
                                        <div className="space-y-6">
                                            {['site_name', 'support_email', 'contact_phone'].map(key => {
                                                const setting = settings.find(s => s.key === key);
                                                return (
                                                    <div key={key}>
                                                        <label className="text-slate-400 text-xs font-bold mb-3 block text-right">
                                                            {key === 'site_name' ? 'اسم المنصة' : key === 'support_email' ? 'البريد الإلكتروني للدعم' : 'رقم الهاتف'}
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                defaultValue={setting?.value || (key === 'site_name' ? 'Sadeem Learn' : '')}
                                                                id={`input-${key}`}
                                                                className="flex-1 p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <button
                                                                onClick={() => handleUpdateSetting(key, (document.getElementById(`input-${key}`) as HTMLInputElement).value)}
                                                                className="px-4 bg-blue-600 text-white rounded-xl font-bold text-xs"
                                                            >حفظ</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className={`${cardBg} rounded-[2.5rem] border p-8 space-y-8`}>
                                        <h4 className="text-white font-black text-lg mb-4">خيارات التسجيل والنظام</h4>
                                        <div className="space-y-6">
                                            {[
                                                { key: 'allow_registration', label: 'تسجيل مستخدمين جدد', desc: 'السماح بإنشاء حسابات جديدة تلقائياً' },
                                                { key: 'maintenance_mode', label: 'وضع الصيانة', desc: 'تعطيل الوصول للمنصة مؤقتاً' },
                                                { key: 'enable_gamification', label: 'تفعيل نظام النقاط', desc: 'منح الطالب نقاط XP عند إكمال الدروس' }
                                            ].map(item => {
                                                const setting = settings.find(s => s.key === item.key);
                                                const isActive = setting?.value === 'true';
                                                return (
                                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl transition hover:bg-slate-800/50">
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{item.label}</div>
                                                            <div className="text-[10px] text-slate-500">{item.desc}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUpdateSetting(item.key, isActive ? 'false' : 'true')}
                                                            className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                                        >
                                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <RagDocumentUploader />
                                </div>
                            </div>
                        )}

                        {activeTab === 'community' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500">
                                            <MessageSquare size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">إدارة المجتمع</h3>
                                            <p className="text-slate-500 text-xs font-bold mt-1">مراقبة وحذف المنشورات غير اللائقة</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 bg-slate-800 px-4 py-2 rounded-xl font-bold">
                                        إجمالي المنشورات: {communityPosts.length}
                                    </div>
                                </div>

                                {communityLoading ? (
                                    <div className="flex justify-center py-20"><Loading /></div>
                                ) : (
                                    <div className={`${cardBg} rounded-[2.5rem] border overflow-hidden`}>
                                        <table className="w-full text-right text-sm">
                                            <thead className="bg-slate-900 text-slate-400">
                                                <tr>
                                                    <th className="p-6">المنشور</th>
                                                    <th className="p-6">النوع</th>
                                                    <th className="p-6">المبدع</th>
                                                    <th className="p-6 text-center">التفاعلات</th>
                                                    <th className="p-6 text-center">الإجراء</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {communityPosts.map(post => (
                                                    <tr key={post.id} className="hover:bg-slate-800/30">
                                                        <td className="p-6 max-w-xs">
                                                            <div className="text-white font-bold truncate">{post.title}</div>
                                                            <div className="text-slate-500 text-[10px] line-clamp-1">{post.content}</div>
                                                        </td>
                                                        <td className="p-6">
                                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${post.type === 'PROJECT' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                                {post.type === 'PROJECT' ? 'مشروع' : 'سؤال'}
                                                            </span>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="text-white font-bold">{post.author?.user.first_name} {post.author?.user.last_name}</div>
                                                            <div className="text-slate-500 text-[10px]">{new Date(post.created_at).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex items-center justify-center gap-4 text-slate-400">
                                                                <span className="flex items-center gap-1 text-[10px]"><Heart size={12} /> {post._count?.reactions || 0}</span>
                                                                <span className="flex items-center gap-1 text-[10px]"><MessageCircle size={12} /> {post._count?.comments || 0}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    onClick={() => window.open(`/community/posts/${post.id}`, '_blank')} // Simplified for admin mock
                                                                    className="p-2 text-blue-400 hover:text-blue-300"
                                                                    title="عرض المنشور"
                                                                >
                                                                    <Activity size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCommunityPost(post.id)}
                                                                    className="p-2 text-red-500 hover:text-red-400"
                                                                    title="حذف المنشور"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {communityPosts.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="p-20 text-center text-slate-500 font-bold">لا توجد منشورات مسجلة حالياً</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>


            {categoryModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className={`${cardBg} w-full max-w-md rounded-[2.5rem] border border-slate-700 p-8 shadow-2xl`}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-white">{categoryModal.mode === 'create' ? 'إضافة تصنيف جديد' : 'تعديل التصنيف'}</h3>
                            <button onClick={() => setCategoryModal(null)} className="p-2 text-slate-400 hover:text-white"><X /></button>
                        </div>
                        <form onSubmit={handleCategorySubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-slate-400 text-xs font-bold mb-2 block text-right">اسم التصنيف (بالعربية)</label>
                                    <input name="name_ar" defaultValue={categoryModal.data?.name_ar} required className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-right" placeholder="مثال: كتب برمجية" />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-xs font-bold mb-2 block text-left">Category Name (English)</label>
                                    <input
                                        name="name_en"
                                        defaultValue={categoryModal.data?.name_en}
                                        required
                                        className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-left"
                                        placeholder="e.g. Programming Books"
                                        onBlur={(e) => {
                                            const slugInput = document.getElementsByName('slug')[0] as HTMLInputElement;
                                            if (slugInput && !slugInput.value) {
                                                slugInput.value = slugify(e.target.value);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-slate-400 text-xs font-bold mb-2 block text-right">الأيقونة (Emoji)</label>
                                        <input name="icon" defaultValue={categoryModal.data?.icon} className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-center" placeholder="📚" />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-xs font-bold mb-2 block text-left">الاسم المختصر (Slug)</label>
                                        <input name="slug" defaultValue={categoryModal.data?.slug} required placeholder="books" className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-left" />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl shadow-lg transition">حفظ التصنيف</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[3rem] p-8 lg:p-12 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                            <div>
                                <h3 className="text-2xl font-black text-white">تفاصيل الطلب <span className="text-blue-500">#{selectedOrder.id.slice(0, 8)}</span></h3>
                                <p className="text-slate-500 text-sm font-bold mt-1">{new Date(selectedOrder.created_at).toLocaleString('ar-DZ')}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition"><X size={24} /></button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">معلومات المشتري</h4>
                                    <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-white/5 space-y-3">
                                        <div className="flex justify-between font-bold text-sm">
                                            <span className="text-slate-400">الاسم:</span>
                                            <span className="text-white">{selectedOrder.full_name || `${selectedOrder.student.user.first_name} ${selectedOrder.student.user.last_name}`}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-sm">
                                            <span className="text-slate-400">الهاتف:</span>
                                            <span className="text-blue-400" dir="ltr">{selectedOrder.phone_number}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-sm">
                                            <span className="text-slate-400">البريد:</span>
                                            <span className="text-slate-300">{selectedOrder.student.user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">العنوان والشحن</h4>
                                    <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-white/5 space-y-3">
                                        <div className="flex justify-between font-bold text-sm">
                                            <span className="text-slate-400">الولاية:</span>
                                            <span className="text-white">{selectedOrder.wilaya}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-sm">
                                            <span className="text-slate-400">البلدية:</span>
                                            <span className="text-white">{selectedOrder.baladia}</span>
                                        </div>
                                        <div className="pt-3 border-t border-white/5">
                                            <span className="text-slate-400 text-xs block mb-2">العنوان التفصيلي:</span>
                                            <p className="text-slate-200 text-sm font-medium leading-relaxed">{selectedOrder.delivery_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">المنتجات المختارة</h4>
                                    <div className="bg-slate-800/50 rounded-[2rem] border border-white/5 overflow-hidden">
                                        <div className="max-h-[250px] overflow-y-auto p-2 no-scrollbar">
                                            {selectedOrder.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition">
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{item.product.name_ar}</div>
                                                        <div className="text-[10px] text-slate-500 font-black">الكمية: {item.quantity} × {item.price.toLocaleString()} دج</div>
                                                    </div>
                                                    <span className="text-sm font-black text-emerald-400">{(item.price * item.quantity).toLocaleString()} دج</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-6 bg-slate-800 border-t border-white/5 space-y-3 shadow-inner">
                                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                                <span>المجموع الفرعي</span>
                                                <span>{(selectedOrder.total_amount - (selectedOrder.shipping_fee || 0)).toLocaleString()} دج</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                                <span>رسوم التوصيل</span>
                                                <span>{(selectedOrder.shipping_fee || 0).toLocaleString()} دج</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-black text-amber-500 pt-3 border-t border-white/5 uppercase">
                                                <span>إجمالي المبلغ</span>
                                                <span>{selectedOrder.total_amount.toLocaleString()} دج</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm hover:bg-slate-700 transition flex items-center justify-center gap-2"
                                    >
                                        📥 طباعة
                                    </button>
                                    <a
                                        href={`https://wa.me/${selectedOrder.phone_number.replace(/\s+/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 transition flex items-center justify-center gap-2"
                                    >
                                        💬 WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELIVERY MODAL */}

            {deliveryModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4">
                    <div className={`${cardBg} w-full max-w-md rounded-[3rem] border border-white/10 p-10 shadow-3xl animate-in fade-in zoom-in duration-300`}>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white">{deliveryModal.mode === 'create' ? 'إضافة تسعيرة شحن' : 'تعديل تسعيرة شحن'}</h3>
                                <p className="text-slate-500 text-xs font-bold mt-1">ضبط سعر التوصيل لولاية محددة</p>
                            </div>
                            <button onClick={() => setDeliveryModal(null)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition"><X /></button>
                        </div>
                        <form onSubmit={handleDeliverySubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 block text-right">رقم الولاية</label>
                                        <input
                                            name="wilaya_num"
                                            defaultValue={deliveryModal.data?.wilaya_num}
                                            placeholder="مثال: 16"
                                            required
                                            className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 block text-right">اسم الولاية</label>
                                        <input
                                            name="wilaya_ar"
                                            defaultValue={deliveryModal.data?.wilaya_ar}
                                            placeholder="الجزائر"
                                            required
                                            className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-right"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 block text-right">سعر الشحن (دج)</label>
                                    <div className="relative">
                                        <input
                                            name="fee"
                                            type="number"
                                            defaultValue={deliveryModal.data?.fee}
                                            required
                                            className="w-full p-4 pl-12 bg-slate-900 border border-slate-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-black text-xl"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">دج</div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black rounded-[2rem] shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 active:scale-95">
                                {deliveryModal.mode === 'create' ? 'إضافة التسعيرة' : 'تحديث التسعيرة'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* USER MODAL */}
            {userModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[130] flex items-center justify-center p-4">
                    <div className={`${cardBg} w-full max-w-md rounded-[3rem] border border-white/10 p-10 shadow-3xl animate-in fade-in zoom-in duration-300`}>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white">تعديل بيانات المستخدم</h3>
                                <p className="text-slate-500 text-xs font-bold mt-1">{userModal.data?.email}</p>
                            </div>
                            <button onClick={() => setUserModal(null)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition"><X /></button>
                        </div>
                        <form onSubmit={handleUserSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 block text-right">الاسم الأول</label>
                                        <input
                                            name="first_name"
                                            defaultValue={userModal.data?.first_name}
                                            required
                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 block text-right">اللقب</label>
                                        <input
                                            name="last_name"
                                            defaultValue={userModal.data?.last_name}
                                            required
                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 block text-right">الدور (Role)</label>
                                    <select
                                        name="role"
                                        defaultValue={userModal.data?.role}
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    >
                                        <option value="STUDENT">طالب (STUDENT)</option>
                                        <option value="TEACHER">أستاذ (TEACHER)</option>
                                        <option value="ADMIN">مدير (ADMIN)</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-900 border border-white/5 rounded-2xl">
                                    <span className="text-white text-sm font-bold">الحساب نشط</span>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        defaultChecked={userModal.data?.is_active}
                                        className="w-6 h-6 rounded-lg bg-slate-800 border-white/10 text-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:opacity-90 transition transform active:scale-[0.98]"
                            >
                                حفظ التغييرات 💾
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
