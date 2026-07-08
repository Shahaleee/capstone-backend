const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config(); // This helps read your secret key

const app = express();
app.use(cors()); // Allows your frontend to talk to this server
app.use(express.json());

app.post('/api/simplify', async (req, res) => {
    const { text, targetGrade } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // Key is kept safe on the server
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Simplify this for Grade ${targetGrade}: ${text}` }] }]
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to connect to AI" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));