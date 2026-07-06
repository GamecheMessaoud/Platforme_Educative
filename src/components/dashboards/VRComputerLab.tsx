import { useState, useEffect } from 'react';
import { Box, Maximize, MousePointer2, Move, Globe, Info, X } from 'lucide-react';

interface HardwareInfo {
    name: string;
    nameEn: string;
    description: string;
    color: string;
    icon: string;
}

const hardwareData: Record<string, HardwareInfo> = {
    cpu: {
        name: "المعالج المركزي",
        nameEn: "CPU",
        description: "دماغ الحاسوب! يقوم بمعالجة جميع العمليات الحسابية والمنطقية. سرعته تُقاس بالجيجاهرتز (GHz).",
        color: "#4CC3D9",
        icon: "🧠"
    },
    ram: {
        name: "الذاكرة العشوائية",
        nameEn: "RAM",
        description: "ذاكرة مؤقتة سريعة جداً تحفظ البيانات أثناء تشغيل البرامج. كلما زادت، زادت سرعة الأداء!",
        color: "#7B68EE",
        icon: "⚡"
    },
    gpu: {
        name: "بطاقة الرسومات",
        nameEn: "GPU",
        description: "مسؤولة عن معالجة الصور والفيديو والألعاب ثلاثية الأبعاد. ضرورية للذكاء الاصطناعي أيضاً!",
        color: "#2ECC71",
        icon: "🎮"
    },
    database: {
        name: "القرص الصلب",
        nameEn: "Hard Drive",
        description: "يخزن جميع ملفاتك بشكل دائم: الصور، البرامج، والنظام. يوجد منه نوعان: HDD و SSD.",
        color: "#FFC65D",
        icon: "💾"
    },
    motherboard: {
        name: "اللوحة الأم",
        nameEn: "Motherboard",
        description: "اللوحة الرئيسية التي تربط جميع المكونات ببعضها. بدونها لا يمكن للأجزاء أن تتواصل!",
        color: "#E74C3C",
        icon: "🔌"
    },
    network: {
        name: "بطاقة الشبكة",
        nameEn: "Network Card",
        description: "تتيح للحاسوب الاتصال بالإنترنت والشبكات الأخرى. تنقل البيانات بسرعة الضوء!",
        color: "#1ABC9C",
        icon: "🌐"
    }
};

export default function VRComputerLab() {
    const [loading, setLoading] = useState(true);
    const [activeInfo, setActiveInfo] = useState<string | null>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
        script.onload = () => setLoading(false);
        document.head.appendChild(script);

        return () => { /* A-Frame cleanup handled by SPA */ };
    }, []);

    const toggleFullscreen = () => {
        const el = document.querySelector('.vr-lab-container');
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[600px] bg-slate-900 rounded-[3rem] flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-purple-900/30" />
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 w-20 h-20 border-4 border-secondary/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-white font-black text-lg relative z-10">جاري تحضير المختبر ثلاثي الأبعاد... 🚀</p>
                <p className="text-white/50 font-bold text-sm relative z-10">يتم تحميل بيئة A-Frame للواقع الافتراضي</p>
            </div>
        );
    }

    return (
        <div className="vr-lab-container relative w-full h-[700px] rounded-[4rem] overflow-hidden shadow-luxury-deep border-8 border-white dark:border-slate-800 group">
            {/* A-Frame Scene */}
            <a-scene embedded style={{ width: '100%', height: '100%' }}>
                {/* Assets */}
                <a-assets>
                    <img id="sky" src="https://cdn.aframe.io/a-painter/images/sky.jpg" />
                    <img id="grid" src="https://cdn.aframe.io/a-painter/images/floor.jpg" />
                </a-assets>

                {/* Environment */}
                <a-sky src="#sky" rotation="0 -90 0"></a-sky>
                <a-plane src="#grid" rotation="-90 0 0" width="100" height="100" repeat="100 100"></a-plane>

                {/* Title */}
                <a-text value="Sadeem 3D Lab" position="-2 3.5 -5" color="#f97316" font="mozillavr" width="12"></a-text>
                <a-text value="استكشف مكونات الحاسوب" position="-1.5 3 -5" color="#ffffff" font="mozillavr" width="8"></a-text>

                {/* ═══ CPU ═══ */}
                <a-box 
                    position="-3 0.75 -5" 
                    width="1.2" height="1.2" depth="1.2"
                    color="#4CC3D9" 
                    shadow 
                    animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear"
                >
                    <a-text value="CPU" position="0 0.9 0" align="center" color="#fff" width="5" font="mozillavr"></a-text>
                    <a-text value="المعالج" position="0 -0.9 0" align="center" color="#4CC3D9" width="4" font="mozillavr"></a-text>
                </a-box>

                {/* ═══ RAM ═══ */}
                <a-box 
                    position="-1 0.4 -5" 
                    width="0.3" height="0.7" depth="1.5"
                    color="#7B68EE" 
                    shadow
                    animation="property: position; to: -1 0.6 -5; dir: alternate; dur: 2000; loop: true; easing: easeInOutSine"
                >
                    <a-text value="RAM" position="0 0.6 0" align="center" color="#fff" width="4" font="mozillavr"></a-text>
                </a-box>
                <a-box 
                    position="-0.5 0.4 -5" 
                    width="0.3" height="0.7" depth="1.5"
                    color="#9B88FF" 
                    shadow
                    animation="property: position; to: -0.5 0.6 -5; dir: alternate; dur: 2200; loop: true; easing: easeInOutSine"
                >
                </a-box>

                {/* ═══ GPU ═══ */}
                <a-box 
                    position="1 0.5 -5" 
                    width="2" height="0.4" depth="1"
                    color="#2ECC71" 
                    shadow
                    animation="property: rotation; to: 0 0 5; dir: alternate; dur: 3000; loop: true; easing: easeInOutSine"
                >
                    <a-text value="GPU" position="0 0.5 0" align="center" color="#fff" width="5" font="mozillavr"></a-text>
                    <a-text value="بطاقة الرسومات" position="0 -0.5 0" align="center" color="#2ECC71" width="4" font="mozillavr"></a-text>
                    {/* Fan simulation */}
                    <a-cylinder position="-0.5 0.3 0" radius="0.15" height="0.05" color="#333" 
                        animation="property: rotation; to: 0 0 360; loop: true; dur: 1000; easing: linear"></a-cylinder>
                    <a-cylinder position="0.5 0.3 0" radius="0.15" height="0.05" color="#333" 
                        animation="property: rotation; to: 0 0 360; loop: true; dur: 1200; easing: linear"></a-cylinder>
                </a-box>

                {/* ═══ Hard Drive ═══ */}
                <a-cylinder 
                    position="3 0.75 -5" 
                    radius="0.6" height="1.5" 
                    color="#FFC65D" 
                    shadow
                    animation="property: rotation; to: 0 -360 0; loop: true; dur: 12000; easing: linear"
                >
                    <a-text value="HDD" position="0 1 0" align="center" color="#fff" width="4" font="mozillavr"></a-text>
                    <a-text value="القرص الصلب" position="0 -1 0" align="center" color="#FFC65D" width="4" font="mozillavr"></a-text>
                </a-cylinder>

                {/* ═══ Motherboard (flat platform) ═══ */}
                <a-box 
                    position="0 0.05 -5" 
                    width="8" height="0.1" depth="4"
                    color="#1a1a2e" 
                    shadow
                >
                    {/* Circuit traces */}
                    <a-box position="-2 0.06 0" width="4" height="0.02" depth="0.05" color="#E74C3C" shadow></a-box>
                    <a-box position="1 0.06 0.5" width="3" height="0.02" depth="0.05" color="#E74C3C" shadow></a-box>
                    <a-box position="0 0.06 -1" width="6" height="0.02" depth="0.05" color="#27ae60" shadow></a-box>
                </a-box>

                {/* ═══ Network Card ═══ */}
                <a-sphere 
                    position="0 2 -7" 
                    radius="0.8" 
                    color="#1ABC9C" 
                    shadow
                    animation="property: position; to: 0 2.5 -7; dir: alternate; dur: 3000; loop: true; easing: easeInOutSine"
                >
                    <a-text value="NETWORK" position="0 1.2 0" align="center" color="#fff" width="5" font="mozillavr"></a-text>
                    <a-text value="الشبكة" position="0 -1.2 0" align="center" color="#1ABC9C" width="4" font="mozillavr"></a-text>
                </a-sphere>

                {/* Data flow particles */}
                <a-sphere position="-2 1.5 -6" radius="0.08" color="#4CC3D9" 
                    animation="property: position; to: 2 1.5 -6; dur: 3000; loop: true; easing: linear"></a-sphere>
                <a-sphere position="2 1.8 -6" radius="0.06" color="#7B68EE" 
                    animation="property: position; to: -2 1.8 -6; dur: 4000; loop: true; easing: linear"></a-sphere>
                <a-sphere position="-1 2 -5.5" radius="0.05" color="#2ECC71" 
                    animation="property: position; to: 1 2 -5.5; dur: 2500; loop: true; easing: linear"></a-sphere>

                {/* Lights */}
                <a-light type="ambient" color="#556" intensity="0.6"></a-light>
                <a-light type="point" intensity="1.2" position="0 5 -3" color="#fff"></a-light>
                <a-light type="point" intensity="0.5" position="-3 3 -5" color="#4CC3D9"></a-light>
                <a-light type="point" intensity="0.5" position="3 3 -5" color="#FFC65D"></a-light>

                {/* Camera + Cursor */}
                <a-entity position="0 2.5 0">
                    <a-camera>
                        <a-cursor color="#f97316" fuse="true" fuse-timeout="1500"></a-cursor>
                    </a-camera>
                </a-entity>
            </a-scene>

            {/* ═══ Overlay UI ═══ */}
            <div className="absolute top-8 left-8 z-10 flex flex-col gap-4">
                <div className="bg-black/60 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white/20 text-white max-w-xs animate-slide-right">
                    <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                        <Box className="text-primary" /> مختبر عتاد الحاسوب
                    </h3>
                    <p className="text-xs font-bold text-white/70 leading-relaxed">
                        استكشف المكونات الداخلية للحاسوب في بيئة ثلاثية الأبعاد. حرك الكاميرا بالماوس والأزرار (WASD) لرؤية التفاصيل.
                    </p>
                </div>
            </div>

            {/* Hardware Info Cards */}
            <div className="absolute top-8 right-8 z-10 flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
                {Object.entries(hardwareData).map(([key, hw]) => (
                    <button
                        key={key}
                        onClick={() => setActiveInfo(activeInfo === key ? null : key)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-300 text-right backdrop-blur-xl
                            ${activeInfo === key
                                ? 'bg-white/20 border-white/30 shadow-lg'
                                : 'bg-black/40 border-white/10 hover:bg-black/50 hover:border-white/20'
                            }`}
                    >
                        <span className="text-xl">{hw.icon}</span>
                        <span className="text-white text-xs font-black">{hw.name}</span>
                        <Info size={14} className="text-white/50" />
                    </button>
                ))}
            </div>

            {/* Info Panel */}
            {activeInfo && hardwareData[activeInfo] && (
                <div className="absolute bottom-28 right-8 z-20 bg-black/80 backdrop-blur-2xl p-6 rounded-[2rem] border-2 border-white/20 text-white max-w-sm animate-premium-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{hardwareData[activeInfo].icon}</span>
                            <div>
                                <h4 className="font-black text-lg">{hardwareData[activeInfo].name}</h4>
                                <span className="text-xs font-bold text-white/50">{hardwareData[activeInfo].nameEn}</span>
                            </div>
                        </div>
                        <button onClick={() => setActiveInfo(null)} className="p-2 hover:bg-white/10 rounded-xl transition">
                            <X size={16} />
                        </button>
                    </div>
                    <p className="text-sm font-bold text-white/80 leading-relaxed">
                        {hardwareData[activeInfo].description}
                    </p>
                    <div className="mt-4 h-1 rounded-full" style={{ backgroundColor: hardwareData[activeInfo].color }} />
                </div>
            )}

            {/* Control Buttons */}
            <div className="absolute bottom-8 left-8 z-10 flex gap-3">
                <div className="bg-primary p-4 rounded-2xl text-white shadow-xl flex items-center gap-3 border-2 border-primary/30">
                    <MousePointer2 size={16} /> <span className="text-[10px] font-black uppercase tracking-wider">انقر على العناصر</span>
                </div>
                <div className="bg-secondary p-4 rounded-2xl text-white shadow-xl flex items-center gap-3 border-2 border-secondary/30">
                    <Move size={16} /> <span className="text-[10px] font-black uppercase tracking-wider">استكشف المختبر</span>
                </div>
            </div>

            {/* Fullscreen Button */}
            <div className="absolute bottom-8 right-8 z-10">
                <button 
                    onClick={toggleFullscreen}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 p-5 rounded-full text-white border-2 border-white/30 transition-all group"
                >
                    <Maximize size={24} className="group-hover:scale-125 transition-transform" />
                </button>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-black/40 backdrop-blur-xl px-8 py-4 rounded-full border-2 border-white/10">
                <Globe className="text-primary animate-pulse" size={20} />
                <span className="text-white text-xs font-black uppercase tracking-widest">VR Ready Learning Environment</span>
            </div>
        </div>
    );
}
