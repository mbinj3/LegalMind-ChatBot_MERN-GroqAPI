const Groq = require('groq-sdk');

// Lazy-initialize Groq client so missing key at load time doesn't crash the server
function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        return null;
    }
    return new Groq({ apiKey });
}

// Models to try in order of preference
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODELS = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768'];

const SYSTEM_PROMPT = `You are LegalMind AI, an elite legal solution architect and jurisprudence assistant.
Your goal is to provide structured, objective, and highly insightful legal summaries and statute identification.

Format your responses with clean, organized Markdown:
### 📋 Executive Summary
A concise overview of the core dispute, claim, or factual scenario.

### ⚖️ Applicable Statutes & Legal Sections
Identify relevant laws, codes, acts, regulations, or articles (with specific section references where applicable).

### 🔍 Legal Analysis & Core Issues
Detailed breakdown of rights, obligations, liabilities, evidentiary requirements, and potential defenses.

### 💡 Strategic Recommendations & Next Steps
Concrete, pragmatic steps (e.g., document preservation, formal legal notices, dispute resolution).

### ⚠️ Legal Disclaimer
A clear reminder that this assessment is for educational and analytical purposes and does not constitute formal legal counsel.`;

const userQuery = async (req, res) => {
    try {
        const groq = getGroqClient();
        if (!groq) {
            return res.status(503).json({
                error: 'GROQ_API_KEY is not configured on the server. Please add your API key to .env or Vercel Environment Variables.'
            });
        }

        // Validate request body
        const rawQuestion = req.body?.formData || req.body?.query;
        if (!rawQuestion || typeof rawQuestion !== 'string') {
            return res.status(400).json({
                error: 'Invalid input. Please provide a valid text query.'
            });
        }

        const userQuestion = rawQuestion.trim();
        if (userQuestion.length < 5) {
            return res.status(400).json({
                error: 'Query is too short. Please provide at least 5 characters describing your case details.'
            });
        }

        if (userQuestion.length > 10000) {
            return res.status(400).json({
                error: 'Query exceeds the maximum allowed length of 10,000 characters.'
            });
        }

        // Build messages payload with optional history for conversational context
        const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
        const sanitizedHistory = rawHistory
            .slice(-6) // Retain last 6 messages to preserve context while optimizing token usage
            .filter(item => (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
            .map(item => ({
                role: item.role,
                content: item.content.slice(0, 4000)
            }));

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...sanitizedHistory,
            { role: 'user', content: userQuestion }
        ];

        // Attempt completion with primary model, then fallback if needed
        let completion = null;
        let activeModel = PRIMARY_MODEL;
        const candidateModels = [PRIMARY_MODEL, ...FALLBACK_MODELS];

        for (const model of candidateModels) {
            try {
                activeModel = model;
                completion = await groq.chat.completions.create({
                    messages,
                    model,
                    temperature: 0.3,
                    max_tokens: 2048,
                });
                if (completion?.choices?.[0]?.message?.content) {
                    break;
                }
            } catch (err) {
                console.warn(`[LegalMind] Groq call failed on model ${model}:`, err?.message || err);
                // Continue to next fallback model
            }
        }

        if (!completion?.choices?.[0]?.message?.content) {
            throw new Error('All model completions failed or returned empty content.');
        }

        const summary = completion.choices[0].message.content;

        return res.status(200).json({
            summary,
            model: activeModel,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[LegalMind] Query Controller Error:', error?.message || error);
        return res.status(500).json({
            error: 'Failed to process the legal query. Please verify your connection or try again shortly.'
        });
    }
};

module.exports = { userQuery };
