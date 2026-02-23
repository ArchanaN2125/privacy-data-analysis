const mongoose = require('mongoose');

const proofSchema = new mongoose.Schema({
    proofId: {
        type: String,
        unique: true,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    organizationId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for fast lookups
proofSchema.index({ hash: 1 });

module.exports = mongoose.model('Proof', proofSchema);
