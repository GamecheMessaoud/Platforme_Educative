import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Package,
    ShoppingCart, Plus, Minus, Trash2, X,
    Star, ChevronLeft
} from 'lucide-react';
import { getStoreCategories, getStoreProducts } from '../services/storeService';
import { useCartStore } from '../store/cartStore';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';

const formatPrice = (price: number) => Math.round(price).toLocaleString();

export default function StorePage() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { items: cart, addItem: addToCart, removeItem: removeFromCart, updateQuantity, getTotal: getCartTotal } = useCartStore();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeCategory]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cats, prods] = await Promise.all([
                getStoreCategories(),
                getStoreProducts(activeCategory || undefined)
            ]);
            setCategories(cats);
            setProducts(prods);
        } catch (error) {
            console.error('Error loading store:', error);
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = getCartTotal();

    // Theme-based classes
    const bg = isDark ? 'bg-[#050505] text-[#f8fafc]' : 'bg-slate-50 text-slate-900';
    const headerBg = isDark ? 'bg-[#0a0c10]/80 border-white/5' : 'bg-white/80 border-slate-200';
    const cardBg = isDark ? 'bg-[#0a0c10] border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';
    const cartBtnBg = isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900';
    const catActiveBg = isDark ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30';
    const catInactiveBg = isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200';
    const emptyBg = isDark ? 'text-slate-500' : 'text-slate-400';
    const priceBadgeBg = isDark ? 'bg-white/10 backdrop-blur-xl text-amber-400 border border-white/10 font-bold' : 'bg-white/90 backdrop-blur-md text-amber-600 border border-slate-200 font-bold';
    const productNameColor = isDark ? 'text-slate-100' : 'text-slate-900';
    const productDescColor = isDark ? 'text-slate-400' : 'text-slate-500';
    const addBtnBg = isDark ? 'bg-[#13161c] hover:bg-amber-500 text-amber-500 hover:text-white border border-white/5 hover:border-amber-500' : 'bg-slate-50 hover:bg-amber-500 text-slate-700 hover:text-white border border-slate-200';
    const cartDrawerBg = isDark ? 'bg-[#050505] border-white/5' : 'bg-white border-slate-200';
    const cartItemBg = isDark ? 'bg-[#0a0c10] border-white/5 hover:bg-white/5 transition-colors' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors';
    const cartItemImgBg = isDark ? 'bg-black/50' : 'bg-white';
    const cartFooterBg = isDark ? 'bg-[#0a0c10] border-t border-white/5' : 'bg-slate-50 border-t border-slate-200';
    const qtyBtnBg = isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700';

    return (
        <div className={`min-h-screen font-['Inter'] ${bg} transition-colors duration-500`} dir="rtl">
            {/* Header */}
            <header className={`sticky top-0 z-50 ${headerBg} backdrop-blur-xl border-b p-4 transition-all duration-300`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <ShoppingBag className="text-white relative z-10" size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-l from-amber-400 to-orange-600">
                                متجر المنصة
                            </h1>
                            <p className={`text-xs font-bold tracking-wide uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Store</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowCart(true)}
                            className={`relative p-3.5 ${cartBtnBg} rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95`}
                        >
                            <ShoppingCart size={22} />
                            {cart.length > 0 && (
                                <span className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 animate-bounce-in`}>
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-16">
                {/* Hero / Banner */}
                <section className="relative h-72 lg:h-[400px] rounded-[3rem] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />

                    {/* Decorative Elements */}
                    <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-10 left-10 w-48 h-48 bg-black/20 rounded-full blur-3xl" />

                    <div className="absolute inset-0 flex flex-col justify-center p-12 space-y-6 text-white z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
                            <Star size={16} className="text-amber-300 fill-amber-300" />
                            <span className="text-xs font-bold tracking-widest text-amber-50 uppercase">Premium Selection</span>
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black max-w-2xl leading-[1.1] drop-shadow-xl">
                            معدات المستقبل<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white">بين يديك.</span>
                        </h2>
                        <p className="text-white/80 font-medium text-lg lg:text-xl max-w-xl leading-relaxed">
                            استكشف مجموعتنا الحصرية من الحقائب التعليمية والإلكترونيات المصممة خصيصاً لتطوير مهاراتك البرمجية.
                        </p>
                    </div>
                    <div className="absolute left-10 lg:left-24 bottom-0 top-0 flex items-center opacity-10 pointer-events-none transform -rotate-12 scale-150">
                        <Package size={400} strokeWidth={1} />
                    </div>
                </section>

                {/* Categories */}
                <section>
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar px-2">
                        <button
                            onClick={() => {
                                setActiveCategory(null);
                                setSelectedProduct(null);
                            }}
                            className={`px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300 whitespace-nowrap outline-none focus:ring-2 focus:ring-amber-500/50 ${!activeCategory ? catActiveBg : catInactiveBg}`}
                        >
                            جميع المنتجات
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setSelectedProduct(null);
                                }}
                                className={`px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-3 outline-none focus:ring-2 focus:ring-amber-500/50 ${activeCategory === cat.id ? catActiveBg : catInactiveBg}`}
                            >
                                <span className={`text-xl ${activeCategory === cat.id ? 'opacity-100' : 'opacity-70'}`}>{cat.icon}</span>
                                {cat.name_ar}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Content Area */}
                <section>
                    {selectedProduct ? (
                        <div className="animate-premium-in space-y-10">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className={`flex items-center gap-2 font-black text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}
                            >
                                <ChevronLeft size={20} className="rotate-180" /> عودة للمتجر
                            </button>

                            <div className={`grid lg:grid-cols-2 gap-12 ${cardBg} p-8 lg:p-12 rounded-[3.5rem] overflow-hidden`}>
                                <div className={`aspect-square rounded-[2.5rem] ${isDark ? 'bg-[#13161c]' : 'bg-slate-100'} p-8 flex items-center justify-center relative overflow-hidden group`}>
                                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/10 pointer-events-none" />
                                    {selectedProduct.image_url ? (
                                        <img src={selectedProduct.image_url} alt={selectedProduct.name_ar} className="w-[90%] h-[90%] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <Package size={120} className="opacity-10" />
                                    )}
                                </div>

                                <div className="flex flex-col h-full space-y-8">
                                    <div className="space-y-4">
                                        <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 font-black text-[10px] uppercase tracking-widest rounded-full border border-amber-500/20 w-fit block">
                                            {selectedProduct.category.name_ar}
                                        </span>
                                        <h3 className={`text-4xl lg:text-5xl font-black leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{selectedProduct.name_ar}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1 text-amber-500">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />)}
                                            </div>
                                            <span className="text-sm font-bold opacity-50">(4.0) مراجعات الطلاب</span>
                                        </div>
                                    </div>

                                    <div className="text-4xl font-black text-amber-500">
                                        {formatPrice(selectedProduct.price)} دج
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>وصف المنتج</h4>
                                        <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                            {selectedProduct.description || 'هذا المنتج مصمم بعناية لتمكين الطلاب من فهم أعمق للتقنيات الحديثة. يوفر تجربة تعليمية عملية وممتعة تساهم في بناء مهارات المستقبل.'}
                                        </p>
                                    </div>

                                    <div className="pt-8 mt-auto flex flex-col sm:flex-row gap-4">
                                        {(() => {
                                            const inCart = cart.find(i => i.id === selectedProduct.id);
                                            if (inCart) {
                                                return (
                                                    <div className="flex-1 flex items-center gap-4 p-2 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                                        <button onClick={() => {
                                                            if (inCart.quantity <= 1) removeFromCart(selectedProduct.id);
                                                            else updateQuantity(selectedProduct.id, inCart.quantity - 1);
                                                        }} className={`w-14 h-14 rounded-xl transition-all flex items-center justify-center ${qtyBtnBg}`}>
                                                            <Minus size={22} />
                                                        </button>
                                                        <div className="flex-1 text-center font-black text-2xl text-amber-500">{inCart.quantity}</div>
                                                        <button onClick={() => updateQuantity(selectedProduct.id, inCart.quantity + 1)} className="w-14 h-14 bg-amber-500 hover:bg-amber-400 text-white shadow-lg rounded-xl flex items-center justify-center">
                                                            <Plus size={22} />
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <button
                                                    onClick={() => addToCart(selectedProduct)}
                                                    className="flex-1 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                                                >
                                                    <Plus size={24} /> إضافة للسلة
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        loading ? (
                            <div className="py-32 flex flex-col items-center justify-center space-y-4">
                                <Loading />
                                <p className={`font-bold ${emptyBg} animate-pulse`}>جاري تحميل المنتجات الرائعة...</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {products.length === 0 ? (
                                    <div className={`col-span-full py-32 flex flex-col items-center justify-center ${emptyBg} rounded-[3rem] border border-dashed ${isDark ? 'border-white/10' : 'border-slate-300'}`}>
                                        <Package size={80} className="mb-6 opacity-20" />
                                        <h3 className="text-2xl font-black mb-2 text-slate-400">لا توجد منتجات</h3>
                                        <p className="font-medium opacity-70">لم يتم العثور على منتجات في هذا التصنيف حالياً.</p>
                                    </div>
                                ) : (
                                    products.map((prod, index) => (
                                        <div
                                            key={prod.id}
                                            onClick={() => setSelectedProduct(prod)}
                                            className={`group ${cardBg} rounded-[2.5rem] overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-500 relative cursor-pointer`}
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            {/* Hover Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                            <div className={`h-64 ${isDark ? 'bg-[#13161c]' : 'bg-slate-100'} relative p-4 flex items-center justify-center overflow-hidden`}>
                                                {/* Subtle vignette */}
                                                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/20 pointer-events-none z-10" />

                                                {prod.image_url ? (
                                                    <img
                                                        src={prod.image_url}
                                                        alt={prod.name_ar}
                                                        className="w-[85%] h-[85%] object-contain transition-transform duration-700 group-hover:scale-110 relative z-0 drop-shadow-2xl"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-white/5' : 'text-black/5'} relative z-0`}>
                                                        <Package size={80} />
                                                    </div>
                                                )}
                                                <div className={`absolute top-4 right-4 ${priceBadgeBg} px-4 py-2 rounded-2xl text-sm shadow-xl z-20 transition-transform duration-300 group-hover:scale-105`}>
                                                    {formatPrice(prod.price)} دج
                                                </div>
                                            </div>
                                            <div className="p-6 lg:p-8 flex-1 flex flex-col relative z-20">
                                                <div className="text-[10px] text-amber-500 font-black mb-3 flex items-center gap-2 uppercase tracking-widest bg-amber-500/10 w-fit px-3 py-1 rounded-full border border-amber-500/20">
                                                    {prod.category.name_ar}
                                                </div>
                                                <h3 className={`text-xl font-black mb-3 ${productNameColor} line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors`}>{prod.name_ar}</h3>
                                                <p className={`${productDescColor} text-sm font-medium line-clamp-2 mb-8 leading-relaxed`}>
                                                    {prod.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}
                                                </p>

                                                {(() => {
                                                    const inCart = cart.find(i => i.id === prod.id);
                                                    if (inCart) {
                                                        return (
                                                            <div className="mt-auto flex items-center gap-3 p-1.5 bg-amber-500/10 rounded-2xl border border-amber-500/20" onClick={e => e.stopPropagation()}>
                                                                <button onClick={() => {
                                                                    if (inCart.quantity <= 1) removeFromCart(prod.id);
                                                                    else updateQuantity(prod.id, inCart.quantity - 1);
                                                                }} className={`w-12 h-12 bg-white/10 hover:bg-red-500/80 hover:text-white rounded-xl font-black transition-all flex items-center justify-center ${isDark ? 'text-slate-300' : 'text-slate-700 bg-white shadow-sm'}`}>
                                                                    <Minus size={18} />
                                                                </button>
                                                                <div className="flex-1 text-center font-black text-xl text-amber-500">
                                                                    {inCart.quantity}
                                                                </div>
                                                                <button onClick={() => updateQuantity(prod.id, inCart.quantity + 1)}
                                                                    className="w-12 h-12 bg-amber-500 hover:bg-amber-400 text-white shadow-lg rounded-xl font-black transition-all flex items-center justify-center">
                                                                    <Plus size={18} />
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart(prod);
                                                        }}
                                                            className={`mt-auto w-full py-4.5 ${addBtnBg} rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-3 group/btn hover:shadow-lg hover:shadow-amber-500/20`}>
                                                            <Plus size={18} className="transition-transform duration-300 group-hover/btn:rotate-90 group-hover/btn:scale-110" />
                                                            إضافة للسلة
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )
                    )}
                </section>
            </main>

            {/* Premium Cart Drawer */}
            {showCart && (
                <div className="fixed inset-0 z-[100] transition-opacity">
                    <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300`} onClick={() => setShowCart(false)} />
                    <div className={`absolute left-0 top-0 bottom-0 w-full max-w-sm ${cartDrawerBg} border-r shadow-2xl flex flex-col animate-slide-left`}>
                        <div className={`p-6 md:p-8 border-b ${isDark ? 'border-white/5' : 'border-slate-200'} flex items-center justify-between`}>
                            <h3 className={`text-2xl font-black flex items-center gap-3 ${productNameColor}`}>
                                <ShoppingBag className="text-amber-500" /> سلة المشتريات
                                <span className={`text-xs ml-2 px-3 py-1 rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{cart.length}</span>
                            </h3>
                            <button onClick={() => setShowCart(false)} className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className={`h-full flex flex-col items-center justify-center ${emptyBg} space-y-6`}>
                                    <div className={`w-32 h-32 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-50'} flex items-center justify-center`}>
                                        <ShoppingBag size={48} className="opacity-20" />
                                    </div>
                                    <p className="font-bold text-lg">سلتك فارغة حالياً</p>
                                    <button onClick={() => setShowCart(false)} className={`px-6 py-3 rounded-xl font-bold text-sm ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} transition-all`}>
                                        العودة للتسوق
                                    </button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className={`flex gap-5 p-4 ${cartItemBg} rounded-3xl border relative group hover:shadow-lg transition-all duration-300`}>
                                        <div className={`w-24 h-24 ${cartItemImgBg} rounded-2xl flex-shrink-0 flex items-center justify-center p-2 relative overflow-hidden`}>
                                            {item.image_url ? (
                                                <img src={item.image_url} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                            ) : (
                                                <span className="text-4xl opacity-50">{item.icon || '📦'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className={`font-black text-sm line-clamp-2 leading-tight ${productNameColor} pr-6`}>{item.name_ar}</h4>
                                                <p className="text-amber-500 font-black text-sm mt-1.5">{formatPrice(item.price)} دج</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <button onClick={() => {
                                                    if (item.quantity <= 1) removeFromCart(item.id);
                                                    else updateQuantity(item.id, item.quantity - 1);
                                                }} className={`w-8 h-8 ${qtyBtnBg} rounded-lg flex items-center justify-center transition-all`}>
                                                    <Minus size={14} />
                                                </button>
                                                <span className={`text-sm font-black min-w-[32px] text-center ${productNameColor}`}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className={`w-8 h-8 ${qtyBtnBg} rounded-lg flex items-center justify-center transition-all`}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className={`absolute top-4 left-4 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className={`p-6 md:p-8 ${cartFooterBg} space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]`}>
                                <div className="space-y-3">
                                    <div className={`flex justify-between items-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>
                                        <span>توصيل</span>
                                        <span>يتم حسابه لاحقاً</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-500/30">
                                        <span className={`font-black text-lg ${productNameColor}`}>الإجمالي</span>
                                        <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                                            {formatPrice(cartTotal)} دج
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-5 bg-gradient-to-r from-amber-500 hover:from-amber-400 to-orange-600 hover:to-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 group/checkout"
                                >
                                    متابعة الدفع
                                    <ShoppingBag size={20} className="transition-transform duration-300 group-hover/checkout:scale-110" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
}
