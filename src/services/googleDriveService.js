/**
 * Google Drive Service
 * Manages OAuth2, Google Picker, and Drive API interactions.
 */

// These should be configured in an .env file or provided by the user
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install';

let tokenClient;
let accessToken = null;
let pickerApiLoaded = false;

/**
 * Carga los scripts necesarios de Google (gapi y gsi).
 */
export async function loadGoogleScripts() {
  return new Promise((resolve) => {
    const scriptGapi = document.createElement('script');
    scriptGapi.src = 'https://apis.google.com/js/api.js';
    scriptGapi.onload = () => {
      window.gapi.load('client:picker', async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        pickerApiLoaded = true;
        resolve();
      });
    };
    document.body.appendChild(scriptGapi);

    const scriptGsi = document.createElement('script');
    scriptGsi.src = 'https://accounts.google.com/gsi/client';
    scriptGsi.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error !== undefined) {
            throw response;
          }
          accessToken = response.access_token;
        },
      });
    };
    document.body.appendChild(scriptGsi);
  });
}

/**
 * Solicita el token de acceso al usuario.
 */
export function authenticate() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error !== undefined) {
        reject(response);
      }
      accessToken = response.access_token;
      resolve(accessToken);
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/**
 * Abre el Google Picker para seleccionar o subir archivos.
 * @param {Function} onSelect Callback al seleccionar un archivo.
 */
export async function openPicker(onSelect) {
  if (!pickerApiLoaded) {
    await loadGoogleScripts();
  }

  if (!accessToken) {
    await authenticate();
  }

  const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
  view.setMimeTypes('application/vnd.google-apps.document,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  const picker = new window.google.picker.PickerBuilder()
    .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
    .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
    .setDeveloperKey(API_KEY)
    .setAppId(CLIENT_ID)
    .setOAuthToken(accessToken)
    .addView(view)
    .addView(new window.google.picker.DocsUploadView())
    .setCallback((data) => {
      if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
        const doc = data[window.google.picker.Response.DOCUMENTS][0];
        onSelect({
          id: doc[window.google.picker.Document.ID],
          name: doc[window.google.picker.Document.NAME],
          url: doc[window.google.picker.Document.URL],
          mimeType: doc[window.google.picker.Document.MIME_TYPE],
        });
      }
    })
    .build();
  picker.setVisible(true);
}

/**
 * Crea una carpeta para el estudiante si no existe.
 * @param {string} folderName Nombre de la carpeta (ej. nombre del estudiante).
 * @returns {string} ID de la carpeta creada.
 */
export async function createStudentFolder(folderName) {
  if (!accessToken) await authenticate();

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  try {
    const response = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });
    return response.result.id;
  } catch (err) {
    console.error('Error creating folder:', err);
    throw err;
  }
}
