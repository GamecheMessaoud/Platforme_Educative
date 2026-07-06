import { useState } from 'react';
import { Brain, Rocket, Trophy, ChevronRight, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const questions = [
  {
    id: 1,
    text: "هل سبق لك البرمجة باستخدام سكراتش أو أي لغة أخرى؟",
    emoji: "💻",
    options: [
      { text: "لا، أنا مبتدئ تماماً", level: 1, emoji: "🌱" },
      { text: "نعم، قمت ببعض المشاريع البسيطة", level: 2, emoji: "🔧" },
      { text: "نعم، أفهم المفاهيم البرمجية المعقدة", level: 3, emoji: "🚀" }
    ]
  },
  {
    id: 2,
    text: "ماذا يعني 'التكرار' (Loop) في البرمجة؟",
    emoji: "🔄",
    options: [
      { text: "لا أعرف بعد", level: 1, emoji: "❓" },
      { text: "إعادة تنفيذ الكود عدة مرات", level: 2, emoji: "✅" },
      { text: "هيكلية للتحكم في تدفق البيانات", level: 3, emoji: "🧠" }
    ]
  },
  {
    id: 3,
    text: "هل تعرف ما هو 'المتغير' (Variable)؟",
    emoji: "📦",
    options: [
      { text: "لم أسمع بهذا المصطلح من قبل", level: 1, emoji: "🤔" },
      { text: "مكان لتخزين قيمة أو بيان", level: 2, emoji: "📝" },
      { text: "وعاء ديناميكي للبيانات بأنواع مختلفة", level: 3, emoji: "⚡" }
    ]
  },
  {
    id: 4,
    text: "ما الذي يمكنك فعله باستخدام 'الجمل الشرطية' (If/Else)؟",
    emoji: "🔀",
    options: [
      { text: "لا أعرف ما هي الجمل الشرطية", level: 1, emoji: "🌱" },
      { text: "اتخاذ قرارات بناءً على شروط معينة", level: 2, emoji: "🎯" },
      { text: "بناء خوارزميات معقدة للذكاء الاصطناعي", level: 3, emoji: "🤖" }
    ]
  },
  {
    id: 5,
    text: "أي من هذه الأشياء تهتم به أكثر؟",
    emoji: "✨",
    options: [
      { text: "صنع ألعاب بسيطة وقصص", level: 1, emoji: "🎮" },
      { text: "بناء تطبيقات ومواقع ذكية", level: 2, emoji: "🌐" },
      { text: "الذكاء الاصطناعي والأنظمة المتقدمة", level: 3, emoji: "🧬" }
    ]
  }
];

const levelInfo: Record<number, { name: string; emoji: string; color: string; desc: string }> = {
  1: { name: "مبتدئ مبدع", emoji: "🌱", color: "from-emerald-400 to-green-500", desc: "ستبدأ من الأساسيات وتتعلم خطوة بخطوة!" },
  2: { name: "مطور واعد", emoji: "⚡", color: "from-blue-400 to-indigo-500", desc: "لديك أساس جيد! ستتقدم نحو مشاريع أكثر تعقيداً." },
  3: { name: "خبير مستقبلي", emoji: "🚀", color: "from-purple-500 to-pink-500", desc: "مبدع بالفطرة! ستنطلق مباشرة نحو التحديات المتقدمة." }
};

export default function PlacementTest({ onComplete }: { onComplete: (level: number) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [resultLevel, setResultLevel] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { user, setUser } = useAuthStore();

  const handleSelect = (level: number, optIndex: number) => {
    setSelectedOption(optIndex);
    const newScores = [...scores, level];

    setTimeout(() => {
      setSelectedOption(null);
      if (currentStep < questions.length - 1) {
        setScores(newScores);
        setCurrentStep(currentStep + 1);
      } else {
        const averageLevel = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
        const finalLevel = Math.max(1, Math.min(3, averageLevel));
        setScores(newScores);
        submitLevel(finalLevel);
      }
    }, 400);
  };

  const submitLevel = async (level: number) => {
    setIsSubmitting(true);
    try {
      await api.put('/auth/update-skill', { skill_level_num: level });
      // Update user in store so placement_completed is true
      if (user) {
        setUser({
          ...user,
          studentProfile: {
            id: user.studentProfile?.id || '',
            total_xp: user.studentProfile?.total_xp || 0,
            current_streak: user.studentProfile?.current_streak || 0,
            current_level: level,
            placement_completed: true,
          }
        });
      }
      setResultLevel(level);
    } catch (error) {
      console.error('Error updating level:', error);
      setResultLevel(level); // Fallback — still show result
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Result Screen ──
  if (resultLevel !== null) {
    const info = levelInfo[resultLevel];
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-2xl flex items-center justify-center p-6">
        <div className="bg-white dark:bg-[#161b22] w-full max-w-2xl rounded-[3.5rem] p-12 shadow-luxury border-4 border-primary/20 animate-premium-in text-center">
          {/* Trophy animation */}
          <div className="relative mx-auto mb-8 w-32 h-32">
            <div className={`absolute inset-0 bg-gradient-to-br ${info.color} rounded-full blur-3xl opacity-40 animate-pulse`} />
            <div className={`relative w-32 h-32 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 border-white/30`}>
              {info.emoji}
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles size={20} className="text-white" />
            </div>
          </div>

          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
            🎉 تم تحديد مستواك!
          </h2>

          <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${info.color} text-white px-8 py-4 rounded-[2rem] text-xl font-black shadow-xl mb-6`}>
            <Trophy size={24} />
            المستوى {resultLevel}: {info.name}
          </div>

          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
            {info.desc}
          </p>

          <button
            onClick={() => onComplete(resultLevel)}
            className="group relative px-12 py-5 bg-gradient-to-r from-primary to-secondary text-white font-black text-xl rounded-[2rem] shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center gap-3">
              ابدأ رحلتك التعليمية <Rocket size={22} />
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz Screen ──
  const progress = ((currentStep) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-2xl flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#161b22] w-full max-w-2xl rounded-[3.5rem] p-12 shadow-luxury border-4 border-primary/20 animate-premium-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-5 border-2 border-primary/10 shadow-inner">
            <Brain size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">تحديد المستوى الذكي 🚀</h2>
          <p className="text-slate-500 font-bold text-sm">ساعدنا في تخصيص رحلتك التعليمية المثالية</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} /> السؤال {currentStep + 1} من {questions.length}
            </span>
            <span className="text-xs font-black text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-shimmer rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1.5 rounded-full transition-all duration-500 ${
                  i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary/50 animate-pulse' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl">{questions[currentStep].emoji}</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight pr-4 border-r-4 border-primary">
              {questions[currentStep].text}
            </h3>
          </div>
        </div>

        {/* Options */}
        {isSubmitting ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 font-black animate-pulse">جاري تحليل إجاباتك... 🧠</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions[currentStep].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt.level, i)}
                disabled={selectedOption !== null}
                className={`group flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 text-right
                  ${selectedOption === i
                    ? 'bg-primary/10 border-primary scale-[0.98] shadow-xl shadow-primary/20'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg'
                  }
                  ${selectedOption !== null && selectedOption !== i ? 'opacity-40' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-all duration-300
                    ${selectedOption === i
                      ? 'bg-primary text-white scale-110'
                      : 'bg-white dark:bg-slate-800 group-hover:bg-primary/10'
                    }`}
                  >
                    {selectedOption === i ? <CheckCircle2 size={24} /> : opt.emoji}
                  </div>
                  <span className="font-black text-slate-700 dark:text-slate-200">{opt.text}</span>
                </div>
                <ChevronRight className={`transition-all duration-300 ${selectedOption === i ? 'text-primary translate-x-1' : 'text-slate-300 group-hover:text-primary'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
