import PlanesList from '../components/PlanesList';

export default function PlanesPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          Planes
        </p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Cotización centralizada
        </h1>
      </div>
      <PlanesList />
    </main>
  );
}
