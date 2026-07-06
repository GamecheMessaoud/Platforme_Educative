import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { createOrder, getDeliveryTariffs } from '../services/storeService';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';
import api from '../lib/api';

const formatPrice = (price: number) => Math.round(price).toLocaleString();

const wilayas = [
    "01-أدرار", "02-الشلف", "03-الأغواط", "04-أم البواقي", "05-باتنة", "06-بجاية", "07-بسكرة", "08-بشار", "09-البليدة",
    "10-البويرة", "11-تمنراست", "12-تبسة", "13-تلمسان", "14-تيارت", "15-تيزي وزو", "16-الجزائر", "17-الجلفة", "18-جيجل",
    "19-سطيف", "20-سعيدة", "21-سكيكدة", "22-سيدي بلعباس", "23-عنابة", "24-قالمة", "25-قسنطينة", "26-المدية", "27-مستغانم",
    "28-المسيلة", "29-معسكر", "30-ورقلة", "31-وهران", "32-البيض", "33-إليزي", "34-برج بوعريريج", "35-بومرداس",
    "36-الطارف", "37-تندوف", "38-تيسمسيلت", "39-الوادي", "40-خنشلة", "41-سوق أهراس", "42-تيبازة", "43-ميلة", "44-عين الدفلى",
    "45-النعامة", "46-عين تيموشنت", "47-غرداية", "48-غليزان", "49-تيميمون", "50-برج باجي مختار", "51-أولاد جلال",
    "52-بني عباس", "53-عين صالح", "54-عين قزام", "55-تقرت", "56-جانت", "57-المغير", "58-المنيعة"
];

const baladiasMapping: Record<string, string[]> = {
    "16-الجزائر": ["الجزائر الوسطى", "باب الواد", "الحراش", "بئر مراد رايس", "الدالية"],
    "31-وهران": ["وهران الوسطى", "بئر الجير", "السانية", "قديل"],
    "25-قسنطينة": ["قسنطينة", "الخروب", "حامة بوزيان"],
    "19-سطيف": ["سطيف", "العلمة", "بوقاعة"],
    "09-البليدة": ["البليدة", "بوفاريك", "العفرون"]
};

const defaultBaladias = ["مركز الولاية", "بلدية 02", "بلدية 03"];

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { items, getTotal, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        wilaya: '',
        baladia: '',
        delivery_address: '',
        payment_type: 'COD'
    });
    const [shippingFee, setShippingFee] = useState(0);
    const [tariffs, setTariffs] = useState<any[]>([]);

    // Premium Theme-based classes
    const bg = isDark ? 'bg-[#050505] text-[#f8fafc]' : 'bg-slate-50 text-slate-900';
    const navBg = isDark ? 'bg-[#0a0c10]/90 backdrop-blur-xl border-white/5' : 'bg-white/90 backdrop-blur-xl border-slate-200';
    const cardBg = isDark ? 'bg-[#0a0c10] border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';
    const titleColor = isDark ? 'text-white' : 'text-slate-900';
    const labelColor = isDark ? 'text-slate-300' : 'text-slate-700';
    const inputBg = isDark ? 'bg-[#13161c] border-white/10 text-white placeholder-slate-500 focus:bg-[#1a1e26] focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-amber-500';
    const paymentCardBg = isDark ? 'bg-[#13161c] border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-amber-200';
    const paymentCardActive = isDark ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-amber-500 bg-amber-50 focus:ring-4 ring-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]';
    const summaryBg = isDark ? 'bg-[#0a0c10] border-white/5 shadow-2xl shadow-black' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/50';
    const returnText = isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900';

    useEffect(() => {
        if (items.length === 0 && !orderSuccess) {
            navigate('/store');
        }
        loadTariffs();
    }, [items, orderSuccess, navigate]);

    const loadTariffs = async () => {
        try {
            const data = await getDeliveryTariffs();
            setTariffs(data);
        } catch (error) {
            console.error('Error loading tariffs:', error);
        }
    };

    const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, wilaya: val, baladia: '' });

        // Dynamic Shipping fee from backend
        const wilayaNum = val.split('-')[0];
        const tariff = tariffs.find(t => t.wilaya_num === wilayaNum);

        if (tariff) {
            setShippingFee(tariff.fee);
        } else {
            // Fallback logic
            let fee = 600;
            if (val.startsWith("16")) fee = 300;
            else if (val.startsWith("31") || val.startsWith("25") || val.startsWith("19")) fee = 500;
            else if (parseInt(val.split('-')[0]) > 48) fee = 900;
            setShippingFee(fee);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                items: items.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
                total_amount: getTotal() + shippingFee,
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                wilaya: formData.wilaya,
                baladia: formData.baladia,
                delivery_address: formData.delivery_address,
                shipping_fee: shippingFee,
                payment_type: formData.payment_type
            };

            const res = await createOrder(orderData);

            // If BARIDIMOB (Chargily), create checkout session and redirect
            if (formData.payment_type === 'BARIDIMOB') {
                try {
                    const chargilyRes = await api.post('/payments/checkout', {
                        orderId: res.id,
                        amount: getTotal() + shippingFee,
                        successUrl: `${window.location.origin}/checkout?status=success&orderId=${res.id}`,
                        failureUrl: `${window.location.origin}/checkout?status=failure&orderId=${res.id}`,
                    });
                    clearCart();
                    // Redirect to Chargily payment page
                    window.location.href = chargilyRes.data.checkout_url;
                    return;
                } catch (payErr) {
                    console.error('Chargily payment error:', payErr);
                    alert('حدث خطأ في نظام الدفع الإلكتروني. تم حفظ طلبك كدفع عند الاستلام.');
                }
            }

            setOrderSuccess(res.id);
            clearCart();
        } catch (error) {
            alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-[#050505]' : 'bg-slate-50'} flex items-center justify-center p-6 text-center`} dir="rtl">
                <div className="max-w-md animate-in zoom-in duration-500 relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full z-0 pointer-events-none" />
                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-600 text-white rounded-full flex items-center justify-center text-6xl mx-auto mb-8 shadow-2xl shadow-green-500/30 relative z-10">
                        <CheckCircle size={64} className="animate-bounce-in" />
                    </div>
                    <h2 className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-6 relative z-10`}>تم استلام طلبك بنجاح!</h2>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-10 text-lg leading-relaxed relative z-10`}>
                        شكراً لثقتك بنا. رقم طلبك هو <span className={`inline-block mt-2 px-4 py-1 rounded-lg ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900'} font-black text-xl tracking-wider`}>#{orderSuccess.slice(0, 8).toUpperCase()}</span><br />
                        سيتصل بك فريقنا قريباً لتأكيد تفاصيل الشحن.
                    </p>
                    <button
                        onClick={() => navigate('/student-dashboard')}
                        className={`inline-block ${isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'} px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 relative z-10`}
                    >
                        العودة للوحة التحكم
                    </button>
                </div>
            </div>
        );
    }

    const currentBaladias = baladiasMapping[formData.wilaya] || defaultBaladias;

    return (
        <div className={`min-h-screen ${bg} relative pb-20 transition-colors duration-500`} dir="rtl">
            <nav className={`${navBg} border-b px-6 py-4 sticky top-0 z-50 transition-colors`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/store')} className={`flex items-center gap-2 ${returnText} transition font-bold group`}>
                        <ChevronRight className="transition-transform group-hover:translate-x-1" /> العودة للمتجر
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-amber-500/20">KT</div>
                        <span className={`font-black text-xl ${titleColor}`}>إتمام الطلب المكتبي</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 mt-4">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
                    {/* Shipping Form */}
                    <div className="lg:col-span-7 space-y-10">
                        {/* Title Section */}
                        <div className="mb-2">
                            <h1 className={`text-4xl font-black ${titleColor} mb-3`}>أكمل طلبك</h1>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>الرجاء إدخال معلومات التوصيل والدفع بدقة لضمان وصول طلبك بأسرع وقت.</p>
                        </div>

                        <div className={`${cardBg} rounded-[2.5rem] p-8 lg:p-10 border transition-colors relative overflow-hidden`}>
                            <h2 className={`text-2xl font-black ${titleColor} mb-8 flex items-center gap-4`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isDark ? 'bg-white/5 text-amber-500 border border-white/10' : 'bg-slate-100 text-amber-600 border border-slate-200'}`}>🚚</div>
                                معلومات الشحن
                            </h2>

                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-7">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={`block text-sm font-bold ${labelColor}`}>الاسم الكامل</label>
                                        <input
                                            type="text" required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className={`w-full px-5 py-4 ${inputBg} border rounded-2xl outline-none transition-all duration-300`}
                                            placeholder="محمد الجزائري"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`block text-sm font-bold ${labelColor}`}>رقم الهاتف</label>
                                        <input
                                            type="tel" required
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            className={`w-full px-5 py-4 ${inputBg} border rounded-2xl outline-none transition-all duration-300`}
                                            placeholder="05 / 06 / 07 ..."
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={`block text-sm font-bold ${labelColor}`}>الولاية</label>
                                        <select
                                            required
                                            value={formData.wilaya}
                                            onChange={handleWilayaChange}
                                            className={`w-full px-5 py-4 ${inputBg} border rounded-2xl outline-none transition-all duration-300 cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_1rem_center]`}
                                        >
                                            <option value="" disabled>اختر الولاية</option>
                                            {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`block text-sm font-bold ${labelColor}`}>البلدية</label>
                                        <select
                                            required disabled={!formData.wilaya}
                                            value={formData.baladia}
                                            onChange={(e) => setFormData({ ...formData, baladia: e.target.value })}
                                            className={`w-full px-5 py-4 ${inputBg} border rounded-2xl outline-none transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_1rem_center]`}
                                        >
                                            <option value="" disabled>اختر البلدية</option>
                                            {currentBaladias.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={`block text-sm font-bold ${labelColor}`}>العنوان بالتدقيق</label>
                                    <textarea
                                        required rows={3}
                                        value={formData.delivery_address}
                                        onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                                        className={`w-full px-5 py-4 ${inputBg} border rounded-2xl outline-none transition-all duration-300 resize-none`}
                                        placeholder="الشارع، رقم المنزل، العمارة، علامات مميزة قرب المنزل..."
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        {/* Payment Methods */}
                        <div className={`${cardBg} rounded-[2.5rem] p-8 lg:p-10 border transition-colors`}>
                            <h2 className={`text-2xl font-black ${titleColor} mb-8 flex items-center gap-4`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isDark ? 'bg-white/5 text-emerald-400 border border-white/10' : 'bg-slate-100 text-emerald-600 border border-slate-200'}`}>💳</div>
                                طريقة الدفع
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className={`relative flex items-center gap-4 p-6 border-2 rounded-[2rem] cursor-pointer transition-all duration-300 ${formData.payment_type === 'COD' ? paymentCardActive : paymentCardBg}`}>
                                    <input type="radio" name="payment" value="COD" checked={formData.payment_type === 'COD'} onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })} className="hidden" />
                                    <div className={`w-16 h-16 ${isDark ? 'bg-[#0a0c10]' : 'bg-white'} rounded-2xl border ${isDark ? 'border-white/5' : 'border-slate-100'} flex items-center justify-center text-4xl shadow-sm drop-shadow-md`}>💵</div>
                                    <div className="flex-1">
                                        <h4 className={`font-black text-lg ${titleColor}`}>الدفع عند الاستلام</h4>
                                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold mt-1 leading-snug`}>ادفع نقداً ومباشرة عند استلام طردك</p>
                                    </div>
                                    <div className={`absolute top-4 left-4 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${formData.payment_type === 'COD' ? 'bg-amber-500 text-white scale-100' : 'bg-slate-700/20 text-transparent scale-0'}`}>✓</div>
                                </label>

                                <label className={`relative flex items-center gap-4 p-6 border-2 rounded-[2rem] cursor-pointer transition-all duration-300 ${formData.payment_type === 'BARIDIMOB' ? paymentCardActive : paymentCardBg}`}>
                                    <input type="radio" name="payment" value="BARIDIMOB" checked={formData.payment_type === 'BARIDIMOB'} onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })} className="hidden" />
                                    <div className={`w-16 h-16 ${isDark ? 'bg-[#0a0c10]' : 'bg-white'} rounded-2xl border ${isDark ? 'border-white/5' : 'border-slate-100'} flex items-center justify-center p-2 shadow-sm drop-shadow-md overflow-hidden relative`}>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1b4332] to-[#40916c] opacity-20" />
                                        <span className="font-black text-xs text-[#40916c] leading-tight text-center relative z-10 flex flex-col items-center">
                                            <span className="text-xl">💳</span>
                                            Edahabia
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-black text-lg ${titleColor}`}>البطاقة الذهبية</h4>
                                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold mt-1 leading-snug`}>دفع إلكتروني عبر CIB أو بريدي موب</p>
                                    </div>
                                    <div className={`absolute top-4 left-4 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${formData.payment_type === 'BARIDIMOB' ? 'bg-amber-500 text-white scale-100' : 'bg-slate-700/20 text-transparent scale-0'}`}>✓</div>

                                    {/* Chargily Banner Badge */}
                                    <div className="absolute -top-3 left-10 text-[9px] bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black px-3 py-1 rounded-full shadow-lg border border-teal-400/30 flex items-center gap-1">
                                        Powered by Chargily
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                        <div className={`${summaryBg} rounded-[3rem] p-8 lg:p-10 sticky top-32 border transition-colors relative overflow-hidden group/summary`}>
                            {/* Subtle Glow */}
                            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover/summary:bg-amber-500/20 transition-all duration-700" />

                            <h3 className={`text-2xl font-black mb-6 ${titleColor}`}>ملخص الطلبية</h3>

                            <div className={`space-y-4 mb-8 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar`}>
                                {items.map((item, index) => (
                                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'} transition-colors border ${isDark ? 'border-white/5' : 'border-transparent'}`} style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className={`w-16 h-16 ${isDark ? 'bg-[#050505]' : 'bg-white'} rounded-xl flex items-center justify-center text-2xl shadow-sm overflow-hidden p-1`}>
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name_ar} className="w-full h-full object-contain" />
                                            ) : (
                                                item.icon || '📦'
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-black ${titleColor} mb-1 truncate`}>{item.name_ar}</div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold`}>الكمية: {item.quantity}</div>
                                                <span className="text-sm font-black text-amber-500">{formatPrice(item.price * item.quantity)} دج</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={`space-y-4 pt-6 ${isDark ? 'border-t border-white/10' : 'border-t border-slate-200'}`}>
                                <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold text-sm`}>
                                    <span>المجموع الفرعي لمنتجات السلة</span>
                                    <span>{formatPrice(getTotal())} دج</span>
                                </div>
                                <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold text-sm`}>
                                    <span>تكلفة التوصيل للولاية المحددة</span>
                                    <span>{formData.wilaya ? `${formatPrice(shippingFee)} دج` : 'يحدد لاحقاً'}</span>
                                </div>
                                <div className={`flex justify-between text-2xl font-black pt-6 pb-2 ${isDark ? 'border-t border-white/10 text-white' : 'border-t border-slate-200 text-slate-900'}`}>
                                    <span>السعر الإجمالي</span>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-l from-amber-400 to-orange-600">
                                        {formatPrice(getTotal() + shippingFee)} دج
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.wilaya || !formData.full_name || !formData.phone_number}
                                className={`w-full bg-gradient-to-r from-amber-500 hover:from-amber-400 to-orange-600 hover:to-orange-500 text-white py-5 rounded-[2rem] font-black text-xl mt-8 shadow-xl shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group flex items-center justify-center gap-3 relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <Loading /> جاري التأكيد...
                                    </div>
                                ) : (
                                    <>
                                        تأكيد وإنهاء الطلب <CheckCircle size={22} className="transition-transform duration-300 group-hover:scale-110" />
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-8 opacity-60">
                                <span className="text-xl">🔒</span>
                                <p className={`text-center text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold leading-relaxed`}>
                                    عملية دفع آمنة ومشفرة تماماً. لن يتم الخصم إلا بعد التأكيد.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
