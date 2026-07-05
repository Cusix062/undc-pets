/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client safely using lazy initialization
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI:', err);
    }
  }

  // API Endpoint for healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', apiConfigured: !!apiKey });
  });

  // API Route for Gemini Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Mensajes no válidos en el cuerpo.' });
      }

      if (!ai) {
        return res.json({
          text: '¡Hola! Soy el asistente virtual de **UNDC Pets**. Actualmente estoy operando en modo local porque no se ha configurado la clave API `GEMINI_API_KEY`. Puedo decirte que en el campus cuidamos a perritos muy queridos como Bobby, Firulais y Titán, y a gatitas tiernas como Luna y Sombra. ¡Por favor activa los secretos de AI Studio para hablar libremente conmigo!',
        });
      }

      // Format messages into structure for Gemini
      const prompt = messages[messages.length - 1]?.content || '';
      
      // Mapping message history to appropriate roles ('user' or 'model')
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] },
        ],
        config: {
          systemInstruction:
            'Eres "UNDC Pets AI", un asistente experto en bienestar animal y guardián virtual de la Universidad Nacional de Cañete (UNDC), Perú. Tu propósito es informar de manera empática, cariñosa y amigable sobre las mascotas que habitan el campus (Bobby el guardián de ingeniería, Luna la gata bibliotecaria, Firulais en tratamiento de cadera, Sombra la pequeña cachorrita del comedor, Titán el perro lobo protector, Milo & Otis los cachorritos del jardín botánico y Manchas la gatita fotogénica), promover el voluntariado, coordinar donaciones y guiar sobre adopciones. Proporciona respuestas claras en español, que sean entusiastas, concisas y bien estructuradas, usando formato Markdown (como negritas, listas o viñetas para que se lean fácilmente). ¡Siempre defiende el bienestar animal!',
        },
      });

      res.json({ text: response.text || 'No pude generar una respuesta. Por favor intenta de nuevo.' });
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({
        error: 'Error al procesar la solicitud de IA',
        details: error.message || String(error),
      });
    }
  });

  // API Routes for Community Posts (local dev — uses JSON file for persistence)
  const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');

  function readPosts(): any[] {
    try { return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8')); }
    catch { return []; }
  }
  function writePosts(posts: any[]) {
    try {
      const dir = path.dirname(POSTS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    }
    catch { /* ignore */ }
  }

  app.get('/api/posts', (req, res) => {
    res.json(readPosts());
  });

  app.post('/api/posts', (req, res) => {
    const posts = readPosts();
    posts.unshift({
      ...req.body,
      id: req.body.id || `post_${Date.now()}`,
      likes: req.body.likes || 0,
      commentsCount: req.body.commentsCount || 0,
      comments: req.body.comments || [],
      createdAt: new Date().toISOString(),
    });
    writePosts(posts);
    res.json(posts);
  });

  app.put('/api/posts/:id', (req, res) => {
    const posts = readPosts();
    const idx = posts.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Post not found' });
    posts[idx] = { ...posts[idx], ...req.body };
    writePosts(posts);
    res.json(posts);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
