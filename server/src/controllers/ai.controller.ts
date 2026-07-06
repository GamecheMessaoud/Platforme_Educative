import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// ── Config ────────────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// RAG service base URL — uses env var so it works in Docker (http://rag:8000) and locally (http://localhost:8000)
const RAG_BASE = process.env.RAG_SERVICE_URL || 'https://rebound-lying-unshaken.ngrok-free.dev';
const RAG_TIMEOUT_MS = 90_000; // 90 s — NVIDIA LLM inference can take 30-40 s

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Attempt to call the RAG /chat endpoint (with session memory).
 * Returns null on any network / HTTP error so the caller can fall back.
 */
async function callRagChat(message: string, sessionId?: string): Promise<{
  answer: string;
  sources: any[];
  session_id: string;
  diagram_mermaid?: string;
} | null> {
  try {
    const payload: any = { message };
    if (sessionId) payload.session_id = sessionId;

    const response = await axios.post(`${RAG_BASE}/chat`, payload, {
      timeout: RAG_TIMEOUT_MS,
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });
    return response.data;
  } catch (err: any) {
    console.warn('[RAG] /chat unavailable:', err.message);
    return null;
  }
}

/**
 * Gemini fallback — simple stateless answer when RAG is down.
 */
async function callGeminiFallback(message: string, history: any[]): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return 'أنا كودي! 🤖 عذراً، خادم الذكاء الاصطناعي غير متاح حالياً. حاول مرة أخرى لاحقاً.';
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const chat = model.startChat({
    history: history || [],
    generationConfig: { maxOutputTokens: 600 },
    systemInstruction:
      'أنت كودي — مساعد تعليمي ذكي للأطفال (8-16 سنة) على منصة سديم. أجب باللغة العربية بأسلوب بسيط وممتع.',
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

/** GET /api/ai/health — quick RAG service health probe */
export const getRagHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      const response = await axios.get(`${RAG_BASE}/health`, { timeout: 15000, headers: { 'ngrok-skip-browser-warning': 'true' } });
      res.json({
        online: true,
        ...response.data,
      });
    } catch (err: any) {
      // Fallback to testing the root URL (/) on 404/405 or timeouts
      const isTimeout = err.code === 'ECONNABORTED' || !err.response;
      const isNotFound = err.response && (err.response.status === 404 || err.response.status === 405);
      
      if (isTimeout || isNotFound) {
        const rootResponse = await axios.get(`${RAG_BASE}/`, { timeout: 15000, headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (rootResponse.data && (rootResponse.data.status === 'ok' || rootResponse.data.service)) {
          res.json({
            online: true,
            status: 'ok',
            documents_indexed: rootResponse.data.documents_count || 0,
          });
          return;
        }
      }
      throw err;
    }
  } catch {
    res.json({ online: false, status: 'unavailable' });
  }
};

/**
 * POST /api/ai/chat/expert  
 * Main chatbot endpoint — uses RAG /chat with session memory, falls back to Gemini.
 */
export const chatWithExpert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, session_id, history } = req.body;

    if (!message?.trim()) {
      res.status(400).json({ message: 'الرسالة مطلوبة' });
      return;
    }

    // ── Try RAG first ─────────────────────────────────────────────────────────
    const ragResult = await callRagChat(message.trim(), session_id);

    if (ragResult) {
      res.json({
        text: ragResult.answer,
        sources: ragResult.sources || [],
        session_id: ragResult.session_id,
        diagram_mermaid: ragResult.diagram_mermaid || null,
        via: 'rag',
      });
      return;
    }

    // ── Gemini fallback ───────────────────────────────────────────────────────
    console.log('[AI] Falling back to Gemini...');
    const geminiHistory = (history || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const text = await callGeminiFallback(message.trim(), geminiHistory);
    res.json({
      text,
      sources: [],
      session_id: null,
      diagram_mermaid: null,
      via: 'gemini_fallback',
    });
  } catch (error: any) {
    console.error('[AI] chatWithExpert error:', error.message);
    res.status(500).json({
      message: 'حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى!',
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/chat  
 * Legacy Gemini-only chat (used by the floating chatbot widget).
 */
export const chatWithCoddy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        text: 'أنا كودي! يبدو أن مفتاح API الخاص بي غير مفعل حالياً، ولكن يمكنني إخبارك أن البرمجة ممتعة جداً! 🚀',
      });
      return;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const geminiHistory = (history || []).map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: m.parts || [{ text: m.text || '' }],
    }));

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: { maxOutputTokens: 500 },
      systemInstruction:
        'أنت كودي — مساعد تعليمي ذكي للأطفال على منصة سديم. أجب باللغة العربية بأسلوب مرح وبسيط.',
    });

    const result = await chat.sendMessage(message);
    res.json({ text: result.response.text() });
  } catch (error: any) {
    console.error('[AI] chatWithCoddy error:', error);
    res.status(500).json({ message: 'خطأ في معالجة طلب الذكاء الاصطناعي', error: error.message });
  }
};

/**
 * POST /api/ai/rag/upload  
 * Admin-only: streams an uploaded file to the RAG /ingest/file endpoint.
 */
export const uploadRagDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'لم يتم تحديد ملف للرفع' });
      return;
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(file.path), file.originalname);

    const response = await axios.post(`${RAG_BASE}/ingest/file`, form, {
      headers: { ...form.getHeaders(), 'ngrok-skip-browser-warning': 'true' },
      timeout: 120_000, // 2 min — big PDFs can be slow
    });

    // Clean up local temp file
    fs.unlink(file.path, () => {});

    res.json({
      message: `✅ تم رفع وفهرسة الملف "${file.originalname}" بنجاح`,
      chunks_stored: response.data.chunks_stored,
      total_documents: response.data.total_documents,
    });
  } catch (error: any) {
    console.error('[AI] uploadRagDocument error:', error.message);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({
      message: 'حدث خطأ أثناء رفع الملف إلى قاعدة المعرفة',
      error: error.message,
    });
  }
};
