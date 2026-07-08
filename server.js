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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Simplify this for Grade ${targetGrade}: ${text}` }] }]
            })
        });
        
        const data = await response.json();

        // If Google sends back an API error, pass it to the frontend safely
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