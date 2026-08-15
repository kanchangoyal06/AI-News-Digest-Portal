const mongoose = require('mongoose');

const digestSchema = new mongoose.Schema({
    sentAt: { type: Date, default: Date.now },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    recipients: [{ type: String }], // Array of email addresses
    status: { type: String, enum: ['Success', 'Failed', 'Downloaded'], default: 'Success' },
    errorMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Digest', digestSchema);
