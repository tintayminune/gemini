const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');  // node-fetch v2 funciona perfecto con require

const app = express();
app.use(cors());
app.use(express.json());

// La clave real viene de variables de entorno (Render)
const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.post('/gemini', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Falta la pregunta' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: question }] }],
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
      throw new Error(`Error Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    res.json({ reply });
  } catch (error) {
    console.error('Error en Gemini:', error.message);
    res.status(500).json({ error: 'Error al conectar con la IA 😔 Intenta más tarde' });
  }
});

// Puerto que usa Render (dinámico)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API escuchando en puerto ${port}`);
});