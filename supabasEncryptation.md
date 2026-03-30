-- Crear extensión si no está
create extension if not exists vault;

-- Guardar el secreto una sola vez
select vault.create_secret(
'thesis-asistant',
'at_estudiante_crypto_key',
'Ammyt1010'
);
