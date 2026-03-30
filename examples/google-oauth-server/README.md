# Google OAuth Example Server

Ejemplo de servidor Express que demuestra el flujo **correcto y seguro** de OAuth2 con refresh tokens. Solo autorizas **una sola vez**, y luego el servidor renueva tokens automáticamente sin pedir login.

## 🔑 Cómo obtener el `refresh_token` (paso crucial)

El `refresh_token` **NO existe en la consola de Google**. Se genera ejecutando el flujo OAuth correctamente. Aquí está el proceso:

### Opción A: Script automatizado (recomendado)

Crea un archivo `.env` en esta carpeta:

```bash
GOOGLE_CLIENT_ID=TU_CLIENT_ID_DEL_JSON
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_DEL_JSON
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

Luego ejecuta el script helper (desde `examples/google-oauth-server`):

```bash
chmod +x get-refresh-token.sh
./get-refresh-token.sh
```

El script te guiará paso a paso. Al final te mostrará el `refresh_token` para copiar.

### Opción B: Manual (paso a paso)

1. **Construir URL de autorización**

Abre esto en el navegador (sustituye CLIENT_ID):

```
https://accounts.google.com/o/oauth2/v2/auth?
client_id=TU_CLIENT_ID&
redirect_uri=http://localhost:3000/oauth2callback&
response_type=code&
scope=https://www.googleapis.com/auth/drive.file&
access_type=offline&
prompt=consent
```

2. **Login y acepta permisos**

Inicia sesión con la cuenta que creó la carpeta en Drive. **Importante**: acepta que la app tenga acceso offline.

3. **Captura el código**

Te redirigirá a:

```
http://localhost:3000/oauth2callback?code=4/0AbC...XYZ
```

Copia el `code` (la parte después de `code=`).

4. **Intercambiar código por tokens**

Con curl:

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=TU_CLIENT_ID" \
  -d "client_secret=TU_CLIENT_SECRET" \
  -d "code=4/0AbC...XYZ" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=http://localhost:3000/oauth2callback"
```

Respuesta:

```json
{
  "access_token": "ya29.a0Af...",
  "expires_in": 3599,
  "refresh_token": "1//0gAbC...",
  "scope": "https://www.googleapis.com/auth/drive.file",
  "token_type": "Bearer"
}
```

**Ese `refresh_token` es el que necesitas guardar.**

---

## ✅ Flujo con el servidor corriendo

Una vez que obtengas el `refresh_token`:

1. **Guárdalo en `.env`**

```bash
GOOGLE_REFRESH_TOKEN=1//0gAbC...
```

2. **Arranca el servidor:**

```bash
npm start
```

3. **Sube un archivo:**

```bash
echo 'contenido' > /tmp/file.txt
curl -F "file=@/tmp/file.txt" http://localhost:3000/google/upload
```

El archivo aparecerá en el folder que especificaste en `UPLOAD_FOLDER_ID`.

---

## Endpoints disponibles

- `GET /google/connect` — Inicia el flujo OAuth (redirige a Google)
- `GET /oauth2callback` — Callback que Google usa (no visites directamente)
- `GET /debug/refresh-token` — Muestra el refresh token guardado (para debug; elimina en producción)
- `POST /google/upload` — Sube un archivo al folder especificado en `UPLOAD_FOLDER_ID`
- `POST /org/upload` — Sube usando service account (si está configurado)

## Service-account (organization) upload mode

If you prefer to upload files into a shared organization folder (so files land in the organization's Drive, not the user's), use the service-account endpoint `/org/upload`.

Setup:

- Create a service account in Google Cloud with the Drive API enabled. Create and download a JSON key for the service account.
- Share the destination folder in Drive with the service account email (invite it with Editor access). Obtain the `folderId` of the destination folder.

Providing the service account key (two options):

- Option B (recommended): mount the JSON key file on the server and set `SERVICE_ACCOUNT_KEY_PATH` to the file path (e.g. `/run/secrets/sa-key.json`). The server will read and parse the file at startup.
- Option A: set `SERVICE_ACCOUNT_KEY_JSON` to the JSON contents (as a single-line string) — convenient for quick tests but less ideal for production.

Example `.env` (preferred using a mounted key file):

```
SERVICE_ACCOUNT_KEY_PATH=/run/secrets/my-service-account.json
ORG_FOLDER_ID=1G-v4qZMRSsyuCWEu5oyBN46gIO2XQ0rV
```

Or, if you must use the env JSON directly:

```
SERVICE_ACCOUNT_KEY_JSON={...}  # full JSON key contents
ORG_FOLDER_ID=1G-v4qZMRSsyuCWEu5oyBN46gIO2XQ0rV
```

Then POST files to `/org/upload` (multipart/form-data, key `file`) and the server will upload them into the specified organizational folder using the service account.

Security note: keep the service account JSON secret and never expose it to the client. Store it securely on the server or in your deployment secrets manager.

## Using an OAuth2 client (upload to a specific account/folder)

If you want the server to upload files into a specific Google account/folder using an OAuth2 client ID (the same account that owns the folder), use the `/google/connect` flow to obtain a `refresh_token` for that account and then POST to `/google/upload`.

Steps summary:

1. Put your OAuth client secret JSON (the file you attached, `client_secret_*.json`) somewhere on the server, e.g. `~/.secrets/client_secret.json`.
2. Export the client id/secret and the target folder id as env vars and start the server:

```bash
export GOOGLE_CLIENT_ID=$(jq -r .web.client_id ~/.secrets/client_secret.json)
export GOOGLE_CLIENT_SECRET=$(jq -r .web.client_secret ~/.secrets/client_secret.json)
export GOOGLE_REDIRECT_URI=http://localhost:3000/google/callback
export UPLOAD_FOLDER_ID=1G-v4qZMRSsyuCWEu5oyBN46gIO2XQ0rV  # the folder you provided
export MOCK_ORG_UPLOAD=false
node server.js
```

3. In your browser, open `http://localhost:3000/google/connect` and authorize with the Google account that owns the destination folder. Make sure to grant offline access (the server requests it). The server will log that it saved a refresh token.

4. From another terminal, upload a file using the `POST /google/upload` endpoint:

```bash
echo 'archivo real' > /tmp/mock_upload.txt
curl -v -F "file=@/tmp/mock_upload.txt" http://localhost:3000/google/upload
```

If everything is correct the file will be uploaded into the folder you specified by `UPLOAD_FOLDER_ID`. If you see a 403 or permission error, double-check that the account you used to authorize is the owner or has write access to that folder.

Security notes:

- The refresh token is stored in-memory in this demo; persist it in a secure DB in production.
- Keep the client secret file secure and do not commit it to source control.
