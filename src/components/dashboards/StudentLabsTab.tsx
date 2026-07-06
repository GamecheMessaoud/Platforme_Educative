import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FlaskConical, ExternalLink } from 'lucide-react';
import StatsHeader from './StatsHeader';

const availableLabs = [
    { id: 'scratch-lab', emoji: '🎮', title: 'Scratch 3.0 Lab', desc: 'ابتكر ألعابك وقصصك التفاعلية باستخدام مكعبات البرمجة السحرية.', color: 'from-orange-400 to-pink-500', status: 'مفتوح', diff: 'مبتدئ', learners: '1.2k' },
    { id: 'python-lab', emoji: '🐍', title: 'Python IDE', desc: 'اكتب كود بايثون الحقيقي وشاهد سحر البرمجة يتحقق في ثوانٍ.', color: 'from-green-400 to-emerald-500', status: 'مفتوح', diff: 'متوسط', learners: '850' },
    { id: 'arduino-lab', emoji: '⚡', title: 'Arduino Simulator', desc: 'صمم دوائر إلكترونية ذكية وبرمجها بدون الحاجة لقطع حقيقية.', color: 'from-blue-400 to-indigo-500', status: 'مفتوح', diff: 'متقدم', learners: '420' },
    { id: '3d-lab', emoji: '🧊', title: '3D VR Lab', desc: 'استكشف عالم الواقع الافتراضي وتفاعل مع المعالجات واللوحات الأم ثلاثية الأبعاد.', color: 'from-purple-400 to-pink-500', status: 'مفتوح', diff: 'متوسط', learners: '630' },
    { id: 'mobile-lab', emoji: '📱', title: 'Mobile App Builder', desc: 'اصنع تطبيقات هاتفك الخاصة وانشرها ليستخدمها أصدقاؤك وعائلتك.', color: 'from-blue-500 to-cyan-500', status: 'مفتوح', diff: 'متقدم', learners: '290' },
    { id: 'ai-lab', emoji: '🧠', title: 'AI Lab', desc: 'درب ذكاءك الاصطناعي الأول وافهم كيف تفكر الآلات بدقة.', color: 'from-red-400 to-orange-500', status: 'مفتوح', diff: 'متقدم', learners: '150' }
];

export default function StudentLabsTab({ onLabSelect }: { onLabSelect?: (id: string) => void }) {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const cardBg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-100';

    return (
        <div className="space-y-12 animate-premium-in" dir="rtl">
            <StatsHeader />
            <div>
                <h2 className="text-3xl font-black text-gradient flex items-center gap-4">
                    <FlaskConical className="text-purple-500" size={36} />
                    المختبرات الإبداعية
                </h2>
                <p className={`text-base font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>بيئات عمل احترافية لبناء مشاريعك المستقبلية ✨</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {availableLabs.map((lab, idx) => (
                    <div
                        key={lab.id}
                        onClick={() => {
                            if ((lab.id === '3d-lab' || lab.id === 'arduino-lab') && onLabSelect) {
                                onLabSelect(lab.id);
                            } else {
                                navigate(`/lab/${lab.id}`);
                            }
                        }}
                        className={`group relative ${cardBg} rounded-[4rem] border-2 overflow-hidden hover:-translate-y-6 transition-all duration-700 shadow-luxury flex flex-col hover:border-primary/40 cursor-pointer opacity-0 animate-premium-in`}
                        style={{ animationDelay: `${idx * 0.15}s` }}
                    >
                        <div className={`h-48 bg-gradient-to-br ${lab.color} flex items-center justify-center relative overflow-hidden shrink-0`}>
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay group-hover:bg-transparent transition-colors" />
                            <div className="absolute inset-0 shimmer-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <span className="text-8xl drop-shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">{lab.emoji}</span>
                            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-xl text-white px-5 py-2 rounded-2xl text-[10px] font-black shadow-xl border-2 border-white/20 uppercase tracking-widest">
                                {lab.diff}
                            </div>
                        </div>

                        <div className="p-10 flex flex-col flex-1 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black group-hover:text-primary transition-colors duration-500">{lab.title}</h3>
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full font-black flex items-center gap-2 border border-emerald-500/10">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow"></div> {lab.status}
                                    </span>
                                </div>
                                <p className={`text-base font-bold leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {lab.desc}
                                </p>
                            </div>

                            <div className="pt-4 mt-auto border-t border-slate-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary font-black text-sm">
                                    <div className="flex -space-x-3 rtl:space-x-reverse items-center justify-center p-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">👤</div>
                                        ))}
                                    </div>
                                    <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`}>+{lab.learners} مبدع</span>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-all">
                                    <ExternalLink size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Hover Decorative Element */}
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    </div>
                ))}
            </div>
        </div>
    );
}
