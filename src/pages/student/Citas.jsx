import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  History,
  Video,
} from 'lucide-react';
import { Card } from '../../components/ui/card';

const calendarCells = [
  { label: '25', muted: true },
  { label: '26', muted: true },
  { label: '27', muted: true },
  { label: '28', muted: true },
  { label: '29', muted: true },
  { label: '30', muted: true },
  { label: '1' },
  { label: '2' },
  { label: '3' },
  { label: '4', event: 'Revisión de tesis' },
  { label: '5' },
  { label: '6', event: '14:00 Metodología', highlight: true },
  { label: '7' },
  { label: '8' },
  { label: '9' },
  { label: '10' },
  { label: '11' },
  { label: '12' },
  { label: '13' },
  { label: '14' },
  { label: '15' },
];

const upcomingMeetings = [
  {
    title: 'Revisión de metodología',
    advisor: 'Dra. Sarah Jenkins',
    time: '14:00 - 15:00',
    mode: 'Videollamada',
    status: 'Hoy',
    cta: 'Unirse a la llamada',
  },
  {
    title: 'Feedback capítulo 2',
    advisor: 'Prof. Mark Thompson',
    time: '10:00 - 11:00',
    mode: 'Videollamada',
    status: '12 Oct',
    cta: 'Preparar materiales',
    subtle: true,
  },
];

const historyItems = [
  { title: 'Propuesta inicial', date: '28 Sep 2023', icon: History },
  { title: 'Auditoría de fuentes', date: '15 Sep 2023', icon: BookOpen },
];

const Citas = () => {
  return (
    <div className="w-full flex-1 px-4 sm:px-6 lg:px-10 py-12 animate-fade-in text-slate-900">
      <main className="max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-8 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Octubre 2023</h2>
                <div className="flex gap-1">
                  <button className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors" aria-label="Mes anterior">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors" aria-label="Mes siguiente">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary/20 hover:brightness-105 transition">
                <CalendarDays size={16} />
                Nueva sesión
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div
                  key={day}
                  className="py-4 text-center text-xs font-bold uppercase tracking-[0.15em] text-slate-500 bg-white"
                >
                  {day}
                </div>
              ))}

              {calendarCells.map((day, idx) => {
                const classes = [
                  'min-h-[110px] p-3 bg-white text-sm transition-shadow',
                  day.muted ? 'opacity-50 text-slate-400' : 'text-slate-800',
                  day.highlight ? 'ring-2 ring-primary/40 shadow-lg shadow-primary/10' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div key={`${day.label}-${idx}`} className={classes}>
                    <div className="flex items-start justify-between">
                      <span>{day.label}</span>
                      {day.highlight && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                    </div>
                    {day.event && (
                      <div className="mt-2 bg-primary/10 border-l-4 border-primary p-2 rounded text-[11px] font-semibold text-primary">
                        {day.event}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <aside className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold px-1">Próximas citas</h3>
              {upcomingMeetings.map((meeting, idx) => (
                <Card
                  key={meeting.title + idx}
                  className={`p-5 ${
                    meeting.subtle ? 'border-slate-200' : 'shadow-lg shadow-primary/10 border-primary/20'
                  } flex flex-col gap-4`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100">
                        <img
                          src={idx === 0 ?
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuBfmZNbTtvY4BMFdyH8pjJrEUN3lN0C9UXP98ix2V1nn8-ymOUkveYbd1TASRMESROjP9KmlxQMd4ezvmjgDiPoqZCzseTOHLj7Z95UucEkAR7IOCaykRFlxgvVZovR3-9MTmfc3R2-WHUxGH3vaVcvOuzn3OJ400gF-TEcm1dPsY1GzPmTSiBUhcb0gwRa0ZxnvDkAAq84xTiGbpfviwA91kHb_zoIsqFkyrv3IPNNTMFMMzzULK5QsbAMsZuPnB-mJzKRqnHqh_jK'
                            : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDohpVGc5kShGuXm7IrKcEmTc5pA7sF6tcI5BKTZ72itrgvz_MQoJbz48zDHyANUu48ab20iD_63iMxnMukydIcPkfHA7UeLFdDyyGO4t5ZAB15VA4PiUWdbUeDxaPKetYXbuLskanw9Uhjqkus3s_MSudwP9MSYtGI3ysCacySC15M38hnoI6Yzasn-oAAtvQGOQv1_90ZHrJCc0-jB0T35U5nWSASemsJKw0g_9ROLrRZQEHAr_ObQ4UhHDSOItFpjYWYCg0NrfIK'
                          }
                          alt={meeting.advisor}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{meeting.title}</p>
                        <p className="text-xs text-slate-500">{meeting.advisor}</p>
                      </div>
                    </div>
                    <div className={`${meeting.subtle ? 'bg-slate-100 text-slate-600' : 'bg-primary/10 text-primary'} px-3 py-1 rounded-full text-[10px] font-bold`}>
                      {meeting.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock3 size={14} />
                      {meeting.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video size={14} />
                      {meeting.mode}
                    </span>
                  </div>
                  <button
                    className={`w-full py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition ${
                      meeting.subtle
                        ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg hover:brightness-110'
                    }`}
                  >
                    {meeting.cta}
                  </button>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold px-1">Historial de reuniones</h3>
              <Card className="p-0 divide-y divide-slate-100">
                {historyItems.map((item) => (
                  <div
                    key={item.title}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-500">{item.date}</p>
                      </div>
                    </div>
                    <button className="p-2 opacity-0 group-hover:opacity-100 text-primary transition-opacity flex items-center gap-1 text-xs font-bold">
                      <Download size={14} />
                      Rec
                    </button>
                  </div>
                ))}
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Citas;
