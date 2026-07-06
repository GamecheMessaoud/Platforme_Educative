import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle2, Crown, Zap, Shield, Sparkles } from 'lucide-react';
import api from '../../lib/api';

export default function SubscriptionPage() {
    const { isDark } = useTheme();
    const { user } = useAuthStore();
    const [loadingPlan, setLoadingPlan] = useState<'MONTHLY' | 'YEARLY' | null>(null);

    const subscriptionStatus = user?.studentProfile?.subscription_status || 'NONE';
    const isPremium = subscriptionStatus === 'ACTIVE';

    const handleSubscribe = async (planType: 'MONTHLY' | 'YEARLY') => {
        setLoadingPlan(planType);
        try {
            const { data } = await api.post('/subscriptions/checkout', {
                planType,
                successUrl: `${window.location.origin}/student-dashboard?subscription=success`,
                failureUrl: `${window.location.origin}/student-dashboard?subscription=failure`
            });
            
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('حدث خطأ أثناء الاتصال بالدفع. يرجى المحاولة لاحقاً.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const cardBgMonth = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
    const cardBgYear = isDark 
        ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/50' 
        : 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-400';
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const mutedColor = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className={`min-h-[80vh] flex flex-col items-center justify-center p-6 ${isDark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
            <div className="text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/20 mb-6">
                    <Crown size={40} className="text-white" />
                </div>
                <h1 className={`text-4xl md:text-5xl font-black mb-4 ${textColor}`}>
                    اشترك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Sadeem Premium</span>
                </h1>
                <p className={`text-lg md:text-xl font-bold ${mutedColor} max-w-2xl mx-auto`}>
                    أطلق العنان لقدراتك مع وصول غير محدود لكل الدورات والمختبرات الافتراضية
                </p>
            </div>

            {isPremium && (
                <div className="mb-12 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
                    <CheckCircle2 size={24} />
                    أنت مشترك بالفعل في الخطة المميزة!
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
                {/* Monthly Plan */}
                <div className={`relative rounded-[3rem] p-8 border-2 shadow-xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 ${cardBgMonth}`}>
                    <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300`}>
                        <Zap size={32} />
                    </div>
                    <h3 className={`text-2xl font-black mb-2 ${textColor}`}>الاشتراك الشهري</h3>
                    <p className={`font-bold mb-6 ${mutedColor}`}>مرونة تامة، الدفع شهرياً</p>
                    <div className="mb-8">
                        <span className={`text-5xl font-black ${textColor}`}>1,500</span>
                        <span className={`text-xl font-bold ${mutedColor} ml-2`}>د.ج / شهر</span>
                    </div>
                    
                    <ul className="space-y-4 mb-10 w-full text-right flex-1">
                         <li className={`flex items-center gap-3 font-bold ${mutedColor}`}><CheckCircle2 className="text-primary" size={20}/> وصول كامل لجميع دورات المنصة</li>
                         <li className={`flex items-center gap-3 font-bold ${mutedColor}`}><CheckCircle2 className="text-primary" size={20}/> استخدام مختبرات الواقع الافتراضي 3D</li>
                         <li className={`flex items-center gap-3 font-bold ${mutedColor}`}><CheckCircle2 className="text-primary" size={20}/> دعم فني وحل الاستفسارات</li>
                    </ul>

                    <button 
                        onClick={() => handleSubscribe('MONTHLY')}
                        disabled={loadingPlan !== null}
                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${loadingPlan === 'MONTHLY' ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'} ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'}`}
                    >
                        {loadingPlan === 'MONTHLY' ? 'جاري التحويل...' : 'اختر الشهري'}
                    </button>
                </div>

                {/* Yearly Plan */}
                <div className={`relative rounded-[3rem] p-8 border-2 shadow-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 ${cardBgYear}`}>
                    <div className="absolute -top-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-500/30">
                        الأكثر توفيراً 🔥
                    </div>
                    <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                        <Sparkles size={32} />
                    </div>
                    <h3 className={`text-2xl font-black mb-2 ${textColor}`}>الاشتراك السنوي</h3>
                    <p className={`font-bold mb-6 ${mutedColor}`}>أفضل قيمة لتعلم مستمر</p>
                    <div className="mb-2">
                        <span className="text-lg text-slate-400 line-through mr-3">18,000 د.ج</span>
                    </div>
                    <div className="mb-8">
                        <span className={`text-5xl font-black text-amber-500`}>15,000</span>
                        <span className={`text-xl font-bold ${mutedColor} ml-2`}>د.ج / سنة</span>
                    </div>
                    
                    <ul className="space-y-4 mb-10 w-full text-right flex-1">
                         <li className={`flex items-center gap-3 font-bold ${textColor}`}><CheckCircle2 className="text-amber-500" size={20}/> وصول كامل لجميع دورات المنصة</li>
                         <li className={`flex items-center gap-3 font-bold ${textColor}`}><CheckCircle2 className="text-amber-500" size={20}/> استخدام مختبرات الواقع الافتراضي 3D</li>
                         <li className={`flex items-center gap-3 font-bold ${textColor}`}><CheckCircle2 className="text-amber-500" size={20}/> دعم فني متقدم وشارات حصرية</li>
                         <li className={`flex items-center gap-3 font-bold text-amber-500 bg-amber-500/10 p-2 rounded-lg`}><Shield size={20}/> توفير 3,000 د.ج!</li>
                    </ul>

                    <button 
                        onClick={() => handleSubscribe('YEARLY')}
                        disabled={loadingPlan !== null}
                        className={`w-full py-4 rounded-2xl font-black text-lg text-[#050505] bg-gradient-to-r from-amber-400 to-orange-500 transition-all shadow-lg shadow-amber-500/20 ${loadingPlan === 'YEARLY' ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-amber-500/30'}`}
                    >
                        {loadingPlan === 'YEARLY' ? 'جاري التحويل...' : 'اختر السنوي'}
                    </button>
                </div>
            </div>
            
            <div className={`mt-12 flex items-center gap-4 text-xs font-bold uppercase tracking-widest ${mutedColor}`}>
                <span className="px-3 py-1 rounded-md bg-slate-800/5 dark:bg-slate-100/5">دفع آمن</span>
                <span>•</span>
                <span className="px-3 py-1 rounded-md bg-slate-800/5 dark:bg-slate-100/5">البطاقة الذهبية</span>
                <span>•</span>
                <span className="px-3 py-1 rounded-md bg-slate-800/5 dark:bg-slate-100/5">Chargily V2</span>
            </div>
        </div>
    );
}
