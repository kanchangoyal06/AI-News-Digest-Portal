const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    group: { type: String, default: 'General' }, // e.g., 'Engineering', 'Marketing', 'Execs'
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Recipient', recipientSchema);
