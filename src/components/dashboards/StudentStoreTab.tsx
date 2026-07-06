import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Package,
    ShoppingCart, Plus, Minus, Trash2, X,
    Star, ChevronLeft
} from 'lucide-react';
import { getStoreCategories, getStoreProducts } from '../../services/storeService';
import { useCartStore } from '../../store/cartStore';
import { useTheme } from '../../context/ThemeContext';
import Loading from '../Loading';

const formatPrice = (price: number) => Math.round(price).toLocaleString();

export default function StudentStoreTab() {
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

    const cardBg = isDark ? 'bg-[#0a0c10] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl';
    const cartBtnBg = isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900';
    const catActiveBg = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20';
    const catInactiveBg = isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200';
    const priceBadgeBg = isDark ? 'bg-white/10 backdrop-blur-xl text-amber-400 border border-white/10 font-bold' : 'bg-white/90 backdrop-blur-md text-amber-600 border border-slate-200 font-bold';
    const productNameColor = isDark ? 'text-slate-100' : 'text-slate-900';
    const productDescColor = isDark ? 'text-slate-400' : 'text-slate-500';
    const addBtnBg = isDark ? 'bg-[#13161c] hover:bg-amber-500 text-amber-500 hover:text-white border border-white/5 hover:border-amber-500' : 'bg-slate-50 hover:bg-amber-500 text-slate-700 hover:text-white border border-slate-200';
    const cartDrawerBg = isDark ? 'bg-[#050505] border-white/5' : 'bg-white border-slate-200';
    const cartItemBg = isDark ? 'bg-[#0a0c10] border-white/5' : 'bg-slate-50 border-slate-200';
    const qtyBtnBg = isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700';

    return (
        <div className="space-y-12 animate-premium-in" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 relative overflow-hidden group">
                        <ShoppingBag className="text-white relative z-10" size={22} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-l from-amber-400 to-orange-600">
                            متجر المنصة
                        </h2>
                        <p className={`text-xs font-bold tracking-wide uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Store</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowCart(true)}
                    className={`relative p-3.5 ${cartBtnBg} rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95`}
                >
                    <ShoppingCart size={22} />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 animate-bounce-in">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Banner */}
            <section className="relative h-64 rounded-[3rem] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 flex flex-col justify-center p-12 space-y-6 text-white z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
                        <Star size={16} className="text-amber-300 fill-amber-300" />
                        <span className="text-xs font-bold tracking-widest text-amber-50 uppercase">Premium Selection</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black max-w-2xl leading-[1.1] drop-shadow-xl">
                        معدات المستقبل بين يديك.
                    </h2>
                    <p className="text-white/80 font-medium text-lg max-w-xl leading-relaxed">
                        استكشف مجموعتنا الحصرية من الحقائب التعليمية والإلكترونيات.
                    </p>
                </div>
            </section>

            {/* Categories */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar px-2">
                <button
                    onClick={() => setActiveCategory(null)}
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

            {/* Product Detail View */}
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
                                <h3 className={`text-4xl font-black leading-tight ${productNameColor}`}>{selectedProduct.name_ar}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1 text-amber-500">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />)}
                                    </div>
                                    <span className="text-sm font-bold opacity-50">(4.0) مراجعات الطلاب</span>
                                </div>
                            </div>

                            <div className={`text-4xl font-black text-amber-500`}>
                                {formatPrice(selectedProduct.price)} دج
                            </div>

                            <div className="space-y-4">
                                <h4 className={`text-lg font-black ${productNameColor}`}>وصف المنتج</h4>
                                <p className={`${productDescColor} text-lg leading-relaxed font-medium`}>
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
                <section>
                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center space-y-4">
                            <Loading />
                            <p className={`font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} animate-pulse`}>جاري تحميل المنتجات الرائعة...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.length === 0 ? (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-500/20 text-slate-400">
                                    <Package size={80} className="mb-6 opacity-20" />
                                    <h3 className="text-2xl font-black mb-2">لا توجد منتجات</h3>
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
                                        <div className={`h-64 ${isDark ? 'bg-[#13161c]' : 'bg-slate-100'} relative p-4 flex items-center justify-center overflow-hidden`}>
                                            {prod.image_url ? (
                                                <img src={prod.image_url} alt={prod.name_ar} className="w-[85%] h-[85%] object-contain transition-transform duration-700 group-hover:scale-110 relative z-0 drop-shadow-2xl" />
                                            ) : (
                                                <Package size={80} className="opacity-10" />
                                            )}
                                            <div className={`absolute top-4 right-4 ${priceBadgeBg} px-4 py-2 rounded-2xl text-sm shadow-xl z-20`}>
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
                                                            }} className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center ${qtyBtnBg}`}>
                                                                <Minus size={18} />
                                                            </button>
                                                            <div className="flex-1 text-center font-black text-xl text-amber-500">{inCart.quantity}</div>
                                                            <button onClick={() => updateQuantity(prod.id, inCart.quantity + 1)} className="w-12 h-12 bg-amber-500 hover:bg-amber-400 text-white shadow-lg rounded-xl flex items-center justify-center">
                                                                <Plus size={18} />
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(prod);
                                                    }} className={`mt-auto w-full py-4.5 ${addBtnBg} rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-3`}>
                                                        <Plus size={18} /> إضافة للسلة
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* Cart Drawer */}
            {showCart && (
                <div className="fixed inset-0 z-[100] transition-opacity">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCart(false)} />
                    <div className={`absolute left-0 top-0 bottom-0 w-full max-w-sm ${cartDrawerBg} border-r shadow-2xl flex flex-col animate-slide-left`}>
                        <div className={`p-8 border-b ${isDark ? 'border-white/5' : 'border-slate-200'} flex items-center justify-between`}>
                            <h3 className={`text-2xl font-black flex items-center gap-3 ${productNameColor}`}>
                                <ShoppingBag className="text-amber-500" /> سلة المشتريات
                                <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{cart.length}</span>
                            </h3>
                            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-500/10 rounded-xl transition-colors"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                                    <ShoppingBag size={80} />
                                    <p className="font-bold text-lg">سلتك فارغة حالياً</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className={`flex gap-5 p-4 ${cartItemBg} rounded-3xl border border-transparent hover:border-amber-500/20 transition-all`}>
                                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center p-2">
                                            {item.image_url ? <img src={item.image_url} className="w-full h-full object-contain" /> : <span>📦</span>}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <h4 className={`font-black text-sm line-clamp-1 ${productNameColor}`}>{item.name_ar}</h4>
                                            <p className="text-amber-500 font-black text-xs">{formatPrice(item.price)} دج</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${qtyBtnBg}`}><Minus size={14} /></button>
                                                <span className={`text-sm font-black ${productNameColor}`}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${qtyBtnBg}`}><Plus size={14} /></button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl self-center"><Trash2 size={18} /></button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className={`p-8 ${isDark ? 'bg-[#0a0c10]' : 'bg-slate-50'} border-t border-slate-500/10 space-y-6`}>
                                <div className="flex justify-between items-center">
                                    <span className={`font-black text-lg ${productNameColor}`}>الإجمالي</span>
                                    <span className="text-3xl font-black text-amber-500">{formatPrice(cartTotal)} دج</span>
                                </div>
                                <button onClick={() => navigate('/checkout')} className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/25">متابعة الدفع</button>
                            </div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
}
