const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    sources: [{
        name: String,
        url: String, // RSS URL or Website URL
        type: { type: String, enum: ['RSS', 'HTML'], default: 'RSS' },
        enabled: { type: Boolean, default: true }
    }],
    categories: [{ type: String }],
    defaultPrompt: { type: String, default: 'Analyze this article and determine if it is related to Artificial Intelligence. If it is, provide a concise 3-4 line summary, assign an importance score from 1-10, and generate keywords.' },
    minImportanceScore: { type: Number, default: 5 },
    digestFrequency: { type: String, enum: ['Daily', 'Weekly', 'Manual'], default: 'Manual' },
    filterKeywords: [{
        keyword: { type: String, required: true },
        enabled: { type: Boolean, default: true }
    }],
    receiverEmails: [{ type: String }]
});

module.exports = mongoose.model('Settings', settingsSchema);
