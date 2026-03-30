import PlanesList from '../components/PlanesList';
import { getCurrentUser } from '../services/authService';
import { useEffect, useState } from 'react';

export default function PlanesPage() {
  const [estudianteId, setEstudianteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const user = await getCurrentUser();
      setEstudianteId(user?.id || null);
    }
    fetchUser();
  }, []);

  if (!estudianteId) return <div>Cargando usuario...</div>;

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Planes</h1>
      <PlanesList estudianteId={estudianteId} />
    </main>
  );
}
