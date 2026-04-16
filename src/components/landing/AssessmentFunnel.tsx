import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
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
};

type Question = {
  key: AnswerKey;
  title: string;
  helper: string;
  options: QuestionOption[];
};

type Answers = Partial<Record<AnswerKey, string>>;

const questions: Question[] = [
  {
    key: 'level',
    title: '¿Cuál es tu nivel académico?',
    helper: 'Esto nos ayuda a estimar el nivel general de exigencia de tu tesis.',
    options: [
      { value: 'pregrado', label: 'Pregrado' },
      { value: 'maestria', label: 'Maestría' },
      { value: 'doctorado', label: 'Doctorado' },
    ],
  },
  {
    key: 'career',
    title: '¿Qué carrera estudias?',
    helper: 'Algunas disciplinas requieren evaluación especializada.',
    options: [
      { value: 'arquitectura', label: 'Arquitectura' },
      { value: 'ingenieria', label: 'Ingeniería' },
      { value: 'administracion', label: 'Administración' },
      { value: 'psicologia', label: 'Psicología' },
      { value: 'otros', label: 'Otra carrera' },
    ],
  },
  {
    key: 'stage',
    title: '¿En qué punto está tu tesis?',
    helper: 'La etapa actual cambia mucho el tipo de acompañamiento que conviene.',
    options: [
      { value: 'starting', label: 'Recién empiezo' },
      { value: 'topic', label: 'Ya tengo tema' },
      { value: 'developing', label: 'Tengo observaciones' },
      { value: 'closing', label: 'Estoy cerrando' },
    ],
  },
  {
    key: 'complexity',
    title: '¿Cómo sientes la dificultad metodológica?',
    helper: 'Piensa en variables, enfoque, estructura y exigencia técnica.',
    options: [
      { value: 'low', label: 'Baja' },
      { value: 'medium', label: 'Media' },
      { value: 'high', label: 'Alta' },
    ],
  },
  {
    key: 'support',
    title: '¿Qué nivel de acompañamiento necesitas?',
    helper: 'No se trata solo de avanzar; también de cuánto apoyo quieres en el proceso.',
    options: [
      { value: 'order', label: 'Solo orden' },
      { value: 'guided', label: 'Guía frecuente' },
      { value: 'intensive', label: 'Soporte intensivo' },
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
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Asesoría"
          title="¿Necesitas asesoría para tu tesis?"
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-14"
        >
          <GlassCard className="overflow-hidden rounded-[36px] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col justify-start gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/90 bg-sky-100/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Asesoría
                  </div>
                  <p className="mt-6 text-3xl font-semibold text-slate-950">
                    Encuentra el plan ideal para tu tesis
                  </p>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Responde 5 preguntas rápidas para una recomendación personalizada.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>
                      {isComplete
                        ? 'Resultado listo'
                        : `Paso ${stepIndex + 1} de ${totalSteps}`}
                    </span>
                    <span>
                      {Math.round(
                        ((isComplete ? totalSteps : stepIndex + 1) / totalSteps) *
                        100,
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200/80">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300"
                      style={{
                        width: `${((isComplete ? totalSteps : stepIndex + 1) / totalSteps) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {questions.map((question, index) => (
                      <div
                        key={question.key}
                        className={cn(
                          'rounded-[18px] border px-4 py-3 text-sm transition-colors duration-300',
                          answers[question.key]
                            ? 'border-sky-200 bg-sky-50/80 text-slate-700'
                            : index === stepIndex && !isComplete
                              ? 'border-slate-300 bg-white/72 text-slate-900'
                              : 'border-white/70 bg-white/55 text-slate-500',
                        )}
                      >
                        <p className="font-semibold">{question.title}</p>
                        <p className="mt-1 text-xs leading-6">
                          {answers[question.key]
                            ? labelsByKey[question.key][answers[question.key] as string]
                            : 'Pendiente'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-h-[28rem]">
                {!isComplete ? (
                  <div className="flex h-full flex-col justify-between rounded-[28px] border border-white/75 bg-white/70 p-6 sm:p-7">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Pregunta activa
                      </p>
                      <h3 className="mt-4 text-3xl font-semibold text-slate-950">
                        {currentQuestion.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-base leading-8 text-slate-600">
                        {currentQuestion.helper}
                      </p>
                    </div>

                    <div className="mt-8 grid gap-3">
                      {currentQuestion.options.map((option) => {
                        const isSelected = answers[currentQuestion.key] === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleAnswer(option.value)}
                            className={cn(
                              'flex items-center justify-between rounded-[20px] border px-4 py-4 text-left text-sm font-medium transition-all duration-300',
                              isSelected
                                ? 'border-sky-200 bg-sky-50 text-slate-900'
                                : 'border-white/70 bg-white/78 text-slate-700 hover:bg-white',
                            )}
                          >
                            <span>{option.label}</span>
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                        Responde una opción para continuar.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col justify-between rounded-[28px] border border-sky-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.8))] p-6 sm:p-7">
                    <div>
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
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {recommendation?.detail}
                      </p>

                      <div className="mt-8 grid gap-2">
                        {recommendation?.bullets.map((bullet) => (
                          <div
                            key={bullet}
                            className="rounded-[20px] border border-white/80 bg-white/78 px-4 py-2 text-sm leading-6 text-slate-700"
                          >
                            {bullet}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-[22px] border border-slate-200/70 bg-white/70 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Ideal para
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {recommendation?.idealFor}
                        </p>
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
