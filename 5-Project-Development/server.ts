import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

// Resilient helper with automatic fallback for high demand (503/429)
async function generateWithFallback(params: Omit<Parameters<typeof ai.models.generateContent>[0], 'model'>) {
  let lastError: any;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err?.message || err);
      lastError = err;
      // If it's not a temporary error (e.g. invalid argument), we might still try next or rethrow
    }
  }
  throw lastError;
}

// API: Explain a topic simply for students
app.post('/api/explain', async (req, res) => {
  try {
    const { topic, gradeLevel = 'General Student' } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please enter a valid question or topic.' });
    }

    const systemInstruction = `You are EduGenie, a world-class, enthusiastic, and supportive learning assistant designed specifically for students.
Your mission is to make learning simple, exciting, and crystal-clear.
Target audience: ${gradeLevel}.
Language tone: Friendly, warm, encouraging, engaging, and easy to understand.
Avoid jargon where possible, or clearly define it with relatable examples.
Use rich, nicely formatted markdown with emoji accents.`;

    const prompt = `Please provide a simple, engaging, and clear explanation for the student's question/topic:
"${topic.trim()}"

Structure your response clearly with these sections:
1. 💡 **In a Nutshell**: A simple 1-2 sentence core definition that anyone can grasp immediately.
2. 🔍 **How It Works (Step-by-Step)**: Break the concept into 3-4 friendly, bite-sized key points.
3. 🌟 **Real-World Analogy**: A fun, relatable everyday analogy (like video games, cooking, sports, or nature) that makes the concept unforgettable.
4. 🚀 **Why This Is Cool & Important**: 1-2 sentences on why this matters in the real world.
5. 💡 **Key Takeaway**: One quick memorable sentence to lock it into memory.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'Unable to generate explanation. Please try again.';
    return res.json({ topic: topic.trim(), explanation: text, gradeLevel });
  } catch (err: any) {
    console.error('Error in /api/explain:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate explanation. Please check your connection and try again.',
    });
  }
});

// API: Summarize a topic
app.post('/api/summarize', async (req, res) => {
  try {
    const { topic, gradeLevel = 'General Student' } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please enter a valid question or topic.' });
    }

    const systemInstruction = `You are EduGenie, a high-yield study assistant for students.
Your goal is to provide a fast, clear, bulleted summary that a student can read and understand in under 60 seconds.
Target audience: ${gradeLevel}.`;

    const prompt = `Please provide a short, high-yield summary for the topic:
"${topic.trim()}"

Format your response cleanly with markdown:
1. 📌 **Quick Summary**: One punchy, clear takeaway sentence.
2. 📝 **Key Facts & Core Points**:
   - Bullet 1
   - Bullet 2
   - Bullet 3
   - Bullet 4
3. 🔑 **Essential Vocabulary**: 2-3 important terms with one-line student-friendly definitions.
4. ⚡ **Mnemonic / Memory Tip**: A clever acronym, rhyme, or memory trick to never forget this.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    const text = response.text || 'Unable to generate summary. Please try again.';
    return res.json({ topic: topic.trim(), summary: text, gradeLevel });
  } catch (err: any) {
    console.error('Error in /api/summarize:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate summary. Please check your connection and try again.',
    });
  }
});

// API: Generate 5 multiple choice questions with answers
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic, gradeLevel = 'General Student' } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please enter a valid question or topic.' });
    }

    const systemInstruction = `You are EduGenie, an expert educator crafting an engaging 5-question multiple choice quiz for students.
Level: ${gradeLevel}.
Guidelines:
- Create exactly 5 multiple choice questions on the provided topic.
- Each question must test understanding of key concepts, not obscure trivia.
- Each question must have exactly 4 plausible options (index 0, 1, 2, 3).
- Provide the correct option index (0 to 3).
- Provide a clear, encouraging 1-2 sentence explanation of why the correct answer is right and why it matters.`;

    const prompt = `Create a 5-question multiple choice quiz on the topic: "${topic.trim()}".`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: '0-based index of the correct option (0, 1, 2, or 3)',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Clear, helpful explanation for the correct answer',
                  },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['topic', 'questions'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('No quiz data received from Gemini.');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Clean up markdown block if present
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Ensure questions array has 5 items and proper structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid quiz response structure.');
    }

    // Sanitize questions
    const sanitizedQuestions = parsed.questions.slice(0, 5).map((q: any, idx: number) => ({
      id: q.id ?? idx + 1,
      question: q.question || `Question ${idx + 1}`,
      options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
      explanation: q.explanation || 'The selected option is the correct answer for this question.',
    }));

    return res.json({
      topic: topic.trim(),
      questions: sanitizedQuestions,
      gradeLevel,
    });
  } catch (err: any) {
    console.error('Error in /api/quiz:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate quiz. Please check your connection and try again.',
    });
  }
});

// API: Ask follow-up question
app.post('/api/followup', async (req, res) => {
  try {
    const { topic, context, question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Please enter your follow-up question.' });
    }

    const systemInstruction = `You are EduGenie, answering a student's follow-up doubt or question.
Keep it direct, easy to understand, encouraging, and clear.`;

    const prompt = `Topic being studied: "${topic}"
Previous content context:
${context || 'N/A'}

Student's follow-up question:
"${question.trim()}"

Provide a friendly, direct answer that clears up their doubt.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const answer = response.text || 'Unable to generate follow-up answer.';
    return res.json({ answer });
  } catch (err: any) {
    console.error('Error in /api/followup:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to process follow-up.',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
