const Settings = require('../models/Settings');

const defaultSources = [
    { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", type: "RSS", enabled: true },
    { name: "TechCrunch", url: "https://techcrunch.com/feed", type: "RSS", enabled: true },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", type: "RSS", enabled: true },
    { name: "Wired", url: "https://www.wired.com/feed/rss", type: "RSS", enabled: true },
    { name: "Ars Technica", url: "http://feeds.arstechnica.com/arstechnica/index", type: "RSS", enabled: true },
    { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", type: "RSS", enabled: true },
    { name: "NYT Home", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", type: "RSS", enabled: true },
    { name: "NYT Technology", url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", type: "RSS", enabled: true },
    { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss", type: "RSS", enabled: true },
    { name: "Washington Post", url: "https://feeds.washingtonpost.com/rss/world", type: "RSS", enabled: true },
    { name: "WSJ", url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", type: "RSS", enabled: true },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", type: "RSS", enabled: true },
    { name: "Times of India", url: "https://timesofindia.indiatimes.com/rss.cms", type: "RSS", enabled: true },
    { name: "TOI Tech", url: "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms", type: "RSS", enabled: true },
    { name: "The Hindu", url: "https://www.thehindu.com/news/feeder/default.rss", type: "RSS", enabled: true },
    { name: "LiveMint", url: "https://www.livemint.com/rss/technology", type: "RSS", enabled: true },
    { name: "Indian Express", url: "https://indianexpress.com/section/technology/feed/", type: "RSS", enabled: true },
    { name: "Google Research", url: "https://research.google/blog/rss/", type: "RSS", enabled: true },
    { name: "OpenAI", url: "https://openai.com/blog/rss.xml", type: "RSS", enabled: true }
];

const defaultKeywords = [
    "Artificial Intelligence",
    "Generative AI",
    "Machine Learning",
    "Deep Learning",
    "Large Language Models",
    "LLMs",
    "AI Agents",
    "Data Science",
    "Data Analytics",
    "Data Engineering",
    "Big Data",
    "MLOps",
    "NLP",
    "Computer Vision",
    "AI Research",
    "Cloud AI",
    "OpenAI",
    "Gemini",
    "Claude",
    "NVIDIA AI",
    "Microsoft AI",
    "Google AI",
    "Azure AI",
    "AWS AI",
    "Hugging Face",
    "AI startups",
    "AI products"
];

const initSettings = async () => {
    try {
        const existingSettings = await Settings.findOne();
        if (!existingSettings) {
            console.log('No settings found. Initializing with default enterprise configuration...');
            
            const filterKeywords = defaultKeywords.map(keyword => ({
                keyword,
                enabled: true
            }));

            await Settings.create({
                sources: defaultSources,
                filterKeywords: filterKeywords,
                defaultPrompt: 'Analyze this article and determine if it is related to Artificial Intelligence. If it is, provide a concise 3-4 line summary, assign an importance score from 1-10, and generate keywords.',
                minImportanceScore: 5
            });
            console.log('Default settings successfully initialized.');
        } else {
            console.log('Settings document already exists. Skipping initialization.');
        }
    } catch (error) {
        console.error('Error during system initialization:', error);
    }
};

module.exports = initSettings;
