import { reunionesApi } from '../api/reuniones.api';

const unwrap = (data) => data?.data || data;

export async function crearGoogleMeetAdmin(payload = {}) {
  const reunionId = payload.reunion_id || payload.reunionId;

  if (!reunionId) {
    throw new Error('Se requiere reunion_id para crear Google Meet');
  }

  return unwrap(await reunionesApi.crearGoogleMeet(reunionId));
}
