const axios = require('axios');
const cheerio = require('cheerio');

const scrapeArticleContent = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(data);
        
        // Remove unnecessary elements
        $('script, style, noscript, nav, header, footer, iframe, aside').remove();

        // Try to get main content
        let content = $('article').text();
        if (!content || content.trim().length < 100) {
            content = $('main').text();
        }
        if (!content || content.trim().length < 100) {
            content = $('body').text();
        }

        // Clean up text
        content = content.replace(/\s+/g, ' ').trim();
        
        // Truncate if too long to save tokens (e.g., max 5000 chars)
        if (content.length > 5000) {
            content = content.substring(0, 5000);
        }

        return content;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return null; // Return null so we can fallback to RSS description
    }
};

module.exports = {
    scrapeArticleContent,
};
