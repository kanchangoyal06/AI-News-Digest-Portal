const Article = require('../models/Article');
const Settings = require('../models/Settings');
const { fetchAllRssFeeds } = require('../services/rssService');
const { processArticleWithAI, generateEmbedding } = require('../services/aiService');


// @desc    Get all articles (Dashboard)
// @route   GET /api/news
// @access  Private/Admin
const getArticles = async (req, res) => {
    const { status, timeframe, category, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.categories = category;

    if (timeframe) {
        const now = new Date();
        if (timeframe === 'today') {
            query.publishedAt = { $gte: new Date(now.setHours(0,0,0,0)) };
        } else if (timeframe === 'yesterday') {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            query.publishedAt = { 
                $gte: new Date(yesterday.setHours(0,0,0,0)),
                $lt: new Date(new Date().setHours(0,0,0,0))
            };
        } else if (timeframe === 'last3days') {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(now.getDate() - 3);
            query.publishedAt = { $gte: threeDaysAgo };
        }
    }

    try {
        const articles = await Article.find(query)
            .sort({ importanceScore: -1, publishedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Article.countDocuments(query);

        res.json({
            articles,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalArticles: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error: error.message });
    }
};

// @desc    Update article status or summary
// @route   PUT /api/news/:id
// @access  Private/Admin
const updateArticle = async (req, res) => {
    const { summary, status } = req.body;
    
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        if (summary) article.summary = summary;
        if (status) article.status = status;

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (error) {
        res.status(500).json({ message: 'Error updating article', error: error.message });
    }
};

let isCollecting = false;

// @desc    Trigger manual news collection (Usually done by background job)
// @route   POST /api/news/collect
// @access  Private/Admin
const collectNews = async (req, res) => {
    console.log('[News Collection] collectNews endpoint hit by user:', req.user?._id);
    if (isCollecting) {
        return res.status(429).json({ message: 'A news collection job is already in progress' });
    }
    isCollecting = true;

    try {
        // Run asynchronously, just return accepted
        res.status(202).json({ message: 'News collection started in background' });
        
        // This logic normally sits in the worker process triggered by BullMQ
        let settings = await Settings.findOne();
        if (!settings) {
            console.error("No settings found in database. System initialization might have failed.");
            return;
        }

        const dynamicSources = (settings.sources || []).filter(s => s.enabled);

        if (dynamicSources.length === 0) {
            console.log("No enabled RSS sources configured in database.");
        }

        let allItems = [];
        const uniqueUrls = new Set();

        // 1. Fetch from STRICT RSS Feeds asynchronously
        const rssItems = await fetchAllRssFeeds(dynamicSources);
        
        // Remove duplicates based on URL for RSS feeds
        for (const item of rssItems) {
            if (!uniqueUrls.has(item.url)) {
                uniqueUrls.add(item.url);
                allItems.push(item);
            }
        }

        // 2. Fetch from News APIs (Restored existing functionality)
        try {
            const { fetchAllNewsApis } = require('../services/newsApiService');
            const apiItems = await fetchAllNewsApis('artificial intelligence OR machine learning');
            
            for (const item of apiItems) {
                if (!uniqueUrls.has(item.url)) {
                    uniqueUrls.add(item.url);
                    allItems.push(item);
                }
            }
        } catch (apiError) {
            console.error('Error fetching from External News APIs:', apiError.message);
        }

        // 3. Filter for AI/Data-related content locally
        let aiKeywordsRegex = null;
        if (settings.filterKeywords && settings.filterKeywords.length > 0) {
            const enabledKeywords = settings.filterKeywords
                .filter(k => k.enabled)
                .map(k => k.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // escape regex special characters
            
            if (enabledKeywords.length > 0) {
                aiKeywordsRegex = new RegExp(enabledKeywords.join('|'), 'i');
            }
        }

        if (!aiKeywordsRegex) {
            console.warn("[Filtering] No enabled filter keywords found. Skipping local keyword filter.");
        }

        const filteredItems = allItems.filter(item => {
            const textToSearch = `${item.title || ''} ${item.originalText || ''}`;
            
            if (!aiKeywordsRegex) {
                return true; // Skip filter as requested
            }
            
            // Using word boundaries for AI to avoid matching 'hair' or 'pain'
            return /\bAI\b/i.test(textToSearch) || aiKeywordsRegex.test(textToSearch);
        });

        console.log(`[Filtering] Retained ${filteredItems.length} AI-related articles out of ${allItems.length} total fetched.`);

        // 4. Filter out articles that already exist in DB
        const urlsToCheck = filteredItems.map(item => item.url);
        const existingArticles = await Article.find({ url: { $in: urlsToCheck } }, { url: 1 }).lean();
        const existingUrlSet = new Set(existingArticles.map(a => a.url));
        
        const newItems = filteredItems.filter(item => !existingUrlSet.has(item.url));

        // 4.5 Limit items to recent 24h
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const now = Date.now();
        let limitedItems = newItems.filter(item => {
            if (!item.publishedAt) return true;
            return (now - new Date(item.publishedAt).getTime()) <= ONE_DAY;
        });

        // Sort by date descending (newest first)
        limitedItems.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

        // Enforce max config limit (raised to 300 to handle larger RSS + API volumes)
        const maxArticles = settings.maxArticlesToProcess || 300;
        if (limitedItems.length > maxArticles) {
            limitedItems = limitedItems.slice(0, maxArticles);
        }

        if (limitedItems.length === 0) {
            console.log("No new articles to process.");
            return;
        }

        const { processArticlesBatchWithAI } = require('../services/aiService');
        
        const chunkSize = 5;
        let totalSaved = 0;
        let allSavedArticles = []; // Track all inserted articles for auto-email
        let allCandidates = []; // Track all AI-related articles across all chunks

        console.log(`\nAnalyzing ${limitedItems.length} articles using Gemini AI (in batches of ${chunkSize})...`);
        
        for (let i = 0; i < limitedItems.length; i += chunkSize) {
            const chunk = limitedItems.slice(i, i + chunkSize);
            console.log(`Processing batch ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(limitedItems.length / chunkSize)}...`);
            
            let batchResults = null;
            try {
                batchResults = await processArticlesBatchWithAI(chunk, settings.defaultPrompt, (i / chunkSize) + 1);
            } catch (apiError) {
                console.error(`[Gemini API Error] Batch ${Math.floor(i / chunkSize) + 1} failed: ${apiError.message}`);
                console.error(`Skipping batch ${Math.floor(i / chunkSize) + 1} due to error.`);
            }

            if (batchResults && Array.isArray(batchResults)) {

                
                let articlesToInsert = [];
                
                // Create lookup dictionary by URL from Gemini response
                const aiResultsByUrl = {};
                for (const aiResult of batchResults) {
                    if (aiResult && aiResult.url) {
                        aiResultsByUrl[aiResult.url] = aiResult;
                    }
                }

                for (const item of chunk) {
                    const aiResult = aiResultsByUrl[item.url];
                    
                    // Accept ALL AI-related articles regardless of score — top 5 are picked by score below
                    if (aiResult && aiResult.isAiRelated) {
                        articlesToInsert.push({
                            title: item.title,
                            url: item.url,
                            source: item.source,
                            publishedAt: item.publishedAt,
                            summary: aiResult.summary,
                            originalText: item.originalText,
                            categories: aiResult.category ? [aiResult.category] : [],
                            keywords: aiResult.keywords || [],
                            importanceScore: aiResult.importanceScore || 0,
                        });
                    }
                }
                
                if (articlesToInsert.length > 0) {
                    allCandidates.push(...articlesToInsert);
                }
            } else {
                console.error(`Failed to analyze batch ${Math.floor(i / chunkSize) + 1}. Skipping...`);
            }
            
            // Wait between chunks to prevent 503 overloading (6s gap)
            if (i + chunkSize < limitedItems.length) {
                await new Promise(resolve => setTimeout(resolve, 6000));
            }
        }
        
        // ─── Post-Processing: Take Top 5 Overall ───
        if (allCandidates.length > 0) {
            allCandidates.sort((a, b) => b.importanceScore - a.importanceScore);
            const topArticles = allCandidates.slice(0, 5);
            console.log(`Selected top ${topArticles.length} most important articles out of ${allCandidates.length} AI-related candidates.`);
            try {
                await Article.insertMany(topArticles, { ordered: false });
                totalSaved += topArticles.length;
                console.log(`✅ Saved ${topArticles.length} highly relevant articles to database.`);
            } catch (insertError) {
                if (insertError.code === 11000) {
                    const inserted = insertError.insertedDocs || [];
                    totalSaved += inserted.length;
                    console.log(`✅ Saved ${inserted.length} highly relevant articles to database (some were already present).`);
                } else {
                    console.error('Database insertion error:', insertError.message);
                }
            }
        } else {
            console.log(`No highly relevant articles found in this run.`);
        }
        
        console.log(`Finished processing. Total relevant articles saved: ${totalSaved}.`);


    } catch (error) {
        console.error('Error during collection:', error.message);
    } finally {
        isCollecting = false;
    }
};

const getCollectionStatus = (req, res) => {
    res.json({ isCollecting });
};

module.exports = {
    getArticles,
    updateArticle,
    collectNews,
    getCollectionStatus
};
