import { useMemo, useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  MessageCircle,
  MessagesSquare,
  RotateCcw,
  Sparkles,
  Search,
  X,
} from 'lucide-react';

import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';
import { planCatalog } from './Plans';
import { obtenerUniversidades } from '../../services/catalogService';
import { registrarLeadEstudiante } from '../../services/leadService';

type AnswerKey =
  | 'level'
  | 'stage'
  | 'complexity'
  | 'support'
  | 'career'
  | 'university'
  | 'contact';

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
  isContact?: boolean;
};

type Answers = Partial<Record<AnswerKey, string>>;

type LeadForm = {
  nombre: string;
  email: string;
  telefono: string;
  aceptaContacto: boolean;
};

type University = {
  id: string;
  nombre: string;
  ubicacion: string;
  pais: string;
};

type AssessmentFunnelProps = {
  onNavigate?: (section: string) => void;
};

const advisorPhoneNumber = '51944877217';

const stopKeyPropagation = (event: KeyboardEvent<HTMLInputElement>) => {
  event.stopPropagation();
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
  {
    key: 'contact',
    shortLabel: 'Contacto',
    title: '¿Cómo puede contactarte un asesor?',
    helper: 'Guardaremos tu diagnóstico con estos datos al terminar el funnel.',
    isContact: true,
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
  contact: {},
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
  const [leadForm, setLeadForm] = useState<LeadForm>({
    nombre: '',
    email: '',
    telefono: '',
    aceptaContacto: true,
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const leadSubmitAttemptedRef = useRef(false);

  const totalSteps = questions.length;
  const currentQuestion = questions[stepIndex];

  const isComplete =
    totalSteps > 0 &&
    questions.every((question) =>
      question.isContact
        ? Boolean(
            leadForm.nombre.trim() &&
              leadForm.email.trim() &&
              leadForm.telefono.trim() &&
              leadForm.aceptaContacto &&
              answers.contact,
          )
        : answers[question.key],
    );

  const progressStep = isComplete ? totalSteps : stepIndex + 1;
  const completionPercent = Math.round((progressStep / totalSteps) * 100);

  const answeredCount = questions.filter((question) => answers[question.key]).length;

  const recommendation = useMemo(
    () => (isComplete ? getPlanRecommendation(answers) : null),
    [answers, isComplete],
  );

  const selectedUniversity = useMemo(
    () =>
      universities.find((university) => university.id === answers.university) ??
      null,
    [answers.university, universities],
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

    if (question.isContact) {
      return answers.contact ? leadForm.nombre.trim() || 'Datos completos' : null;
    }

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
      const message = encodeURIComponent(
        'Hola, estoy interesado en asesoría para mi tesis en Arquitectura.',
      );

      window.open(`https://wa.me/${advisorPhoneNumber}?text=${message}`, '_blank');
      return;
    }

    setAnswers((current) => ({
      ...current,
      [currentQuestion.key]: value,
    }));

    if (stepIndex < totalSteps - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const handleContactContinue = () => {
    const nombre = leadForm.nombre.trim();
    const email = leadForm.email.trim();
    const telefono = leadForm.telefono.trim();

    if (!nombre || !email || !telefono) {
      setLeadError('Completa tu nombre, correo y WhatsApp para terminar el diagnóstico.');
      return;
    }

    if (!leadForm.aceptaContacto) {
      setLeadError('Autoriza el contacto para que un asesor pueda escribirte.');
      return;
    }

    setLeadError(null);
    setAnswers((current) => ({
      ...current,
      contact: 'complete',
    }));
  };

  const handleBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleReset = () => {
    setAnswers({});
    setStepIndex(0);
    setSearchTerm('');
    setLeadSubmitted(false);
    setLeadError(null);
    leadSubmitAttemptedRef.current = false;
    setLeadForm({
      nombre: '',
      email: '',
      telefono: '',
      aceptaContacto: true,
    });
  };

  const updateLeadField = (
    field: keyof LeadForm,
    value: string | boolean,
  ) => {
    setLeadForm((current) => ({
      ...current,
      [field]: value,
    }));
    setLeadError(null);

    if (answers.contact) {
      setAnswers((current) => {
        const next = { ...current };
        delete next.contact;
        return next;
      });
      setLeadSubmitted(false);
      leadSubmitAttemptedRef.current = false;
    }
  };

  const buildWhatsappUrl = () => {
    const message = encodeURIComponent(
      [
        'Hola, acabo de completar el diagnóstico de AppThesis.',
        recommendation?.plan ? `Plan recomendado: ${recommendation.plan}.` : null,
        leadForm.nombre.trim() ? `Mi nombre es ${leadForm.nombre.trim()}.` : null,
        selectedUniversity?.nombre
          ? `Universidad: ${selectedUniversity.nombre}.`
          : null,
        answers.level ? `Nivel: ${labelsByKey.level[answers.level]}.` : null,
        answers.career ? `Carrera: ${labelsByKey.career[answers.career]}.` : null,
      ]
        .filter(Boolean)
        .join(' '),
    );

    return `https://wa.me/${advisorPhoneNumber}?text=${message}`;
  };

  const handleLeadSubmit = async () => {
    const nombre = leadForm.nombre.trim();
    const email = leadForm.email.trim();
    const telefono = leadForm.telefono.trim();

    if (!nombre || !email || !telefono) {
      setLeadError('Completa tu nombre, correo y WhatsApp para registrar tu diagnóstico.');
      return;
    }

    if (!leadForm.aceptaContacto) {
      setLeadError('Autoriza el contacto para que un asesor pueda escribirte.');
      return;
    }

    if (!recommendation) {
      setLeadError('Termina el diagnóstico antes de registrar tus datos.');
      return;
    }

    try {
      setLeadSubmitting(true);
      setLeadError(null);

      await registrarLeadEstudiante({
        nombre,
        email,
        telefono,
        nivelAcademico: answers.level ?? '',
        carrera: answers.career ?? '',
        aceptaContacto: leadForm.aceptaContacto,
        universidadId: answers.university ?? null,
        presupuesto: 0,
        planRecomendado: recommendation.plan,
        respuestas: {
          ...answers,
          labels: Object.fromEntries(
            questions.map((question) => [
              question.key,
              getAnswerLabel(question),
            ]),
          ),
          recommendation,
          university: selectedUniversity,
          source: 'assessment_funnel',
        },
      });

      setLeadSubmitted(true);
    } catch (error) {
      console.error('Error registering lead:', error);
      setLeadError('No pudimos registrar tus datos. Intenta nuevamente o conversa por WhatsApp.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      !isComplete ||
      leadSubmitted ||
      leadSubmitting ||
      leadSubmitAttemptedRef.current
    ) {
      return;
    }

    leadSubmitAttemptedRef.current = true;
    void handleLeadSubmit();
  }, [isComplete, leadSubmitted, leadSubmitting]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);

        const data = await obtenerUniversidades();

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

  // Función para normalizar texto: quita tildes y pasa a minúsculas
  function normalizeText(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }

  useEffect(() => {
    const term = normalizeText(searchTerm.trim());

    if (!term) {
      setFilteredUniversities(universities);
      return;
    }

    setFilteredUniversities(
      universities.filter((university) => {
        const nombre = normalizeText(university.nombre ?? '');
        const ubicacion = normalizeText(university.ubicacion ?? '');
        const pais = normalizeText(university.pais ?? '');

        return (
          nombre.includes(term) ||
          ubicacion.includes(term) ||
          pais.includes(term)
        );
      }),
    );
  }, [searchTerm, universities]);

  return (
    <section
      id="assessment-funnel"
      className="relative px-3 py-10 sm:px-4 md:px-6 lg:px-8 lg:py-14"
    >
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Diagnóstico académico"
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-6 lg:mt-8"
        >
          <div className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(239,246,255,0.62)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.5),0_34px_90px_rgba(15,23,42,0.12)] backdrop-blur-[32px] lg:rounded-[32px]">
            <div className="flex flex-col lg:grid lg:min-h-[640px] lg:grid-cols-[0.68fr_1.32fr] xl:grid-cols-[0.62fr_1.38fr]">
              <aside
                data-scroll-lock="true"
                className="relative min-h-0 overflow-hidden border-b border-white/50 p-4 text-slate-900 sm:p-5 md:p-6 lg:border-b-0 lg:border-r lg:border-white/50 lg:p-5 xl:p-6"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.7),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(191,219,254,0.48),transparent_28%),linear-gradient(160deg,rgba(255,255,255,0.5),rgba(239,246,255,0.72),rgba(224,239,255,0.64))]" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 backdrop-blur-xl">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600">
                        <Sparkles className="h-3 w-3" />
                      </span>
                      Diagnóstico
                    </div>

                    <div className="rounded-full border border-white/70 bg-white/55 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur-xl">
                      {isComplete ? 'Listo' : '3 min'}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                      Tu ruta ideal
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Responde rápido y recibe una recomendación clara.
                    </p>
                  </div>

                  <div className="mt-4 rounded-[20px] border border-white/70 bg-white/58 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>
                        {isComplete
                          ? 'Evaluación terminada'
                          : `Paso ${stepIndex + 1} de ${totalSteps}`}
                      </span>

                      <span>{completionPercent}%</span>
                    </div>

                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-300"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-600">
                      <span>{answeredCount} respuestas</span>
                      <span>
                        {isComplete ? 'Desbloqueada' : 'Al final'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex-1 space-y-2 pr-1">
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
                            'flex w-full items-center justify-between gap-3 rounded-[16px] border px-3 py-2 text-left text-sm transition-all duration-300',
                            isAnswered
                              ? 'border-blue-200 bg-white/70 text-slate-900 shadow-[0_10px_24px_rgba(59,130,246,0.1)]'
                              : isCurrent
                                ? 'border-white/80 bg-white/60 text-slate-900'
                                : 'border-white/50 bg-white/35 text-slate-600 hover:border-white/80 hover:bg-white/50 hover:text-slate-800',
                          )}
                        >
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Paso {index + 1}
                            </p>

                            <p className="mt-0.5 font-semibold leading-5 text-slate-900">
                              {question.shortLabel}
                            </p>
                          </div>

                          <div className="max-w-[120px] text-right">
                            <p className="line-clamp-1 text-xs leading-5 text-slate-600">
                              {answerLabel ?? (isCurrent ? 'En curso' : 'Pendiente')}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 hidden w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs font-medium text-blue-700 backdrop-blur-xl xl:inline-flex">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600">
                      <Sparkles className="h-3 w-3" />
                    </span>
                    Menos ruido, mejor decisión.
                  </div>
                </div>
              </aside>

              <div
                data-scroll-lock="true"
                className="min-h-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(224,239,255,0.38),rgba(255,255,255,0.72))] p-4 sm:p-5 md:p-6 lg:p-7"
              >
                {!isComplete ? (
                  <div className="flex min-h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-white/65 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 backdrop-blur-xl">
                          <BookOpenCheck className="h-3.5 w-3.5" />
                          Pregunta activa
                        </p>

                        <h3 className="mt-5 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 sm:text-3xl">
                          {currentQuestion.title}
                        </h3>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                          {currentQuestion.helper}
                        </p>
                      </div>

                      <div className="hidden h-14 w-14 items-center justify-center rounded-[20px] border border-blue-200 bg-blue-50 text-blue-600 shadow-[0_12px_32px_rgba(59,130,246,0.1)] backdrop-blur-xl sm:flex">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    </div>

                    {currentQuestion.isContact ? (
                      <div className="mt-6 rounded-[22px] border border-white/70 bg-white/60 px-5 py-4 shadow-[0_14px_34px_rgba(59,130,246,0.08)] backdrop-blur-xl">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                              Nombre
                            </span>
                            <input
                              type="text"
                              value={leadForm.nombre}
                              onChange={(event) =>
                                updateLeadField('nombre', event.target.value)
                              }
                              onKeyDown={stopKeyPropagation}
                              className="mt-2 w-full rounded-[16px] border border-white/80 bg-white/75 px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_rgba(59,130,246,0.05)] outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                              placeholder="Tu nombre"
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                              Correo
                            </span>
                            <input
                              type="email"
                              value={leadForm.email}
                              onChange={(event) =>
                                updateLeadField('email', event.target.value)
                              }
                              onKeyDown={stopKeyPropagation}
                              className="mt-2 w-full rounded-[16px] border border-white/80 bg-white/75 px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_rgba(59,130,246,0.05)] outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                              placeholder="correo@ejemplo.com"
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                              WhatsApp
                            </span>
                            <input
                              type="tel"
                              value={leadForm.telefono}
                              onChange={(event) =>
                                updateLeadField('telefono', event.target.value)
                              }
                              onKeyDown={stopKeyPropagation}
                              className="mt-2 w-full rounded-[16px] border border-white/80 bg-white/75 px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_rgba(59,130,246,0.05)] outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                              placeholder="+51 999 999 999"
                            />
                          </label>
                        </div>

                        <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-slate-600">
                          <input
                            type="checkbox"
                            checked={leadForm.aceptaContacto}
                            onChange={(event) =>
                              updateLeadField('aceptaContacto', event.target.checked)
                            }
                            className="mt-1 h-4 w-4 rounded border-blue-200 text-blue-600 focus:ring-blue-200"
                          />
                          <span>
                            Acepto que AppThesis use estos datos para contactarme sobre mi diagnóstico y asesoría.
                          </span>
                        </label>

                        {leadError ? (
                          <p className="mt-3 rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {leadError}
                          </p>
                        ) : null}

                        <button
                          type="button"
                          onClick={handleContactContinue}
                          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(59,130,246,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
                        >
                          Terminar diagnóstico
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : currentQuestion.isSearchable ? (
                      <div className="mt-6 space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

                          <input
                            type="text"
                            placeholder="Busca tu universidad..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyDown={stopKeyPropagation}
                            className="w-full rounded-[20px] border border-white/80 bg-white/70 py-3 pl-12 pr-12 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_rgba(59,130,246,0.06)] backdrop-blur-xl transition-all duration-300 placeholder:text-slate-500 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
                          <div className="flex items-center justify-center rounded-[20px] border border-white/70 bg-white/55 py-10 backdrop-blur-xl">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                          </div>
                        ) : (
                          <div
                            data-lenis-prevent
                            className="max-h-[280px] space-y-2 overflow-y-auto pr-1"
                          >
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
                                      'flex w-full items-center justify-between rounded-[18px] border px-4 py-2.5 text-left transition-all duration-300',
                                      isSelected
                                        ? 'border-blue-300 bg-white/75 shadow-[0_16px_36px_rgba(59,130,246,0.12)]'
                                        : 'border-white/70 bg-white/55 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white/70',
                                    )}
                                  >
                                    <div className="flex flex-col gap-1">
                                      <p className="font-semibold text-slate-900">
                                        {university.nombre}
                                      </p>

                                      <p className="text-xs text-slate-600">
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
                              <div className="rounded-[18px] border border-white/60 bg-white/40 px-4 py-8 text-center backdrop-blur-xl">
                                <p className="text-sm text-slate-600">
                                  No encontramos universidades con ese nombre.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-6 grid gap-3">
                        {currentQuestion.options?.map((option, index) => {
                          const isSelected =
                            answers[currentQuestion.key] === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleAnswer(option.value)}
                              className={cn(
                                'group flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3 text-left shadow-[0_10px_28px_rgba(59,130,246,0.06)] backdrop-blur-xl transition-all duration-300',
                                isSelected
                                  ? 'border-blue-300 bg-white/75 shadow-[0_18px_40px_rgba(59,130,246,0.12)]'
                                  : 'border-white/70 bg-white/55 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white/70',
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border text-xs font-semibold transition-colors duration-300',
                                    isSelected
                                      ? 'border-blue-300 bg-white text-blue-600'
                                      : 'border-white/70 bg-blue-50 text-blue-600 group-hover:border-blue-200 group-hover:text-blue-700',
                                  )}
                                >
                                  {String(index + 1).padStart(2, '0')}
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-900 sm:text-base">
                                    {option.label}
                                  </p>

                                  <p className="mt-1 text-sm leading-5 text-slate-600">
                                    {option.description}
                                  </p>
                                </div>
                              </div>

                              <ArrowRight
                                className={cn(
                                  'h-4 w-4 shrink-0 transition-all duration-300',
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

                    <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={stepIndex === 0}
                        className={cn(
                          'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300',
                          stepIndex === 0
                            ? 'cursor-not-allowed border border-white/50 bg-white/40 text-slate-400'
                            : 'border border-white/70 bg-white/60 text-slate-900 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white/75 hover:text-blue-700',
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </button>

                      <p className="text-sm text-slate-600">
                        Elige la opción más cercana a tu caso.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col justify-between">
                    <div>
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                          <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-white/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-green-700 backdrop-blur-xl">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Recomendación lista
                          </div>

                          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700">
                            Plan recomendado
                          </p>

                          <h3 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                            {recommendation?.plan}
                          </h3>

                          <p className="mt-3 text-base leading-7 text-slate-700">
                            {recommendation?.reason}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {recommendation?.detail}
                          </p>
                        </div>

                        <div className="rounded-[22px] border border-white/70 bg-white/60 px-5 py-4 shadow-[0_14px_34px_rgba(59,130,246,0.08)] backdrop-blur-xl">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                            Evaluación
                          </p>

                          <p className="mt-2 text-3xl font-semibold text-slate-900">
                            {completionPercent}%
                          </p>

                          <p className="text-sm text-slate-600">completada</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {recommendation?.bullets.slice(0, 4).map((bullet) => (
                          <div
                            key={bullet}
                            className="flex items-start gap-3 rounded-[20px] border border-white/70 bg-white/55 px-4 py-3 text-sm leading-6 text-slate-700 shadow-[0_14px_30px_rgba(59,130,246,0.08)] backdrop-blur-xl"
                          >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>

                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-[22px] border border-white/70 bg-white/60 px-5 py-4 shadow-[0_14px_34px_rgba(59,130,246,0.08)] backdrop-blur-xl">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                              Registro automático
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {leadSubmitting
                                ? 'Estamos guardando tu diagnóstico para que el asesor reciba tu contexto.'
                                : leadSubmitted
                                  ? 'Tu diagnóstico quedó registrado con tus datos de contacto.'
                                  : 'Intentaremos guardar tu diagnóstico automáticamente.'}
                            </p>
                          </div>

                          <div
                            className={cn(
                              'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold',
                              leadSubmitted
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : leadSubmitting
                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'border-amber-200 bg-amber-50 text-amber-700',
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {leadSubmitted
                              ? 'Lead registrado'
                              : leadSubmitting
                                ? 'Guardando...'
                                : 'Pendiente'}
                          </div>
                        </div>

                        {leadError ? (
                          <p className="mt-3 rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {leadError}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={buildWhatsappUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-green-200 bg-green-50 px-6 py-3.5 text-sm font-semibold text-green-700 shadow-[0_12px_28px_rgba(34,197,94,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-100"
                      >
                        Hablar por WhatsApp
                        <MessageCircle className="h-4 w-4" />
                      </a>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/60 px-6 py-3.5 text-sm font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white/75 hover:text-blue-700"
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
