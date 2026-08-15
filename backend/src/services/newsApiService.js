const axios = require('axios');

const fetchFromNewsData = async (query = 'artificial intelligence OR machine learning') => {
    try {
        if (!process.env.NEWSDATA_API_KEY) return [];
        console.log(`[NewsData.io] Fetching with query: "${query}"...`);
        const response = await axios.get(`https://newsdata.io/api/1/news`, {
            params: {
                apikey: process.env.NEWSDATA_API_KEY,
                q: query,
                language: 'en'
            }
        });
        const results = response.data.results || [];
        console.log(`[NewsData.io] Successfully fetched ${results.length} articles.`);
        return results.map(item => ({
            title: item.title,
            url: item.link,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            source: item.source_id || 'NewsData.io',
            originalText: item.content || item.description || ''
        }));
    } catch (error) {
        console.error('Error fetching from NewsData.io:', error.message);
        return [];
    }
};

const fetchFromApiTube = async (query = 'artificial intelligence') => {
    try {
        if (!process.env.APITUBE_API_KEY) return [];
        console.log(`[ApiTube] Fetching recent articles...`);
        // Apitube uses X-API-Key header
        const response = await axios.get(`https://api.apitube.io/v1/news/everything`, {
            params: {
                language: { code: 'en' },
                per_page: 10,
            },
            headers: {
                'X-API-Key': process.env.APITUBE_API_KEY
            }
        });
        const results = response.data.results || [];
        console.log(`[ApiTube] Successfully fetched ${results.length} articles.`);
        return results.map(item => ({
            title: item.title,
            url: item.url || item.link,
            publishedAt: item.published_at ? new Date(item.published_at) : new Date(),
            source: item.source?.name || 'ApiTube',
            originalText: item.content || item.description || ''
        }));
    } catch (error) {
        console.error('Error fetching from ApiTube:', error.message);
        return [];
    }
};

const fetchFromNewsAPI = async (query = 'artificial intelligence OR machine learning') => {
    try {
        if (!process.env.NEWSAPI_API_KEY) return [];
        console.log(`[NewsAPI.org] Fetching with query: "${query}"...`);
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                apiKey: process.env.NEWSAPI_API_KEY,
                q: query,
                language: 'en',
                sortBy: 'publishedAt'
            }
        });
        const articles = response.data.articles || [];
        console.log(`[NewsAPI.org] Successfully fetched ${articles.length} articles.`);
        return articles.map(item => ({
            title: item.title,
            url: item.url,
            publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
            source: item.source?.name || 'NewsAPI.org',
            originalText: item.content || item.description || ''
        }));
    } catch (error) {
        console.error('Error fetching from NewsAPI.org:', error.message);
        return [];
    }
};

const fetchFromMediaStack = async (query = 'artificial intelligence') => {
    try {
        if (!process.env.MEDIASTACK_API_KEY) return [];
        console.log(`[MediaStack] Fetching with query: "${query}"...`);
        const response = await axios.get(`http://api.mediastack.com/v1/news`, {
            params: {
                access_key: process.env.MEDIASTACK_API_KEY,
                keywords: query,
                languages: 'en',
                sort: 'published_desc'
            }
        });
        const data = response.data.data || [];
        console.log(`[MediaStack] Successfully fetched ${data.length} articles.`);
        return data.map(item => ({
            title: item.title,
            url: item.url,
            publishedAt: item.published_at ? new Date(item.published_at) : new Date(),
            source: item.source || 'MediaStack',
            originalText: item.description || ''
        }));
    } catch (error) {
        console.error('Error fetching from MediaStack:', error.message);
        return [];
    }
};

const fetchAllNewsApis = async (query) => {
    console.log(`\n=== Starting combined API fetch for query: "${query}" ===`);
    const results = await Promise.all([
        fetchFromNewsData(query),
        fetchFromApiTube(query),
        fetchFromNewsAPI(query),
        fetchFromMediaStack(query)
    ]);
    
    // Flatten array of arrays
    const finalResults = results.flat();
    console.log(`=== Finished fetching. Total combined articles collected: ${finalResults.length} ===\n`);
    
    if (finalResults.length > 0) {
        console.log(`[Sample Output] Data being sent to Gemini for processing:`);
        console.log(`Title: ${finalResults[0].title}`);
        console.log(`Source: ${finalResults[0].source}`);
        console.log(`Link: ${finalResults[0].url}\n`);
    }

    return finalResults;
};

module.exports = {
    fetchAllNewsApis
};
