import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CircleQuestionMark,
  Info,
  PauseCircle,
  Send,
  Volume2,
} from 'lucide-react';

const TTS_API_URL =
  import.meta.env.VITE_TTS_API_URL?.trim() || 'http://127.0.0.1:8000/api/tts';
const TTS_REQUEST_TIMEOUT_MS = 1800;

const TTS_VOICE = 'coral';
const TTS_INSTRUCTIONS =
  'Habla en español latino, con tono cálido, natural, conversacional y pausas suaves.';

const BOT_RULES = [
  {
    test: (text) =>
      includesAny(text, ['precio', 'costo', 'cuanto cuesta', 'cotizacion']),
    reply:
      'Claro. Puedo ayudarte con una cotización. Primero necesito algunos datos para orientarte mejor.',
  },
  {
    test: (text) => includesAny(text, ['asesoria', 'asesoría', 'asesor']),
    reply:
      'Perfecto. Te ayudo con la asesoría. Cuéntame brevemente qué necesitas y luego te pediré tus datos.',
  },
  {
    test: (text) => includesAny(text, ['planes', 'plan']),
    reply:
      'Tenemos distintas opciones de atención. Si deseas, te explico los planes y luego te solicito tus datos.',
  },
];

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

function getBotReply(text) {
  const matched = BOT_RULES.find((rule) => rule.test(text));
  if (matched) return matched.reply;
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
    };
  }, []);

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

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    addMessage('user', text);
    setInput('');

    const reply = getBotReply(text);

    if (!audioEnabled) {
      setTimeout(() => {
        addMessage('bot', reply);
      }, 300);
      return;
    }

    startPendingReply();
    void deliverBotReply(reply);
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

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#334155_55%,#0ea5e9_100%)] text-white shadow-[0_18px_50px_rgba(15,23,42,0.35)] transition duration-300 hover:scale-105"
        aria-label="Abrir asistente"
      >
        <CircleQuestionMark className="h-6 w-6" />
      </button>

      {open && (
        <div
          className={`fixed right-5 z-[9999] overflow-hidden rounded-[28px] border border-slate-200/70 bg-slate-100 shadow-[0_28px_90px_rgba(15,23,42,0.28)] backdrop-blur transition-all duration-300 ${
            expanded
              ? 'bottom-5 top-5 w-[min(520px,calc(100vw-24px))] max-w-[calc(100vw-24px)]'
              : 'bottom-24 w-[390px] max-w-[calc(100vw-24px)]'
          }`}
        >
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 text-white">
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
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
            <div className="flex-1 text-center text-sm font-medium text-white/75">
              Asistente AppThesis
            </div>
            <div className="w-4" />
          </div>

          {!minimized && (
            <div className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_36%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
            <div className="rounded-[24px] border border-slate-200 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 px-4 pb-4 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#0ea5e9_100%)] text-white shadow-[0_12px_30px_rgba(37,99,235,0.3)]">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      Asistente inteligente
                    </h3>
                    <p className="text-sm text-slate-500">
                      Online · Listo para cotizar y orientar
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(34,197,94,0.85)]" />
                    Activo
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <Volume2 className="h-4 w-4 text-sky-600" />
                  <span>Voz: {statusLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
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
                  className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-sky-400"
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
                          ? 'rounded-tl-md bg-slate-100 text-slate-800'
                          : 'rounded-br-md bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#0ea5e9_100%)] text-white'
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
                    <div className="rounded-[22px] rounded-tl-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <TypingDots />
                        Escribiendo...
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-slate-100 px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={handleReplayLastBotMessage}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                  >
                    <Volume2 className="h-4 w-4" />
                    Repetir
                  </button>
                  <button
                    onClick={stopAudio}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
                  >
                    <PauseCircle className="h-4 w-4" />
                    Detener
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSend();
                    }}
                    placeholder="Escribe tu consulta..."
                    className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                  />
                  <button
                    onClick={handleSend}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#0ea5e9_100%)] text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:scale-105"
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
