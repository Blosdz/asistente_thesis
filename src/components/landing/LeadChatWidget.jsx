import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CircleQuestionMark,
  Info,
  PauseCircle,
  Send,
  Volume2,
} from 'lucide-react';

const CHAT_START_URL =
  import.meta.env.VITE_CHAT_START_URL?.trim() ||
  'http://34.123.45.67:8001/api/chat/start';
const CHAT_MESSAGE_URL =
  import.meta.env.VITE_CHAT_MESSAGE_URL?.trim() ||
  'http://34.123.45.67:8001/api/chat/message';
const CHAT_END_URL =
  import.meta.env.VITE_CHAT_END_URL?.trim() ||
  'http://34.123.45.67:8001/api/chat/end';
const TTS_API_URL =
  import.meta.env.VITE_TTS_API_URL?.trim() || 'http://34.123.45.67:8000/api/tts';
const CHAT_REQUEST_TIMEOUT_MS = 12000;
const TTS_REQUEST_TIMEOUT_MS = 1800;

const TTS_VOICE = 'coral';
const TTS_INSTRUCTIONS =
  'Habla en español latino, con tono cálido, natural, conversacional y pausas suaves.';

const WELCOME_MESSAGE =
  'Hola. Soy el asistente virtual de AppThesis. Cuéntame qué necesitas y te ayudo.';

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function includesAny(text, terms) {
  const normalized = normalizeText(text);
  return terms.some((term) => normalized.includes(normalizeText(term)));
}

function getFallbackReply(text) {
  if (includesAny(text, ['precio', 'costo', 'cuanto cuesta', 'cotizacion'])) {
    return 'Claro. Puedo ayudarte con una cotización. Primero necesito algunos datos para orientarte mejor.';
  }

  if (includesAny(text, ['asesoria', 'asesoría', 'asesor'])) {
    return 'Perfecto. Te ayudo con la asesoría. Cuéntame brevemente qué necesitas y luego te pediré tus datos.';
  }

  if (includesAny(text, ['planes', 'plan'])) {
    return 'Tenemos distintas opciones de atención. Si deseas, te explico los planes y luego te solicito tus datos.';
  }

  return 'Gracias por escribir. Estoy listo para ayudarte. Cuéntame qué información necesitas.';
}

function getTimestamp() {
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400" />
    </div>
  );
}

function readStringCandidate(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = readStringCandidate(item);
      if (candidate) return candidate;
    }
  }

  if (value && typeof value === 'object') {
    const priorityKeys = [
      'response',
      'reply',
      'message',
      'text',
      'content',
      'assistant_message',
      'assistant_response',
      'output',
      'answer',
    ];

    for (const key of priorityKeys) {
      const candidate = readStringCandidate(value[key]);
      if (candidate) return candidate;
    }

    for (const nestedValue of Object.values(value)) {
      const candidate = readStringCandidate(nestedValue);
      if (candidate) return candidate;
    }
  }

  return null;
}

function looksLikeBundledSource(text) {
  if (!text || typeof text !== 'string') return false;

  const sourceMarkers = [
    'import.meta.hot',
    '__vite__createHotContext',
    '/@vite/client',
    '/@react-refresh',
    'jsxDEV(',
    '$RefreshReg$(',
    'RefreshRuntime',
  ];

  return sourceMarkers.some((marker) => text.includes(marker));
}

function extractReplyText(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const directPaths = [
    payload.reply,
    payload.response,
    payload.message,
    payload.answer,
    payload.output_text,
    payload.assistant_message,
    payload.assistant_response,
    payload.data?.reply,
    payload.data?.response,
    payload.data?.message,
    payload.data?.answer,
    payload.data?.output_text,
    payload.data?.assistant_message,
    payload.data?.assistant_response,
    payload.result?.reply,
    payload.result?.response,
    payload.result?.message,
    payload.result?.answer,
    payload.result?.output_text,
    payload.result?.assistant_message,
    payload.result?.assistant_response,
  ];

  for (const candidateValue of directPaths) {
    const candidate = readStringCandidate(candidateValue);
    if (candidate && !looksLikeBundledSource(candidate)) {
      return candidate;
    }
  }

  const messageCollections = [
    payload.messages,
    payload.data?.messages,
    payload.result?.messages,
    payload.output,
    payload.data?.output,
    payload.result?.output,
  ];

  for (const collection of messageCollections) {
    if (!Array.isArray(collection)) continue;

    for (const item of collection) {
      const candidate =
        readStringCandidate(item?.content?.text) ||
        readStringCandidate(item?.text) ||
        readStringCandidate(item?.message) ||
        readStringCandidate(item?.content?.[0]?.text) ||
        readStringCandidate(item?.content?.[0]?.value);

      if (candidate && !looksLikeBundledSource(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function readSessionId(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const priorityKeys = [
    'session_id',
    'sessionId',
    'chat_id',
    'chatId',
    'conversation_id',
    'conversationId',
    'thread_id',
    'threadId',
    'id',
  ];

  for (const key of priorityKeys) {
    const candidate = readStringCandidate(payload[key]);
    if (candidate) return candidate;
  }

  for (const value of Object.values(payload)) {
    if (value && typeof value === 'object') {
      const nestedCandidate = readSessionId(value);
      if (nestedCandidate) return nestedCandidate;
    }
  }

  return null;
}

async function postJson(url, body, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    let payload = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(
        readStringCandidate(payload?.error) ||
          `La solicitud a ${url} falló con estado ${response.status}.`,
      );
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`La solicitud a ${url} superó ${timeoutMs} ms.`);
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function LeadChatWidget({ initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: WELCOME_MESSAGE,
      time: getTimestamp(),
    },
  ]);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioMode, setAudioMode] = useState('coqui');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastAudioSource, setLastAudioSource] = useState('Coqui');
  const [audioNotice, setAudioNotice] = useState('');
  const [pendingReply, setPendingReply] = useState(null);

  const bodyRef = useRef(null);
  const audioRef = useRef(null);
  const replyTimerRef = useRef(null);
  const chatSessionIdRef = useRef(null);
  const sessionStartPromiseRef = useRef(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = synth.getVoices() || [];
      setVoices(availableVoices);

      const esVoice =
        availableVoices.find((v) => v.lang?.toLowerCase().startsWith('es-pe')) ||
        availableVoices.find((v) => v.lang?.toLowerCase().startsWith('es')) ||
        availableVoices[0];

      if (esVoice && !selectedVoiceName) {
        setSelectedVoiceName(esVoice.name);
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, [selectedVoiceName]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, pendingReply]);

  useEffect(() => {
    return () => {
      clearPendingReplyTimer();
      stopAudio();
      void terminateChatSession();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    void initializeChatSession();
  }, [open]);

  const selectedVoice = useMemo(() => {
    return voices.find((v) => v.name === selectedVoiceName) || null;
  }, [voices, selectedVoiceName]);

  function clearPendingReplyTimer() {
    if (!replyTimerRef.current) return;
    clearTimeout(replyTimerRef.current);
    replyTimerRef.current = null;
  }

  function startPendingReply() {
    clearPendingReplyTimer();
    setPendingReply(true);
  }

  function finishPendingReply() {
    clearPendingReplyTimer();
    setPendingReply(null);
  }

  async function createServerAudio(text) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), TTS_REQUEST_TIMEOUT_MS);
    let response;

    try {
      response = await fetch(TTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          text,
          voice: TTS_VOICE,
          instructions: TTS_INSTRUCTIONS,
        }),
      });
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error(
          `Coqui no respondio en ${TTS_REQUEST_TIMEOUT_MS} ms desde ${TTS_API_URL}.`,
        );
      }

      throw new Error(
        `No se pudo conectar con Coqui en ${TTS_API_URL}. Verifica que FastAPI este corriendo.`,
      );
    } finally {
      window.clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorMessage = 'No se pudo obtener el audio del servidor TTS';

      try {
        const payload = await response.json();
        if (payload?.error) {
          errorMessage = payload.error;
        }
      } catch {
        // ignore JSON parsing issues and keep generic message
      }

      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    return { audio, audioUrl };
  }

  async function playPreparedAudio(audio, audioUrl, sourceLabel) {
    audioRef.current = audio;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
      setIsSpeaking(false);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    setLastAudioSource(sourceLabel);
    await audio.play();
  }

  function speakWithBrowser(text) {
    if (!('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoice?.lang || 'es-PE';
    utterance.voice = selectedVoice || null;
    utterance.rate = 1.08;
    utterance.pitch = 0.95;
    utterance.volume = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setLastAudioSource('Navegador');
    synth.speak(utterance);
  }

  async function speak(text) {
    if (!audioEnabled) return;

    stopAudio();
    setAudioNotice('');

    if (audioMode === 'coqui') {
      try {
        const preparedAudio = await createServerAudio(text);
        await playPreparedAudio(preparedAudio.audio, preparedAudio.audioUrl, 'Coqui');
        return;
      } catch (error) {
        console.error('Fallo TTS de Coqui, usando voz del navegador:', error);
        setAudioNotice(
          'Coqui no pudo generar audio ahora. Se usó la voz del navegador como respaldo.',
        );
      }
    }

    speakWithBrowser(text);
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  }

  function addMessage(role, text) {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        text,
        time: getTimestamp(),
      },
    ]);
  }

  async function initializeChatSession() {
    if (chatSessionIdRef.current) {
      return chatSessionIdRef.current;
    }

    if (sessionStartPromiseRef.current) {
      return sessionStartPromiseRef.current;
    }

    const startPromise = postJson(
      CHAT_START_URL,
      {
        source: 'landing',
        channel: 'web',
      },
      CHAT_REQUEST_TIMEOUT_MS,
    )
      .then((payload) => {
        const sessionId = readSessionId(payload);

        if (!sessionId) {
          throw new Error('El endpoint de inicio no devolvió un identificador de sesión.');
        }

        chatSessionIdRef.current = sessionId;
        return sessionId;
      })
      .finally(() => {
        sessionStartPromiseRef.current = null;
      });

    sessionStartPromiseRef.current = startPromise;
    return startPromise;
  }

  async function terminateChatSession() {
    const sessionId = chatSessionIdRef.current;
    if (!sessionId) return;

    chatSessionIdRef.current = null;
    sessionStartPromiseRef.current = null;

    try {
      await postJson(
        CHAT_END_URL,
        {
          session_id: sessionId,
          sessionId: sessionId,
          chat_id: sessionId,
          source: 'landing',
        },
        CHAT_REQUEST_TIMEOUT_MS,
      );
    } catch (error) {
      console.warn('No se pudo cerrar la sesión del chat remoto:', error);
    }
  }

  async function requestBotReply(text) {
    const sessionId = await initializeChatSession();
    const payload = await postJson(
      CHAT_MESSAGE_URL,
      {
        session_id: sessionId,
        sessionId: sessionId,
        chat_id: sessionId,
        message: text,
        text,
        user_message: text,
        source: 'landing',
        channel: 'web',
      },
      CHAT_REQUEST_TIMEOUT_MS,
    );

    const reply = extractReplyText(payload);

    if (!reply) {
      throw new Error('El endpoint de mensaje no devolvió una respuesta de texto.');
    }

    return reply;
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    addMessage('user', text);
    setInput('');

    startPendingReply();

    try {
      const reply = await requestBotReply(text);
      await deliverBotReply(reply);
    } catch (error) {
      console.error('Fallo el chat remoto de la landing:', error);
      setAudioNotice(
        'No se pudo conectar con el chat remoto. Se usó la respuesta local de respaldo.',
      );
      await deliverBotReply(getFallbackReply(text));
    }
  }

  async function deliverBotReply(reply) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 300);
    });

    addMessage('bot', reply);
    finishPendingReply();

    if (audioEnabled) {
      void speak(reply);
    }
  }

  function handleReplayLastBotMessage() {
    const lastBot = [...messages].reverse().find((message) => message.role === 'bot');
    if (lastBot) {
      void speak(lastBot.text);
    }
  }

  const statusLabel = audioEnabled
    ? isSpeaking
      ? `${lastAudioSource} reproduciendo`
      : `${lastAudioSource} listo`
    : 'Audio apagado';

  function handleClose() {
    setOpen(false);
    void terminateChatSession();
  }

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(239,246,255,0.78)_100%)] text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_42px_rgba(148,163,184,0.28)] backdrop-blur-2xl transition duration-300 hover:scale-105 hover:border-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_22px_48px_rgba(148,163,184,0.34)]"
        aria-label="Abrir asistente"
      >
        <CircleQuestionMark className="h-6 w-6" />
      </button>

      {open && (
        <div
          className={`fixed right-5 z-[9999] overflow-hidden rounded-[30px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(243,247,251,0.58)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_30px_90px_rgba(148,163,184,0.28)] backdrop-blur-2xl transition-all duration-300 ${
            expanded
              ? 'bottom-5 top-5 w-[min(520px,calc(100vw-24px))] max-w-[calc(100vw-24px)]'
              : 'bottom-24 w-[390px] max-w-[calc(100vw-24px)]'
          }`}
        >
          <div className="flex items-center gap-3 border-b border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.66)_0%,rgba(244,248,252,0.48)_100%)] px-4 py-3 text-slate-700 backdrop-blur-2xl">
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="h-3 w-3 rounded-full bg-rose-400 transition hover:scale-110"
                aria-label="Cerrar asistente"
                title="Cerrar"
              />
              <button
                onClick={() => setMinimized((value) => !value)}
                className="h-3 w-3 rounded-full bg-amber-300 transition hover:scale-110"
                aria-label={minimized ? 'Restaurar asistente' : 'Minimizar asistente'}
                title={minimized ? 'Restaurar' : 'Minimizar'}
              />
              <button
                onClick={() => setExpanded((value) => !value)}
                className="h-3 w-3 rounded-full bg-emerald-400 transition hover:scale-110"
                aria-label={expanded ? 'Reducir asistente' : 'Expandir asistente'}
                title={expanded ? 'Reducir' : 'Expandir'}
              />
            </div>
            <div className="flex-1 text-center text-sm font-medium text-slate-500">
              Asistente AppThesis
            </div>
            <div className="w-4" />
          </div>

          {!minimized && (
            <div className="bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.34),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(251,207,232,0.18),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.66)_0%,rgba(246,249,252,0.5)_100%)] p-4">
            <div className="rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(248,250,252,0.62)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_18px_50px_rgba(148,163,184,0.14)] backdrop-blur-2xl">
              <div className="border-b border-slate-200/55 px-4 pb-4 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(219,234,254,0.72)_100%)] text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_30px_rgba(125,168,214,0.22)]">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      Asistente inteligente
                    </h3>
                    <p className="text-sm text-slate-500/90">
                      Online · Listo para cotizar y orientar
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-[0_8px_20px_rgba(148,163,184,0.1)]">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(34,197,94,0.85)]" />
                    Activo
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/65 bg-white/62 px-3 py-2 text-xs text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <Volume2 className="h-4 w-4 text-sky-600" />
                  <span>Voz: {statusLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-slate-200/45 px-4 py-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={audioEnabled}
                    onChange={(event) => setAudioEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  Audio activado
                </label>

                <select
                  value={audioMode}
                  onChange={(event) => setAudioMode(event.target.value)}
                  className="ml-auto rounded-xl border border-white/70 bg-white/78 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-sky-400"
                >
                  <option value="coqui">Coqui local</option>
                  <option value="browser">Voz del navegador</option>
                </select>
              </div>

              {audioNotice ? (
                <div className="mx-4 mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{audioNotice}</span>
                </div>
              ) : null}

              <div
                ref={bodyRef}
                className={`flex flex-col gap-4 overflow-y-auto px-4 py-4 ${
                  expanded ? 'h-[calc(100vh-23rem)] min-h-[320px]' : 'h-[320px]'
                }`}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[85%] animate-[fadeIn_.25s_ease-out] ${
                      msg.role === 'bot' ? 'mr-auto' : 'ml-auto'
                    }`}
                  >
                    <div
                      className={`rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                        msg.role === 'bot'
                          ? 'rounded-tl-md border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,250,252,0.74)_100%)] text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_26px_rgba(148,163,184,0.12)]'
                          : 'rounded-br-md border border-white/70 bg-[linear-gradient(180deg,rgba(226,240,255,0.88)_0%,rgba(208,232,255,0.76)_100%)] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_12px_26px_rgba(125,168,214,0.18)]'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div
                      className={`mt-1 text-[11px] text-slate-400 ${
                        msg.role === 'bot' ? 'text-left' : 'text-right'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                ))}

                {pendingReply ? (
                  <div className="mr-auto max-w-[85%] animate-[fadeIn_.25s_ease-out]">
                    <div className="rounded-[22px] rounded-tl-md border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(248,250,252,0.72)_100%)] px-4 py-3 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_26px_rgba(148,163,184,0.12)]">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <TypingDots />
                        Escribiendo...
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-slate-200/45 px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={handleReplayLastBotMessage}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/72 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition hover:border-sky-300 hover:text-sky-700"
                  >
                    <Volume2 className="h-4 w-4" />
                    Repetir
                  </button>
                  <button
                    onClick={stopAudio}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/72 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition hover:border-rose-300 hover:text-rose-700"
                  >
                    <PauseCircle className="h-4 w-4" />
                    Detener
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-200/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(243,247,251,0.72)_100%)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSend();
                    }}
                    placeholder="Escribe tu consulta..."
                    className="flex-1 rounded-full border border-white/80 bg-white/84 px-4 py-3 text-sm text-slate-800 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition placeholder:text-slate-400 focus:border-sky-400"
                  />
                  <button
                    onClick={handleSend}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(180deg,rgba(225,239,255,0.92)_0%,rgba(204,232,255,0.78)_100%)] text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_30px_rgba(125,168,214,0.26)] transition hover:scale-105"
                    aria-label="Enviar"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                  <Info className="h-3.5 w-3.5 text-sky-600" />
                  El texto aparece primero y el audio se genera solo cuando hace falta.
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
