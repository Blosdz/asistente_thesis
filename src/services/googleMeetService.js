import { supabase } from '../lib/supabase';

const DEFAULT_MEET_FUNCTION_NAME =
  import.meta.env.VITE_SUPABASE_MEET_FUNCTION_NAME || 'create-meet-link';

function resolveMeetUrl(payload) {
  if (!payload || typeof payload !== 'object') return null;

  return (
    payload.enlace_reunion ||
    payload.meet_link ||
    payload.meeting_link ||
    payload.meetingUri ||
    payload.hangoutLink ||
    payload.url ||
    payload.data?.enlace_reunion ||
    payload.data?.meet_link ||
    payload.data?.meeting_link ||
    payload.data?.meetingUri ||
    payload.data?.hangoutLink ||
    payload.data?.url ||
    null
  );
}

export async function crearGoogleMeetAdmin(payload) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Usuario no autenticado');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${DEFAULT_MEET_FUNCTION_NAME}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error || result.message || 'No se pudo crear el Google Meet',
    );
  }

  const meetUrl = resolveMeetUrl(result);

  if (!meetUrl) {
    throw new Error(
      'La función de Google Meet no devolvió un enlace de reunión',
    );
  }

  return {
    ...result,
    enlace_reunion: meetUrl,
  };
}
