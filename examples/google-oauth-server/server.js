require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

const upload = multer({ dest: path.join(__dirname, 'uploads') });
const app = express();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/google/callback';
const PORT = process.env.PORT || 3000;

// Demo persistence: replace with DB in production
let savedRefreshToken = process.env.GOOGLE_REFRESH_TOKEN || null;
const REFRESH_TOKEN_PATH =
  process.env.REFRESH_TOKEN_PATH ||
  path.join(os.homedir(), '.secrets', 'google_refresh_token.txt');

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

const MOCK_ORG_UPLOAD = process.env.MOCK_ORG_UPLOAD === 'true';

// Helper: create an auth client for service account (organization uploads)
function getServiceAccountAuth() {
  // Prefer a file path if provided (sa key file mounted on disk)
  const keyPath = process.env.SERVICE_ACCOUNT_KEY_PATH;
  const keyJson = process.env.SERVICE_ACCOUNT_KEY_JSON;

  let credentials = null;
  if (keyPath) {
    try {
      const raw = fs.readFileSync(keyPath, 'utf8');
      credentials = JSON.parse(raw);
    } catch (e) {
      console.error(
        'Failed to read or parse SERVICE_ACCOUNT_KEY_PATH',
        e.message || e,
      );
      return null;
    }
  } else if (keyJson) {
    try {
      credentials = JSON.parse(keyJson);
    } catch (e) {
      console.error('Invalid SERVICE_ACCOUNT_KEY_JSON');
      return null;
    }
  } else {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return auth;
}

app.get('/', (req, res) => res.send('Google OAuth example server'));

app.get('/google/connect', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/drive.file'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  res.redirect(url);
});

// Debug endpoint: show refresh token for copying (remove in production)
app.get('/debug/refresh-token', (req, res) => {
  if (!savedRefreshToken) {
    try {
      if (REFRESH_TOKEN_PATH && fs.existsSync(REFRESH_TOKEN_PATH)) {
        const fromDisk = fs.readFileSync(REFRESH_TOKEN_PATH, 'utf8').trim();
        if (fromDisk) savedRefreshToken = fromDisk;
      }
    } catch (e) {
      // ignore
    }
  }

  if (savedRefreshToken) {
    res.json({
      refresh_token: savedRefreshToken,
      note: 'Keep this safe. Use it as GOOGLE_REFRESH_TOKEN in production.',
      stored_at: REFRESH_TOKEN_PATH,
    });
  } else {
    res.status(404).json({
      error: 'No refresh token available. Authorize first at /google/connect',
    });
  }
});

app.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  if (error) {
    console.error(
      '❌ OAuth error from Google:',
      error,
      req.query.error_description,
    );
    return res
      .status(400)
      .send(
        `<h1>Authorization Error</h1><p>${error}: ${req.query.error_description || ''}</p>`,
      );
  }

  if (!code) return res.status(400).send('Missing code');

  try {
    console.log('🔄 Exchanging code for tokens...');
    console.log('  code:', code.substring(0, 20) + '...');
    console.log('  client_id:', CLIENT_ID);
    console.log('  redirect_uri:', REDIRECT_URI);

    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const tokens = response.data;

    console.log('✅ Token exchange successful!');
    console.log(
      '  access_token:',
      tokens.access_token?.substring(0, 20) + '...',
    );
    console.log('  refresh_token:', tokens.refresh_token ? 'YES' : 'NO');

    if (tokens.refresh_token) {
      savedRefreshToken = tokens.refresh_token;
      console.log(
        '💾 Saved refresh token (demo). Persist this securely in DB.',
      );
      try {
        const dir = path.dirname(REFRESH_TOKEN_PATH);
        if (!fs.existsSync(dir))
          fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
        fs.writeFileSync(REFRESH_TOKEN_PATH, tokens.refresh_token, {
          mode: 0o600,
        });
        console.log('✅ Refresh token written to', REFRESH_TOKEN_PATH);
      } catch (e) {
        console.warn(
          '⚠️  Could not persist refresh token to disk:',
          e.message || e,
        );
      }
    } else {
      console.log(
        '⚠️  No refresh_token returned. Ensure prompt=consent & access_type=offline.',
      );
    }

    oauth2Client.setCredentials(tokens);
    // Show a nice message with the refresh token and next steps
    res.send(`
      <html>
        <head><title>Authorization Complete</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>✅ Authorization Complete</h1>
          <p>Your refresh token has been saved securely.</p>
          <p><strong>Next steps:</strong></p>
          <ol>
            <li>Visit <code>http://localhost:3000/debug/refresh-token</code> to view and copy your refresh token</li>
            <li>Save it in your .env or secrets manager as <code>GOOGLE_REFRESH_TOKEN</code></li>
            <li>You can now close this window and upload files using <code>POST /google/upload</code></li>
          </ol>
          <p><a href="http://localhost:3000/debug/refresh-token">View your refresh token →</a></p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ 🔥 Token exchange FAILED');
    console.error('Error message:', err.message);
    if (err.response?.data) {
      console.error(
        'Google error response:',
        JSON.stringify(err.response.data, null, 2),
      );
    }
    if (err.stack) {
      console.error('Stack:', err.stack);
    }

    const errorData = err.response?.data || { error: err.message };
    res.status(500).send(`
      <html>
        <head><title>Authorization Failed</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>❌ Token Exchange Failed</h1>
          <p><strong>Error:</strong> ${errorData.error || 'Unknown error'}</p>
          <p><strong>Description:</strong> ${errorData.error_description || errorData.message || 'No description'}</p>
          <pre style="background: #f0f0f0; padding: 10px; border-radius: 4px;">
${JSON.stringify(errorData, null, 2)}
          </pre>
          <p><a href="http://localhost:3000/google/connect">Try again →</a></p>
        </body>
      </html>
    `);
  }
});

async function authorizeWithRefreshToken() {
  // try read from disk if not in-memory
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
  // getAccessToken will ensure a valid access token (may renew using refresh_token)
  await oauth2Client.getAccessToken();
  return oauth2Client;
}

app.post('/google/upload', upload.single('file'), async (req, res) => {
  try {
    const auth = await authorizeWithRefreshToken();
    const drive = google.drive({ version: 'v3', auth });

    const { path: filePath, originalname, mimetype } = req.file;
    const TARGET_FOLDER_ID = process.env.TARGET_FOLDER_ID; // Provide the folder ID in your .env

    const requestBody = { name: originalname };
    if (TARGET_FOLDER_ID) {
      requestBody.parents = [TARGET_FOLDER_ID];
    }

    const response = await drive.files.create({
      requestBody,
      media: { mimeType: mimetype, body: fs.createReadStream(filePath) },
      fields: 'id, name, webViewLink, webContentLink',
    });

    // cleanup
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

// Organization upload using a service account and a fixed folderId
// This uploads files always into the organization's folder (ORG_FOLDER_ID)
app.post('/org/upload', upload.single('file'), async (req, res) => {
  try {
    const ORG_FOLDER_ID = process.env.ORG_FOLDER_ID;
    if (!ORG_FOLDER_ID) throw new Error('ORG_FOLDER_ID not configured');
    const { path: filePath, originalname, mimetype } = req.file;

    if (MOCK_ORG_UPLOAD) {
      // Simulate upload: return fake ID and cleanup
      const fake = { id: `mock_${Date.now()}`, name: originalname };
      fs.unlinkSync(filePath);
      return res.json({ success: true, file: fake, mocked: true });
    }

    const auth = getServiceAccountAuth();
    if (!auth)
      throw new Error(
        'Service account credentials not configured (SERVICE_ACCOUNT_KEY_JSON)',
      );

    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });

    const response = await drive.files.create({
      requestBody: {
        name: originalname,
        parents: [ORG_FOLDER_ID],
      },
      media: { mimeType: mimetype, body: fs.createReadStream(filePath) },
      fields: 'id, name',
    });

    fs.unlinkSync(filePath);
    res.json({ success: true, file: response.data });
  } catch (err) {
    console.error('Org upload failed', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`Example server listening on http://localhost:${PORT}`),
);
