const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

const processArticleWithAI = async (text, customPrompt) => {
    const defaultPrompt = `
    Analyze the following article text. 
    1. Determine if it is strongly related to Artificial Intelligence, Machine Learning, or Data Science. (Return true or false)
    2. If true, provide a concise 3-4 line summary of the article.
    3. If true, assign an importance score from 1 to 10 (10 being groundbreaking news).
    4. If true, extract up to 5 keywords or categories.
    
    Return the response strictly in JSON format with keys: "isAiRelated" (boolean), "summary" (string), "importanceScore" (number), "keywords" (array of strings). Do not include markdown formatting or backticks around the JSON.
    
    Article Text:
    `;

    const prompt = customPrompt ? `${customPrompt}\n\nArticle Text:\n` : defaultPrompt;

    try {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini request timed out after 3 minutes')), 180000)
        );
        const response = await Promise.race([
            ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt + text,
                config: { responseMimeType: "application/json" }
            }),
            timeoutPromise
        ]);

        let responseText = response.text;
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(responseText);
    } catch (error) {
        console.error('Error processing with Gemini API:', error.message);
        return null;
    }
};

const processArticlesBatchWithAI = async (articles, customPrompt) => {
    const systemInstructions = `
    Analyze the following list of articles. For each article, perform these tasks:
    1. Determine if it is strongly related to Artificial Intelligence, Machine Learning, Data Science, or related fields.
    2. If true, provide a concise 3-4 line summary of the article.
    3. If true, assign an importance score from 1 to 10 (10 being groundbreaking news).
    4. If true, assign a broad category (e.g., 'Generative AI', 'Data Science', 'AI Research').
    5. If true, extract up to 5 specific keywords.
    
    Return the response strictly as a JSON array of objects.
    Each object must include the key "url" containing the exact URL provided in the prompt for that article.
    Each object must also have the key "isAiRelated" (boolean). If true, also include "summary" (string), "category" (string), "importanceScore" (number), "keywords" (array of strings).
    `;

    const prompt = (customPrompt && customPrompt.length > 20 ? customPrompt + '\n\n' : '') + systemInstructions + '\n\nArticles to process:\n';

    // Truncate content to 400 chars per article — enough for Gemini to judge relevance, avoids huge payloads
    const articlesText = articles.map((a, i) => {
        const snippet = (a.originalText || '').substring(0, 400);
        return `Article [${i}]:\nTitle: ${a.title}\nSource: ${a.source}\nURL: ${a.url}\nContent: ${snippet}`;
    }).join('\n\n');

    try {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini request timed out after 3 minutes')), 180000)
        );

        const response = await Promise.race([
            ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt + articlesText,
                config: { responseMimeType: "application/json" }
            }),
            timeoutPromise
        ]);

        let responseText = response.text;
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsed = JSON.parse(responseText);
            return parsed;
        } catch (parseError) {
            console.error('Failed to parse AI response.');
            throw parseError;
        }
    } catch (error) {
        // Detect rate limit / server errors by status or code
        const errCode = error.status || error.code || (error.error && error.error.code);
        if (errCode && [429, 500, 502, 503, 504].includes(Number(errCode))) {
            throw error;
        }
        console.error('Error processing batch with Gemini API:', error.message);
        return null;
    }
};


const generateEmbedding = async (text) => {
    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
        });
        return response.embeddings[0].values;
    } catch (error) {
        console.error('Error generating embedding:', error.message);
        return null;
    }
};

module.exports = {
    processArticleWithAI,
    processArticlesBatchWithAI,
    generateEmbedding,
};
