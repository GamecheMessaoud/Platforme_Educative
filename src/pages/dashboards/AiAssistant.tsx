import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import {
    Send, Plus, Trash2, Mic, MicOff, Check, X,
    RefreshCw, Copy, ChevronRight, Wifi, WifiOff,
    BookOpen, Code2, BarChart3, Zap, Sparkles, Menu, History
} from 'lucide-react';
import api from '../../lib/api';
import axios from 'axios';
import mermaid from 'mermaid';

// Voice transcription — tries RAG Whisper first, then browser SpeechRecognition fallback
const WHISPER_API_URL = 'https://rebound-lying-unshaken.ngrok-free.dev/transcribe/sync?mode=single';

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Cairo, sans-serif',
    flowchart: { curve: 'basis', padding: 15 },
});

/* ─── Types ──────────────────────────────────────────────────────── */
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
    sources?: { source: string; page?: number }[];
    diagram_mermaid?: string | null;
    via?: 'rag' | 'gemini_fallback';
}

interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    messages: ChatMessage[];
}

/* ─── Storage helpers ────────────────────────────────────────────── */
const STORAGE_KEY = 'chatcody_v2_conversations';
const ACTIVE_KEY  = 'chatcody_v2_active';
function loadConversations(): Conversation[] {
    try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveConversations(c: Conversation[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); }
function loadActiveId(): string | null { return localStorage.getItem(ACTIVE_KEY); }
function saveActiveId(id: string) { localStorage.setItem(ACTIVE_KEY, id); }
function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function fmt(iso: string) { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/* ─── Parse 4 pedagogical blocks ────────────────────────────────── */
interface ParsedBlocks {
    explanation: string;
    code: { lang: string; content: string } | null;
    diagram: string | null;
    activity: string | null;
}
function parseResponse(text: string, diagramMermaid?: string | null): ParsedBlocks {
    const codeMatch = text.match(/```(\w*)\n?([\s\S]*?)```/);
    const actPat = /(?:🎯|جرب|حاول|نشاط|تحدى|try it|challenge|activity)[:\s]+([\s\S]*?)(?:\n\n|$)/i;
    const actMatch = text.match(actPat);
    let explanation = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(actPat, '')
        .trim();
    return {
        explanation,
        code: codeMatch ? { lang: codeMatch[1] || 'code', content: codeMatch[2].trim() } : null,
        diagram: diagramMermaid || null,
        activity: actMatch ? actMatch[1].trim() : null,
    };
}

function cleanSource(raw: string): string {
    let name = raw.replace(/^.*[/\\]/, '').replace(/\.(pdf|docx|txt|html|md)$/i, '').replace(/[_-]/g,' ').trim();
    // Remove common prefixes like "Noor-Book.com" or "ar_L4_script"
    name = name.replace(/^Noor Book\.com\s*/i, '').replace(/^ar\s+L\d+\s+/i, '').trim();
    // If the name is empty or too short, return a default
    return name.length > 2 ? name : 'درس';
}

/* ─── Mermaid Diagram Renderer ───────────────────────────────────── */
function MermaidDiagram({ code, isDark }: { code: string; isDark: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const render = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
                const { svg: renderedSvg } = await mermaid.render(id, code);
                if (!cancelled) setSvg(renderedSvg);
            } catch (err) {
                console.warn('Mermaid render error:', err);
                if (!cancelled) setError(true);
            }
        };
        render();
        return () => { cancelled = true; };
    }, [code]);

    if (error) {
        return (
            <pre className={`text-[12px] font-mono leading-relaxed overflow-x-auto direction-ltr text-left font-bold p-3 rounded-xl ${isDark ? 'text-violet-300 bg-white/5' : 'text-violet-900 bg-violet-50'}`}>
                {code}
            </pre>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`w-full overflow-x-auto rounded-xl p-3 ${isDark ? 'bg-white/5 [&_svg]:invert [&_svg]:hue-rotate-180' : 'bg-violet-50/50'}`}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

/* ─── XP celebration ─────────────────────────────────────────────── */
function XPToast() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 700);
        const t2 = setTimeout(() => setVisible(false), 2500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);
    if (!visible) return null;
    return (
        <div className="absolute -top-1 -right-1 pointer-events-none animate-xp-float z-30">
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md shadow-orange-400/40 whitespace-nowrap">
                <Sparkles size={8}/> +5 XP
            </div>
        </div>
    );
}

/* ─── Four-block Cody message ─────────────────────────────────────── */
function CodyMessage({ msg, isDark }: { msg: ChatMessage; isDark: boolean }) {
    const [copied, setCopied] = useState(false);
    const [xpKey] = useState(() => genId()); // unique per render
    const blocks = parseResponse(msg.text, msg.diagram_mermaid);

    const copyCode = async () => {
        if (!blocks.code) return;
        await navigator.clipboard.writeText(blocks.code.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const noContent = !blocks.explanation && !blocks.code && !blocks.diagram && !blocks.activity;

    return (
        <div className="flex gap-3 animate-msg-appear" key={xpKey}>
            {/* Mascot avatar */}
            <div className="relative shrink-0 mt-1">
                <div className={`w-10 h-10 rounded-2xl border-2 overflow-hidden shadow-md ${isDark ? 'border-violet-500/40 bg-violet-950/60' : 'border-white bg-white/80'}`}>
                    <img src="/moscot.png" alt="Cody" className="w-full h-full object-contain" />
                </div>
                <XPToast key={xpKey} />
            </div>

            <div className="max-w-[85%] min-w-0 space-y-2.5">
                {/* Name + time */}
                <div className="flex items-center gap-2 px-1">
                    <span className={`text-[11px] font-black ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>كودي</span>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{fmt(msg.timestamp)}</span>
                    {msg.via === 'gemini_fallback' && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                            <Zap size={8}/> Gemini
                        </span>
                    )}
                </div>

                {/* If we couldn't parse — fallback plain bubble */}
                {noContent && (
                    <div className={`px-5 py-4 rounded-2xl text-sm leading-[1.85] font-semibold cody-bubble-bot ${isDark ? 'bg-white/10 text-slate-100' : 'bg-white text-slate-800'}`}>
                        {msg.text}
                    </div>
                )}

                {/* Block 1 — Explanation */}
                {blocks.explanation && (
                    <div className="cody-block-explanation cody-bubble-bot">
                        <div className="flex items-center gap-1.5 mb-2">
                            <BookOpen size={14} className="text-emerald-500 shrink-0"/>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">📝 الشرح</span>
                        </div>
                        <p className={`text-[15px] leading-[1.8] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {blocks.explanation}
                        </p>
                    </div>
                )}

                {/* Block 2 — Code */}
                {blocks.code && (
                    <div className="cody-mac-window cody-bubble-bot">
                        <div className="cody-mac-header">
                            <div className="flex gap-1.5">
                                <div className="cody-mac-dot close"></div>
                                <div className="cody-mac-dot min"></div>
                                <div className="cody-mac-dot max"></div>
                            </div>
                            <div className="flex-1 text-center font-mono text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                {blocks.code.lang || 'CODE'}
                            </div>
                            <button onClick={copyCode}
                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition text-[9px] font-black text-slate-300">
                                {copied ? <><Check size={10} className="text-green-400"/> نُسخ</> : <><Copy size={10}/> نسخ</>}
                            </button>
                        </div>
                        <div className="cody-code-body" style={{ backgroundColor: '#1e1e2e' }}>
                            <SyntaxHighlighter
                                language={blocks.code.lang || 'python'}
                                style={vscDarkPlus}
                                customStyle={{ margin: 0, background: 'transparent', padding: '16px', fontSize: '14px', borderRadius: '0 0 12px 12px' }}
                            >
                                {blocks.code.content}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                )}

                {/* Block 3 — Diagram (rendered visually) */}
                {blocks.diagram && (
                    <div className="cody-block-diagram cody-bubble-bot">
                        <div className="flex items-center gap-1.5 mb-2.5">
                            <BarChart3 size={14} className="text-violet-500 shrink-0"/>
                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-700">📊 مخطط توضيحي</span>
                        </div>
                        <MermaidDiagram code={blocks.diagram} isDark={isDark} />
                    </div>
                )}

                {/* Block 4 — Activity */}
                {blocks.activity && (
                    <div className="cody-block-activity cody-bubble-bot">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-lg leading-none animate-bounce">🎯</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">جرّب بنفسك!</span>
                        </div>
                        <p className={`text-[15px] leading-[1.8] font-black ${isDark ? 'text-orange-100' : 'text-orange-900'}`}>
                            {blocks.activity}
                        </p>
                    </div>
                )}

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className={`text-[10px] font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>📚 من دروسي:</span>
                        {msg.sources.slice(0, 3).map((src, i) => (
                            <span key={i} className="cody-source-chip">
                                {cleanSource(src.source || 'درس')}
                                {src.page != null && <span className="opacity-60 mr-1 font-bold">ص{src.page+1}</span>}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Typing indicator ───────────────────────────────────────────── */
function TypingIndicator({ isDark }: { isDark: boolean }) {
    return (
        <div className="flex gap-3 animate-msg-appear">
            <div className={`w-10 h-10 rounded-2xl border-2 overflow-hidden shadow-md shrink-0 mt-1 ${isDark ? 'border-violet-500/40 bg-violet-950/60' : 'border-white bg-white/80'}`}>
                <img src="/moscot.png" alt="Cody" className="w-full h-full object-contain animate-mascot-breathe"/>
            </div>
            <div>
                <span className={`block text-[11px] font-black mb-1.5 px-1 ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>كودي</span>
                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl cody-bubble-bot ${isDark ? 'bg-white/10 text-slate-200' : 'bg-white text-slate-800'}`}>
                    <div className="flex gap-1.5 items-end h-6">
                        <div className="w-2.5 rounded-full bg-violet-400 cody-dot-1" style={{height:'8px'}}/>
                        <div className="w-2.5 rounded-full bg-teal-400 cody-dot-2" style={{height:'8px'}}/>
                        <div className="w-2.5 rounded-full bg-emerald-400 cody-dot-3" style={{height:'8px'}}/>
                    </div>
                    <span className="text-xs font-bold opacity-70">يبحث في الدروس…</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Voice button + Whisper API (MediaRecorder) ─────────────────────── */
function VoiceInput({ onInsert, disabled, isDark }: {
    onInsert: (text: string) => void;
    disabled: boolean;
    isDark: boolean;
}) {
    const [phase, setPhase] = useState<'idle' | 'recording' | 'transcribing' | 'confirming'>('idle');
    const [draft, setDraft] = useState('');
    
    // MediaRecorder refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef(true);
    const startTimeRef = useRef<number>(0);

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

    const start = async () => {
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
            startTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Release mic immediately
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(t => t.stop());
                    streamRef.current = null;
                }
                
                const duration = Date.now() - (startTimeRef.current || 0);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                if (duration < 800 || audioBlob.size < 100) {
                    if (mountedRef.current) setPhase('idle');
                    if (duration < 800) alert('الرجاء الضغط مطولاً على الزر للتحدث...');
                    return;
                }
                
                setPhase('transcribing');
                
                try {
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');
                    
                    const res = await axios.post(WHISPER_API_URL, formData, {
                        headers: { 'Content-Type': 'multipart/form-data', 'ngrok-skip-browser-warning': 'true' },
                        timeout: 120000,
                    });
                    
                    if (!mountedRef.current) return;
                    
                    const text = res.data.transcript || '';
                    if (text.trim()) {
                        setDraft(text.trim());
                        setPhase('confirming');
                    } else {
                        setPhase('idle');
                        alert('لم نتمكن من سماع شيء بوضوح. حاول مرة أخرى!');
                    }
                } catch (err) {
                    console.error('Transcription error:', err);
                    if (!mountedRef.current) return;
                    setPhase('idle');
                    alert('حدث خطأ أثناء الاتصال بخادم الصوت. تأكد من تشغيل الخادم.');
                }
            };

            mediaRecorder.start(250); // collect in 250ms chunks for reliability
            setPhase('recording');
            setDraft('');
        } catch (err) {
            console.error('Mic error:', err);
            alert('تعذر الوصول إلى الميكروفون. يرجى إعطاء الصلاحية من إعدادات المتصفح.');
            if (mountedRef.current) setPhase('idle');
        }
    };

    const stop = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const confirm = () => { if (draft.trim()) onInsert(draft.trim()); setPhase('idle'); setDraft(''); };
    const cancel  = () => {
        setPhase('idle');
        setDraft('');
        // Also release mic if somehow still held
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    return (
        <>
            {/* Transcript popup — large & kid-friendly */}
            {(phase === 'transcribing' || phase === 'confirming') && (
                <div className={`fixed inset-0 z-50 flex items-end justify-center p-4 pb-28 sm:pb-32 pointer-events-none`}>
                    <div className={`pointer-events-auto w-full max-w-xl animate-msg-appear shadow-2xl rounded-2xl p-5 ${isDark ? 'bg-[#1a1b2e]/95 border border-white/10' : 'bg-white/95 border border-slate-200'}`}
                         style={{ backdropFilter: 'blur(20px)' }}>
                        <p className={`text-base font-black mb-3 flex items-center gap-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                            {phase === 'transcribing'
                                ? <><span className="w-3 h-3 rounded-full bg-violet-500 animate-pulse"/> ⏳ كودي يستمع ويترجم (Whisper)...</>
                                : '🎤 هل هذا ما قلته؟'}
                        </p>
                        {phase === 'confirming' && (
                            <textarea
                                value={draft} onChange={e => setDraft(e.target.value)} rows={3} dir="rtl"
                                className={`w-full resize-none rounded-xl border-2 outline-none text-base font-bold leading-loose p-4 ${isDark ? 'bg-white/5 border-white/10 text-slate-100 focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-400'} transition`}
                            />
                        )}
                        {phase === 'confirming' && (
                            <div className="flex gap-3 mt-4">
                                <button onClick={confirm}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black transition active:scale-95 shadow-lg shadow-emerald-500/30 btn-tactile">
                                    <Check size={18}/> تأكيد وإرسال ✅
                                </button>
                                <button onClick={start}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition active:scale-95 btn-tactile ${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
                                    <RefreshCw size={16}/> أعد 🔄
                                </button>
                                <button onClick={cancel}
                                    className={`p-3 rounded-xl transition ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-200 text-slate-500'}`}>
                                    <X size={20}/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* The mic button itself */}
            <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); if (phase === 'idle') start(); }}
                onPointerUp={(e) => { e.preventDefault(); if (phase === 'recording') stop(); }}
                onPointerLeave={(e) => { e.preventDefault(); if (phase === 'recording') stop(); }}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'none' }}
                disabled={disabled || phase === 'transcribing' || phase === 'confirming'}
                title={phase === 'recording' ? 'أفلت لإيقاف التسجيل' : 'اضغط مطولاً للتحدث'}
                className={`relative p-3.5 rounded-full transition-all duration-200 active:scale-90 disabled:opacity-30 shrink-0 ${
                    phase === 'recording'
                        ? 'bg-red-500 text-white shadow-xl shadow-red-500/50'
                        : isDark
                            ? 'text-slate-300 hover:text-white hover:bg-white/10'
                            : 'text-slate-500 hover:text-violet-700 hover:bg-violet-100'
                }`}
            >
                {phase === 'recording' && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-red-400/30 animate-ping"/>
                        {/* Mini waveform above button */}
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-end gap-0.5 bg-red-500/90 px-2 py-1.5 rounded-full" style={{bottom:'unset'}}>
                            {[1,2,3,4,5].map(n=>(
                                <span key={n} className={`w-1 rounded-full bg-white waveform-bar-${n}`} style={{height:'6px'}}/>
                            ))}
                        </span>
                    </>
                )}
                {phase === 'recording' ? <MicOff size={20} className="relative z-10"/> : <Mic size={20}/>}
            </button>
        </>
    );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function AiAssistant() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { user } = useAuthStore();

    const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
    const [activeId, setActiveId]           = useState<string | null>(() => loadActiveId());
    const [input, setInput]                 = useState('');
    const [loading, setLoading]             = useState(false);
    const [ragHealth, setRagHealth]         = useState<{ online: boolean; documents_indexed?: number } | null>(null);
    const [ragSessionId, setRagSessionId]   = useState<string | null>(null);
    const [mascotHappy, setMascotHappy]     = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef       = useRef<HTMLInputElement>(null);

    const active      = conversations.find(c => c.id === activeId) || null;
    const firstName   = user?.full_name?.split(' ')[0] || 'بطل';

    useEffect(() => { saveConversations(conversations); }, [conversations]);
    useEffect(() => { if (activeId) saveActiveId(activeId); }, [activeId]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active?.messages.length, loading]);

    /* RAG health */
    useEffect(() => {
        const check = async () => {
            try { const r = await api.get('/ai/health'); setRagHealth(r.data); }
            catch { setRagHealth({ online: false }); }
        };
        check();
        const iv = setInterval(check, 30_000);
        return () => clearInterval(iv);
    }, []);

    const createNewChat = useCallback(() => {
        const c: Conversation = { id: genId(), title: 'محادثة جديدة', createdAt: new Date().toISOString(), messages: [] };
        setConversations(prev => [c, ...prev]);
        setActiveId(c.id);
        setInput('');
        setRagSessionId(null);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    useEffect(() => {
        if (conversations.length === 0) createNewChat();
        else if (!activeId || !conversations.find(c => c.id === activeId)) setActiveId(conversations[0].id);
    }, []); // eslint-disable-line

    const deleteConvo = (id: string) => {
        setConversations(prev => {
            const next = prev.filter(c => c.id !== id);
            if (activeId === id) { if (next.length > 0) setActiveId(next[0].id); else createNewChat(); }
            return next;
        });
    };

    const handleSend = async (overrideText?: string) => {
        const msg = (overrideText ?? input).trim();
        if (!msg || loading || !activeId) return;

        const userMsg: ChatMessage = { id: genId(), role: 'user', text: msg, timestamp: new Date().toISOString() };
        setConversations(prev => prev.map(c => {
            if (c.id !== activeId) return c;
            const isFirst = c.messages.filter(m => m.role === 'user').length === 0;
            return { ...c, title: isFirst ? msg.slice(0, 48) : c.title, messages: [...c.messages, userMsg] };
        }));
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat/expert', { message: msg, session_id: ragSessionId || undefined });
            if (res.data.session_id) setRagSessionId(res.data.session_id);
            const botMsg: ChatMessage = {
                id: genId(), role: 'assistant',
                text: res.data.text || res.data.reply || res.data.answer || 'عذراً، لم أفهم سؤالك. حاول مرة أخرى! 😊',
                timestamp: new Date().toISOString(),
                sources: res.data.sources || [],
                diagram_mermaid: res.data.diagram_mermaid || null,
                via: res.data.via || 'rag',
            };
            setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, botMsg] } : c));
            setMascotHappy(true);
            setTimeout(() => setMascotHappy(false), 1200);
        } catch (err: any) {
            const errText = err?.response?.data?.error || 'آسف، حدثت مشكلة في الاتصال. تأكد من تشغيل الخادم! 🔌';
            setConversations(prev => prev.map(c => c.id === activeId
                ? { ...c, messages: [...c.messages, { id: genId(), role: 'assistant', text: errText, timestamp: new Date().toISOString() }] }
                : c
            ));
        } finally {
            setLoading(false);
        }
    };

    /* ── Premium Theme classes ── */
    const bgMesh = isDark ? 'bg-mesh-dark' : 'bg-mesh-light';
    const hdr    = isDark ? 'bg-[#0b0c16]/80 border-white/[0.08]' : 'bg-white/60 border-white/50';
    const txt    = isDark ? 'text-slate-100' : 'text-slate-900';
    const txtS   = isDark ? 'text-slate-300' : 'text-slate-600';
    const txtM   = isDark ? 'text-slate-400' : 'text-slate-500';
    const cardC  = isDark ? 'bg-white/[0.05] border border-white/[0.08]' : 'bg-white/80 border border-white shadow-md';
    const slideH = isDark ? 'bg-[#13152a]/95 border-white/[0.05]' : 'bg-white/95 border-slate-200';

    const suggestions = [
        { icon: '🐍', label: 'Python', text: 'ما هو المتغير في Python؟', cls: 'from-emerald-400/20 to-teal-400/20 border-emerald-400/40 text-emerald-800 dark:text-emerald-300 shadow-emerald-500/20' },
        { icon: '🎮', label: 'Scratch', text: 'كيف أصنع لعبة في Scratch؟', cls: 'from-orange-400/20 to-amber-400/20 border-orange-400/40 text-orange-800 dark:text-orange-300 shadow-orange-500/20' },
        { icon: '⚡', label: 'Arduino', text: 'كيف أضيء LED بالأردوينو؟', cls: 'from-blue-400/20 to-cyan-400/20 border-blue-400/40 text-blue-800 dark:text-blue-300 shadow-blue-500/20' },
        { icon: '🔄', label: 'Loops', text: 'اشرح لي حلقات التكرار', cls: 'from-violet-400/20 to-purple-400/20 border-violet-400/40 text-violet-800 dark:text-violet-300 shadow-violet-500/20' },
    ];

    return (
        <div className={`h-screen flex flex-col overflow-hidden font-cairo ${bgMesh}`} dir="rtl">

            {/* ══ HEADER (Glassy) ══ */}
            <header className={`relative z-20 px-4 md:px-8 py-3 flex items-center justify-between border-b backdrop-blur-xl ${hdr} shrink-0 shadow-sm`}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)}
                        className={`p-2 rounded-xl transition ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-white/80 text-slate-600 shadow-sm'}`}>
                        <ChevronRight size={22}/>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`w-12 h-12 rounded-[1.25rem] border-[3px] overflow-hidden shadow-lg ${isDark ? 'border-violet-500/50 bg-violet-950/80' : 'border-white bg-white'}`}>
                                <img src="/moscot.png" alt="Cody"
                                     className={`w-full h-full object-contain ${mascotHappy ? 'animate-mascot-happy' : 'animate-mascot-idle'}`}/>
                            </div>
                            <span className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-[3px] ${isDark ? 'border-[#0b0c16]' : 'border-[#f8faff]'} ${loading ? 'bg-amber-400' : 'bg-emerald-400'}`}/>
                        </div>
                        <div>
                            <h1 className={`text-base font-black ${txt} flex items-center gap-2`}>
                                كودي
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${isDark ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-violet-100 text-violet-700 border border-violet-200'}`}>
                                    مساعد سديم
                                </span>
                            </h1>
                            <p className={`text-[11px] font-bold ${loading ? (isDark ? 'text-amber-400':'text-amber-600') : txtM}`}>
                                {loading ? '🔍 يبحث في الدروس…' : '✨ جاهز للمساعدة'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="hidden md:flex items-center gap-1.5 ml-2" title={ragHealth?.online ? `${ragHealth.documents_indexed ?? '?'} وثيقة مفهرسة` : 'غير متصل'}>
                        {ragHealth?.online ? <Wifi size={14} className="text-emerald-500"/> : <WifiOff size={14} className="text-rose-400"/>}
                        <span className={`text-[11px] font-black ${ragHealth?.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {ragHealth?.online ? 'متصل بالدروس' : 'احتياطي'}
                        </span>
                    </div>
                    <button onClick={() => setIsHistoryOpen(true)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-black transition-all active:scale-95 btn-tactile ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                        <History size={16} strokeWidth={2.5}/>
                        <span className="hidden sm:inline">السجل</span>
                    </button>
                    <button onClick={createNewChat}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-black transition-all active:scale-95 btn-tactile ${isDark ? 'border border-white/10 bg-white/10 hover:bg-white/20 text-white' : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-md'}`}>
                        <Plus size={16} strokeWidth={3}/> <span className="hidden sm:inline">محادثة جديدة</span>
                    </button>
                </div>
            </header>

            {/* ══ HISTORY SLIDE DRAWER ══ */}
            {isHistoryOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsHistoryOpen(false)} />
            )}
            <div className={`fixed inset-y-0 right-0 z-[110] w-full max-w-[320px] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${slideH} ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-white/[0.05]' : 'border-slate-100'}`}>
                    <h2 className={`text-lg font-black flex items-center gap-2 ${txt}`}>
                        <History size={20} className="text-violet-500"/> محادثاتي السابقة
                    </h2>
                    <button onClick={() => setIsHistoryOpen(false)} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <X size={20}/>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 cody-scroll">
                    {conversations.length === 0 && (
                        <div className={`text-center mt-10 text-sm font-bold ${txtM}`}>لا توجد محادثات سابقة</div>
                    )}
                    {conversations.map(c => (
                        <div key={c.id} className={`group flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer hover-lift border ${c.id === activeId ? (isDark ? 'bg-violet-500/20 border-violet-500/30' : 'bg-violet-50 border-violet-200 shadow-sm') : cardC}`}
                             onClick={() => { setActiveId(c.id); setIsHistoryOpen(false); }}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${c.id === activeId ? 'bg-violet-500/20' : (isDark ? 'bg-white/5' : 'bg-slate-50')}`}>💬</div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-black truncate ${c.id === activeId ? 'text-violet-600 dark:text-violet-300' : txt}`}>{c.title || 'محادثة جديدة'}</p>
                                <p className={`text-[10px] font-bold mt-0.5 ${txtM}`}>{new Date(c.createdAt).toLocaleDateString('ar-DZ')}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteConvo(c.id); }}
                                className={`p-2 rounded-xl transition opacity-0 group-hover:opacity-100 ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ MESSAGES ══ */}
            <div className="flex-1 overflow-y-auto cody-scroll relative z-10">
                <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8 pb-48">

                    {/* Welcome screen */}
                    {active && active.messages.length === 0 && !loading && (
                        <div className="flex flex-col items-center pt-6 pb-4 animate-msg-appear">
                            {/* Mascot hero */}
                            <div className="relative mb-8">
                                <div className={`w-32 h-32 rounded-[2rem] border-4 overflow-hidden shadow-2xl hover-lift ${isDark ? 'border-violet-500/50 bg-violet-950/80 shadow-violet-500/30' : 'border-white bg-white shadow-violet-200/60'}`}>
                                    <img src="/moscot.png" alt="Cody" className="w-full h-full object-contain animate-mascot-idle drop-shadow-xl"/>
                                </div>
                                <div className={`absolute -bottom-2 -right-3 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl ${isDark ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/40' : 'bg-gradient-to-br from-amber-300 to-orange-400 shadow-orange-300/50'}`}>
                                    <Sparkles size={18} className="text-white"/>
                                </div>
                                <div className="absolute -top-4 -left-3 text-3xl animate-float" style={{animationDuration: '3s'}}>⭐</div>
                            </div>

                            <h2 className={`text-3xl md:text-4xl font-black mb-3 text-center ${txt}`}>
                                أهلاً {firstName}! <span className="inline-block animate-bounce">👋</span>
                            </h2>
                            <p className={`text-base font-bold mb-2 text-center ${txtS}`}>
                                أنا <span className="text-violet-500 font-black text-lg">كودي</span>، مساعدك الذكي 🚀
                            </p>
                            <p className={`text-sm font-semibold mb-10 text-center max-w-md leading-relaxed ${txtM}`}>
                                اسألني أي سؤال عن Python أو Scratch أو Arduino، وسأبحث في محتوى دروسك الحقيقي!
                            </p>

                            {/* Premium Suggestion cards */}
                            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                {suggestions.map(s => (
                                    <button key={s.text} onClick={() => handleSend(s.text)}
                                        className={`group p-5 rounded-2xl border-2 bg-gradient-to-br text-right hover-lift btn-tactile ${s.cls} ${isDark ? 'bg-opacity-20' : 'bg-white/50 backdrop-blur-sm'}`}>
                                        <span className="text-3xl block mb-3 drop-shadow-sm group-hover:scale-110 transition-transform">{s.icon}</span>
                                        <span className={`text-sm font-black block mb-1 leading-tight`}>{s.text}</span>
                                        <span className={`text-[11px] font-bold opacity-70`}>{s.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Past conversations (Removed from here since we have the sidebar now) */}
                        </div>
                    )}

                    {/* Message list */}
                    {active?.messages.map(msg => (
                        msg.role === 'user' ? (
                            <div key={msg.id} className="flex gap-3 flex-row-reverse animate-msg-appear">
                                <div className="w-10 h-10 rounded-[1rem] bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 mt-1 text-white font-black text-base shadow-lg shadow-teal-500/30">
                                    {firstName.charAt(0)}
                                </div>
                                <div className="max-w-[80%]">
                                    <div className={`flex items-center gap-2 px-1 mb-1.5 flex-row-reverse`}>
                                        <span className={`text-[12px] font-black ${txtS}`}>أنت</span>
                                        <span className={`text-[10px] font-bold ${txtM}`}>{fmt(msg.timestamp)}</span>
                                    </div>
                                    <div className="px-5 py-4 bg-gradient-to-br from-teal-400 to-teal-600 text-white text-[15px] font-bold leading-[1.8] cody-bubble-user">
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <CodyMessage key={msg.id} msg={msg} isDark={isDark}/>
                        )
                    ))}

                    {loading && <TypingIndicator isDark={isDark}/>}
                    <div ref={messagesEndRef}/>
                </div>
            </div>

            {/* ══ FLOATING INPUT BAR ══ */}
            <div className="absolute bottom-6 left-0 right-0 z-30 px-4 md:px-8 pointer-events-none flex justify-center">
                <div className="w-full max-w-3xl pointer-events-auto relative">
                    <div className="cody-glass-input rounded-full p-2.5 flex items-center gap-3 transition-all duration-300 focus-within:shadow-2xl focus-within:shadow-violet-500/20 focus-within:-translate-y-1">
                        
                        {/* Voice button */}
                        <div className="relative z-40">
                            <VoiceInput
                                onInsert={text => { setInput(text); setTimeout(() => inputRef.current?.focus(), 50); }}
                                disabled={loading}
                                isDark={isDark}
                            />
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder={loading ? '⏳ كودي يفكر…' : 'اسأل كودي أي سؤال عن البرمجة…'}
                            disabled={loading}
                            className={`flex-1 bg-transparent px-2 py-2 outline-none text-[15px] font-bold min-w-0 ${txt} placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                        />
                        
                        <button onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg transition-all duration-200 btn-tactile disabled:opacity-40 disabled:grayscale hover:shadow-violet-500/40 shrink-0">
                            <Send size={20} className="rotate-180 -ml-1"/>
                        </button>
                    </div>
                    
                    <p className={`text-center text-[10px] font-black uppercase tracking-[0.2em] mt-4 opacity-60 drop-shadow-sm ${txtM}`}>
                        Powered by Sadeem RAG 
                    </p>
                </div>
            </div>
        </div>
    );
}
