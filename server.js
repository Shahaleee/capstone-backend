const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/simplify', async (req, res) => {
    const { text, targetGrade } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    // CHANGED: Swapped gemini-1.5-flash out for the active gemini-2.5-flash model identifier
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    // Quick safety check for your Render environment variable
    if (!API_KEY) {
        return res.status(500).json({ error: "Backend configuration error: GEMINI_API_KEY is missing." });
    }

    try {
        // We create a strict instruction set for the AI so it formats cleanly
        const systemInstruction = `You are an expert educational assistant. Simplify the following text strictly for a Grade ${targetGrade} level. 
        
        CRITICAL RULES:
        1. Output ONLY plain, clean text paragraphs. 
        2. Do NOT use any Markdown formatting, asterisks (*), or bold text (**).
        3. Do NOT include conversational filler, introductions, or conclusions (e.g., do NOT say "Okay, imagine", "Here is your text", or "That's Bernoulli's theorem!"). Start directly with the explanation.
        4. Make it look professional, clean, and ready for a teacher or parent to copy and paste directly into a school worksheet.`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `${systemInstruction}\n\nText to simplify: ${text}` 
                    }] 
                }]
            })
        });
        
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        res.json(data);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to connect to AI service" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// 1. EXISTNG ENDPOINT: TEXT SIMPLIFIER
app.post('/api/simplify', async (req, res) => {
    const { text, targetGrade } = req.body;

    if (!API_KEY) {
        return res.status(500).json({ error: "Backend configuration error: GEMINI_API_KEY is missing." });
    }

    try {
        const systemInstruction = `You are an expert educational assistant. Simplify the following text strictly for a Grade ${targetGrade} level. 
        CRITICAL RULES:
        1. Output ONLY plain, clean text paragraphs. 
        2. Do NOT use any Markdown formatting, asterisks (*), or bold text (**).
        3. Do NOT include conversational filler, introductions, or conclusions. Start directly with the explanation.
        4. Make it look professional, clean, and ready for a teacher or parent to copy and paste directly into a school worksheet.`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nText to simplify: ${text}` }] }]
            })
        });
        
        const data = await response.json();
        if (data.error) return res.status(400).json({ error: data.error.message });
        res.json(data);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to connect to AI service" });
    }
});

// 2. NEW ENDPOINT: AI SEMANTIC LINGUISTIC ANALYZER
app.post('/api/analyze', async (req, res) => {
    const { text } = req.body;

    if (!API_KEY) {
        return res.status(500).json({ error: "Backend configuration error: GEMINI_API_KEY is missing." });
    }

    try {
        const analysisPrompt = `You are an advanced linguistic analysis engine. Analyze the following text for conceptual density and academic reading difficulty.
        
        You MUST respond with ONLY a valid, raw JSON object. Do not wrap it in markdown code blocks or backticks.
        
        Use this exact JSON structure:
        {
            "grade": "Grade X" (Use formats like: "Grade 6", "Below Grade 1", or "Grade 12+ / Adult"),
            "difficulty": "Easy / Basic" or "Standard" or "Advanced / Hard",
            "explanation": "A one-sentence professional educational explanation of why this text matches that grade tier.",
            "complexWords": ["list", "of", "up", "to", "5", "difficult", "or", "academic", "words", "found", "in", "the", "text"]
        }

        Text to analyze: ${text}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: analysisPrompt }] }]
            })
        });

        const data = await response.json();
        if (data.error) return res.status(400).json({ error: data.error.message });

        // Extract and parse the clean JSON payload returned by Gemini
        const rawJsonText = data.candidates[0].content.parts[0].text.trim();
        const parsedAnalysis = JSON.parse(rawJsonText);
        
        res.json(parsedAnalysis);
    } catch (error) {
        console.error("Analysis Server Error:", error);
        res.status(500).json({ error: "AI Analysis Engine temporary blackout." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));