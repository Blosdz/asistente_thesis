import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../../ui/card';
import { deepseekApi } from '../../../api/deepseek.api';

export default function AcademicAIChatPanel({
  tesisId,
  documentId,
  className = '',
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize: check if Deepseek is configured and load history
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check Deepseek status
        const statusData = tesisId
          ? await deepseekApi.getStatus(tesisId)
          : { configured: false };
        setIsConfigured(statusData?.configured || false);

        // Load conversation history
        if (tesisId) {
          const historyData = await deepseekApi.getHistory(tesisId);
          if (historyData?.data) {
            setMessages(historyData.data);
          }
        }
      } catch (error) {
        console.error('Error initializing Deepseek:', error);
        setIsConfigured(false);
      } finally {
        setInitialized(true);
      }
    };

    initialize();
  }, [tesisId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();

      if (!inputValue.trim() || loading || !isConfigured) return;

      const userMessage = inputValue.trim();
      setInputValue('');
      setLoading(true);

      try {
        // Add user message to UI immediately
        const userMsg = {
          role: 'user',
          content: userMessage,
        };
        setMessages((prev) => [...prev, userMsg]);

        // Send to API
        const response = await deepseekApi.sendMessage(tesisId, {
          message: userMessage,
          documentId: documentId || undefined,
          conversationHistory: messages,
        });

        if (response?.data) {
          // Add AI response to UI
          const aiMsg = {
            role: 'assistant',
            content: response.data.message,
          };
          setMessages((prev) => [...prev, aiMsg]);

          // Show suggestions if available
          if (response.data.suggestions?.length > 0) {
            toast.success(
              `${response.data.suggestions.length} suggestion(s) generated`,
            );
          }
        }
      } catch (error) {
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1));
        console.error('Error sending message:', error);
        toast.error(
          error?.message || 'Error talking to AI assistant',
        );
      } finally {
        setLoading(false);
      }
    },
    [inputValue, loading, isConfigured, tesisId, documentId, messages],
  );

  if (!initialized) {
    return (
      <Card
        className={`flex min-h-0 flex-col rounded-2xl border-none p-4 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.35)] ${className}`}
      >
        <div className="flex items-center gap-3 animate-pulse">
          <div className="ios-avatar-glass flex h-10 w-10 items-center justify-center rounded-full ">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Academic AI
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">
              Iniciando asistente...
            </h3>
          </div>
        </div>
      </Card>
    );
  }

  if (!isConfigured) {
    return (
      <Card
        className={`flex min-h-0 flex-col rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.35)] ${className}`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Asistente No Disponible
            </p>
            <p className="mt-1 text-sm text-amber-700">
              El asistente académico está siendo configurado. Por favor, intenta más tarde.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`flex min-h-0 flex-col rounded-2xl border-none p-4 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.35)] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <div className="ios-avatar-glass flex h-8 w-8 items-center justify-center rounded-full">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Academic AI
          </p>
          <h3 className="text-sm font-semibold text-slate-950">
            Asistente académico
          </h3>
        </div>
      </div>

      {/* Messages Container */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="space-y-2 text-slate-400">
              <MessageSquare className="mx-auto h-12 w-12 opacity-50" />
              <p className="text-sm">
                Inicia una conversación para obtener ayuda en tu tesis
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-blue-500 text-white'
                    : 'rounded-bl-sm bg-slate-100 text-slate-700'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start gap-2">
            <div className="rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2 text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="flex gap-2 border-t border-slate-200 pt-3"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pregunta al asistente..."
          disabled={loading}
          className="h-9 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="ios-accent-button flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </Card>
  );
}
