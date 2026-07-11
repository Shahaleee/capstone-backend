const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// Global configuration safeguard
if (!API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY environment variable is missing.");
}

// ==========================================
// 1. ENDPOINT: TEXT SIMPLIFIER
// ==========================================
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
        console.error("Simplification Server Error:", error);
        res.status(500).json({ error: "Failed to connect to AI service" });
    }
});

// ==========================================
// 2. ENDPOINT: AI SEMANTIC LINGUISTIC ANALYZER
// ==========================================
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
            "grade": "Grade X",
            "difficulty": "Standard",
            "explanation": "A one-sentence professional educational explanation.",
            "complexWords": ["list", "of", "words"]
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

        const rawJsonText = data.candidates[0].content.parts[0].text.trim();
        const cleanJsonString = rawJsonText.replace(/```json\n?|```/g, '').trim();
        const parsedAnalysis = JSON.parse(cleanJsonString);
        
        res.json(parsedAnalysis);
    } catch (error) {
        console.error("Analysis Server Error:", error);
        res.status(500).json({ error: "AI Analysis Engine temporary blackout." });
    }
});

// ==========================================
// 3. ENDPOINT: AI VALIDATION GATEKEEPER
// ==========================================
app.post('/api/validate', async (req, res) => {
    const { text } = req.body;

    if (!API_KEY) {
        return res.status(500).json({ error: "Backend configuration error: GEMINI_API_KEY is missing." });
    }

    try {
        const validationPrompt = `You are a strict validation filter. Analyze the following text. 
        If it contains heavy internet slang, brainrot, keyboard mashing (e.g., asdfgh, tyfikghyio), or completely lacks standard English/academic structure, reject it.
        Respond ONLY with a valid JSON object in this exact format: {"isValid": true/false, "reason": "Short reason if false"}.
        Text to analyze: "${text}"`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: validationPrompt }] }]
            })
        });

        const data = await response.json();
        if (data.error) return res.status(400).json({ error: data.error.message });

        const aiTextResponse = data.candidates[0].content.parts[0].text.trim();
        const cleanJsonString = aiTextResponse.replace(/```json\n?|```/g, '').trim();
        const result = JSON.parse(cleanJsonString);

        res.json(result);
    } catch (error) {
        console.error("Validation Server Error:", error);
        res.status(500).json({ error: "Failed to validate text payload context structure." });
    }
});

// ==========================================
// 4. SERVER RUNTIME INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Capstone Production Server running smoothly on port ${PORT}`);
});