import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { X, Send, Mic, MicOff, Check, RefreshCw, Maximize2, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import axios from 'axios';

// 🔴 THE NGROK ENDPOINT FOR WHISPER AI 🔴
const WHISPER_API_URL = 'https://rebound-lying-unshaken.ngrok-free.dev/transcribe/sync?mode=single';

interface Message { id: string; role: 'user' | 'assistant'; text: string; }

function genId() { return Math.random().toString(36).slice(2); }

/* Quick suggestions that rotate after each answer */
const SUGGESTION_POOL = [
    ['💡 اشرح المتغيرات في Python', '🎮 كيف أصنع لعبة Scratch؟'],
    ['🔄 ما هي حلقات التكرار؟', '⚡ كيف أوصل LED بالأردوينو؟'],
    ['📦 ما هو الكائن في OOP؟', '🔍 اشرح الشرط if/else'],
    ['🐍 ما الفرق بين list و dict؟', '🎯 كيف أعمل دالة function؟'],
];

export default function CodyDrawer() {
    const { isOpen, closeDrawer } = useChatStore();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', role: 'assistant', text: 'أهلاً يا بطل! 🚀 أنا كودي. اسألني أي شيء عن البرمجة وسأساعدك!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggIdx, setSuggIdx] = useState(0);
    const [mascotHappy, setMascotHappy] = useState(false);

    // Voice state
    const [voicePhase, setVoicePhase] = useState<'idle' | 'recording' | 'transcribing' | 'confirming'>('idle');
    const [voiceDraft, setVoiceDraft] = useState('');
    
    // MediaRecorder refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef(true);
    const voiceStartTimeRef = useRef<number>(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Cleanup on unmount — stop any active recording & release mic
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            // Force-stop recorder if component unmounts during recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                try { mediaRecorderRef.current.stop(); } catch {}
            }
            // Release microphone tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            mediaRecorderRef.current = null;
        };
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async (overrideText?: string) => {
        const text = (overrideText ?? input).trim();
        if (!text || loading) return;

        const userMsg: Message = { id: genId(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat/expert', { message: text });
            const botText = res.data.text || res.data.reply || res.data.answer || 'عذراً، حدثت مشكلة. حاول مرة أخرى!';
            setMessages(prev => [...prev, { id: genId(), role: 'assistant', text: botText }]);
            setSuggIdx(i => (i + 1) % SUGGESTION_POOL.length);
            setMascotHappy(true);
            setTimeout(() => setMascotHappy(false), 900);
        } catch {
            setMessages(prev => [...prev, { id: genId(), role: 'assistant', text: 'عذراً، يبدو أن هناك مشكلة في الاتصال! 😢' }]);
        } finally {
            setLoading(false);
        }
    };

    const startVoice = async () => {
        // Clean up any previous recording first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        mediaRecorderRef.current = null;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            voiceStartTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Release mic immediately
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
                
                if (!mountedRef.current) return;

                const duration = Date.now() - (voiceStartTimeRef.current || 0);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                if (duration < 800 || audioBlob.size < 100) {
                    if (mountedRef.current) setVoicePhase('idle');
                    if (duration < 800) alert('الرجاء الضغط مطولاً على الزر للتحدث...');
                    return;
                }

                setVoicePhase('transcribing');

                try {
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'drawer_recording.webm');

                    const res = await axios.post(WHISPER_API_URL, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'ngrok-skip-browser-warning': 'true'
                        },
                        timeout: 120000,
                    });

                    if (!mountedRef.current) return;

                    const text = res.data.transcript || '';
                    if (text.trim()) {
                        setVoiceDraft(text.trim());
                        setVoicePhase('confirming');
                    } else {
                        setVoicePhase('idle');
                        alert('لم نتمكن من سماع شيء بوضوح. حاول مرة أخرى!');
                    }
                } catch (err) {
                    console.error('Drawer transcription error:', err);
                    if (!mountedRef.current) return;
                    setVoicePhase('idle');
                    alert('حدث خطأ أثناء الاتصال بخادم الصوت. تأكد من تشغيل الخادم.');
                }
            };

            mediaRecorder.start(250); // collect in 250ms chunks for reliability
            setVoicePhase('recording');
            setVoiceDraft('');
        } catch (err) {
            console.error('Drawer mic error:', err);
            alert('تعذر الوصول إلى الميكروفون. يرجى إعطاء الصلاحية من إعدادات المتصفح.');
            if (mountedRef.current) setVoicePhase('idle');
        }
    };

    const stopVoice = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const confirmVoice = () => { if (voiceDraft.trim()) { setInput(voiceDraft.trim()); } setVoicePhase('idle'); setVoiceDraft(''); };
    const cancelVoice  = () => {
        setVoicePhase('idle');
        setVoiceDraft('');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    if (!isOpen) return null;

    /* Theme */
    const bgMesh = isDark ? 'bg-mesh-dark' : 'bg-mesh-light';
    const hdr    = isDark ? 'bg-white/[0.05] border-b border-white/[0.1] backdrop-blur-xl' : 'bg-white/70 border-b border-white/50 backdrop-blur-xl';
    const txt    = isDark ? 'text-slate-100' : 'text-slate-800';
    const txtM   = isDark ? 'text-slate-400' : 'text-slate-500';

    const suggestions = SUGGESTION_POOL[suggIdx % SUGGESTION_POOL.length];

    return (
        <div
            className={`fixed inset-y-0 right-0 z-[99999] w-full sm:w-[420px] ${bgMesh} shadow-[0_0_60px_rgba(0,0,0,0.3)] flex flex-col animate-slide-in-right font-cairo`}
            style={{ borderRadius: '1.5rem 0 0 1.5rem', overflow: 'hidden' }}
            dir="rtl"
        >
            {/* ── Header ── */}
            <div className={`${hdr} px-5 py-4 flex items-center justify-between shrink-0 shadow-sm z-20 relative`}>
                <div className="flex items-center gap-3">
                    {/* Mascot */}
                    <div className="relative hover-lift">
                        <div className={`w-12 h-12 rounded-[1rem] border-2 overflow-hidden shadow-md ${isDark ? 'border-violet-500/40 bg-violet-950/80' : 'border-white bg-white'}`}>
                            <img src="/moscot.png" alt="Cody"
                                 className={`w-full h-full object-contain ${mascotHappy ? 'animate-mascot-happy' : 'animate-mascot-idle'}`}/>
                        </div>
                        <span className={`absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'border-[#0b0c16]' : 'border-[#f8faff]'} ${loading ? 'bg-amber-400' : 'bg-emerald-400'}`}/>
                    </div>
                    <div>
                        <h2 className={`font-black text-lg ${txt}`}>كودي</h2>
                        <p className={`text-[11px] font-bold flex items-center gap-1 ${loading ? 'text-amber-500' : txtM}`}>
                            {loading ? 'يبحث…' : <><Sparkles size={11} className="text-emerald-500"/> مساعد سديم</>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { closeDrawer(); navigate('/ai-assistant'); }}
                        title="المحادثة الكاملة"
                        className={`p-2.5 rounded-[0.8rem] transition-all btn-tactile ${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 shadow-sm'}`}
                    >
                        <Maximize2 size={16} strokeWidth={2.5}/>
                    </button>
                    <button onClick={closeDrawer} 
                        className={`p-2.5 rounded-[0.8rem] transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-black/5 text-slate-500'}`}>
                        <X size={20} strokeWidth={2.5}/>
                    </button>
                </div>
            </div>

            {/* ── Messages ── */}
            <div className={`flex-1 overflow-y-auto cody-scroll p-5 space-y-4 relative z-10`}>
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-2.5 animate-msg-appear ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        {msg.role === 'assistant' ? (
                            <div className={`w-9 h-9 rounded-xl border-2 overflow-hidden shrink-0 mt-0.5 shadow-sm ${isDark ? 'border-violet-500/40 bg-violet-950/60' : 'border-white bg-white/80'}`}>
                                <img src="/moscot.png" alt="Cody" className="w-full h-full object-contain"/>
                            </div>
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 text-white font-black text-xs shadow-md shadow-teal-500/30">
                                أنا
                            </div>
                        )}
                        <div className={`max-w-[80%] px-4 py-3 text-[13px] font-bold leading-[1.8] shadow-sm ${
                            msg.role === 'user'
                                ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white cody-bubble-user'
                                : `cody-bubble-bot ${isDark ? 'bg-white/10 text-slate-200' : 'bg-white text-slate-800'}`
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Typing */}
                {loading && (
                    <div className="flex gap-2.5 animate-msg-appear">
                        <div className={`w-9 h-9 rounded-xl border-2 overflow-hidden shrink-0 mt-0.5 shadow-sm ${isDark ? 'border-violet-500/40 bg-violet-950/60' : 'border-white bg-white/80'}`}>
                            <img src="/moscot.png" alt="Cody" className="w-full h-full object-contain animate-mascot-breathe"/>
                        </div>
                        <div className={`px-4 py-3.5 flex items-center gap-2 cody-bubble-bot ${isDark ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                            <div className="flex gap-1.5 items-end h-5">
                                <div className="w-2 rounded-full bg-violet-400 cody-dot-1" style={{height:'6px'}}/>
                                <div className="w-2 rounded-full bg-teal-400 cody-dot-2" style={{height:'6px'}}/>
                                <div className="w-2 rounded-full bg-emerald-400 cody-dot-3" style={{height:'6px'}}/>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef}/>
            </div>

            {/* ── Floating Input Area ── */}
            <div className="p-4 shrink-0 relative z-20">
                
                {/* ── Quick suggestions ── */}
                {!loading && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-none mb-3 px-1">
                        {suggestions.map(s => (
                            <button key={s} onClick={() => handleSend(s.slice(2))}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 hover-lift shrink-0 btn-tactile ${
                                    isDark ? 'bg-white/10 text-slate-200 hover:bg-white/20' : 'bg-white text-violet-800 border border-violet-100 shadow-sm hover:shadow-md'
                                }`}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Voice transcript confirm — kid-friendly ── */}
                {(voicePhase === 'transcribing' || voicePhase === 'confirming') && (
                    <div className={`mb-3 voice-transcript-card shadow-xl animate-msg-appear rounded-2xl p-4`}>
                        <p className={`text-sm font-black mb-2 flex items-center gap-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                            {voicePhase === 'transcribing' ? <><span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse"/> ⏳ جاري الترجمة (Whisper)...</> : '🎤 هل هذا ما قلته؟'}
                        </p>
                        {voicePhase === 'confirming' && (
                            <textarea value={voiceDraft} onChange={e => setVoiceDraft(e.target.value)} rows={3} dir="rtl"
                                className={`w-full resize-none rounded-xl border-2 outline-none text-base font-bold leading-loose p-3 ${isDark ? 'bg-white/5 border-white/10 text-slate-100 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-400'} transition`}/>
                        )}
                        {voicePhase === 'confirming' && (
                            <div className="flex gap-2 mt-3">
                                <button onClick={confirmVoice}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black transition active:scale-95 btn-tactile shadow-md shadow-emerald-500/30">
                                    <Check size={16}/> تأكيد ✅
                                </button>
                                <button onClick={startVoice}
                                    className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold transition btn-tactile ${isDark ? 'bg-white/10 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`}>
                                    <RefreshCw size={14}/> أعد 🔄
                                </button>
                                <button onClick={cancelVoice}
                                    className={`p-3 rounded-xl transition ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-slate-400 hover:bg-white'}`}>
                                    <X size={18}/>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Glassy Input Bar ── */}
                <div className={`flex items-center gap-2 p-2 rounded-full transition-all focus-within:shadow-xl focus-within:-translate-y-0.5 cody-glass-input`}>
                    
                    {/* Voice */}
                    <button
                        type="button"
                        onPointerDown={(e) => { e.preventDefault(); if (voicePhase === 'idle') startVoice(); }}
                        onPointerUp={(e) => { e.preventDefault(); if (voicePhase === 'recording') stopVoice(); }}
                        onPointerLeave={(e) => { e.preventDefault(); if (voicePhase === 'recording') stopVoice(); }}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ touchAction: 'none' }}
                        disabled={voicePhase === 'transcribing' || loading}
                        title={voicePhase === 'recording' ? 'أفلت لإيقاف التسجيل' : 'اضغط مطولاً للتحدث'}
                        className={`p-3 rounded-full transition-all active:scale-90 disabled:opacity-30 shrink-0 relative ${
                            voicePhase === 'recording'
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                                : isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-violet-700 hover:bg-violet-100'
                        }`}>
                        {voicePhase === 'recording' && <span className="absolute inset-0 rounded-full bg-red-400/25 animate-ping"/>}
                        {voicePhase === 'recording' ? <MicOff size={18} className="relative z-10"/> : <Mic size={18}/>}
                    </button>

                    <input
                        type="text" value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="اسأل كودي هنا…"
                        disabled={loading}
                        className={`flex-1 bg-transparent outline-none text-[14px] font-bold py-1.5 min-w-0 ${txt} placeholder:text-slate-400 placeholder:font-medium`}
                    />

                    <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center shadow-md transition-all btn-tactile disabled:opacity-30 disabled:grayscale hover:scale-105 shrink-0">
                        <Send size={16} className="rotate-180 -ml-1"/>
                    </button>
                </div>
            </div>
        </div>
    );
}
