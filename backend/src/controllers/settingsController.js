const Settings = require('../models/Settings');

// @desc    Get settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'Settings not initialized' });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        
        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
};

// @desc    Get all filter keywords
// @route   GET /api/settings/filter-keywords
// @access  Private/Admin
const getFilterKeywords = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'Settings not initialized' });
        res.json(settings.filterKeywords || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching keywords', error: error.message });
    }
};

// @desc    Add a filter keyword
// @route   POST /api/settings/filter-keywords
// @access  Private/Admin
const addFilterKeyword = async (req, res) => {
    try {
        const { keyword, enabled } = req.body;
        if (!keyword) return res.status(400).json({ message: 'Keyword is required' });

        let settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'Settings not initialized' });

        const isDuplicate = settings.filterKeywords.some(k => k.keyword.toLowerCase() === keyword.toLowerCase());
        if (isDuplicate) {
            return res.status(400).json({ message: 'Keyword already exists' });
        }

        settings.filterKeywords.push({ keyword, enabled: enabled !== undefined ? enabled : true });
        await settings.save();
        
        // Return the newly added subdocument
        const newKeyword = settings.filterKeywords[settings.filterKeywords.length - 1];
        res.status(201).json(newKeyword);
    } catch (error) {
        res.status(500).json({ message: 'Error adding keyword', error: error.message });
    }
};

// @desc    Update a filter keyword
// @route   PUT /api/settings/filter-keywords/:id
// @access  Private/Admin
const updateFilterKeyword = async (req, res) => {
    try {
        const { keyword, enabled } = req.body;
        const settings = await Settings.findOne();
        
        if (!settings) return res.status(404).json({ message: 'Settings not found' });

        const keywordDoc = settings.filterKeywords.id(req.params.id);
        if (!keywordDoc) return res.status(404).json({ message: 'Keyword not found' });

        if (keyword !== undefined) keywordDoc.keyword = keyword;
        if (enabled !== undefined) keywordDoc.enabled = enabled;

        await settings.save();
        res.json(keywordDoc);
    } catch (error) {
        res.status(500).json({ message: 'Error updating keyword', error: error.message });
    }
};

// @desc    Delete a filter keyword
// @route   DELETE /api/settings/filter-keywords/:id
// @access  Private/Admin
const deleteFilterKeyword = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'Settings not found' });

        const keywordDoc = settings.filterKeywords.id(req.params.id);
        if (!keywordDoc) return res.status(404).json({ message: 'Keyword not found' });

        settings.filterKeywords.pull(req.params.id);
        await settings.save();
        
        res.json({ message: 'Keyword deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting keyword', error: error.message });
    }
};

// @desc    Get all RSS feeds
// @route   GET /api/settings/rss-feeds
// @access  Private/Admin
const getRssFeeds = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'Settings not initialized' });
        res.json(settings.sources || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching RSS feeds', error: error.message });
    }
};

// @desc    Add an RSS feed
// @route   POST /api/settings/rss-feeds
// @access  Private/Admin
const addRssFeed = async (req, res) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) return res.status(400).json({ message: 'Name and URL are required' });

        let settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'Settings not initialized' });

        try {
            new URL(url);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid RSS URL' });
        }

        const isDuplicate = settings.sources.some(s => s.url === url);
        if (isDuplicate) {
            return res.status(400).json({ message: 'RSS URL already exists' });
        }

        settings.sources.push({ name, url, type: 'RSS', enabled: true });
        await settings.save();
        
        // Return the newly added subdocument
        const newFeed = settings.sources[settings.sources.length - 1];
        res.status(201).json(newFeed);
    } catch (error) {
        res.status(500).json({ message: 'Error adding RSS feed', error: error.message });
    }
};

// @desc    Toggle an RSS feed status
// @route   PUT /api/settings/rss-feeds/:id/toggle
// @access  Private/Admin
const toggleRssFeed = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'Settings not found' });

        const feedDoc = settings.sources.id(req.params.id);
        if (!feedDoc) return res.status(404).json({ message: 'RSS feed not found' });

        feedDoc.enabled = !feedDoc.enabled;
        await settings.save();
        
        res.json({ message: 'RSS feed toggled', enabled: feedDoc.enabled });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling RSS feed', error: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getFilterKeywords,
    addFilterKeyword,
    updateFilterKeyword,
    deleteFilterKeyword,
    getRssFeeds,
    addRssFeed,
    toggleRssFeed
};
