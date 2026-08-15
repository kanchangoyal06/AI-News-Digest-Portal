const Digest = require('../models/Digest');
const Article = require('../models/Article');
const { generateEmailHTML } = require('../services/emailService');

// @desc    Download a new digest as .eml
// @route   POST /api/digests/download
// @access  Private/Admin
const downloadDigest = async (req, res) => {
    const { articleIds } = req.body;

    if (!articleIds || articleIds.length === 0) {
        return res.status(400).json({ message: 'No articles selected' });
    }

    try {
        const articles = await Article.find({ _id: { $in: articleIds } });
        if (!articles || articles.length === 0) {
            return res.status(404).json({ message: 'Articles not found' });
        }

        // Create Digest record
        const digest = await Digest.create({
            sentBy: req.user._id,
            articles: articleIds,
            recipients: [], // Empty since we are not sending directly anymore
            status: 'Downloaded'
        });

        // Mark articles as Sent
        await Article.updateMany(
            { _id: { $in: articleIds } },
            { $set: { status: 'Sent' } }
        );

        // Fetch Receiver Emails from Settings
        const settings = await require('../models/Settings').findOne();
        const receiverEmails = settings?.receiverEmails || [];
        const toHeader = receiverEmails.length > 0 ? `To: ${receiverEmails.join(', ')}\n` : '';

        // Generate HTML and EML
        const html = generateEmailHTML(articles);
        const emlContent = `X-Unsent: 1
${toHeader}Subject: AI News Digest - ${new Date().toLocaleDateString()}
Content-Type: text/html; charset="utf-8"

${html}`;

        res.setHeader('Content-Type', 'message/rfc822');
        res.setHeader('Content-Disposition', 'attachment; filename="digest.eml"');
        res.send(emlContent);
    } catch (error) {
        res.status(500).json({ message: 'Error generating digest', error: error.message });
    }
};

// @desc    Get digest history
// @route   GET /api/digests
// @access  Private/Admin
const getDigests = async (req, res) => {
    try {
        const digests = await Digest.find({})
            .populate('sentBy', 'name email')
            .populate('articles', 'title source publishedAt')
            .sort({ sentAt: -1 });

        res.json(digests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching digest history', error: error.message });
    }
};

module.exports = {
    downloadDigest,
    getDigests
};
