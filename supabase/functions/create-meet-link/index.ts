import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type MeetRequest = {
  advisor_id?: string | null;
  advisor_name?: string | null;
  advisor_email?: string | null;
  student_id?: string | null;
  student_name?: string | null;
  student_email?: string | null;
  thesis_id?: string | null;
  thesis_title?: string | null;
  validation_cita_id?: string | null;
  reunion_id?: string | null;
  cola_id?: string | null;
  pago_id?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  inicio?: string | null;
  fin?: string | null;
  motivo?: string | null;
  notas?: string | null;
  title?: string | null;
  description?: string | null;
  modalidad?: string | null;
  location?: string | null;
  process_queue?: boolean | null;
  batch_size?: number | null;
};

type QueueItem = {
  cola_id: string;
  reunion_id: string;
  pago_id: string;
  asesor_id?: string | null;
  estudiante_id?: string | null;
  inicio: string;
  fin: string;
  motivo?: string | null;
  notas?: string | null;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getGoogleOAuthEnv(name: string) {
  return Deno.env.get(`GOOGLE_MEET_OAUTH_${name}`) ??
    Deno.env.get(`GOOGLE_OAUTH_${name}`);
}

async function getGoogleAccessToken() {
  const clientId = getGoogleOAuthEnv("CLIENT_ID");
  const clientSecret = getGoogleOAuthEnv("CLIENT_SECRET");
  const refreshToken = getGoogleOAuthEnv("REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Faltan credenciales OAuth de Google para Calendar/Meet",
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      `Error obteniendo access token de Google: ${JSON.stringify(json)}`,
    );
  }

  return json.access_token as string;
}

function resolveDateTime(
  primary?: string | null,
  fallback?: string | null,
) {
  return primary || fallback || null;
}

function buildSummary(payload: MeetRequest) {
  if (payload.title?.trim()) return payload.title.trim();
  if (payload.motivo?.trim()) return payload.motivo.trim();
  if (payload.thesis_title?.trim()) {
    return `Asesoria de tesis - ${payload.thesis_title.trim()}`;
  }
  if (payload.advisor_name?.trim() && payload.student_name?.trim()) {
    return `Asesoria entre ${payload.advisor_name.trim()} y ${
      payload.student_name.trim()
    }`;
  }
  return "Asesoria de tesis";
}

function buildDescription(payload: MeetRequest) {
  const parts = [
    payload.description?.trim(),
    payload.notas?.trim(),
    payload.validation_cita_id
      ? `validation_cita_id: ${payload.validation_cita_id}`
      : null,
    payload.reunion_id ? `reunion_id: ${payload.reunion_id}` : null,
    payload.pago_id ? `pago_id: ${payload.pago_id}` : null,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join("\n\n")
    : "Reunion creada automaticamente tras validacion de pago.";
}

async function createGoogleCalendarEvent(
  accessToken: string,
  payload: MeetRequest,
) {
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID") || "primary";
  const startAt = resolveDateTime(payload.start_at, payload.inicio);
  const endAt = resolveDateTime(payload.end_at, payload.fin);

  if (!startAt || !endAt) {
    throw new Error("Faltan start_at/inicio o end_at/fin para crear el Meet");
  }

  const eventPayload = {
    summary: buildSummary(payload),
    description: buildDescription(payload),
    location: payload.location || null,
    start: { dateTime: startAt },
    end: { dateTime: endAt },
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${
      encodeURIComponent(calendarId)
    }/events?conferenceDataVersion=1&sendUpdates=none`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    },
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      `Error creando evento en Google Calendar: ${JSON.stringify(json)}`,
    );
  }

  return json;
}

function extractMeetUrl(eventData: Record<string, unknown>) {
  const conferenceData = eventData.conferenceData as
    | {
      entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
    }
    | undefined;

  return (eventData.hangoutLink as string | undefined) ||
    conferenceData?.entryPoints?.find((item) =>
      item.entryPointType === "video" && item.uri
    )?.uri ||
    null;
}

async function processQueueItem(
  supabaseAdmin: ReturnType<typeof createClient>,
  accessToken: string,
  item: QueueItem,
) {
  try {
    const eventData = await createGoogleCalendarEvent(accessToken, {
      reunion_id: item.reunion_id,
      cola_id: item.cola_id,
      pago_id: item.pago_id,
      inicio: item.inicio,
      fin: item.fin,
      motivo: item.motivo,
      notas: item.notas,
      title: item.motivo || "Asesoria de tesis",
      description:
        item.notas || "Reunion creada automaticamente tras validacion de pago.",
    });

    const enlace = extractMeetUrl(eventData);
    const meetCode =
      (eventData.conferenceData as { conferenceId?: string } | undefined)
        ?.conferenceId ?? null;

    if (!enlace) {
      throw new Error(
        "Google devolvio el evento pero no devolvio un enlace de Meet",
      );
    }

    const { error: saveError } = await supabaseAdmin.rpc(
      "guardar_resultado_google_meet",
      {
        p_cola_id: item.cola_id,
        p_reunion_id: item.reunion_id,
        p_google_event_id: eventData.id ?? null,
        p_enlace_reunion: enlace,
        p_meet_codigo: meetCode,
        p_error: null,
      },
    );

    if (saveError) {
      throw saveError;
    }

    return {
      ok: true,
      cola_id: item.cola_id,
      reunion_id: item.reunion_id,
      google_event_id: eventData.id ?? null,
      meet_link: enlace,
      meet_codigo: meetCode,
    };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Error desconocido";

    await supabaseAdmin.rpc("guardar_resultado_google_meet", {
      p_cola_id: item.cola_id,
      p_reunion_id: item.reunion_id,
      p_google_event_id: null,
      p_enlace_reunion: null,
      p_meet_codigo: null,
      p_error: errorMessage,
    });

    return {
      ok: false,
      cola_id: item.cola_id,
      reunion_id: item.reunion_id,
      error: errorMessage,
    };
  }
}

function isDirectCreationRequest(payload: MeetRequest) {
  return Boolean(
    payload.start_at || payload.end_at || payload.inicio || payload.fin ||
      payload.title || payload.description || payload.validation_cita_id,
  ) && payload.process_queue !== true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo no permitido" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        { error: "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY" },
        500,
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json().catch(() => ({})) as MeetRequest;
    const accessToken = await getGoogleAccessToken();

    if (isDirectCreationRequest(body)) {
      const eventData = await createGoogleCalendarEvent(accessToken, body);
      const meetUrl = extractMeetUrl(eventData);

      if (!meetUrl) {
        throw new Error(
          "Google Calendar creo el evento, pero no devolvio enlace Meet",
        );
      }

      return jsonResponse({
        ok: true,
        mode: "direct",
        space_id: null,
        event_id: eventData.id ?? null,
        meet_link: meetUrl,
        enlace_reunion: meetUrl,
        meetingUri: meetUrl,
        meetingCode:
          (eventData.conferenceData as { conferenceId?: string } | undefined)
            ?.conferenceId ?? null,
        meetingEvent: eventData,
      });
    }

    const batchSize = Math.max(1, Math.min(Number(body.batch_size ?? 1), 10));
    const resultados: Array<Record<string, unknown>> = [];

    for (let i = 0; i < batchSize; i += 1) {
      const { data: cola, error: takeError } = await supabaseAdmin.rpc(
        "tomar_cola_google_meet",
      );

      if (takeError) {
        throw takeError;
      }

      const item = (Array.isArray(cola) ? cola[0] : null) as QueueItem | null;

      if (!item) {
        break;
      }

      resultados.push(
        await processQueueItem(supabaseAdmin, accessToken, item),
      );
    }

    return jsonResponse({
      ok: true,
      mode: "queue",
      processed: resultados.length,
      results: resultados,
      message: resultados.length > 0
        ? "Procesamiento de Google Meet completado"
        : "Sin trabajos pendientes",
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      500,
    );
  }
});
