import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  Crown,
  Layers3,
  NotebookPen,
  X,
} from 'lucide-react';

import SectionHeading from '../ui/SectionHeading';
import { cn } from '../../lib/cn';

type PlanName = 'Esencial' | 'Guiado' | 'Integral';

type Plan = {
  title: PlanName;
  benefits: string[];
  includes: string[];
  excludes: string[];
  bullets: string[];
  idealFor: string;
  summary: string;
  icon: typeof Layers3;
  featured?: boolean;
  badge?: string;
};

export const planCatalog: Plan[] = [
  {
    title: 'Esencial',
    benefits: [
      'Organización total de tu tesis desde el inicio.',
      'Evitas desorden, pérdida de avances y confusión.',
      'Control claro del progreso tipo dashboard.',
      'Centralización de todo en un solo lugar.',
      'Apoyo con IA para acelerar tareas.',
    ],
    includes: [
      'Plataforma completa AppTesis.',
      'Dashboard de avance.',
      'Gestión de documentos.',
      'Observaciones del asesor centralizadas.',
      'Historial de cambios.',
      'Flujo estructurado del proceso de tesis.',
      'Asistente IA dentro del sistema.',
    ],
    excludes: [
      'Asesorías personalizadas.',
      'Acompañamiento metodológico.',
      'Revisión profunda de borradores.',
      'Preparación para sustentación.',
      'Desarrollo guiado de la tesis.',
    ],
    bullets: [
      'Dashboard de avance',
      'Gestión de documentos',
      'Asistente IA',
      'Ruta estructurada',
    ],
    idealFor:
      'Estudiantes que necesitan orden, estructura y una base clara para avanzar principalmente por cuenta propia.',
    summary: 'SaaS + estructura + IA para organizar tu tesis.',
    icon: Layers3,
  },
  {
    title: 'Guiado',
    benefits: [
      'Mejora real en la calidad de tu tesis.',
      'Evitas errores metodológicos graves.',
      'Tienes dirección profesional constante.',
      'Avanzas más rápido y con menos incertidumbre.',
      'Feedback estratégico, no solo técnico.',
    ],
    includes: [
      'Todo lo del Plan Esencial.',
      'Acompañamiento metodológico cercano.',
      'Revisión estratégica del enfoque.',
      'Apoyo en variables y estructura.',
      'Corrección de coherencia del trabajo.',
      'Revisión más profunda de observaciones.',
      'Orientación para defensa.',
      'Seguimiento constante del avance.',
    ],
    excludes: [
      'Desarrollo completo de la tesis por el asesor.',
      'Acompañamiento intensivo de inicio a fin.',
      'Intervención profunda en todos los capítulos.',
      'Resolución total del análisis estadístico.',
    ],
    bullets: [
      'Todo lo del Esencial',
      'Acompañamiento cercano',
      'Revisión estratégica',
      'Seguimiento constante',
    ],
    idealFor:
      'Estudiantes que buscan seguimiento más constante y orientación metodológica sin requerir soporte completo de inicio a fin.',
    summary: 'Mentoría + guía + corrección estratégica.',
    icon: NotebookPen,
    featured: true,
    badge: 'Más elegido',
  },
  {
    title: 'Integral',
    benefits: [
      'Máxima probabilidad de terminar la tesis correctamente.',
      'Reducción drástica de errores críticos.',
      'Seguridad antes de sustentar.',
      'Acompañamiento completo en todo el proceso.',
      'Soporte técnico y estratégico avanzado.',
    ],
    includes: [
      'Todo lo del Plan Guiado.',
      'Acompañamiento completo hasta la sustentación.',
      'Apoyo desde anteproyecto.',
      'Desarrollo supervisado continuo.',
      'Revisión progresiva de borradores.',
      'Soporte metodológico profundo.',
      'Apoyo en análisis estadístico según el caso.',
      'Seguimiento total de observaciones.',
      'Preparación para sustentación.',
      'Intervención técnica y estratégica.',
    ],
    excludes: [
      'No es 100% “te hacen la tesis”.',
      'Requiere participación activa del estudiante.',
      'Algunos casos complejos pueden requerir evaluación adicional.',
      'Ajustes de precio según nivel o complejidad.',
    ],
    bullets: [
      'Todo lo del Guiado',
      'Acompañamiento completo',
      'Revisión progresiva',
      'Preparación para sustentar',
    ],
    idealFor:
      'Estudiantes que necesitan acompañamiento amplio, continuidad y respaldo durante casi todo el proceso.',
    summary: 'Copiloto experto premium hasta el cierre.',
    icon: Crown,
  },
];

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]',
        plan.featured
          ? 'border-blue-200 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-slate-50 text-slate-500',
      )}
    >
      {plan.badge ?? 'Plan modular'}
    </div>
  );
}

function PlanIcon({ plan }: { plan: Plan }) {
  const Icon = plan.icon;

  return (
    <div
      className={cn(
        'flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border',
        plan.featured
          ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-sky-100 text-blue-700'
          : 'border-slate-200 bg-slate-50 text-slate-700',
      )}
    >
      <Icon className="h-6 w-6" />
    </div>
  );
}

function PlanBulletGrid({ plan }: { plan: Plan }) {
  return (
    <div className="mt-7 grid gap-2">
      {plan.bullets.map((bullet) => (
        <div
          key={bullet}
          className={cn(
            'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm',
            plan.featured
              ? 'border-blue-100 bg-blue-50 text-slate-700'
              : 'border-slate-200 bg-slate-50 text-slate-600',
          )}
        >
          <div
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
              plan.featured
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-slate-500',
            )}
          >
            <Check className="h-3.5 w-3.5" />
          </div>
          <span>{bullet}</span>
        </div>
      ))}
    </div>
  );
}

function PlanListItem({
  children,
  type,
}: {
  children: string;
  type: 'include' | 'exclude';
}) {
  const isInclude = type === 'include';

  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-slate-600">
      <div
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
          isInclude
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-500',
        )}
      >
        {isInclude ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      </div>

      <span>{children}</span>
    </li>
  );
}

function PlanList({
  title,
  countLabel,
  items,
  type,
}: {
  title: string;
  countLabel: string;
  items: string[];
  type: 'include' | 'exclude';
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          {title}
        </p>

        <span className="text-xs font-medium text-slate-400">
          {countLabel}
        </span>
      </div>

      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <PlanListItem key={item} type={type}>
            {item}
          </PlanListItem>
        ))}
      </ul>
    </div>
  );
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: 'easeOut',
      }}
      className={cn(
        'relative h-full overflow-hidden rounded-[34px] border bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] transition duration-300 sm:p-7 lg:p-8',
        plan.featured
          ? 'border-blue-200 shadow-[0_28px_90px_rgba(37,99,235,0.13)] lg:-translate-y-4'
          : 'border-slate-200 hover:border-blue-100 hover:shadow-[0_28px_90px_rgba(15,23,42,0.09)]',
      )}
    >
      {plan.featured && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300" />
      )}

      <div className="absolute right-[-6rem] top-[-6rem] h-56 w-56 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <PlanIcon plan={plan} />

            <div>
              <PlanBadge plan={plan} />

              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                {plan.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8 border-t border-slate-200 pt-7">
          <PlanList
            title="Qué incluye"
            countLabel={`${plan.includes.length} módulos`}
            items={plan.includes}
            type="include"
          />
          <div className="border-t border-slate-200 pt-7">
            <PlanList
              title="Qué no incluye"
              countLabel={`${plan.excludes.length} límites`}
              items={plan.excludes}
              type="exclude"
            />
          </div>
        </div>
     </div>
    </motion.article>
  );
}


export default function Plans() {
  return (
    <section
      id="planes"
      className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#ffffff_100%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Planes"
          title="Tres formas de avanzar tu tesis"
          description="Elige entre estructura, acompañamiento o soporte integral según tu etapa y nivel de exigencia."
          align="center"
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {planCatalog.map((plan, index) => (
            <PlanCard key={plan.title} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
