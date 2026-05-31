import { motion, useReducedMotion } from 'motion/react';
import { CalendarClock, ExternalLink } from 'lucide-react';

import { Card } from '../../ui/card';

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function MeetingsCalendar({ meetings, onOpenMeetings }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section variants={reducedMotion ? undefined : itemVariants}>
      <Card className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Reuniones
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              Proximas sesiones
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Mantente al dia con las asesorias y sesiones planificadas.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenMeetings}
            className="ios-secondary-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Ver reuniones
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_15px_40px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-sm font-semibold text-slate-700">
                    {meeting.day}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {meeting.time}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {meeting.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">{meeting.date}</p>
                <p className="mt-3 text-xs text-slate-500">
                  Estado: {meeting.status}
                </p>
                {meeting.link && (
                  <a
                    href={meeting.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Unirse a Meet
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500 md:col-span-3">
              No tienes reuniones proximas en este momento.
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <CalendarClock className="h-4 w-4 text-blue-600" />
          Las reuniones sincronizadas se muestran aqui automaticamente.
        </div>
      </Card>
    </motion.section>
  );
}
