import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  MessagesSquare,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';
import { planCatalog } from './Plans';

type AnswerKey = 'level' | 'stage' | 'complexity' | 'support' | 'career';
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
  options: QuestionOption[];
};

type Answers = Partial<Record<AnswerKey, string>>;

const questions: Question[] = [
  {
    key: 'level',
    shortLabel: 'Nivel',
    title: '¿Cuál es tu nivel académico?',
    helper: 'Estimamos la exigencia general.',
    options: [
      {
        value: 'pregrado',
        label: 'Pregrado',
        description: 'Ruta base',
      },
      {
        value: 'maestria',
        label: 'Maestría',
        description: 'Mayor exigencia',
      },
      {
        value: 'doctorado',
        label: 'Doctorado',
        description: 'Máxima profundidad',
      },
    ],
  },
  {
    key: 'career',
    shortLabel: 'Carrera',
    title: '¿Qué carrera estudias?',
    helper: 'Adaptamos el enfoque a tu carrera.',
    options: [
      {
        value: 'arquitectura',
        label: 'Arquitectura',
        description: 'Atención especializada',
      },
      {
        value: 'ingenieria',
        label: 'Ingeniería',
        description: 'Enfoque técnico',
      },
      {
        value: 'administracion',
        label: 'Administración',
        description: 'Enfoque aplicado',
      },
      {
        value: 'psicologia',
        label: 'Psicología',
        description: 'Diseño y análisis',
      },
      {
        value: 'otros',
        label: 'Otra carrera',
        description: 'Asesoría adaptable',
      },
    ],
  },
  {
    key: 'stage',
    shortLabel: 'Etapa',
    title: '¿En qué punto está tu tesis?',
    helper: 'La etapa define el tipo de apoyo.',
    options: [
      {
        value: 'starting',
        label: 'Recién empiezo',
        description: 'Punto de partida',
      },
      {
        value: 'topic',
        label: 'Ya tengo tema',
        description: 'Base definida',
      },
      {
        value: 'developing',
        label: 'Tengo observaciones',
        description: 'Ajustes pendientes',
      },
      {
        value: 'closing',
        label: 'Estoy cerrando',
        description: 'Fase final',
      },
    ],
  },
  {
    key: 'complexity',
    shortLabel: 'Dificultad',
    title: '¿Cómo sientes la dificultad metodológica?',
    helper: 'Mide la exigencia metodológica.',
    options: [
      {
        value: 'low',
        label: 'Baja',
        description: 'Manejable',
      },
      {
        value: 'medium',
        label: 'Media',
        description: 'Requiere guía',
      },
      {
        value: 'high',
        label: 'Alta',
        description: 'Alta exigencia',
      },
    ],
  },
  {
    key: 'support',
    shortLabel: 'Soporte',
    title: '¿Qué nivel de acompañamiento necesitas?',
    helper: 'Define cuánta guía necesitas.',
    options: [
      {
        value: 'order',
        label: 'Solo orden',
        description: 'Más autonomía',
      },
      {
        value: 'guided',
        label: 'Guía frecuente',
        description: 'Seguimiento cercano',
      },
      {
        value: 'intensive',
        label: 'Soporte intensivo',
        description: 'Acompañamiento amplio',
      },
    ],
  },
];

const labelsByKey: Record<AnswerKey, Record<string, string>> = {
  level: {
    pregrado: 'Pregrado',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
  },
  career: {
    arquitectura: 'Arquitectura',
    ingenieria: 'Ingeniería',
    administracion: 'Administración',
    psicologia: 'Psicología',
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
    order: 'Solo orden',
    guided: 'Guía frecuente',
    intensive: 'Soporte intensivo',
  },
};

function getPlanRecommendation(answers: Answers) {
  const levelRank = {
    pregrado: 0,
    maestria: 1,
    doctorado: 2,
  }[answers.level ?? 'pregrado'];

  const stageRank = {
    starting: 0,
    topic: 0,
    developing: 1,
    closing: 2,
  }[answers.stage ?? 'starting'];

  const complexityRank = {
    low: 0,
    medium: 1,
    high: 2,
  }[answers.complexity ?? 'low'];

  const supportRank = {
    order: 0,
    guided: 1,
    intensive: 2,
  }[answers.support ?? 'order'];

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
    Integral: 'Soporte profundo para tesis exigente.',
  };

  const signals = [
    answers.stage === 'closing' ? 'en etapa de cierre' : null,
    answers.stage === 'developing' ? 'tienes observaciones para revisar' : null,
    answers.complexity === 'high' ? 'dificultad metodológica alta' : null,
    answers.complexity === 'medium' ? 'dificultad metodológica media' : null,
    answers.support === 'intensive' ? 'necesitas soporte intensivo' : null,
    answers.support === 'guided' ? 'necesitas guía frecuente' : null,
    answers.level === 'doctorado' ? 'nivel doctoral requiere profundidad' : null,
    answers.level === 'maestria' ? 'maestría pide criterio metodológico' : null,
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

export default function AssessmentFunnel({ onNavigate }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
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

  const handleAnswer = (value: string) => {
    // Si selecciona arquitectura, redireccionar a WhatsApp
    if (currentQuestion.key === 'career' && value === 'arquitectura') {
      const phoneNumber = '+51944877217';
      const message = encodeURIComponent('Hola, estoy interesado en asesoría para mi tesis en Arquitectura.');
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestion.key]: value,
    };

    setAnswers(nextAnswers);

    if (stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleReset = () => {
    setAnswers({});
    setStepIndex(0);
  };

  return (
    <section id="assessment-funnel" className="px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto ">
        <SectionHeading
          eyebrow="Asesoría"
          title="¿Necesitas asesoría para tu tesis?"
          description="5 preguntas. 1 recomendación clara."
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-14"
        >
          <GlassCard className="overflow-hidden rounded-[40px] border-white/80 p-3 sm:p-4">
            <div className="grid gap-3 lg:grid-cols-[0.94fr_1.06fr]">
              <div className="rounded-[32px] bg-[linear-gradient(145deg,rgba(15,23,42,0.97),rgba(30,41,59,0.95),rgba(14,116,144,0.84))] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] sm:p-7 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    Plan assessment
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                    {isComplete ? 'Listo' : '3 min'}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-3xl font-semibold leading-tight text-white sm:text-[2.2rem]">
                    Tu plan ideal, en 5 respuestas.
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                    Rápido, claro y enfocado en tu etapa real.
                  </p>
                </div>

                <div className="mt-8 rounded-[28px] border border-white/12 bg-white/10 p-5">
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
                        : 'Tu plan se calcula al final'}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {questions.map((question, index) => (
                      <div
                        key={question.key}
                        className={cn(
                          'rounded-[20px] border px-4 py-3 text-sm transition-all duration-300',
                          answers[question.key]
                            ? 'border-cyan-300/30 bg-white/14 text-white'
                            : index === stepIndex && !isComplete
                              ? 'border-white/25 bg-white/18 text-white'
                              : 'border-white/10 bg-white/[0.06] text-white/55',
                        )}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                          Paso {index + 1}
                        </p>
                        <p className="mt-2 font-semibold leading-6">
                          {question.shortLabel}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-white/72">
                          {answers[question.key]
                            ? labelsByKey[question.key][answers[question.key] as string]
                            : index === stepIndex && !isComplete
                              ? 'En curso'
                              : 'Pendiente'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-medium text-white/75">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Menos ruido, mejor recomendación.
                </div>
              </div>

              <div className="min-h-[34rem]">
                {!isComplete ? (
                  <div className="flex h-full flex-col justify-between rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.88))] p-6 sm:p-7 lg:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/90 bg-sky-100/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                          <BookOpenCheck className="h-4 w-4" />
                          Pregunta activa
                        </p>
                        <h3 className="mt-5 text-3xl font-semibold leading-tight text-slate-950">
                          {currentQuestion.title}
                        </h3>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                          {currentQuestion.helper}
                        </p>
                      </div>

                      <div className="hidden h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-100 to-blue-100 text-blue-700 sm:flex">
                        <Sparkles className="h-7 w-7" />
                      </div>
                    </div>

                    {currentQuestion.key === 'career' ? (
                      <div className="mt-6 rounded-[24px] border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm leading-7 text-amber-900">
                        Arquitectura te lleva a atención directa por WhatsApp.
                      </div>
                    ) : null}

                    <div className="mt-8 grid gap-4">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = answers[currentQuestion.key] === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleAnswer(option.value)}
                            className={cn(
                              'group flex items-center justify-between gap-4 rounded-[24px] border px-4 py-4 text-left transition-all duration-300',
                              isSelected
                                ? 'border-sky-200 bg-sky-50 shadow-[0_18px_40px_rgba(37,99,235,0.08)]'
                                : 'border-white/80 bg-white/88 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]',
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border text-sm font-semibold transition-colors duration-300',
                                  isSelected
                                    ? 'border-sky-200 bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                                    : 'border-slate-200 bg-slate-50 text-slate-600 group-hover:border-sky-200 group-hover:text-sky-700',
                                )}
                              >
                                {String(index + 1).padStart(2, '0')}
                              </div>

                              <div>
                                <p className="text-base font-semibold text-slate-900">
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

                    <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={stepIndex === 0}
                        className={cn(
                          'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300',
                          stepIndex === 0
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5',
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
                  <div className="flex min-h-full flex-col justify-between rounded-[32px] border border-sky-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,246,255,0.94))] p-6 shadow-[0_22px_60px_rgba(37,99,235,0.10)] sm:p-7 lg:p-8">
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
                          <h3 className="mt-3 text-4xl font-semibold text-slate-950">
                            {recommendation?.plan}
                          </h3>
                          <p className="mt-4 text-base leading-8 text-slate-700">
                            {recommendation?.reason}
                          </p>
                        </div>

                        <div className="rounded-[26px] border border-sky-200/80 bg-white/90 px-5 py-4">
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
                            className="flex items-start gap-3 rounded-[24px] border border-white/80 bg-white/88 px-4 py-4 text-sm leading-6 text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
                          >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="rounded-[26px] border border-slate-900/5 bg-slate-950 px-5 py-5 text-white">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                            Ideal para
                          </p>
                          <p className="mt-3 text-sm leading-7 text-white/86">
                            {recommendation?.idealFor}
                          </p>
                        </div>

                        <div className="rounded-[26px] border border-white/80 bg-white/84 px-5 py-5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MessagesSquare className="h-4 w-4 text-sky-600" />
                            <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                              Señales detectadas
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {questions.map((question) =>
                              answers[question.key] ? (
                                <div
                                  key={question.key}
                                  className="rounded-full border border-sky-200/80 bg-sky-50/90 px-3 py-2 text-xs font-medium text-slate-700"
                                >
                                  {labelsByKey[question.key][answers[question.key] as string]}
                                </div>
                              ) : null,
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => onNavigate('plans')}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900"
                      >
                        Ver plan recomendado
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/78 px-6 py-4 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Volver a responder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
