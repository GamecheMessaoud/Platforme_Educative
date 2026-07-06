import { Link } from 'react-router-dom';
import {
    Mail, Phone, MapPin, Facebook, Twitter,
    Instagram, Youtube, Heart, Send, ArrowLeft,
    Code2, Cpu, Palette, Zap
} from 'lucide-react';

const footerLinks = {
    courses: [
        { label: 'Scratch 3.0', href: '/courses/scratch', icon: '🎨' },
        { label: 'Python للأبطال', href: '/courses/python', icon: '🐍' },
        { label: 'Arduino & روبوتات', href: '/courses/arduino', icon: '🤖' },
        { label: 'تطوير التطبيقات', href: '/courses/mobile', icon: '📱' },
        { label: 'الطباعة 3D', href: '/courses/3d-printing', icon: '🖨️' },
    ],
    platform: [
        { label: 'المختبر الافتراضي', href: '/labs' },
        { label: 'المتجر', href: '/store' },
        { label: 'المجتمع', href: '/community' },
        { label: 'المدونة', href: '/blog' },
        { label: 'الشارات والجوائز', href: '/badges' },
    ],
    support: [
        { label: 'مركز المساعدة', href: '/help' },
        { label: 'اتصل بنا', href: '/contact' },
        { label: 'شروط الخدمة', href: '/terms' },
        { label: 'سياسة الخصوصية', href: '/privacy' },
        { label: 'سياسة الاسترداد', href: '/refund' },
    ],
};

const socials = [
    { icon: <Facebook size={18} />, href: '#', color: 'hover:bg-blue-600 hover:border-blue-600' },
    { icon: <Twitter size={18} />, href: '#', color: 'hover:bg-sky-500 hover:border-sky-500' },
    { icon: <Instagram size={18} />, href: '#', color: 'hover:bg-pink-600 hover:border-pink-600' },
    { icon: <Youtube size={18} />, href: '#', color: 'hover:bg-red-600 hover:border-red-600' },
];

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white">
            {/* Top wave */}
            <div className="h-20 bg-gradient-to-b from-slate-50 to-slate-950 relative overflow-hidden">
                <svg viewBox="0 0 1440 80" className="absolute bottom-0 w-full" preserveAspectRatio="none">
                    <path fill="#020617" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
                </svg>
            </div>

            <div className="max-w-screen-2xl mx-auto px-8 pb-16">

                {/* Newsletter Banner */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] p-10 md:p-14 mb-20 overflow-hidden shadow-2xl shadow-indigo-900/50">
                    <div className="absolute inset-0 opacity-20">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="absolute rounded-full bg-white"
                                style={{
                                    width: Math.random() * 6 + 2 + 'px',
                                    height: Math.random() * 6 + 2 + 'px',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.6 + 0.2,
                                }}
                            />
                        ))}
                    </div>
                    <div className="relative flex flex-col md:flex-row items-center gap-10 justify-between">
                        <div className="text-center md:text-right">
                            <div className="text-3xl md:text-4xl font-black mb-3">اشترك في النشرة الإخبارية 🚀</div>
                            <p className="text-indigo-200 font-bold text-lg">احصل على آخر الدروس والعروض والتحديات مباشرةً في بريدك</p>
                        </div>
                        <div className="flex gap-0 w-full md:w-auto md:min-w-[400px]">
                            <input
                                type="email"
                                placeholder="أدخل بريدك الإلكتروني..."
                                className="flex-1 px-6 py-5 bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-r- rounded-l- outline-none font-bold focus:bg-white/30 transition"
                            />
                            <button className="px-8 py-5 bg-white text-indigo-700 font-black rounded-l- rounded-r- hover:bg-indigo-50 transition-all hover:px-10 flex items-center gap-2 whitespace-nowrap">
                                <Send size={18} />
                                اشترك
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <img src="/sadeem.png" alt="Sadeem Logo" className="w-14 h-14 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                            <div>
                                <div className="text-2xl font-black text-white">Sadeem | سديم</div>
                                <div className="text-xs text-primary-light font-black tracking-[0.2em] uppercase">تعلم مهارات المستقبل</div>
                            </div>
                        </Link>
                        <p className="text-slate-400 font-bold leading-relaxed text-lg max-w-sm">
                            المنصة العربية الأولى لتعليم مهارات الذكاء الاصطناعي، البرمجة، والروبوتات للأطفال بين 6-18 سنة، بطريقة ممتعة وتفاعلية.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { val: '5K+', label: 'طالب' },
                                { val: '50+', label: 'درس' },
                                { val: '15+', label: 'مسار' },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-slate-800/60 rounded-2xl p-4 text-center border border-slate-700/50">
                                    <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{stat.val}</div>
                                    <div className="text-slate-400 font-bold text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Social */}
                        <div className="flex gap-3">
                            {socials.map((s, i) => (
                                <a key={i} href={s.href}
                                    className={`w-12 h-12 rounded-2xl border-2 border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 ${s.color}`}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Courses */}
                    <div>
                        <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
                            <Code2 size={18} className="text-indigo-400" />
                            المسارات
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.courses.map((link) => (
                                <li key={link.href}>
                                    <Link to={link.href}
                                        className="flex items-center gap-2 text-slate-400 font-bold hover:text-indigo-400 transition-colors group"
                                    >
                                        <span className="text-lg">{link.icon}</span>
                                        <span className="group-hover:translate-x-[-4px] transition-transform">{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
                            <Cpu size={18} className="text-purple-400" />
                            المنصة
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.platform.map((link) => (
                                <li key={link.href}>
                                    <Link to={link.href}
                                        className="text-slate-400 font-bold hover:text-purple-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <ArrowLeft size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support + Contact */}
                    <div>
                        <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2">
                            <Palette size={18} className="text-pink-400" />
                            الدعم
                        </h4>
                        <ul className="space-y-3 mb-8">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link to={link.href}
                                        className="text-slate-400 font-bold hover:text-pink-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <ArrowLeft size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-400 font-bold">
                                <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center">
                                    <Mail size={14} className="text-indigo-400" />
                                </div>
                                <span className="text-sm">info@sadeem.dz</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 font-bold">
                                <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center">
                                    <Phone size={14} className="text-green-400" />
                                </div>
                                <span className="text-sm" dir="ltr">+213 XXX XXX XXX</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 font-bold">
                                <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center">
                                    <MapPin size={14} className="text-red-400" />
                                </div>
                                <span className="text-sm">الجزائر، DZ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 font-bold text-sm">
                        © 2026 منصة سديم التعليمية. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                        <span>صُنع بكل</span>
                        <Heart size={16} className="text-red-500 fill-red-500 animate-bounce-subtle" />
                        <span>لمستقبل أطفالنا العرب</span>
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex gap-6 text-slate-500 font-bold text-sm">
                        <Link to="/terms" className="hover:text-indigo-400 transition">الشروط</Link>
                        <Link to="/privacy" className="hover:text-indigo-400 transition">الخصوصية</Link>
                        <Link to="/cookies" className="hover:text-indigo-400 transition">الكوكيز</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
