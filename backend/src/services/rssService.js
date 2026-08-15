const Parser = require('rss-parser');
const parser = new Parser();

const fetchRssFeed = async (url) => {
    try {
        const feed = await parser.parseURL(url);
        return feed.items.map(item => ({
            title: item.title,
            url: item.link,
            publishedAt: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate) : new Date(),
            source: feed.title || 'Unknown Source',
            originalText: item.contentSnippet || item.content || '',
        }));
    } catch (error) {
        console.error(`[RSS Parsing Error] Failed to parse feed at ${url}: ${error.message}`);
        return []; // Return empty array on failure so it doesn't break everything
    }
};

const fetchAllRssFeeds = async (sources) => {
    const promises = sources.map(async (source) => {
        const items = await fetchRssFeed(source.url);
        // Ensure required fields exist and inject the specific source name
        return items
            .filter(item => item && item.url && item.title)
            .map(item => ({
                ...item,
                source: source.name || item.source
            }));
    });
    
    const results = await Promise.allSettled(promises);
    
    let allItems = [];
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allItems.push(...result.value);
        }
        // Rejected ones are already handled by catch in fetchRssFeed returning []
        // But if there's an unexpected rejection, Promise.allSettled handles it without breaking the loop
    });
    
    return allItems;
};

module.exports = {
    fetchRssFeed,
    fetchAllRssFeeds,
};
