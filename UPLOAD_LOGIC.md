# Flujo de Subida de Archivos a Google Drive

Este documento explica paso a paso cómo funciona el proceso de subida de archivos en este proyecto (ruta `POST /google/upload`), utilizando una única cuenta de Google y sin requerir interacción por cada usuario final.

## 1. Recepción del Archivo (Middleware `multer`)

Cuando el cliente (el frontend o una petición cURL) envía un archivo, lo hace a través de una petición HTTP POST con el formato `multipart/form-data`.

En nuestro archivo `server.js`, utilizamos el middleware **multer**:

```javascript
const upload = multer({ dest: path.join(__dirname, 'uploads') });
// ...
app.post('/google/upload', upload.single('file'), async (req, res) => { ... })
```

- **¿Qué hace?** Multer intercepta la petición, lee los bytes del archivo que vienen en camino y los guarda temporalmente en la carpeta local `uploads/`. Esto evita que la memoria RAM del servidor colapse si se suben archivos muy pesados.
- Al terminar su trabajo, Multer nos deja disponible la información del archivo en el objeto `req.file` (ruta temporal, nombre original, tipo mime, etc.).

## 2. Autenticación Transparente

Antes de intentar hablar con Google, el servidor debe asegurar que tiene permisos válidos:

```javascript
const auth = await authorizeWithRefreshToken();
const drive = google.drive({ version: 'v3', auth });
```

- En lugar de pedirle credenciales al usuario final, inyectamos a nuestro cliente de Google el `GOOGLE_REFRESH_TOKEN` que obtuvimos previemente y que está guardado en el archivo `.env`.
- La librería oficial de Google evalúa el estado de sus tokens. Si detecta que no hay un **Access Token** o que el anterior ya caducó, se conecta a los servidores de Google usando el Refresh Token y obtiene un Access Token nuevo de forma _automática e invisible_.

## 3. Configuración y Subida a Google Drive

Una vez con autorización, preparamos el "paquete" (metadata y contenido multimedia) que enviaremos a la API de Google Drive:

```javascript
const requestBody = { name: originalname };
if (TARGET_FOLDER_ID) {
  requestBody.parents = [TARGET_FOLDER_ID];
}
```

- **Metadatos (`requestBody`):** Le indicamos a Drive cómo queremos que se llame el archivo. Además, si configuramos un `TARGET_FOLDER_ID` en el `.env`, se lo pasamos en el arreglo `parents`. Esto es lo que le dice a Google Drive: _"No guardes esto en la raíz, ponlo dentro de esta carpeta específica"_.

```javascript
const response = await drive.files.create({
  requestBody,
  media: { mimeType: mimetype, body: fs.createReadStream(filePath) },
  fields: 'id, name, webViewLink, webContentLink',
});
```

- **Contenido (`media`):** Usamos un _Readable Stream_ (`fs.createReadStream`) para leer el archivo temporal que nos dejó Multer pasándolo hacia Google como un flujo de datos en tiempo real (stream).
- **Campos devueltos (`fields`):** Explicitamente le pedimos a Drive que en su respuesta nos regrese propiedades clave como `webViewLink` (un enlace directo para visualizar el doc) y `webContentLink` (un enlace directo de descarga).

## 4. Limpieza y Respuesta al Cliente

```javascript
// cleanup
fs.unlinkSync(filePath);

res.json({
  success: true,
  file: response.data,
  link: response.data.webViewLink,
});
```

- **Limpieza:** Una vez que Google Drive nos confirma que recibió el archivo (y nos devuelve la respuesta exitosa), ya no necesitamos el archivo temporal en nuestra carpeta local `uploads/`, por lo cual lo borramos usando `fs.unlinkSync()`. Así evitamos llenar el disco duro del servidor con basura.
- **Respuesta final:** Devolvemos un JSON al cliente (frontend) indicando que fue un éxito y adosamos la información, en especial el `link`, para que el cliente pueda guardar esta URL en tu base de datos o mostrarla al usuario final.

---

## Anexo: Código de las Funciones Principales (`server.js`)

Aquí tienes la implementación exacta de las funciones encargadas de esto en el servidor:

### 1. Función para autorizar automáticamente (Refresh Token)
Esta función lee el token persistido, se lo pasa al cliente de Google y obtiene el token de acceso actualizado.

```javascript
async function authorizeWithRefreshToken() {
  // intenta leer del disco si no está en memoria
  if (!savedRefreshToken) {
    try {
      if (REFRESH_TOKEN_PATH && fs.existsSync(REFRESH_TOKEN_PATH)) {
        const fromDisk = fs.readFileSync(REFRESH_TOKEN_PATH, 'utf8').trim();
        if (fromDisk) savedRefreshToken = fromDisk;
      }
    } catch (e) {
      console.warn('Failed reading refresh token from disk:', e.message || e);
    }
  }

  if (!savedRefreshToken)
    throw new Error('No refresh token available. Reauthorize the app.');
    
  oauth2Client.setCredentials({ refresh_token: savedRefreshToken });
  
  // getAccessToken se asegurará de traer un token válido (renovándolo automáticamente)
  await oauth2Client.getAccessToken();
  return oauth2Client;
}
```

### 2. Endpoint de Subida a Google Drive
Este controlador recibe el archivo de multer, usa la función anterior para autorizarse y realiza la inyección a Drive, manejando la asignación de carpeta y devolviendo los enlaces web.

```javascript
app.post('/google/upload', upload.single('file'), async (req, res) => {
  try {
    const auth = await authorizeWithRefreshToken();
    const drive = google.drive({ version: 'v3', auth });

    const { path: filePath, originalname, mimetype } = req.file;
    const TARGET_FOLDER_ID = process.env.TARGET_FOLDER_ID; // Proveer un ID de carpeta en .env

    const requestBody = { name: originalname };
    if (TARGET_FOLDER_ID) {
      requestBody.parents = [TARGET_FOLDER_ID];
    }

    const response = await drive.files.create({
      requestBody,
      media: { mimeType: mimetype, body: fs.createReadStream(filePath) },
      fields: 'id, name, webViewLink, webContentLink',
    });

    // limpieza local del archivo temporal
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      file: response.data,
      link: response.data.webViewLink,
    });
  } catch (err) {
    console.error('Upload failed', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
```
