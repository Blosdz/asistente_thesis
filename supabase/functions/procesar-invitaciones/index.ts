import { createClient } from 'npm:@supabase/supabase-js@2';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

function resolveLoginRedirectUrl() {
  const explicitLoginUrl = Deno.env.get('APP_LOGIN_URL');
  if (explicitLoginUrl) {
    return explicitLoginUrl;
  }

  const appUrl =
    Deno.env.get('APP_URL') ||
    'https://asistentethesis-production.up.railway.app';

  return appUrl.endsWith('/login') ? appUrl : `${appUrl}/login`;
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const loginRedirectUrl = resolveLoginRedirectUrl();

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY',
        }),
        { status: 500, headers: jsonHeaders },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: pendientes, error: pendientesError } = await supabaseAdmin
      .schema('AT')
      .from('invitaciones_pendientes')
      .select('id, email, nombre, payload, intentos')
      .eq('estado', 'pendiente')
      .order('creado_en', { ascending: true })
      .limit(5);

    if (pendientesError) {
      throw pendientesError;
    }

    const resultados: Array<{
      id: string;
      email: string;
      estado: string;
      detalle?: string;
    }> = [];

    for (const inv of pendientes ?? []) {
      try {
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email: inv.email,
            options: {
              data: inv.payload?.user_metadata ?? {},
              redirectTo: loginRedirectUrl,
            },
          });

        if (linkError) throw linkError;
        const actionLink = linkData?.properties?.action_link;

        if (!actionLink) {
          throw new Error('No se pudo generar action_link');
        }

        // Aquí mandas el correo con tu proveedor propio
        // usando actionLink

        const { error: updateOkError } = await supabaseAdmin
          .schema('AT')
          .from('invitaciones_pendientes')
          .update({
            estado: 'link_generado',
            payload: {
              ...(inv.payload ?? {}),
              action_link: actionLink,
            },
            enviado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString(),
            ultimo_error: null,
            intentos: (inv.intentos ?? 0) + 1,
          })
          .eq('id', inv.id);

        if (updateOkError) throw updateOkError;

        resultados.push({
          id: inv.id,
          email: inv.email,
          estado: 'link_generado',
        });
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : 'Error desconocido';

        await supabaseAdmin
          .schema('AT')
          .from('invitaciones_pendientes')
          .update({
            estado: 'pendiente',
            intentos: (inv.intentos ?? 0) + 1,
            ultimo_error: mensaje,
            actualizado_en: new Date().toISOString(),
          })
          .eq('id', inv.id);

        resultados.push({
          id: inv.id,
          email: inv.email,
          estado: 'error',
          detalle: mensaje,
        });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        procesadas: resultados.length,
        resultados,
      }),
      {
        headers: jsonHeaders,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
