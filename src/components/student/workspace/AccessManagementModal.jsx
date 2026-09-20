import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, ShieldCheck, UserRound } from 'lucide-react';

import Modal from '../../ui/modal';

const getInitials = (name = '') => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'AS';
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
};

export default function AccessManagementModal({
  open,
  onClose,
  thesisTitle,
  assignedAdvisors,
  availableAdvisors,
  onAssignAdvisor,
  assigningAdvisor,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const filteredAdvisors = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('es');

    if (!term) {
      return availableAdvisors;
    }

    return availableAdvisors.filter((advisor) =>
      [
        advisor?.nombre_mostrar,
        advisor?.email_publico,
        advisor?.carrera,
        advisor?.slug,
      ]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('es').includes(term)),
    );
  }, [availableAdvisors, searchTerm]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gestionar accesos"
      subtitle={
        thesisTitle
          ? `Tesis: ${thesisTitle}`
          : 'Administra qué asesores pueden revisar esta tesis.'
      }
      modalWidth="access"
      contentClassName="bg-slate-50 px-5 py-5 sm:px-7 sm:py-6"
      secondaryAction={{
        label: 'Cerrar',
        onClick: onClose,
      }}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:gap-6">
        <section aria-labelledby="current-access-title" className="space-y-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.2)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Accesos actuales
                </p>
                <h3
                  id="current-access-title"
                  className="mt-1 text-base font-semibold tracking-tight text-slate-950"
                >
                  Asesores con permiso
                </h3>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {assignedAdvisors.length}{' '}
                {assignedAdvisors.length === 1 ? 'asignado' : 'asignados'}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {assignedAdvisors.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                  Esta tesis todavía no tiene asesores asignados.
                </div>
              ) : (
                assignedAdvisors.map((item) => (
                  <article
                    key={
                      item.asesor_tesis_id ||
                      `${item.tesis_id}-${item.asesor_id}`
                    }
                    className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.2)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {getInitials(item.asesor_nombre || 'Asesor')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.asesor_nombre || 'Asesor'}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        Rol {item.rol || 'principal'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Con acceso
                    </span>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="grant-access-title" className="space-y-4">
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.2)] sm:p-5">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Buscar asesor
                </p>
                <h3
                  id="grant-access-title"
                  className="mt-1 text-base font-semibold tracking-tight text-slate-950"
                >
                  Otorga permisos de revisión
                </h3>
              </div>

              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <label htmlFor="advisor-access-search" className="sr-only">
                  Buscar asesor por nombre, carrera o correo
                </label>
                <input
                  id="advisor-access-search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, carrera o correo"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {filteredAdvisors.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  {availableAdvisors.length === 0
                    ? 'No tienes asesores adicionales disponibles para esta tesis.'
                    : 'No encontramos asesores con ese criterio.'}
                </div>
              ) : (
                filteredAdvisors.map((advisor) => (
                  <article
                    key={advisor.asesor_id || advisor.relacion_id}
                    className="flex flex-col gap-3 rounded-[16px] border border-slate-200 bg-slate-50 p-3.5 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {getInitials(advisor.nombre_mostrar || 'Asesor')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {advisor.nombre_mostrar || 'Asesor'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {advisor.carrera ||
                            advisor.email_publico ||
                            'Asesor vinculado'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAssignAdvisor(advisor.asesor_id)}
                      disabled={assigningAdvisor}
                      aria-label={`Dar acceso a ${advisor.nombre_mostrar || 'Asesor'}`}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {assigningAdvisor ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Otorgando...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Dar acceso
                        </>
                      )}
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
