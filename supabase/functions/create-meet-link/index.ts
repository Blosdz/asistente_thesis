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

const MIN_MEETING_DURATION_MINUTES = 45;

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

function normalizeText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildFullName(firstName?: string | null, lastName?: string | null) {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return fullName || null;
}

function assertMinimumMeetingDuration(startAt: string, endAt: string) {
  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Las fechas de la reunión no son válidas");
  }

  if (endDate <= startDate) {
    throw new Error("La fecha fin debe ser mayor que la fecha inicio");
  }

  const durationMinutes = Math.round(
    (endDate.getTime() - startDate.getTime()) / 60000,
  );

  if (durationMinutes < MIN_MEETING_DURATION_MINUTES) {
    throw new Error(
      `La reunión debe durar al menos ${MIN_MEETING_DURATION_MINUTES} minutos`,
    );
  }
}

async function getAuthUserEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  authUserId?: string | null,
) {
  if (!authUserId) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(
    authUserId,
  );

  if (error) {
    console.error("No se pudo obtener email del usuario auth", {
      authUserId,
      error,
    });
    return null;
  }

  return normalizeText(data.user?.email ?? null);
}

async function enrichMeetingParticipants(
  supabaseAdmin: ReturnType<typeof createClient>,
  payload: MeetRequest,
) {
  let advisorName = normalizeText(payload.advisor_name);
  let advisorEmail = normalizeText(payload.advisor_email);
  let advisorPublicEmail: string | null = null;
  let studentName = normalizeText(payload.student_name);
  let studentEmail = normalizeText(payload.student_email);

  const advisorId = normalizeText(payload.advisor_id);
  const studentId = normalizeText(payload.student_id);

  const userIds = [advisorId, studentId].filter((value): value is string =>
    Boolean(value)
  );

  const authUsersById = new Map<string, string | null>();

  if (userIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .schema("AT")
      .from("usuarios")
      .select("id, auth_usuario_id")
      .in("id", userIds);

    if (error) {
      console.error("No se pudo resolver usuarios para la reunión", error);
    } else {
      for (const row of data ?? []) {
        authUsersById.set(
          row.id as string,
          row.auth_usuario_id as string | null,
        );
      }
    }
  }

  if (advisorId && (!advisorName || !advisorEmail)) {
    const { data, error } = await supabaseAdmin
      .schema("AT")
      .from("perfil_publico_asesor")
      .select("nombre_mostrar, email_publico")
      .eq("asesor_id", advisorId)
      .maybeSingle();

    if (error) {
      console.error("No se pudo resolver perfil público del asesor", error);
    } else {
      advisorName = advisorName || normalizeText(data?.nombre_mostrar ?? null);
      advisorPublicEmail = normalizeText(data?.email_publico ?? null);
    }
  }

  if (studentId && !studentName) {
    const { data, error } = await supabaseAdmin
      .schema("AT")
      .from("perfil_estudiante")
      .select("nombres, apellidos")
      .eq("estudiante_id", studentId)
      .maybeSingle();

    if (error) {
      console.error("No se pudo resolver perfil del estudiante", error);
    } else {
      studentName = buildFullName(
        data?.nombres ?? null,
        data?.apellidos ?? null,
      );
    }
  }

  if (!advisorEmail && advisorId) {
    advisorEmail = await getAuthUserEmail(
      supabaseAdmin,
      authUsersById.get(advisorId) ?? null,
    );
  }

  advisorEmail = advisorEmail || advisorPublicEmail;

  if (!studentEmail && studentId) {
    studentEmail = await getAuthUserEmail(
      supabaseAdmin,
      authUsersById.get(studentId) ?? null,
    );
  }

  return {
    ...payload,
    advisor_name: advisorName,
    advisor_email: advisorEmail,
    student_name: studentName,
    student_email: studentEmail,
  };
}

function buildSummary(payload: MeetRequest) {
  const studentName = normalizeText(payload.student_name) || "Estudiante";
  const advisorName = normalizeText(payload.advisor_name) || "Asesor";

  return `Reunion Tesis ${studentName} - ${advisorName}`;
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

function buildAttendees(payload: MeetRequest) {
  const attendees = [
    {
      email: normalizeText(payload.advisor_email),
      displayName: normalizeText(payload.advisor_name),
    },
    {
      email: normalizeText(payload.student_email),
      displayName: normalizeText(payload.student_name),
    },
  ].filter((attendee) => attendee.email).map((attendee) => ({
    email: attendee.email as string,
    ...(attendee.displayName ? { displayName: attendee.displayName } : {}),
  }));

  return attendees.filter((attendee, index, collection) =>
    collection.findIndex((item) => item.email === attendee.email) === index
  );
}

async function createGoogleCalendarEvent(
  supabaseAdmin: ReturnType<typeof createClient>,
  accessToken: string,
  payload: MeetRequest,
) {
  const resolvedPayload = await enrichMeetingParticipants(
    supabaseAdmin,
    payload,
  );
  const preferredCalendarId = normalizeText(resolvedPayload.advisor_email);
  const defaultCalendarId = normalizeText(Deno.env.get("GOOGLE_CALENDAR_ID")) ||
    "primary";
  const startAt = resolveDateTime(
    resolvedPayload.start_at,
    resolvedPayload.inicio,
  );
  const endAt = resolveDateTime(
    resolvedPayload.end_at,
    resolvedPayload.fin,
  );

  if (!startAt || !endAt) {
    throw new Error("Faltan start_at/inicio o end_at/fin para crear el Meet");
  }

  assertMinimumMeetingDuration(startAt, endAt);

  const attendees = buildAttendees(resolvedPayload);
  const calendarIds = preferredCalendarId &&
      preferredCalendarId !== defaultCalendarId
    ? [preferredCalendarId, defaultCalendarId]
    : [defaultCalendarId];

  const eventPayload = {
    summary: buildSummary(resolvedPayload),
    description: buildDescription(resolvedPayload),
    location: resolvedPayload.location || null,
    start: { dateTime: startAt },
    end: { dateTime: endAt },
    attendees,
    guestsCanSeeOtherGuests: true,
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  let lastError: Error | null = null;

  for (const calendarId of calendarIds) {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${
        encodeURIComponent(calendarId)
      }/events?conferenceDataVersion=1&sendUpdates=${
        attendees.length > 0 ? "all" : "none"
      }`,
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

    if (res.ok) {
      return {
        eventData: json,
        calendarIdUsed: calendarId,
        resolvedPayload,
      };
    }

    lastError = new Error(
      `Error creando evento en Google Calendar (${calendarId}): ${
        JSON.stringify(json)
      }`,
    );

    if (calendarId === defaultCalendarId || calendarIds.length === 1) {
      throw lastError;
    }

    console.warn(
      "No se pudo crear la reunión en el calendario del asesor. Se intentará con el calendario por defecto.",
      {
        advisorEmail: preferredCalendarId,
        fallbackCalendarId: defaultCalendarId,
        error: json,
      },
    );
  }

  throw lastError ?? new Error("No se pudo crear el evento en Google Calendar");
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

async function saveDirectMeetingSuccess(
  supabaseAdmin: ReturnType<typeof createClient>,
  reunionId: string,
  eventData: Record<string, unknown>,
  meetUrl: string,
) {
  const meetCode =
    (eventData.conferenceData as { conferenceId?: string } | undefined)
      ?.conferenceId ?? null;
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .schema("AT")
    .from("reuniones_asesor")
    .update({
      enlace_reunion: meetUrl,
      google_event_id: eventData.id ?? null,
      meet_codigo: meetCode,
      meet_creado_en: now,
      meet_error: null,
      actualizado_en: now,
    })
    .eq("id", reunionId);

  if (error) {
    throw error;
  }
}

async function syncValidationCitaMeetingSuccess(
  supabaseAdmin: ReturnType<typeof createClient>,
  validationCitaId: string,
  reunionId: string | null,
  meetUrl: string,
) {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    enlace_reunion: meetUrl,
    updated_at: now,
  };

  if (reunionId) {
    payload.meeting_id = reunionId;
  }

  payload.status = "confirmed";

  const { error } = await supabaseAdmin
    .schema("AT")
    .from("validation_cita")
    .update(payload)
    .eq("id", validationCitaId);

  if (error) {
    throw error;
  }
}

async function saveDirectMeetingError(
  supabaseAdmin: ReturnType<typeof createClient>,
  reunionId: string,
  errorMessage: string,
) {
  const { error } = await supabaseAdmin
    .schema("AT")
    .from("reuniones_asesor")
    .update({
      meet_error: errorMessage,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", reunionId);

  if (error) {
    console.error("No se pudo guardar meet_error en reuniones_asesor", error);
  }
}

async function processQueueItem(
  supabaseAdmin: ReturnType<typeof createClient>,
  accessToken: string,
  item: QueueItem,
) {
  try {
    const { eventData, calendarIdUsed } = await createGoogleCalendarEvent(
      supabaseAdmin,
      accessToken,
      {
        reunion_id: item.reunion_id,
        cola_id: item.cola_id,
        pago_id: item.pago_id,
        advisor_id: item.asesor_id,
        student_id: item.estudiante_id,
        inicio: item.inicio,
        fin: item.fin,
        motivo: item.motivo,
        notas: item.notas,
        description:
          item.notas ||
          "Reunion creada automaticamente tras validacion de pago.",
      },
    );

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
      calendar_id_used: calendarIdUsed,
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
      try {
        const { eventData, calendarIdUsed, resolvedPayload } =
          await createGoogleCalendarEvent(supabaseAdmin, accessToken, body);
        const meetUrl = extractMeetUrl(eventData);

        if (!meetUrl) {
          throw new Error(
            "Google Calendar creo el evento, pero no devolvio enlace Meet",
          );
        }

        if (body.reunion_id) {
          await saveDirectMeetingSuccess(
            supabaseAdmin,
            body.reunion_id,
            eventData,
            meetUrl,
          );
        }

        if (body.validation_cita_id) {
          await syncValidationCitaMeetingSuccess(
            supabaseAdmin,
            body.validation_cita_id,
            body.reunion_id ?? null,
            meetUrl,
          );
        }

        return jsonResponse({
          ok: true,
          mode: "direct",
          space_id: null,
          reunion_id: body.reunion_id ?? null,
          event_id: eventData.id ?? null,
          calendar_id_used: calendarIdUsed,
          meet_link: meetUrl,
          enlace_reunion: meetUrl,
          meetingUri: meetUrl,
          advisor_email: resolvedPayload.advisor_email ?? null,
          student_email: resolvedPayload.student_email ?? null,
          title: buildSummary(resolvedPayload),
          meetingCode:
            (eventData.conferenceData as { conferenceId?: string } | undefined)
              ?.conferenceId ?? null,
          meetingEvent: eventData,
        });
      } catch (error) {
        if (body.reunion_id) {
          await saveDirectMeetingError(
            supabaseAdmin,
            body.reunion_id,
            error instanceof Error ? error.message : "Error desconocido",
          );
        }

        throw error;
      }
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
