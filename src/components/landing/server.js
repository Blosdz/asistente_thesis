import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = Number(process.env.TTS_PORT || 3001);
const apiKey = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    'No se encontro OPEN_AI_KEY ni OPENAI_API_KEY en el archivo .env',
  );
}

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey,
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      voice = 'coral',
      instructions = 'Habla en español latino, con tono cálido, natural y conversacional.',
      responseFormat = 'mp3',
    } = req.body ?? {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text es requerido' });
    }

    const speech = await client.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice,
      input: text,
      instructions,
      format: responseFormat,
    });

    const arrayBuffer = await speech.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader(
      'Content-Type',
      responseFormat === 'wav' ? 'audio/wav' : 'audio/mpeg',
    );
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('Error generando TTS:', error);
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'La clave de OpenAI no tiene cuota disponible para generar audio.',
        code: 'insufficient_quota',
      });
    }

    res.status(500).json({
      error: 'No se pudo generar el audio',
      code: 'tts_generation_failed',
    });
  }
});

app.listen(port, () => {
  console.log(`TTS server corriendo en http://localhost:${port}`);
});
