import { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  MessagesSquare,
  RotateCcw,
  Sparkles,
  Search,
  X,
} from 'lucide-react';

import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';
import { planCatalog } from './Plans';

type AnswerKey =
  | 'level'
  | 'stage'
  | 'complexity'
  | 'support'
  | 'career'
  | 'university';

type PlanName = 'Esencial' | 'Guiado' | 'Integral';

type QuestionOption = {
  value: string;
  label: string;
  description: string;
};

type Question = {
  key: AnswerKey;
  shortLabel: string;
  title: string;
  helper: string;
  options?: QuestionOption[];
  isSearchable?: boolean;
};

type Answers = Partial<Record<AnswerKey, string>>;

type University = {
  id: string;
  nombre: string;
  ubicacion: string;
  pais: string;
};

type AssessmentFunnelProps = {
  onNavigate?: (section: string) => void;
};

const questions: Question[] = [
  {
    key: 'level',
    shortLabel: 'Nivel',
    title: '¿Cuál es tu nivel académico?',
    helper: 'Estimamos la exigencia general de tu tesis.',
    options: [
      {
        value: 'pregrado',
        label: 'Pregrado',
        description: 'Ruta base para tesis universitaria.',
      },
      {
        value: 'maestria',
        label: 'Maestría',
        description: 'Mayor exigencia metodológica y argumentativa.',
      },
      {
        value: 'doctorado',
        label: 'Doctorado',
        description: 'Alta profundidad investigativa.',
      },
    ],
  },
  {
    key: 'career',
    shortLabel: 'Carrera',
    title: '¿Qué carrera estudias?',
    helper: 'Adaptamos el enfoque según tu área académica.',
    options: [
      {
        value: 'ingenieria',
        label: 'Ingeniería',
        description: 'Enfoque técnico, datos y aplicación.',
      },
      {
        value: 'sociales',
        label: 'Ciencias Sociales',
        description: 'Enfoque aplicado, social o educativo.',
      },
      {
        value: 'biomedicas',
        label: 'Ciencias Biomédicas',
        description: 'Salud, clínica, enfermería o afines.',
      },
      {
        value: 'arquitectura',
        label: 'Arquitectura',
        description: 'Atención directa por WhatsApp.',
      },
      {
        value: 'otros',
        label: 'Otra carrera',
        description: 'Asesoría adaptable a tu caso.',
      },
    ],
  },
  {
    key: 'stage',
    shortLabel: 'Etapa',
    title: '¿En qué punto está tu tesis?',
    helper: 'La etapa define el tipo de apoyo que necesitas.',
    options: [
      {
        value: 'starting',
        label: 'Recién empiezo',
        description: 'Necesito ordenar mi idea inicial.',
      },
      {
        value: 'topic',
        label: 'Ya tengo tema',
        description: 'Quiero validar y estructurar mejor.',
      },
      {
        value: 'developing',
        label: 'Tengo observaciones',
        description: 'Necesito corregir y priorizar cambios.',
      },
      {
        value: 'closing',
        label: 'Estoy cerrando',
        description: 'Quiero prepararme para sustentar.',
      },
    ],
  },
  {
    key: 'support',
    shortLabel: 'Acompañamiento',
    title: '¿Qué nivel de acompañamiento necesitas?',
    helper: 'Define cuánta guía esperas recibir durante el proceso.',
    options: [
      {
        value: 'basica',
        label: 'Guía básica',
        description: 'Estructura, orden y ruta clara.',
      },
      {
        value: 'acompañamiento',
        label: 'Acompañamiento',
        description: 'Orientación cercana y revisiones.',
      },
      {
        value: 'integral',
        label: 'Integral',
        description: 'Soporte profundo hasta el cierre.',
      },
    ],
  },
  {
    key: 'university',
    shortLabel: 'Universidad',
    title: '¿En cuál universidad estudias?',
    helper: 'Busca tu universidad en el listado.',
    isSearchable: true,
    options: [],
  },
];

const labelsByKey: Record<AnswerKey, Record<string, string>> = {
  level: {
    pregrado: 'Pregrado',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
  },
  career: {
    ingenieria: 'Ingeniería',
    sociales: 'Ciencias Sociales',
    biomedicas: 'Ciencias Biomédicas',
    arquitectura: 'Arquitectura',
    otros: 'Otra carrera',
  },
  stage: {
    starting: 'Recién empiezo',
    topic: 'Ya tengo tema',
    developing: 'Tengo observaciones',
    closing: 'Estoy cerrando',
  },
  complexity: {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  },
  support: {
    basica: 'Guía básica',
    acompañamiento: 'Acompañamiento',
    integral: 'Integral',
  },
  university: {},
};

function getPlanRecommendation(answers: Answers) {
  const levelRank =
    {
      pregrado: 0,
      maestria: 1,
      doctorado: 2,
    }[answers.level ?? 'pregrado'] ?? 0;

  const stageRank =
    {
      starting: 0,
      topic: 0,
      developing: 1,
      closing: 2,
    }[answers.stage ?? 'starting'] ?? 0;

  const complexityRank =
    {
      low: 0,
      medium: 1,
      high: 2,
    }[answers.complexity ?? 'low'] ?? 0;

  const supportRank =
    {
      basica: 0,
      acompañamiento: 1,
      integral: 2,
    }[answers.support ?? 'basica'] ?? 0;

  let plan: PlanName = 'Esencial';

  if (
    supportRank === 2 ||
    complexityRank === 2 ||
    stageRank === 2 ||
    levelRank === 2
  ) {
    plan = 'Integral';
  } else if (
    supportRank === 1 ||
    complexityRank === 1 ||
    stageRank === 1 ||
    levelRank === 1
  ) {
    plan = 'Guiado';
  }

  const reasons: Record<PlanName, string> = {
    Esencial: 'Estructura y orden para avanzar con autonomía.',
    Guiado: 'Orientación cercana para mantener buen ritmo.',
    Integral: 'Soporte profundo para una tesis exigente o en etapa crítica.',
  };

  const signals = [
    answers.stage === 'closing' ? 'estás en etapa de cierre' : null,
    answers.stage === 'developing'
      ? 'tienes observaciones que resolver'
      : null,
    answers.support === 'integral'
      ? 'necesitas soporte intensivo'
      : null,
    answers.support === 'acompañamiento'
      ? 'necesitas guía frecuente'
      : null,
    answers.level === 'doctorado'
      ? 'el nivel doctoral requiere mayor profundidad'
      : null,
    answers.level === 'maestria'
      ? 'la maestría exige mayor criterio metodológico'
      : null,
  ].filter(Boolean);

  const reasonDetail =
    signals.length > 0
      ? `Lo recomendamos porque ${signals.slice(0, 2).join(' y ')}.`
      : 'Lo recomendamos por el tipo de avance y acompañamiento que marcaste.';

  const recommendedPlan = planCatalog.find((item) => item.title === plan);

  return {
    plan,
    reason: reasons[plan],
    detail: reasonDetail,
    bullets: recommendedPlan?.bullets ?? [],
    idealFor: recommendedPlan?.idealFor ?? '',
  };
}

export default function AssessmentFunnel({ onNavigate }: AssessmentFunnelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);

  const totalSteps = questions.length;
  const currentQuestion = questions[stepIndex];

  const isComplete =
    totalSteps > 0 && questions.every((question) => answers[question.key]);

  const progressStep = isComplete ? totalSteps : stepIndex + 1;
  const completionPercent = Math.round((progressStep / totalSteps) * 100);

  const answeredCount = questions.filter((question) => answers[question.key]).length;

  const recommendation = useMemo(
    () => (isComplete ? getPlanRecommendation(answers) : null),
    [answers, isComplete],
  );

  const navigateToSection = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
      return;
    }

    document.getElementById(section)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const getAnswerLabel = (question: Question) => {
    const value = answers[question.key];

    if (!value) return null;

    if (question.key === 'university') {
      return (
        universities.find((university) => university.id === value)?.nombre ??
        'Universidad seleccionada'
      );
    }

    return labelsByKey[question.key][value] ?? value;
  };

  const handleAnswer = (value: string) => {
    if (currentQuestion.key === 'career' && value === 'arquitectura') {
      const phoneNumber = '51944877217';
      const message = encodeURIComponent(
        'Hola, estoy interesado en asesoría para mi tesis en Arquitectura.',
      );

      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestion.key]: value,
    };

    setAnswers(nextAnswers);

    if (stepIndex < totalSteps - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const handleBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleReset = () => {
    setAnswers({});
    setStepIndex(0);
    setSearchTerm('');
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/universidades?select=id%2Cnombre%2Cubicacion%2Cpais&order=nombre.asc`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Accept-Profile': 'AT',
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Error loading universities: ${response.status}`);
        }

        const data = await response.json();

        setUniversities(data);
        setFilteredUniversities(data);
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      setFilteredUniversities(universities);
      return;
    }

    const filtered = universities.filter((university) => {
      const nombre = university.nombre?.toLowerCase() ?? '';
      const ubicacion = university.ubicacion?.toLowerCase() ?? '';
      const pais = university.pais?.toLowerCase() ?? '';

      return (
        nombre.includes(term) ||
        ubicacion.includes(term) ||
        pais.includes(term)
      );
    });

    setFilteredUniversities(filtered);
  }, [searchTerm, universities]);

  return (
    <section
      id="assessment-funnel"
      className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_50%,#ffffff_100%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Diagnóstico académico"
          title="Encuentra el plan ideal para avanzar tu tesis"
          description={`${totalSteps} preguntas rápidas. Una recomendación clara según tu etapa, carrera y nivel de acompañamiento.`}
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-14"
        >
          <div className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* Left summary panel */}
              <aside className="relative overflow-hidden bg-slate-950 p-6 text-white sm:p-8 lg:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.32),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(14,165,233,0.22),transparent_30%),linear-gradient(145deg,rgba(15,23,42,1),rgba(30,41,59,0.98),rgba(8,47,73,0.9))]" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/20 text-cyan-200">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      Diagnóstico
                    </div>

                    <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                      {isComplete ? 'Listo' : '3 min'}
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-3xl font-semibold leading-tight text-white sm:text-[2.2rem]">
                      Tu ruta ideal, en {totalSteps} respuestas.
                    </p>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                      Rápido, claro y enfocado en tu etapa real. Al final te
                      recomendamos un plan según tus respuestas.
                    </p>
                  </div>

                  <div className="mt-8 rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>
                        {isComplete
                          ? 'Evaluación terminada'
                          : `Paso ${stepIndex + 1} de ${totalSteps}`}
                      </span>

                      <span>{completionPercent}%</span>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 transition-all duration-300"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                      <span>{answeredCount} respuestas registradas</span>
                      <span>
                        {isComplete
                          ? 'Recomendación desbloqueada'
                          : 'Se calcula al final'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {questions.map((question, index) => {
                      const answerLabel = getAnswerLabel(question);
                      const isAnswered = Boolean(answerLabel);
                      const isCurrent = index === stepIndex && !isComplete;

                      return (
                        <button
                          key={question.key}
                          type="button"
                          onClick={() => setStepIndex(index)}
                          className={cn(
                            'rounded-[20px] border px-4 py-3 text-left text-sm transition-all duration-300',
                            isAnswered
                              ? 'border-cyan-300/30 bg-white/14 text-white'
                              : isCurrent
                                ? 'border-white/25 bg-white/18 text-white'
                                : 'border-white/10 bg-white/[0.06] text-white/55 hover:border-white/20 hover:text-white/80',
                          )}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                            Paso {index + 1}
                          </p>

                          <p className="mt-2 font-semibold leading-6">
                            {question.shortLabel}
                          </p>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/72">
                            {answerLabel ?? (isCurrent ? 'En curso' : 'Pendiente')}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-medium text-white/75">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/20 text-cyan-200">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    Menos ruido, mejor decisión.
                  </div>
                </div>
              </aside>

              {/* Right question/result panel */}
              <div className="min-h-[38rem] bg-white p-6 sm:p-8 lg:p-10">
                {!isComplete ? (
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                          <BookOpenCheck className="h-4 w-4" />
                          Pregunta activa
                        </p>

                        <h3 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-4xl">
                          {currentQuestion.title}
                        </h3>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                          {currentQuestion.helper}
                        </p>
                      </div>

                      <div className="hidden h-16 w-16 items-center justify-center rounded-[22px] border border-blue-100 bg-blue-50 text-blue-600 sm:flex">
                        <Sparkles className="h-7 w-7" />
                      </div>
                    </div>

                    {currentQuestion.key === 'career' ? (
                      <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-800">
                        Si eliges Arquitectura, te derivaremos directamente por
                        WhatsApp para una evaluación personalizada.
                      </div>
                    ) : null}

                    {currentQuestion.isSearchable ? (
                      <div className="mt-8 space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

                          <input
                            type="text"
                            placeholder="Busca tu universidad..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full rounded-[24px] border border-slate-200 bg-white py-3 pl-12 pr-12 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                          />

                          {searchTerm ? (
                            <button
                              type="button"
                              onClick={() => setSearchTerm('')}
                              className="absolute right-4 top-3.5 text-slate-400 transition hover:text-slate-700"
                              aria-label="Limpiar búsqueda"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          ) : null}
                        </div>

                        {loading ? (
                          <div className="flex items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 py-10">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                          </div>
                        ) : (
                          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
                            {filteredUniversities.length > 0 ? (
                              filteredUniversities.map((university) => {
                                const isSelected =
                                  answers[currentQuestion.key] === university.id;

                                return (
                                  <button
                                    key={university.id}
                                    type="button"
                                    onClick={() => handleAnswer(university.id)}
                                    className={cn(
                                      'flex w-full items-center justify-between rounded-[20px] border px-4 py-3 text-left transition-all duration-300',
                                      isSelected
                                        ? 'border-blue-300 bg-blue-50 shadow-[0_12px_32px_rgba(37,99,235,0.10)]'
                                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50',
                                    )}
                                  >
                                    <div className="flex flex-col gap-1">
                                      <p className="font-semibold text-slate-950">
                                        {university.nombre}
                                      </p>

                                      <p className="text-xs text-slate-500">
                                        {university.ubicacion}, {university.pais}
                                      </p>
                                    </div>

                                    <ArrowRight
                                      className={cn(
                                        'h-4 w-4 shrink-0 transition-all duration-300',
                                        isSelected
                                          ? 'text-blue-600'
                                          : 'text-slate-400',
                                      )}
                                    />
                                  </button>
                                );
                              })
                            ) : (
                              <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                <p className="text-sm text-slate-500">
                                  No encontramos universidades con ese nombre.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-8 grid gap-4">
                        {currentQuestion.options?.map((option, index) => {
                          const isSelected =
                            answers[currentQuestion.key] === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleAnswer(option.value)}
                              className={cn(
                                'group flex items-center justify-between gap-4 rounded-[24px] border px-4 py-4 text-left transition-all duration-300',
                                isSelected
                                  ? 'border-blue-300 bg-blue-50 shadow-[0_18px_40px_rgba(37,99,235,0.10)]'
                                  : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50',
                              )}
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={cn(
                                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border text-sm font-semibold transition-colors duration-300',
                                    isSelected
                                      ? 'border-blue-200 bg-white text-blue-600'
                                      : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-blue-200 group-hover:text-blue-600',
                                  )}
                                >
                                  {String(index + 1).padStart(2, '0')}
                                </div>

                                <div>
                                  <p className="text-base font-semibold text-slate-950">
                                    {option.label}
                                  </p>

                                  <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {option.description}
                                  </p>
                                </div>
                              </div>

                              <ArrowRight
                                className={cn(
                                  'h-5 w-5 shrink-0 transition-all duration-300',
                                  isSelected
                                    ? 'text-blue-600'
                                    : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600',
                                )}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={stepIndex === 0}
                        className={cn(
                          'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300',
                          stepIndex === 0
                            ? 'cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-300'
                            : 'border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700',
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </button>

                      <p className="text-sm text-slate-500">
                        Elige la opción más cercana a tu caso.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col justify-between">
                    <div>
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Recomendación lista
                          </div>

                          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Plan recomendado
                          </p>

                          <h3 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-slate-950">
                            {recommendation?.plan}
                          </h3>

                          <p className="mt-4 text-base leading-8 text-slate-600">
                            {recommendation?.reason}
                          </p>

                          <p className="mt-3 text-sm leading-7 text-slate-500">
                            {recommendation?.detail}
                          </p>
                        </div>

                        <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Evaluación
                          </p>

                          <p className="mt-2 text-3xl font-semibold text-slate-950">
                            {completionPercent}%
                          </p>

                          <p className="text-sm text-slate-500">completada</p>
                        </div>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        {recommendation?.bullets.slice(0, 4).map((bullet) => (
                          <div
                            key={bullet}
                            className="flex items-start gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-slate-700"
                          >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>

                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Ideal para
                          </p>

                          <p className="mt-3 text-sm leading-7 text-slate-700">
                            {recommendation?.idealFor ||
                              'Estudiantes que necesitan avanzar con mayor claridad y una ruta organizada.'}
                          </p>
                        </div>

                        <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MessagesSquare className="h-4 w-4 text-blue-600" />

                            <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                              Señales detectadas
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {questions.map((question) => {
                              const answerLabel = getAnswerLabel(question);

                              return answerLabel ? (
                                <div
                                  key={question.key}
                                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
                                >
                                  {answerLabel}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => navigateToSection('planes')}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                      >
                        Ver plan recomendado
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Volver a responder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
