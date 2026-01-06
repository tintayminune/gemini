const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // v2 es compatible con require

const app = express();

// Middleware
app.use(cors()); // Permite peticiones desde tu frontend
app.use(express.json()); // Para leer JSON en el body

// Clave de Gemini desde variable de entorno (segura)
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_KEY) {
  console.error('¡Error! GEMINI_API_KEY no está definida en variables de entorno');
}

// Ruta principal de la API: POST /gemini
app.post('/gemini', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Falta la pregunta en el body' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: question }]
            }
          ],
          systemInstruction: {
            parts: [{
              text: "Eres un asistente alegre, cálido y experto en las costumbres, tradiciones y fiestas de Tintay y pueblos cercanos de Apurímac, Perú. Responde siempre en español, con detalles culturales ricos, fechas actualizadas, emojis festivos y mucha calidez andina."
            }]
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en Gemini API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extrae la respuesta (ajusta según la estructura real de Gemini)
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo obtener respuesta';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error al procesar la petición:', error.message);
    res.status(500).json({ error: 'Error al conectar con la IA 😔 Intenta de nuevo más tarde' });
  }
});

// Puerto dinámico para Render/Fly/Railway (3000 local)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
