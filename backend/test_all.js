require('dotenv').config();
const mongoose = require('mongoose');
const { fetchAllNewsApis } = require('./src/services/newsApiService');
const { processArticleWithAI } = require('./src/services/aiService');

const runTests = async () => {
    console.log("=== STARTING TESTS ===");

    // 1. Test MongoDB Connection
    console.log("\n1. Testing MongoDB Connection...");
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ MongoDB Connection Successful.");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
    }

    // 2. Test News APIs
    console.log("\n2. Testing News APIs...");
    try {
        const articles = await fetchAllNewsApis('artificial intelligence');
        console.log(`✅ Successfully fetched ${articles.length} articles from News APIs combined.`);
        if (articles.length > 0) {
            console.log("Sample article:", articles[0].title, "from", articles[0].source);
        }
    } catch (error) {
        console.error("❌ News API Fetching Failed:", error.message);
    }

    // 3. Test Gemini API
    console.log("\n3. Testing Gemini API...");
    try {
        const sampleText = "Artificial intelligence is rapidly advancing, with new LLMs being released constantly. Machine learning is changing the world.";
        const result = await processArticleWithAI(sampleText, "");
        if (result && result.summary) {
            console.log("✅ Gemini API Successful.");
            console.log("Result:", result);
        } else {
            console.log("❌ Gemini API returned unexpected result:", result);
        }
    } catch (error) {
         console.error("❌ Gemini API Failed:", error.message);
    }

    mongoose.disconnect();
    console.log("\n=== TESTS FINISHED ===");
};

runTests();
