const express = require('express');
const router = express.Router();
const { 
    getSettings, 
    updateSettings,
    getFilterKeywords,
    addFilterKeyword,
    updateFilterKeyword,
    deleteFilterKeyword,
    getRssFeeds,
    addRssFeed,
    toggleRssFeed
} = require('../controllers/settingsController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, admin, getSettings)
    .put(protect, admin, updateSettings);

router.route('/filter-keywords')
    .get(protect, admin, getFilterKeywords)
    .post(protect, admin, addFilterKeyword);

router.route('/filter-keywords/:id')
    .put(protect, admin, updateFilterKeyword)
    .delete(protect, admin, deleteFilterKeyword);

router.route('/rss-feeds')
    .get(protect, admin, getRssFeeds)
    .post(protect, admin, addRssFeed);

router.route('/rss-feeds/:id/toggle')
    .put(protect, admin, toggleRssFeed);

module.exports = router;
