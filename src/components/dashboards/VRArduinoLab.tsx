import { useState, useEffect } from 'react';
import { Maximize, MousePointer2, Zap, Info } from 'lucide-react';

interface ComponentInfo {
    name: string;
    nameEn: string;
    description: string;
    color: string;
    icon: string;
}

const componentData: Record<string, ComponentInfo> = {
    microcontroller: {
        name: "المتحكم الدقيق (ATmega328P)",
        nameEn: "Microcontroller",
        description: "عقل الأردوينو! الدماغ الذي يتم تخزين شفراتك وبرمجياتك فيه ليقوم بتنفيذ الأوامر بدقة.",
        color: "#1f2937",
        icon: "🧠"
    },
    digitalPins: {
        name: "المنافذ الرقمية",
        nameEn: "Digital I/O Pins",
        description: "تستخدم لقراءة إشارات رقمية (0 أو 1) مثل الأزرار، أو لإرسال إشارات رقمية كإضاءة مصابيح LED.",
        color: "#eab308",
        icon: "🔌"
    },
    analogPins: {
        name: "المنافذ التماثلية",
        nameEn: "Analog In Pins",
        description: "تستخدم لقراءة إشارات متغيرة بدقة من حساسات البيئة مثل حساسات الحرارة أو الضوء (A0-A5).",
        color: "#3b82f6",
        icon: "📡"
    },
    usbPort: {
        name: "منفذ USB",
        nameEn: "USB Port",
        description: "بوابة التواصل! من خلاله نقوم بتوصيل الأردوينو بالحاسوب لرفع الأكواد البرمجية وتوفير الطاقة.",
        color: "#cbd5e1",
        icon: "🔗"
    },
    powerJack: {
        name: "مدخل التغذية الكهربائية",
        nameEn: "Power Jack",
        description: "يُستخدم لتزويد الأردوينو بالطاقة الخارجية (من بطارية أو محول) عندما لا يكون متصلاً بالحاسوب.",
        color: "#000000",
        icon: "⚡"
    },
    led: {
        name: "الصمام الثنائي الباعث للضوء",
        nameEn: "LED (Light Emitting Diode)",
        description: "مصدر ضوئي صغير ينتج الضوء عند مرور التيار من الطرف الموجب (الطويل) إلى السالب (القصير).",
        color: "#ef4444",
        icon: "💡"
    },
    resistor: {
        name: "المقاومة الكهربائية",
        nameEn: "Resistor",
        description: "الحارس الشخصي للإلكترونيات! يقوم بتقليل شدة التيار الكهربائي لحماية القطع الحساسة (مثل الـ LED) من التلف.",
        color: "#d97706",
        icon: "🛡️"
    }
};

export default function VRArduinoLab() {
    const [loading, setLoading] = useState(true);
    const [activeInfo, setActiveInfo] = useState<string | null>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
        script.onload = () => {
             // Register custom A-Frame component for hover interactions
             if (!(window as any).AFRAME.components['hover-highlight']) {
                 (window as any).AFRAME.registerComponent('hover-highlight', {
                     schema: {
                         color: { type: 'color', default: '#ffffff' },
                         scale: { type: 'vec3', default: { x: 1.1, y: 1.1, z: 1.1 } },
                         targetId: { type: 'string' }
                     },
                     init: function () {
                         const el = this.el;
                         const data = this.data;
                         this.originalColor = el.getAttribute('material')?.color || '#ffffff';
                         this.originalScale = el.getAttribute('scale');
                         
                         el.addEventListener('mouseenter', () => {
                             if(el.getAttribute('material')) {
                                el.setAttribute('material', 'color', data.color);
                             }
                             el.setAttribute('scale', data.scale);
                             // Trigger React State
                             setActiveInfo(data.targetId);
                         });
                         
                         el.addEventListener('mouseleave', () => {
                             if(el.getAttribute('material')) {
                                el.setAttribute('material', 'color', this.originalColor);
                             }
                             el.setAttribute('scale', this.originalScale);
                             setActiveInfo(null);
                         });
                     }
                 });
             }
             setLoading(false);
        };
        document.head.appendChild(script);

        return () => { 
            // Cleanup script if component unmounts quickly
        };
    }, []);

    const toggleFullscreen = () => {
        const el = document.querySelector('.vr-arduino-container');
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
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-blue-900/30" />
                 <div className="relative">
                    <Zap className="text-blue-400 w-16 h-16 animate-pulse" />
                 </div>
                 <p className="text-white font-black text-lg relative z-10">جاري تجهيز مختبر الأردوينو الافتراضي... ⚡</p>
                 <p className="text-white/50 font-bold text-sm relative z-10">يتم بناء البيئة الإلكترونية ثلاثية الأبعاد</p>
            </div>
        );
    }

    return (
        <div className="vr-arduino-container relative w-full h-[700px] rounded-[4rem] overflow-hidden shadow-luxury-deep border-8 border-white dark:border-slate-800 group" dir="rtl">
            {/* Overlay UI - Always on top */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {/* Header Toolbar */}
                <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-auto">
                    <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-700 shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                            <Zap className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-lg">مختبر الأردوينو VR ⚡</h2>
                            <p className="text-slate-400 text-xs font-bold flex items-center gap-2">
                                <MousePointer2 size={12} /> انظر إلى المكونات لاستكشافها
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={toggleFullscreen}
                        className="w-14 h-14 bg-slate-900/80 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-slate-700 shadow-2xl hover:bg-primary transition-colors hover:scale-110 pointer-events-auto"
                    >
                        <Maximize className="w-6 h-6" />
                    </button>
                </div>

                {/* Info Display Card */}
                {activeInfo && componentData[activeInfo] && (
                    <div className="absolute bottom-10 left-10 w-[400px] bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[3rem] border border-slate-700 shadow-2xl animate-spring-up">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl border-2 shadow-inner" style={{ backgroundColor: `${componentData[activeInfo].color}20`, borderColor: componentData[activeInfo].color }}>
                                {componentData[activeInfo].icon}
                            </div>
                            <div>
                                <h3 className="text-white font-black text-2xl">{componentData[activeInfo].name}</h3>
                                <div className="text-xs font-black uppercase tracking-widest mt-1" style={{ color: componentData[activeInfo].color }}>
                                    {componentData[activeInfo].nameEn}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50">
                            <p className="text-slate-300 font-bold leading-relaxed text-sm">
                                {componentData[activeInfo].description}
                            </p>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-2 text-primary font-black text-xs bg-primary/10 px-4 py-2 rounded-xl w-fit">
                            <Info size={14} /> عنصر تفاعلي جاهز للتركيب
                        </div>
                    </div>
                )}
                
                {/* Fixed Crosshair overlay (fallback mostly) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/50 mix-blend-difference pointer-events-none hidden" />
            </div>

            {/* A-Frame 3D Scene */}
            {/* ts-ignore because A-Frame elements aren't natively recognized by React TS types */}
            {/* @ts-ignore */}
            <a-scene embedded style={{ width: '100%', height: '100%' }} renderer="antialias: true; colorManagement: true;">
                {/* 1. Environment / Lighting */}
                {/* @ts-ignore */}
                <a-sky color="#0f172a"></a-sky>
                {/* @ts-ignore */}
                <a-light type="ambient" color="#222"></a-light>
                {/* @ts-ignore */}
                <a-light type="directional" position="-1 2 1" intensity="0.8" castShadow="true"></a-light>
                {/* @ts-ignore */}
                <a-light type="point" position="2 4 -2" intensity="0.5" color="#3b82f6"></a-light>
                
                {/* Floor Grid for perspective */}
                {/* @ts-ignore */}
                <a-grid position="0 -1 0" scale="20 20 20"></a-grid>

                {/* 2. Camera with Cursor for Interaction */}
                {/* @ts-ignore */}
                <a-entity position="0 2.5 3.5" rotation="-20 0 0">
                    {/* @ts-ignore */}
                    <a-camera look-controls="pointerLockEnabled: false" wasd-controls="fly: true; acceleration: 50">
                        {/* Cursor acts as the raycaster */}
                        {/* @ts-ignore */}
                        <a-entity 
                            cursor="fuse: false; rayOrigin: mouse"
                            raycaster="objects: .clickable"
                            position="0 0 -1"
                            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
                            material="color: white; shader: flat"
                            animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1"
                            animation__fusing="property: fusing; startEvents: fusing; easing: easeInCubic; dur: 1500; from: 1 1 1; to: 0.1 0.1 0.1"
                            animation__mouseleave="property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 500; to: 1 1 1">
                        {/* @ts-ignore */}
                        </a-entity>
                    {/* @ts-ignore */}
                    </a-camera>
                {/* @ts-ignore */}
                </a-entity>

                {/* 3. Arduino Composition Entity */}
                {/* @ts-ignore */}
                <a-entity position="0 0 0" rotation="-30 0 0">
                    
                    {/* PCB Base */}
                    {/* @ts-ignore */}
                    <a-box position="0 0 0" width="2.8" height="0.1" depth="2.1" color="#006468"></a-box>
                    
                    {/* Microcontroller (Target: microcontroller) */}
                    {/* @ts-ignore */}
                    <a-box 
                        class="clickable" 
                        targetId="microcontroller"
                        hover-highlight="color: #4b5563; scale: 1.05 1.05 1.05; targetId: microcontroller"
                        position="0.2 0.1 -0.2" 
                        width="1.8" height="0.15" depth="0.6" 
                        color="#1f2937">
                    {/* @ts-ignore */}
                    </a-box>
                    
                    {/* USB Port (Target: usbPort) */}
                    {/* @ts-ignore */}
                    <a-box 
                        class="clickable"
                        hover-highlight="color: #f1f5f9; scale: 1.1 1.1 1.1; targetId: usbPort"
                        position="-1.2 0.1 0.6" 
                        width="0.5" height="0.4" depth="0.5" 
                        color="#cbd5e1"
                        material="metalness: 0.8; roughness: 0.2">
                    {/* @ts-ignore */}
                    </a-box>

                    {/* Power Jack (Target: powerJack) */}
                    {/* @ts-ignore */}
                    <a-cylinder 
                        class="clickable"
                        hover-highlight="color: #333333; scale: 1.1 1.1 1.1; targetId: powerJack"
                        position="-1.2 0.1 -0.4" 
                        radius="0.25" height="0.4" 
                        color="#000000">
                    {/* @ts-ignore */}
                    </a-cylinder>

                    {/* Digital Headers (Target: digitalPins) */}
                    {/* @ts-ignore */}
                    <a-box 
                        class="clickable"
                        hover-highlight="color: #fde047; scale: 1.05 1.05 1.05; targetId: digitalPins"
                        position="0.1 0.1 0.9" 
                        width="2.2" height="0.15" depth="0.18" 
                        color="#111827">
                        {/* Little pin markings on top */}
                        {/* @ts-ignore */}
                        <a-box position="0 0.08 0" width="2.1" height="0.01" depth="0.05" color="#d1d5db"></a-box>
                    {/* @ts-ignore */}
                    </a-box>
                    
                    {/* Analog Headers (Target: analogPins) */}
                    {/* @ts-ignore */}
                    <a-box 
                        class="clickable"
                        hover-highlight="color: #60a5fa; scale: 1.05 1.05 1.05; targetId: analogPins"
                        position="0.6 0.1 -0.9" 
                        width="1.2" height="0.15" depth="0.18" 
                        color="#111827">
                        {/* @ts-ignore */}
                        <a-box position="0 0.08 0" width="1.1" height="0.01" depth="0.05" color="#d1d5db"></a-box>
                    {/* @ts-ignore */}
                    </a-box>
                {/* @ts-ignore */}
                </a-entity>

                {/* 4. External Breadboard & Components */}
                {/* @ts-ignore */}
                <a-entity position="0 0 -2.5" rotation="-30 0 0">
                    {/* Breadboard Base */}
                    {/* @ts-ignore */}
                    <a-box position="0 0 0" width="3.5" height="0.1" depth="1.5" color="#ffffff"></a-box>
                    {/* Red line */}
                    {/* @ts-ignore */}
                    <a-box position="0 0.06 0.5" width="3.3" height="0.01" depth="0.02" color="#ef4444"></a-box>
                    {/* Blue line */}
                    {/* @ts-ignore */}
                    <a-box position="0 0.06 0.6" width="3.3" height="0.01" depth="0.02" color="#3b82f6"></a-box>
                    
                    {/* LED (Target: led) */}
                    {/* @ts-ignore */}
                    <a-entity 
                        class="clickable"
                        position="0.5 0.3 0"
                        hover-highlight="color: #ff0000; scale: 1.2 1.2 1.2; targetId: led">
                        {/* Bulb */}
                        {/* @ts-ignore */}
                        <a-sphere position="0 0.2 0" radius="0.15" color="#ef4444" material="emissive: #ef4444; emissiveIntensity: 0.5"></a-sphere>
                        {/* Legs */}
                        {/* @ts-ignore */}
                        <a-cylinder position="-0.05 -0.1 0" radius="0.01" height="0.4" color="#d1d5db"></a-cylinder>
                        {/* @ts-ignore */}
                        <a-cylinder position="0.05 -0.1 0" radius="0.01" height="0.5" color="#d1d5db"></a-cylinder>
                    {/* @ts-ignore */}
                </a-entity>

                    {/* Resistor (Target: resistor) */}
                    {/* @ts-ignore */}
                    <a-entity 
                        class="clickable"
                        position="-0.5 0.1 0"
                        rotation="0 0 90"
                        hover-highlight="color: #f59e0b; scale: 1.2 1.2 1.2; targetId: resistor">
                        {/* Body */}
                        {/* @ts-ignore */}
                        <a-cylinder position="0 0 0" radius="0.06" height="0.4" color="#e5e7eb"></a-cylinder>
                        {/* Color bands */}
                        {/* @ts-ignore */}
                        <a-cylinder position="0 0.1 0" radius="0.065" height="0.03" color="#ef4444"></a-cylinder>
                        {/* @ts-ignore */}
                        <a-cylinder position="0 0 0" radius="0.065" height="0.03" color="#a855f7"></a-cylinder>
                        {/* @ts-ignore */}
                        <a-cylinder position="0 -0.1 0" radius="0.065" height="0.03" color="#8b5cf6"></a-cylinder>
                        {/* Wire ends */}
                        {/* @ts-ignore */}
                        <a-cylinder position="0 0.3 0" radius="0.01" height="0.2" color="#9ca3af"></a-cylinder>
                        {/* @ts-ignore */}
                        <a-cylinder position="0 -0.3 0" radius="0.01" height="0.2" color="#9ca3af"></a-cylinder>
                    {/* @ts-ignore */}
                </a-entity>

                {/* Wire connecting Arduino to Breadboard */}
                {/* @ts-ignore */}
                <a-tube path="0.1 0.1 0.9, 0.5 0.5 0, 0.5 0.3 -2.5" radius="0.02" material="color: red"></a-tube>
                {/* @ts-ignore */}
            </a-entity>

            {/* Floating Instructional Text in Scene */}
            {/* @ts-ignore */}
            <a-text 
                value="Hover over components\nto discover Arduino magic!" 
                position="0 3 -4" 
                align="center" 
                color="#ffffff" 
                scale="1.5 1.5 1.5"
                font="https://cdn.aframe.io/fonts/Exo2Bold.fnt">
            {/* @ts-ignore */}
            </a-text>

            {/* @ts-ignore */}
            </a-scene>
        </div>
    );
}
