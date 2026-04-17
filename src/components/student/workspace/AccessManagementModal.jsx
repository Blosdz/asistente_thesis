import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, ShieldCheck, UserRound } from 'lucide-react';

import Modal from '../../ui/modal';

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
    const term = searchTerm.trim().toLowerCase();

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
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [availableAdvisors, searchTerm]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gestionar accesos"
      subtitle={thesisTitle || 'Administra qué asesores pueden revisar esta tesis.'}
      modalWidth="full"
      secondaryAction={{
        label: 'Cerrar',
        onClick: onClose,
      }}
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-4">
          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Accesos actuales
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  Asesores con permiso
                </h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {assignedAdvisors.length}
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
                    key={item.asesor_tesis_id || `${item.tesis_id}-${item.asesor_id}`}
                    className="flex items-start gap-3 rounded-[18px] bg-white px-4 py-4 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.4)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.asesor_nombre || 'Asesor'}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        Rol {item.rol || 'principal'}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Buscar asesor
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  Otorga permisos de revisión
                </h3>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar asesor"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
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
                    className="flex flex-col gap-4 rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)]">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {advisor.nombre_mostrar || 'Asesor'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {advisor.carrera || advisor.email_publico || 'Asesor vinculado'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAssignAdvisor(advisor.asesor_id)}
                      disabled={assigningAdvisor}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.35)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
