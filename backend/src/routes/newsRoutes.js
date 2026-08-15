const express = require('express');
const router = express.Router();
const { getArticles, updateArticle, collectNews, getCollectionStatus } = require('../controllers/newsController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getArticles);

router.route('/collect')
    .post(protect, admin, collectNews);

router.route('/status')
    .get(protect, admin, getCollectionStatus);

router.route('/:id')
    .put(protect, admin, updateArticle);

module.exports = router;
